import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { requireWorkspaceRole, validateResourceWorkspace } from "@/lib/tenancy";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  // Resolve workspace context and enforce role
  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

  const { groupId } = await params;

  // Validate that group belongs to workspace
  const belongsToWorkspace = await validateResourceWorkspace(
    groupId,
    "group",
    workspace.context.workspaceId,
  );

  if (!belongsToWorkspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const activities = await prisma.activity.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      privacyMode: true,
      openAt: true,
      closeAt: true,
      timezone: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ activities });
}
