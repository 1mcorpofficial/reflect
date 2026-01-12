import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const requestedWorkspaceId = url.searchParams.get("workspaceId"); // Optional workspace filter

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

  // If workspaceId is provided, validate membership
  if (requestedWorkspaceId) {
    if (!adminWorkspaceIds.includes(requestedWorkspaceId)) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
  }

  // Filter by workspace: if provided, use it (already validated); otherwise use admin's workspaces (adminWorkspaceIds.length > 0 guaranteed)
  const users = await prisma.user.findMany({
    where: requestedWorkspaceId
      ? {
          workspaceMemberships: {
            some: {
              workspaceId: requestedWorkspaceId,
              status: "ACTIVE",
            },
          },
        }
      : {
          workspaceMemberships: {
            some: {
              workspaceId: { in: adminWorkspaceIds },
              status: "ACTIVE",
            },
          },
        },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          orgMemberships: true,
          workspaceMemberships: true, // Include workspace memberships count
          activities: true,
          groups: true,
        },
      },
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      orgCount: user._count.orgMemberships,
      workspaceCount: user._count.workspaceMemberships, // Include workspace count
      activityCount: user._count.activities,
      groupCount: user._count.groups,
    })),
  });
}
