import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getRequestId, createErrorResponse } from "@/lib/error-handler";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/admin/gdpr/delete/[userId]
 * Soft-delete/anonymize user data (admin scope)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const limiterKey = buildRateLimitKey(req, "gdpr-delete");
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      const requestId = await getRequestId();
      return NextResponse.json(
        { error: "User not found", requestId },
        { status: 404, headers: { "x-request-id": requestId } },
      );
    }

    // Soft-delete: anonymize email and name
    const anonymizedEmail = `deleted+${userId}@example.invalid`;
    const anonymizedName = "Deleted User";

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        name: anonymizedName,
      },
    });

    void logAudit({
      action: "gdpr.user.delete",
      targetType: "User",
      targetId: userId,
      actorUserId: auth.session.sub,
      metadata: {
        strategy: "anonymize",
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "User data anonymized",
      userId,
    });
  } catch (error) {
    return createErrorResponse(error, 500);
  }
}
