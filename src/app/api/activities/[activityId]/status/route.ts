import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/guards";
import { requireWorkspaceRole, validateResourceWorkspace } from "@/lib/tenancy";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

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

  const belongsToWorkspace = await validateResourceWorkspace(
    activityId,
    "activity",
    workspace.context.workspaceId,
  );
  if (!belongsToWorkspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    workspaceId: workspace.context.workspaceId,
    metadata: { status: parsed.data.status, workspaceId: workspace.context.workspaceId },
  });

  return NextResponse.json({ activity: update });
}
