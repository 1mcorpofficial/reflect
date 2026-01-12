/**
 * Get user's workspaces endpoint.
 * Returns all workspaces the user is a member of.
 */

import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.workspaceMembership.findMany({
    where: {
      userId: session.sub,
      status: "ACTIVE",
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          type: true,
          slug: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      activatedAt: "desc",
    },
  });

  // Sort: Personal workspace first, then by activation date
  const sorted = memberships.sort((a, b) => {
    if (a.workspace.type === "PERSONAL" && b.workspace.type !== "PERSONAL") return -1;
    if (a.workspace.type !== "PERSONAL" && b.workspace.type === "PERSONAL") return 1;
    const aTime = a.activatedAt?.getTime() ?? 0;
    const bTime = b.activatedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  const workspaces = sorted.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    type: m.workspace.type,
    slug: m.workspace.slug,
    role: m.role,
    isActive: m.workspace.id === session.activeWorkspaceId,
    createdAt: m.workspace.createdAt,
  }));

  return NextResponse.json({ workspaces });
}
