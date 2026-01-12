import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getRequestId, createErrorResponse } from "@/lib/error-handler";
import crypto from "crypto";

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

    // #region agent log
    const requestId = crypto.randomUUID();
    fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/gdpr/export/[userId]/route.ts:39',message:'admin gdpr export query start',data:{requestId,adminUserId:auth.session.sub,targetUserId:userId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

    // Get admin's workspace memberships to filter data
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/gdpr/export/[userId]/route.ts:55',message:'admin gdpr export no workspace access',data:{requestId,adminWorkspaceIds:[],decision:'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "No workspace access" },
        { status: 403 },
      );
    }

    // Check if target user is in any of admin's workspaces
    const userMemberships = await prisma.workspaceMembership.findMany({
      where: {
        userId,
        workspaceId: { in: adminWorkspaceIds },
        status: "ACTIVE",
      },
      select: { workspaceId: true },
    });

    if (userMemberships.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/gdpr/export/[userId]/route.ts:55',message:'admin gdpr export access denied',data:{requestId,adminWorkspaceIds,userMemberships:[],decision:'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Get user's activities - filter by admin's workspaces (adminWorkspaceIds.length > 0 guaranteed)
    const activities = await prisma.activity.findMany({
      where: {
        createdById: userId,
        OR: [
          { workspaceId: { in: adminWorkspaceIds } },
          { workspaceId: null, group: { workspaceId: { in: adminWorkspaceIds } } },
          { workspaceId: null, group: { orgId: { in: adminWorkspaceIds } } },
        ],
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        workspaceId: true,
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/gdpr/export/[userId]/route.ts:75',message:'admin gdpr export activities result',data:{requestId,activitiesCount:activities.length,workspaceIds:activities.map(a=>a.workspaceId).filter(Boolean),hasWorkspaceFilter:true,decision:'ALLOW'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

    // Get user's org memberships - filter by admin's workspaces (adminWorkspaceIds.length > 0 guaranteed)
    const memberships = await prisma.orgMember.findMany({
      where: {
        userId,
        orgId: { in: adminWorkspaceIds },
      },
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

    // Get user's groups (as facilitator) - filter by admin's workspaces (adminWorkspaceIds.length > 0 guaranteed)
    const groups = await prisma.group.findMany({
      where: {
        createdById: userId,
        OR: [
          { workspaceId: { in: adminWorkspaceIds } },
          { workspaceId: null, orgId: { in: adminWorkspaceIds } },
        ],
      },
      select: {
        id: true,
        name: true,
        code: true,
        createdAt: true,
        workspaceId: true,
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/gdpr/export/[userId]/route.ts:110',message:'admin gdpr export groups result',data:{requestId,groupsCount:groups.length,workspaceIds:groups.map(g=>g.workspaceId).filter(Boolean),hasWorkspaceFilter:true,decision:'ALLOW'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

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
