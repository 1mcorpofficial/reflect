import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";
import { hashSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const limiterKey = buildRateLimitKey(req, "admin-user-anonymize");
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

  const { userId } = await params;

  // Get admin's workspace memberships
  const adminMemberships = await prisma.workspaceMembership.findMany({
    where: {
      userId: auth.session.sub,
      status: "ACTIVE",
    },
    select: { workspaceId: true },
  });
  const adminWorkspaceIds = adminMemberships.map((m) => m.workspaceId);

  // Enforce workspace isolation: admin must have workspace memberships
  if (adminWorkspaceIds.length === 0) {
    return NextResponse.json({ error: "No workspace access" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if target user is in any of admin's workspaces (adminWorkspaceIds.length > 0 guaranteed)
  const userMemberships = await prisma.workspaceMembership.findMany({
    where: {
      userId,
      workspaceId: { in: adminWorkspaceIds },
      status: "ACTIVE",
    },
    select: { workspaceId: true },
  });

  if (userMemberships.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const anonymizedEmail = `deleted+${user.id}@example.invalid`;
  const newPassword = crypto.randomUUID();
  const passwordHash = await hashSecret(newPassword);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: anonymizedEmail,
      name: null,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  void logAudit({
    action: "user.anonymize",
    targetType: "User",
    targetId: user.id,
    actorUserId: auth.session.sub,
  });

  return NextResponse.json({ user: updated });
}
