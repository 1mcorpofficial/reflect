import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { PDFDocument, StandardFonts } from "pdf-lib";
import * as XLSX from "xlsx";

type ExportFormat = "csv" | "json" | "pdf" | "xlsx";
const MIN_ANON_COUNT = 5;
type RawAnswer = {
  textValue: string | null;
  numberValue: number | null;
  value: unknown;
  status?: string | null;
  meta?: unknown;
};

function answerValue(value: RawAnswer) {
  if (value.status && value.status !== "ANSWERED") {
    return value.status;
  }
  if (value.textValue) return value.textValue;
  if (value.numberValue !== null && value.numberValue !== undefined) {
    return value.numberValue;
  }
  if (value.value === null || value.value === undefined) return "";
  return JSON.stringify(value.value);
}

function getHeaders(rows: Record<string, unknown>[]) {
  if (!rows.length) return [];
  return Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = getHeaders(rows);
  const escape = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    if (str.includes(",") || str.includes("\n")) {
      return `"${str}"`;
    }
    return str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ];
  return lines.join("\n");
}

function toXlsx(rows: Record<string, unknown>[]) {
  const headers = getHeaders(rows);
  const orderedRows = rows.map((row) =>
    headers.reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = row[key] ?? "";
      return acc;
    }, {}),
  );
  const worksheet = XLSX.utils.json_to_sheet(orderedRows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

async function toPdf(rows: Record<string, unknown>[], title: string) {
  const headers = getHeaders(rows);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [612, 792];
  const margin = 40;
  const fontSize = 10;
  const lineHeight = fontSize + 4;
  const maxWidth = pageSize[0] - margin * 2;
  const maxChars = Math.floor(maxWidth / (fontSize * 0.55));

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  const addLine = (text: string, bold = false) => {
    if (y - lineHeight < margin) {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - margin;
    }
    const useFont = bold ? fontBold : font;
    page.drawText(text, {
      x: margin,
      y,
      size: fontSize,
      font: useFont,
    });
    y -= lineHeight;
  };

  addLine(title, true);
  addLine(`Rows: ${rows.length}`);
  addLine("");

  rows.forEach((row, idx) => {
    addLine(`Response ${idx + 1}`, true);
    headers.forEach((key) => {
      const raw = row[key];
      const value = raw === null || raw === undefined ? "" : String(raw);
      const line = `${key}: ${value}`;
      const wrapped = wrapText(line, maxChars);
      wrapped.forEach((chunk) => addLine(chunk));
    });
    addLine("");
  });

  return pdf.save();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;

  const { activityId } = await params;
  const limiterKey = buildRateLimitKey(req, "activity-export");
  const allowed = checkRateLimit(limiterKey, 5, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(allowed.retryAfter ?? 60) },
      },
    );
  }

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "json").toLowerCase() as ExportFormat;

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      title: true,
      groupId: true,
      privacyMode: true,
      createdById: true,
      group: { select: { orgId: true } },
      questionnaire: {
        select: {
          questions: { select: { id: true, prompt: true, order: true } },
        },
      },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  if (auth.session.orgId && activity.group.orgId !== auth.session.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const responses = await prisma.response.findMany({
    where: { activityId },
    select: {
      id: true,
      submittedAt: true,
      participant: { select: { id: true, displayName: true, email: true } },
      answers: {
        select: {
          questionId: true,
          textValue: true,
          numberValue: true,
          value: true,
          status: true,
          meta: true,
        },
      },
    },
  });

  const questionMap =
    activity.questionnaire?.questions.reduce<Record<string, string>>(
      (acc, q) => {
        acc[q.id] = q.prompt;
        return acc;
      },
      {},
    ) ?? {};

  const exportRows = responses.map((resp) => {
    const base: Record<string, unknown> = {
      responseId: resp.id,
      submittedAt: resp.submittedAt?.toISOString() ?? "",
    };

    if (activity.privacyMode === "NAMED") {
      base.participantId = resp.participant?.id ?? "";
      base.participant = resp.participant?.displayName ?? "";
      base.email = resp.participant?.email ?? "";
    }

    for (const ans of resp.answers) {
      const key = questionMap[ans.questionId] ?? ans.questionId;
      base[key] = answerValue(ans);
      if (ans.status === "UNKNOWN" && ans.meta) {
        base[`${key}__followUp`] = JSON.stringify(ans.meta);
      }
    }
    return base;
  });

  if (activity.privacyMode === "ANONYMOUS" && exportRows.length < MIN_ANON_COUNT) {
    return NextResponse.json(
      {
        error: "Not enough responses to export",
        details: `At least ${MIN_ANON_COUNT} submissions required for anonymous exports`,
        minCount: MIN_ANON_COUNT,
        currentCount: exportRows.length,
      },
      { status: 403 },
    );
  }

  if (format === "csv") {
    const csv = toCsv(exportRows);
    const record = await prisma.dataExport.create({
      data: {
        groupId: activity.groupId,
        activityId: activity.id,
        createdById: auth.session.sub,
        format: "CSV",
        status: "COMPLETED",
      },
    });
    void logAudit({
      action: "export.csv",
      targetType: "Activity",
      targetId: activity.id,
      actorUserId: auth.session.sub,
      metadata: { exportId: record.id },
    });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity-${activity.id}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const buffer = toXlsx(exportRows);
    const record = await prisma.dataExport.create({
      data: {
        groupId: activity.groupId,
        activityId: activity.id,
        createdById: auth.session.sub,
        format: "XLSX",
        status: "COMPLETED",
      },
    });
    void logAudit({
      action: "export.xlsx",
      targetType: "Activity",
      targetId: activity.id,
      actorUserId: auth.session.sub,
      metadata: { exportId: record.id },
    });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="activity-${activity.id}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const pdfBytes = await toPdf(
      exportRows,
      `Activity export ${activity.title || activity.id}`,
    );
    const record = await prisma.dataExport.create({
      data: {
        groupId: activity.groupId,
        activityId: activity.id,
        createdById: auth.session.sub,
        format: "PDF",
        status: "COMPLETED",
      },
    });
    void logAudit({
      action: "export.pdf",
      targetType: "Activity",
      targetId: activity.id,
      actorUserId: auth.session.sub,
      metadata: { exportId: record.id },
    });
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="activity-${activity.id}.pdf"`,
      },
    });
  }

  const record = await prisma.dataExport.create({
    data: {
      groupId: activity.groupId,
      activityId: activity.id,
      createdById: auth.session.sub,
      format: "JSON",
      status: "COMPLETED",
    },
  });
  void logAudit({
    action: "export.json",
    targetType: "Activity",
    targetId: activity.id,
    actorUserId: auth.session.sub,
    metadata: { exportId: record.id },
  });

  return NextResponse.json({ responses: exportRows });
}
