import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "facilitator" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.role === "admin" || isAdminEmail(user.email);

  // Get workspace membership (new)
  const workspaceMembership = session.activeWorkspaceId
    ? await prisma.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: session.activeWorkspaceId,
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
      })
    : null;

  // Backward compatibility: get org membership
  const membership = session.orgId
    ? await prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId: session.orgId, userId: session.sub } },
        select: {
          org: { select: { id: true, name: true, slug: true } },
          role: true,
          status: true,
        },
      })
    : null;

  return NextResponse.json({
    user,
    workspace: workspaceMembership?.workspace ?? null,
    workspaceRole: workspaceMembership?.role ?? session.workspaceRole ?? null,
    // Backward compatibility
    org: membership?.org ?? null,
    orgRole: membership?.role ?? null,
    role: session.role,
    isAdmin,
  });
}
