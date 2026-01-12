import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;

  const limiterKey = buildRateLimitKey(req, "activity-status");
  const allowed = checkRateLimit(limiterKey, 10, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(allowed.retryAfter ?? 60) } },
    );
  }

  const { activityId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, createdById: true, group: { select: { orgId: true } } },
  });

  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (auth.session.orgId && activity.group.orgId !== auth.session.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = await prisma.activity.update({
    where: { id: activityId },
    data: {
      status: parsed.data.status,
      publishedAt:
        parsed.data.status === "PUBLISHED" ? new Date() : undefined,
    },
    select: { id: true, status: true, publishedAt: true },
  });

  void logAudit({
    action: "activity.status",
    targetType: "Activity",
    targetId: activityId,
    actorUserId: auth.session.sub,
    metadata: { status: parsed.data.status },
  });

  return NextResponse.json({ activity: update });
}
