import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { generatePersonalCode } from "@/lib/codes";
import { requireRole } from "@/lib/guards";
import { hashSecret } from "@/lib/auth";
import { requireWorkspaceRole, validateResourceWorkspace } from "@/lib/tenancy";
import { prisma } from "@/lib/prisma";
import { hmacLookup } from "@/lib/hmac";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const participantSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  personalCode: z.string().min(4).max(32).optional(),
});

const importSchema = z
  .object({
    participants: z.array(participantSchema).optional(),
    csv: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.participants && data.participants.length > 0) ||
      (data.csv && data.csv.trim().length > 0),
    { message: "Provide `participants` array or `csv` string" },
  );

type ParticipantInput = z.infer<typeof participantSchema>;

function parseCsv(csv: string): ParticipantInput[] {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const participants: ParticipantInput[] = [];
  for (const row of rows) {
    const [name, email] = row.split(",").map((chunk) => chunk.trim());
    if (!name || name.toLowerCase() === "name") continue;
    participants.push({ displayName: name, email: email || undefined });
  }
  return participants;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

  const limiterKey = buildRateLimitKey(req, "participant-import");
  const allowed = checkRateLimit(limiterKey, 5, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(allowed.retryAfter ?? 60) } },
    );
  }

  const { groupId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, code: true },
  });

  const belongsToWorkspace = await validateResourceWorkspace(
    groupId,
    "group",
    workspace.context.workspaceId,
  );
  if (!group || !belongsToWorkspace) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const participantInputs: ParticipantInput[] =
    parsed.data.participants ??
    parseCsv(parsed.data.csv ?? "").filter((p) => p.displayName);

  if (participantInputs.length === 0) {
    return NextResponse.json(
      { error: "No participants to import" },
      { status: 400 },
    );
  }

  const prepared = await Promise.all(
    participantInputs.map(async (person) => {
      const code = person.personalCode ?? generatePersonalCode();
      const hash = await hashSecret(code);
      const lookup = hmacLookup(`${group.id}:${code}`);
      return { ...person, code, hash, lookup };
    }),
  );

  const created = await prisma.$transaction(async (tx) => {
    const output: Array<{
      id: string;
      displayName: string;
      email?: string | null;
      personalCode: string;
      membershipId: string;
    }> = [];

    for (const person of prepared) {
      const participant = await tx.participant.create({
        data: {
          displayName: person.displayName.trim(),
          email: person.email?.trim(),
        },
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      });

      const membership = await tx.groupParticipant.create({
        data: {
          groupId: group.id,
          participantId: participant.id,
          personalCodeHash: person.hash,
          personalCodeLookup: person.lookup,
        },
        select: { id: true },
      });

      await tx.participantInvite.create({
        data: {
          groupId: group.id,
          displayName: participant.displayName,
          email: participant.email ?? undefined,
          codeHash: person.hash,
          participantId: participant.id,
          createdById: auth.session.sub,
        },
      });

      output.push({
        id: participant.id,
        displayName: participant.displayName,
        email: participant.email,
        personalCode: person.code,
        membershipId: membership.id,
      });
    }

    return output;
  });

  void logAudit({
    action: "participant.import",
    targetType: "Group",
    targetId: group.id,
    actorUserId: auth.session.sub,
    workspaceId: workspace.context.workspaceId,
    metadata: { count: created.length, workspaceId: workspace.context.workspaceId },
  });

  return NextResponse.json(
    {
      group: { id: group.id, name: group.name, code: group.code },
      participants: created,
    },
    { status: 201 },
  );
}
