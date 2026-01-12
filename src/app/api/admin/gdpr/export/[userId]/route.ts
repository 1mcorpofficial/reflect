import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getRequestId, createErrorResponse } from "@/lib/error-handler";

/**
 * GET /api/admin/gdpr/export/[userId]
 * Export user data (admin scope)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const requestId = await getRequestId();
      return NextResponse.json(
        { error: "User not found", requestId },
        { status: 404, headers: { "x-request-id": requestId } },
      );
    }

    // Get user's activities
    const activities = await prisma.activity.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
      },
    });

    // Get user's org memberships
    const memberships = await prisma.orgMember.findMany({
      where: { userId },
      select: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        role: true,
        status: true,
        activatedAt: true,
      },
    });

    // Get user's groups (as facilitator)
    const groups = await prisma.group.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        name: true,
        code: true,
        createdAt: true,
      },
    });

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      activities: activities.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
      organizations: memberships.map((m) => ({
        id: m.org.id,
        name: m.org.name,
        slug: m.org.slug,
        role: m.role,
        status: m.status,
        activatedAt: m.activatedAt?.toISOString() ?? null,
      })),
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        code: g.code,
        createdAt: g.createdAt.toISOString(),
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: auth.email,
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-${userId}-export.json"`,
      },
    });
  } catch (error) {
    return createErrorResponse(error, 500);
  }
}
