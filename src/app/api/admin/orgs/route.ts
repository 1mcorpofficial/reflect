import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

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

  // Filter organizations by admin's workspace memberships
  // Since Organization.id matches Workspace.id for backward compatibility (adminWorkspaceIds.length > 0 guaranteed)
  const organizations = await prisma.organization.findMany({
    where: { id: { in: adminWorkspaceIds } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      _count: { select: { members: true, groups: true } },
    },
  });

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      ...org,
      memberCount: org._count.members,
      groupCount: org._count.groups,
    })),
  });
}
