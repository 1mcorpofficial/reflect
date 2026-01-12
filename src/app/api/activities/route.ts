import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/guards";
import { requireWorkspaceRole, validateResourceWorkspace } from "@/lib/tenancy";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import {
  QUESTION_CONFIG_SCHEMAS,
  type QuestionType,
} from "@/lib/question-types";

const questionSchema = z.object({
  prompt: z.string().min(1),
  helperText: z.string().max(500).optional(),
  type: z.enum([
    "TRAFFIC_LIGHT",
    "EMOTION",
    "SCALE",
    "THERMOMETER",
    "SENTENCE_COMPLETION",
    "FREE_TEXT",
    "MULTI_SELECT",
    "PIE_100",
  ]),
  order: z.number().int().nonnegative().optional(),
  config: z.unknown().optional(),
  required: z.boolean().optional(),
  followUp: z
    .array(
      z.object({
        prompt: z.string().min(1),
        helperText: z.string().max(500).optional(),
        type: z.enum([
          "TRAFFIC_LIGHT",
          "EMOTION",
          "SCALE",
          "THERMOMETER",
          "SENTENCE_COMPLETION",
          "FREE_TEXT",
          "MULTI_SELECT",
          "PIE_100",
        ]),
        config: z.unknown().optional(),
      }),
    )
    .min(1)
    .max(5)
    .optional(),
});

const activitySchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(2).max(160),
  description: z.string().max(500).optional(),
  privacyMode: z.enum(["NAMED", "ANONYMOUS"]),
  scheduledFor: z.string().datetime().optional(),
  openAt: z.string().datetime().optional(),
  closeAt: z.string().datetime().optional(),
  timezone: z.string().max(60).optional(),
  questions: z.array(questionSchema).min(1),
});

export async function POST(req: Request) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  // Resolve workspace context and enforce role
  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

  const limiterKey = buildRateLimitKey(req, "activity-create");
  const allowed = checkRateLimit(limiterKey, 10, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(allowed.retryAfter ?? 60) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = activitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: parsed.data.groupId },
    select: { id: true, name: true, createdById: true, orgId: true, workspaceId: true },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Validate that group belongs to workspace
  const belongsToWorkspace = await validateResourceWorkspace(
    parsed.data.groupId,
    "group",
    workspace.context.workspaceId,
  );

  if (!belongsToWorkspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    parsed.data.openAt &&
    parsed.data.closeAt &&
    new Date(parsed.data.openAt) >= new Date(parsed.data.closeAt)
  ) {
    return NextResponse.json(
      { error: "openAt must be before closeAt" },
      { status: 400 },
    );
  }

  const normalizedQuestions = parsed.data.questions.map((q, idx) => {
    const configSchema = QUESTION_CONFIG_SCHEMAS[q.type as QuestionType];
    const normalizedConfig = configSchema.parse(q.config ?? {});

    return {
      prompt: q.prompt.trim(),
      helperText: q.helperText?.trim(),
      type: q.type,
      order: q.order ?? idx,
      required: q.required ?? true,
      config: normalizedConfig,
      followUp: q.followUp,
    };
  });

  const activity = await prisma.$transaction(async (tx) => {
    const createdActivity = await tx.activity.create({
      data: {
        groupId: parsed.data.groupId,
        workspaceId: workspace.context.workspaceId, // Set workspace_id
        title: parsed.data.title.trim(),
        description: parsed.data.description,
        privacyMode: parsed.data.privacyMode,
        openAt: parsed.data.openAt ? new Date(parsed.data.openAt) : null,
        closeAt: parsed.data.closeAt ? new Date(parsed.data.closeAt) : null,
        timezone: parsed.data.timezone,
        scheduledFor: parsed.data.scheduledFor
          ? new Date(parsed.data.scheduledFor)
          : null,
        createdById: workspace.session.sub,
        status: "DRAFT",
      },
      select: { id: true },
    });

    const questionnaire = await tx.questionnaire.create({
      data: {
        activityId: createdActivity.id,
        title: parsed.data.title,
        questions: {
          create: normalizedQuestions.map((question) => ({
            prompt: question.prompt,
            helperText: question.helperText,
            type: question.type,
            order: question.order,
            required: question.required,
            config: question.config as Prisma.InputJsonValue,
            followUp: question.followUp as Prisma.InputJsonValue,
          })),
        },
      },
      select: { id: true },
    });

    return { activityId: createdActivity.id, questionnaireId: questionnaire.id };
  });

  void logAudit({
    action: "activity.create",
    targetType: "Activity",
    targetId: activity.activityId,
    actorUserId: workspace.session.sub,
    workspaceId: workspace.context.workspaceId,
    metadata: { workspaceId: workspace.context.workspaceId },
  });

  return NextResponse.json(
    {
      activity: {
        id: activity.activityId,
        questionnaireId: activity.questionnaireId,
      },
    },
    { status: 201 },
  );
}
