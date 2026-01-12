import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  // #region agent log
  const requestId = crypto.randomUUID();
  const url = new URL(req.url);
  const requestedWorkspaceId = url.searchParams.get("workspaceId");
  fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/audit/route.ts:5',message:'admin audit query start',data:{requestId,adminUserId:auth.session.sub,workspaceIdParam:requestedWorkspaceId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/audit/route.ts:20',message:'admin audit no workspace access',data:{requestId,adminWorkspaceIds:[],decision:'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ error: "No workspace access" }, { status: 403 });
  }

  // If workspaceId is provided, validate membership
  if (requestedWorkspaceId) {
    if (!adminWorkspaceIds.includes(requestedWorkspaceId)) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/audit/route.ts:28',message:'admin audit access denied',data:{requestId,requestedWorkspaceId,adminWorkspaceIds,decision:'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
  }

  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);

  // Filter by workspace: if provided, use it (already validated); otherwise use admin's workspaces (adminWorkspaceIds.length > 0 guaranteed)
  const workspaceFilter = requestedWorkspaceId
    ? { workspaceId: requestedWorkspaceId }
    : { workspaceId: { in: adminWorkspaceIds } };

  const logs = await prisma.auditLog.findMany({
    where: workspaceFilter,
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(take) && take > 0 ? take : 50,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      actorUserId: true,
      actorParticipantId: true,
      workspaceId: true, // Include workspaceId in response
      createdAt: true,
      metadata: true,
    },
  });

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/audit/route.ts:45',message:'admin audit query result',data:{requestId,logsCount:logs.length,workspaceIds:logs.map(l=>l.workspaceId).filter(Boolean),hasMembershipCheck:true,hasWorkspaceFilter:true,decision:'ALLOW'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  return NextResponse.json({ logs });
}
