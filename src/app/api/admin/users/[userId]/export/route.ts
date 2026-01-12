import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

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
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
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

  // Build workspace filter for data queries (adminWorkspaceIds.length > 0 guaranteed)
  const workspaceFilter = {
    OR: [
      { workspaceId: { in: adminWorkspaceIds } },
      { workspaceId: null, group: { workspaceId: { in: adminWorkspaceIds } } },
      { workspaceId: null, group: { orgId: { in: adminWorkspaceIds } } },
    ],
  };

  const [orgs, groups, activities, exports] = await Promise.all([
    prisma.orgMember.findMany({
      where: {
        userId,
        orgId: { in: adminWorkspaceIds },
      },
      select: {
        role: true,
        status: true,
        org: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.group.findMany({
      where: {
        createdById: userId,
        OR: [
          { workspaceId: { in: adminWorkspaceIds } },
          { workspaceId: null, orgId: { in: adminWorkspaceIds } },
        ],
      },
      select: { id: true, name: true, code: true, createdAt: true },
    }),
    prisma.activity.findMany({
      where: {
        createdById: userId,
        ...workspaceFilter,
      },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.dataExport.findMany({
      where: {
        createdById: userId,
        ...workspaceFilter,
      },
      select: { id: true, format: true, status: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    user,
    orgMemberships: orgs,
    groupsCreated: groups,
    activitiesCreated: activities,
    exportsCreated: exports,
    generatedAt: new Date().toISOString(),
  });
}
