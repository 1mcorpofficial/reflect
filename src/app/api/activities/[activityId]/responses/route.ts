import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { hmacLookup } from "@/lib/hmac";
import { QUESTION_CONFIG_SCHEMAS, type QuestionType } from "@/lib/question-types";

const answerStatuses = ["ANSWERED", "UNKNOWN", "DECLINED"] as const;
type AnswerStatus = (typeof answerStatuses)[number];
const MIN_ANON_COUNT = 5;

const followUpAnswerSchema = z.object({
  prompt: z.string().min(1),
  value: z.any().optional(),
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.any().optional(),
  status: z.enum(answerStatuses).optional(),
  followUpAnswers: z.array(followUpAnswerSchema).optional(),
});

const responseSchema = z.object({
  answers: z.array(answerSchema).min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  const { activityId } = await params;
  const limiterKey = buildRateLimitKey(req, "response-submit");
  const allowed = checkRateLimit(limiterKey, 60, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(allowed.retryAfter ?? 60) },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      groupId: true,
      privacyMode: true,
      status: true,
      openAt: true,
      closeAt: true,
      questionnaire: {
        select: {
          questions: {
            select: {
              id: true,
              prompt: true,
              required: true,
              type: true,
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

  if (auth.session.groupId && activity.groupId !== auth.session.groupId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  if (activity.openAt && now < activity.openAt) {
    return NextResponse.json(
      { error: "Activity not open yet", code: "ACTIVITY_NOT_OPEN" },
      { status: 403 },
    );
  }
  if (activity.closeAt && now > activity.closeAt) {
    return NextResponse.json(
      { error: "Activity closed", code: "ACTIVITY_CLOSED" },
      { status: 403 },
    );
  }
  if (activity.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Activity is not published", code: "ACTIVITY_NOT_PUBLISHED" },
      { status: 403 },
    );
  }

  // already submitted?
  if (activity.privacyMode === "ANONYMOUS") {
    const submissionKey = hmacLookup(
      `${activity.id}:${auth.session.membershipId ?? "anon"}`,
    );
    const exists = await prisma.response.findUnique({
      where: { submissionKey },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Already submitted" },
        { status: 409 },
      );
    }
  } else {
    const existing = await prisma.response.findFirst({
      where: {
        activityId: activity.id,
        OR: [
          { participantId: auth.session.sub },
          { groupParticipantId: auth.session.membershipId ?? undefined },
        ],
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Already submitted" },
        { status: 409 },
      );
    }
  }

  const questions = activity.questionnaire?.questions ?? [];

  const byId = new Map(questions.map((q) => [q.id, q]));

  // required check
  const missingRequired = questions.some(
    (q) => q.required && !parsed.data.answers.find((a) => a.questionId === q.id),
  );
  if (missingRequired) {
    return NextResponse.json(
      { error: "Missing required answers" },
      { status: 400 },
    );
  }

  // per-type validation
  for (const ans of parsed.data.answers) {
    const meta = byId.get(ans.questionId);
    if (!meta) {
      return NextResponse.json(
        { error: `Question not found: ${ans.questionId}` },
        { status: 400 },
      );
    }

    const questionType = meta.type as QuestionType;
    const answerStatus: AnswerStatus = (ans.status ?? "ANSWERED") as AnswerStatus;
    if (answerStatus === "DECLINED") {
      continue;
    }

    if (answerStatus === "UNKNOWN") {
      const followUps = ans.followUpAnswers ?? [];
      if (!Array.isArray(followUps) || followUps.length < 1 || followUps.length > 5) {
        return NextResponse.json(
          { error: `Follow-up required (1-5) for ${meta.prompt}` },
          { status: 400 },
        );
      }
      continue;
    }

    let config: unknown;
    try {
      config = QUESTION_CONFIG_SCHEMAS[questionType].parse(
        meta.config ?? {},
      );
    } catch {
      const requestId = crypto.randomUUID();
      console.error(
        `[${requestId}] Invalid question configuration`,
        JSON.stringify({ questionId: meta.id, type: questionType }),
      );
      return NextResponse.json(
        { error: `Invalid configuration for ${meta.prompt}`, requestId },
        { status: 500, headers: { "x-request-id": requestId } },
      );
    }

    if (questionType === "TRAFFIC_LIGHT" || questionType === "EMOTION") {
      const options = (config as { options?: Array<{ value: string }> })?.options ?? [];
      const allowed = new Set(options.map((o) => o.value));
      if (
        typeof ans.value !== "string" ||
        (allowed.size > 0 && !allowed.has(ans.value))
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${meta.prompt}` },
          { status: 400 },
        );
      }
    }

    if (questionType === "SCALE" || questionType === "THERMOMETER") {
      const configTyped = config as { min?: number; max?: number };
      const min = Number(configTyped.min ?? 1);
      const max = Number(configTyped.max ?? (questionType === "SCALE" ? 5 : 10));
      const numeric = Number(ans.value);
      if (Number.isNaN(numeric) || numeric < min || numeric > max) {
        return NextResponse.json(
          { error: `Value out of range for ${meta.prompt}` },
          { status: 400 },
        );
      }
    }

    if (questionType === "MULTI_SELECT") {
      const opts = (config as { options: Array<{ value: string }> }).options;
      const values = Array.isArray(ans.value) ? ans.value : null;
      if (!values || values.some((v) => typeof v !== "string")) {
        return NextResponse.json(
          { error: `Invalid options for ${meta.prompt}` },
          { status: 400 },
        );
      }
      const allowed = new Set(opts.map((o) => o.value));
      if (values.some((v) => !allowed.has(v))) {
        return NextResponse.json(
          { error: `Unknown option for ${meta.prompt}` },
          { status: 400 },
        );
      }
      const minChoices = (config as { minChoices?: number }).minChoices ?? 0;
      const maxChoices = (config as { maxChoices?: number }).maxChoices ?? values.length;
      if (values.length < minChoices || values.length > maxChoices) {
        return NextResponse.json(
          {
            error: `Select between ${minChoices} and ${maxChoices} options for ${meta.prompt}`,
          },
          { status: 400 },
        );
      }
    }

    if (questionType === "PIE_100") {
      if (typeof ans.value !== "object" || ans.value === null || Array.isArray(ans.value)) {
        return NextResponse.json(
          { error: `Invalid pie distribution for ${meta.prompt}` },
          { status: 400 },
        );
      }
      const categories = (config as { categories: Array<{ id?: string; label: string }> })
        .categories;
      const allowed = new Set(
        categories.map((c) => (c.id ?? c.label).trim().toLowerCase()),
      );
      const entries = Object.entries(ans.value as Record<string, unknown>);
      const numericEntries = entries.map(([k, v]) => ({
        key: k.trim().toLowerCase(),
        val: Number(v),
      }));

      if (
        numericEntries.some(
          ({ key, val }) => !allowed.has(key) || Number.isNaN(val) || val < 0,
        )
      ) {
        return NextResponse.json(
          { error: `Invalid categories or values for ${meta.prompt}` },
          { status: 400 },
        );
      }

      const total = numericEntries.reduce((sum, { val }) => sum + val, 0);
      if (Math.abs(total - 100) > 0.5) {
        return NextResponse.json(
          { error: `Sum must be 100 for ${meta.prompt} (currently ${total})` },
          { status: 400 },
        );
      }
    }

    if (
      questionType === "SENTENCE_COMPLETION" ||
      questionType === "FREE_TEXT"
    ) {
      if (typeof ans.value !== "string") {
        return NextResponse.json(
          { error: `Text expected for ${meta.prompt}` },
          { status: 400 },
        );
      }
      if (ans.value.length > 2000) {
        return NextResponse.json(
          { error: `Answer too long for ${meta.prompt}` },
          { status: 400 },
        );
      }
    }
  }

  const submissionKey = hmacLookup(
    `${activity.id}:${auth.session.membershipId ?? "anon"}`,
  );

  const response = await prisma.$transaction(async (tx) => {
    const createdResponse = await tx.response.create({
      data: {
        activityId: activity.id,
        groupId: activity.groupId,
        participantId:
          activity.privacyMode === "ANONYMOUS" ? null : auth.session.sub,
        groupParticipantId:
          activity.privacyMode === "ANONYMOUS"
            ? null
            : auth.session.membershipId ?? null,
        isAnonymous: activity.privacyMode === "ANONYMOUS",
        submissionKey,
        submittedAt: new Date(),
      },
      select: { id: true },
    });

    await tx.answer.createMany({
      data: parsed.data.answers.map((a) => {
        const status: AnswerStatus = (a.status ?? "ANSWERED") as AnswerStatus;
        const value = status === "ANSWERED" ? a.value ?? null : null;
        const followUp =
          status === "UNKNOWN" ? a.followUpAnswers ?? [] : undefined;
        return {
          responseId: createdResponse.id,
          questionId: a.questionId,
          value,
          textValue: typeof value === "string" ? value : null,
          numberValue: typeof value === "number" ? value : null,
          status,
          meta: followUp ? { followUpAnswers: followUp } : undefined,
        };
      }),
    });

    return createdResponse;
  });

  void logAudit({
    action: "response.submit",
    targetType: "Activity",
    targetId: activity.id,
    actorParticipantId: auth.session.membershipId ?? null,
  });

  return NextResponse.json({ responseId: response.id }, { status: 201 });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;

  const { activityId } = await params;
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      privacyMode: true,
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
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      participant: { select: { id: true, displayName: true, email: true } },
      answers: {
        select: {
          questionId: true,
          status: true,
          textValue: true,
          numberValue: true,
          value: true,
          meta: true,
          question: { select: { prompt: true, order: true } },
        },
        orderBy: { question: { order: "asc" } },
      },
    },
  });

  if (activity.privacyMode === "ANONYMOUS" && responses.length < MIN_ANON_COUNT) {
    return NextResponse.json(
      {
        error: "Not enough responses to view",
        details: `At least ${MIN_ANON_COUNT} submissions required for anonymous responses`,
      },
      { status: 403 },
    );
  }

  const questionMap =
    activity.questionnaire?.questions.reduce<Record<string, string>>(
      (acc, q) => {
        acc[q.id] = q.prompt;
        return acc;
      },
      {},
    ) ?? {};

  const payload = responses.map((response) => ({
    id: response.id,
    submittedAt: response.submittedAt?.toISOString() ?? null,
    participant:
      activity.privacyMode === "ANONYMOUS"
        ? null
        : response.participant
          ? {
              id: response.participant.id,
              displayName: response.participant.displayName,
              email: response.participant.email ?? null,
            }
          : null,
    answers: response.answers.map((answer) => ({
      questionId: answer.questionId,
      prompt: answer.question?.prompt ?? questionMap[answer.questionId] ?? "",
      status: answer.status,
      value:
        answer.textValue ??
        (answer.numberValue !== null && answer.numberValue !== undefined
          ? answer.numberValue
          : answer.value ?? null),
      meta: answer.meta ?? null,
    })),
  }));

  return NextResponse.json({ responses: payload, privacyMode: activity.privacyMode });
}
