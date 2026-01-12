/**
 * DEPRECATED: This endpoint is deprecated. Use /api/workspaces instead.
 * 
 * This endpoint is kept for backward compatibility during migration.
 * It will be removed in a future version.
 * 
 * Migration guide:
 * - POST /api/orgs -> POST /api/admin/workspaces (for super-admin) or use workspace invite flow
 * - GET /api/orgs -> GET /api/workspaces
 */

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated",
      message: "Use /api/admin/workspaces to create organization workspaces, or use the workspace invite flow.",
      deprecated: true,
      migration: {
        endpoint: "/api/admin/workspaces",
        note: "Organization workspaces should be created by super-admin or through invite flow",
      },
    },
    { status: 410 }, // 410 Gone
  );
}

export async function GET(req: Request) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  // Return workspaces instead of orgs for backward compatibility
  const memberships = await prisma.workspaceMembership.findMany({
    where: {
      userId: auth.session.sub,
      status: "ACTIVE",
      workspace: {
        type: "ORGANIZATION", // Only return organization workspaces
      },
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      },
    },
  });

  // Also include legacy orgs for backward compatibility
  const legacyOrgs = await prisma.orgMember.findMany({
    where: { userId: auth.session.sub, status: "ACTIVE" },
    select: {
      org: { select: { id: true, name: true, slug: true, createdAt: true } },
      role: true,
    },
  });

  return NextResponse.json({
    orgs: [
      ...memberships.map((m) => ({
        ...m.workspace,
        role: m.role === "ORG_ADMIN" ? "ORG_ADMIN" : "FACILITATOR",
      })),
      ...legacyOrgs.map((m) => ({ ...m.org, role: m.role })),
    ],
    deprecated: true,
    message: "This endpoint is deprecated. Use /api/workspaces instead.",
  });
}
