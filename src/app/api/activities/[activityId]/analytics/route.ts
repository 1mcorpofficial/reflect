import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { QUESTION_CONFIG_SCHEMAS, type QuestionType } from "@/lib/question-types";
import { createErrorResponse } from "@/lib/error-handler";

const SNAPSHOT_VERSION = 2;
const MIN_ANON_COUNT = 5;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;

  try {
  const { activityId } = await params;
  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam) : undefined;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
    return NextResponse.json({ error: "Invalid date filters" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      groupId: true,
      createdById: true,
      privacyMode: true,
      group: { select: { orgId: true } },
      questionnaire: {
        select: {
          questions: {
            select: {
              id: true,
              prompt: true,
              type: true,
              required: true,
              order: true,
              config: true,
            },
          },
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

  const latestSnapshot =
    !from && !to
      ? await prisma.analyticsSnapshot.findFirst({
          where: { activityId, version: SNAPSHOT_VERSION },
          orderBy: { computedAt: "desc" },
        })
      : null;

  if (latestSnapshot) {
    const payload = latestSnapshot.payload as Record<string, unknown>;
    return NextResponse.json({
      activityId,
      ...payload,
    });
  }

  const submittedAtFilter =
    from || to
      ? {
          submittedAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const [participantCount, responses, answers] = await Promise.all([
    prisma.groupParticipant.count({ where: { groupId: activity.groupId } }),
    prisma.response.findMany({
      where: { activityId, ...submittedAtFilter },
      select: { id: true, submittedAt: true },
    }),
    prisma.answer.findMany({
      where: { response: { activityId, ...submittedAtFilter } },
      select: {
        questionId: true,
        textValue: true,
        numberValue: true,
        value: true,
        status: true,
      },
    }),
  ]);

  if (activity.privacyMode === "ANONYMOUS" && responses.length < MIN_ANON_COUNT) {
    return NextResponse.json(
      {
        error: "Not enough responses for analytics",
        details: `At least ${MIN_ANON_COUNT} submissions required for anonymous analytics`,
        minCount: MIN_ANON_COUNT,
        currentCount: responses.length,
      },
      { status: 403 },
    );
  }

  const perQuestion =
    activity.questionnaire?.questions.map((question) => {
      const relevant = answers.filter((a) => a.questionId === question.id);
      const statusOf = (a: (typeof relevant)[number]) =>
        (a.status as string | null) ?? "ANSWERED";
      const answered = relevant.filter((a) => statusOf(a) === "ANSWERED");
      const unknownCount = relevant.filter((a) => statusOf(a) === "UNKNOWN").length;
      const declinedCount = relevant.filter((a) => statusOf(a) === "DECLINED").length;
      const type = question.type as QuestionType;
      let config: unknown;
      try {
        config = QUESTION_CONFIG_SCHEMAS[type].parse(question.config ?? {});
      } catch {
        // skip invalid configs gracefully
        return {
          questionId: question.id,
          prompt: question.prompt,
          type: question.type,
          responses: relevant.length,
          answeredCount: answered.length,
          unknownCount,
          declinedCount,
          average: null,
          distribution: {},
          warning: "Invalid question configuration",
        };
      }

      const distribution: Record<string, number> = {};
      let average: number | null = null;

      if (type === "TRAFFIC_LIGHT" || type === "EMOTION" || type === "MULTI_SELECT") {
        const options =
          type === "MULTI_SELECT" || type === "EMOTION" || type === "TRAFFIC_LIGHT"
            ? (config as { options: Array<{ value: string; label?: string }> }).options
            : undefined;
        const allowed = options ? new Set(options.map((o) => o.value)) : null;
        const labelMap = options
          ? new Map(options.map((o) => [o.value, o.label ?? o.value]))
          : null;

        for (const ans of answered) {
          if (type === "MULTI_SELECT") {
            const values = Array.isArray(ans.value) ? ans.value : [];
            for (const v of values) {
              if (typeof v === "string" && (!allowed || allowed.has(v))) {
                distribution[v] = (distribution[v] ?? 0) + 1;
              }
            }
          } else {
            const raw = (ans.value as string) ?? ans.textValue ?? String(ans.value);
            if (!allowed || allowed.has(raw)) {
              const key = labelMap?.get(raw) ?? raw;
              distribution[key] = (distribution[key] ?? 0) + 1;
            }
          }
        }
      } else if (type === "SCALE" || type === "THERMOMETER") {
        const numericValues = answered
          .map((a) => a.numberValue ?? Number(a.value))
          .filter((v) => Number.isFinite(v)) as number[];
        if (numericValues.length > 0) {
          average =
            numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
          for (const val of numericValues) {
            const key = String(val);
            distribution[key] = (distribution[key] ?? 0) + 1;
          }
        }
      } else if (type === "PIE_100") {
        const categories = (config as { categories: Array<{ id?: string; label: string }> })
          .categories;
        const totals = new Map<string, number>();

        for (const ans of answered) {
          if (!ans.value || typeof ans.value !== "object") continue;
          const obj = ans.value as Record<string, unknown>;
          for (const [k, v] of Object.entries(obj)) {
            const key = k.trim().toLowerCase();
            const numeric = Number(v);
            if (Number.isFinite(numeric)) {
              totals.set(key, (totals.get(key) ?? 0) + numeric);
            }
          }
        }

        const count = relevant.length || 1;
        for (const cat of categories) {
          const key = (cat.id ?? cat.label).trim().toLowerCase();
          const avg = (totals.get(key) ?? 0) / count;
          distribution[cat.label] = Math.round(avg * 100) / 100;
        }
      } else {
        // text types
        for (const ans of answered) {
          const key =
            ans.textValue ??
            (ans.numberValue !== null && ans.numberValue !== undefined
              ? String(ans.numberValue)
              : JSON.stringify(ans.value));
          distribution[key] = (distribution[key] ?? 0) + 1;
        }
      }

      return {
        questionId: question.id,
        prompt: question.prompt,
        type: question.type,
        responses: relevant.length,
        answeredCount: answered.length,
        unknownCount,
        declinedCount,
        average,
        distribution,
      };
    }) ?? [];

  const completionRate =
    participantCount === 0
      ? 0
      : Math.min(1, responses.length / participantCount);

  const trend =
    from || to
      ? Array.from(
          responses.reduce((acc, resp) => {
            if (!resp.submittedAt) return acc;
            const key = resp.submittedAt.toISOString().slice(0, 10);
            acc.set(key, (acc.get(key) ?? 0) + 1);
            return acc;
          }, new Map<string, number>()),
        )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({
            date,
            responses: count,
            completionRate:
              participantCount === 0 ? 0 : Math.min(1, count / participantCount),
          }))
      : [];

  const payload = {
    activityId,
    totalParticipants: participantCount,
    totalResponses: responses.length,
    completionRate,
    perQuestion,
    trend,
    from: from?.toISOString(),
    to: to?.toISOString(),
  };

  if (!from && !to) {
    await prisma.analyticsSnapshot.create({
      data: {
        activityId,
        payload,
        version: SNAPSHOT_VERSION,
      },
    });
  }

  return NextResponse.json(payload);
  } catch (error) {
    return createErrorResponse(error, 500);
  }
}
