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

  const { groupId } = await params;
  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

  const belongsToWorkspace = await validateResourceWorkspace(
    groupId,
    "group",
    workspace.context.workspaceId,
  );
  if (!belongsToWorkspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const members = await prisma.groupParticipant.findMany({
    where: { groupId },
    orderBy: { joinedAt: "desc" },
    select: {
      id: true,
      joinedAt: true,
      participant: { select: { id: true, displayName: true, email: true } },
    },
  });

  return NextResponse.json({
    participants: members.map((m) => ({
      membershipId: m.id,
      participantId: m.participant.id,
      displayName: m.participant.displayName,
      email: m.participant.email,
      joinedAt: m.joinedAt,
    })),
  });
}
