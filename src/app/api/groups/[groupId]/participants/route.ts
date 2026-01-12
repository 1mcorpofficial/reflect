import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;

  const { groupId } = await params;
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, createdById: true, orgId: true },
  });

  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (auth.session.orgId && group.orgId !== auth.session.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
