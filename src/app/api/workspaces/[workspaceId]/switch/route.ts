/**
 * Switch active workspace endpoint.
 * Updates the session to use a different workspace.
 */

import { NextResponse } from "next/server";
import { getSessionFromRequest, signSession, buildSessionCookie } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { requireCsrfToken } from "@/lib/csrf";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const csrfCheck = await requireCsrfToken(req);
  if (!csrfCheck.ok) {
    return csrfCheck.response;
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  // Validate that user is a member of this workspace
  const membership = await prisma.workspaceMembership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.sub,
      },
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          type: true,
          slug: true,
        },
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Workspace not found or access denied" },
      { status: 404 },
    );
  }

  // Get user for admin check
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true },
  });

  const isAdmin = session.role === "admin" || (user ? isAdminEmail(user.email) : false);

  // Create new session with updated workspace
  const newToken = signSession({
    sub: session.sub,
    role: session.role,
    activeWorkspaceId: workspaceId,
    workspaceRole: membership.role,
    // Backward compatibility
    orgId: session.orgId,
    orgRole: session.orgRole,
  });

  const response = NextResponse.json(
    {
      success: true,
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        type: membership.workspace.type,
        slug: membership.workspace.slug,
      },
      role: membership.role,
    },
    { status: 200 },
  );

  response.cookies.set(buildSessionCookie(newToken));
  return response;
}
