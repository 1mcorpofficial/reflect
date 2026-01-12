/**
 * Tenancy (Workspace) resolution and validation utilities.
 * 
 * This module provides functions to:
 * - Resolve active workspace from request
 * - Validate workspace membership
 * - Enforce tenant isolation
 */

import { NextResponse } from "next/server";
import { getSessionFromRequest, type SessionPayload } from "./auth";
import { prisma } from "./prisma";
import type { WorkspaceRole, WorkspaceType } from "../generated/prisma/client";
import crypto from "crypto";

export type WorkspaceContext = {
  workspaceId: string;
  workspaceType: WorkspaceType;
  membershipRole: WorkspaceRole;
  membershipStatus: "ACTIVE" | "INVITED" | "DISABLED";
};

export type TenancyResult =
  | { ok: true; context: WorkspaceContext; session: SessionPayload }
  | { ok: false; response: NextResponse };

/**
 * Resolves workspace from request and validates membership.
 * 
 * Priority order:
 * 1. X-Workspace-Id header
 * 2. activeWorkspaceId from session (JWT claim)
 * 3. Default to user's personal workspace
 * 4. Default to first active workspace membership
 * 
 * @param req Request object
 * @param requireActive If true, requires ACTIVE membership (default: true)
 * @returns TenancyResult with workspace context or error response
 */
export async function resolveWorkspace(
  req: Request,
  requireActive: boolean = true,
): Promise<TenancyResult> {
  // #region agent log
  const requestId = crypto.randomUUID();
  const url = new URL(req.url);
  fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:39',message:'resolveWorkspace entry',data:{requestId,route:url.pathname,method:req.method,requireActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  const session = getSessionFromRequest(req);
  if (!session) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:47',message:'resolveWorkspace no session',data:{requestId,decision:'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Try to get workspaceId from header first
  const headerWorkspaceId = req.headers.get("X-Workspace-Id");

  // Then try from session (JWT claim)
  const sessionWorkspaceId = session.activeWorkspaceId;

  const requestedWorkspaceId = headerWorkspaceId || sessionWorkspaceId;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:57',message:'resolveWorkspace requested workspace',data:{requestId,userId:session.sub,headerWorkspaceId,sessionWorkspaceId,requestedWorkspaceId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  // Get user's memberships
  const memberships = await prisma.workspaceMembership.findMany({
    where: {
      userId: session.sub,
      ...(requireActive ? { status: "ACTIVE" } : {}),
    },
    include: {
      workspace: true,
    },
    orderBy: {
      activatedAt: "desc",
    },
  });

  if (memberships.length === 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No workspace membership found" },
        { status: 403 },
      ),
    };
  }

  // Sort: Personal workspace first, then by activation date
  const sorted = memberships.sort((a, b) => {
    if (a.workspace.type === "PERSONAL" && b.workspace.type !== "PERSONAL") return -1;
    if (a.workspace.type !== "PERSONAL" && b.workspace.type === "PERSONAL") return 1;
    const aTime = a.activatedAt?.getTime() ?? 0;
    const bTime = b.activatedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  let targetMembership = sorted[0]; // Default to first (prefer personal)

  // If workspaceId was requested, validate it
  if (requestedWorkspaceId) {
    const found = sorted.find(
      (m) => m.workspaceId === requestedWorkspaceId,
    );
    if (!found) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:99',message:'resolveWorkspace workspace not found',data:{requestId,userId:session.sub,requestedWorkspaceId,decision:'DENY',status:404},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      // Return 404 to not reveal existence
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Workspace not found" },
          { status: 404 },
        ),
      };
    }
    targetMembership = found;
  }

  // Validate membership status if required
  if (requireActive && targetMembership.status !== "ACTIVE") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Workspace membership not active" },
        { status: 403 },
      ),
    };
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:123',message:'resolveWorkspace success',data:{requestId,userId:session.sub,resolvedWorkspaceId:targetMembership.workspaceId,workspaceType:targetMembership.workspace.type,membershipRole:targetMembership.role,membershipStatus:targetMembership.status,decision:'ALLOW'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  return {
    ok: true,
    context: {
      workspaceId: targetMembership.workspaceId,
      workspaceType: targetMembership.workspace.type,
      membershipRole: targetMembership.role,
      membershipStatus: targetMembership.status,
    },
    session,
  };
}

/**
 * Validates that a resource belongs to the workspace.
 * This is a helper for additional validation after resolveWorkspace.
 */
export async function validateResourceWorkspace(
  resourceId: string,
  resourceType: "group" | "activity" | "response",
  workspaceId: string,
): Promise<boolean> {
  // #region agent log
  const requestId = crypto.randomUUID();
  fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:139',message:'validateResourceWorkspace entry',data:{requestId,resourceId,resourceType,workspaceId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  switch (resourceType) {
    case "group": {
      const group = await prisma.group.findUnique({
        where: { id: resourceId },
        select: { workspaceId: true, orgId: true },
      });
      if (!group) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:150',message:'validateResourceWorkspace group not found',data:{requestId,resourceId,resourceType,decision:'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        return false;
      }
      const matches = group.workspaceId ? group.workspaceId === workspaceId : group.orgId === workspaceId;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dcad8cdf-9cd2-450e-a34c-02d9135e8f5f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tenancy.ts:154',message:'validateResourceWorkspace group result',data:{requestId,resourceId,resourceType,groupWorkspaceId:group.workspaceId,groupOrgId:group.orgId,requestedWorkspaceId:workspaceId,matches,decision:matches?'ALLOW':'DENY'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      return matches;
    }
    case "activity": {
      const activity = await prisma.activity.findUnique({
        where: { id: resourceId },
        include: { group: { select: { workspaceId: true, orgId: true } } },
      });
      if (!activity) return false;
      if (activity.workspaceId) {
        return activity.workspaceId === workspaceId;
      }
      if (activity.group.workspaceId) {
        return activity.group.workspaceId === workspaceId;
      }
      return activity.group.orgId === workspaceId;
    }
    case "response": {
      const response = await prisma.response.findUnique({
        where: { id: resourceId },
        include: {
          activity: {
            include: {
              group: { select: { workspaceId: true, orgId: true } },
            },
          },
          group: { select: { workspaceId: true, orgId: true } },
        },
      });
      if (!response) return false;
      if (response.workspaceId) {
        return response.workspaceId === workspaceId;
      }
      if (response.activity?.workspaceId) {
        return response.activity.workspaceId === workspaceId;
      }
      if (response.activity?.group?.workspaceId) {
        return response.activity.group.workspaceId === workspaceId;
      }
      if (response.group?.workspaceId) {
        return response.group.workspaceId === workspaceId;
      }
      const activityOrgMatch =
        !response.activity?.group?.workspaceId &&
        response.activity?.group?.orgId === workspaceId;
      const groupOrgMatch =
        !response.group?.workspaceId &&
        response.group?.orgId === workspaceId;
      return Boolean(activityOrgMatch || groupOrgMatch);
    }
    default:
      return false;
  }
}

/**
 * Middleware helper that requires workspace context.
 * Use this in route handlers that need workspace scoping.
 */
export async function requireWorkspace(
  req: Request,
  requireActive: boolean = true,
): Promise<TenancyResult> {
  return resolveWorkspace(req, requireActive);
}

export async function requireWorkspaceRole(
  req: Request,
  allowedRoles: WorkspaceRole[],
  requireActive: boolean = true,
): Promise<TenancyResult> {
  const workspace = await resolveWorkspace(req, requireActive);
  if (!workspace.ok) return workspace;
  if (!allowedRoles.includes(workspace.context.membershipRole)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return workspace;
}
