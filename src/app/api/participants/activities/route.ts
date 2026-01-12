import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  if (!auth.session.groupId) {
    return NextResponse.json(
      { error: "Session missing group context" },
      { status: 400 },
    );
  }

  const activities = await prisma.activity.findMany({
    where: {
      groupId: auth.session.groupId,
      status: "PUBLISHED",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      openAt: true,
      closeAt: true,
      timezone: true,
      privacyMode: true,
      status: true,
      responses: {
        where: {
          OR: [
            { participantId: auth.session.sub },
            { groupParticipantId: auth.session.membershipId ?? "" },
          ],
        },
        select: { id: true },
      },
      questionnaire: {
        select: {
          id: true,
          questions: {
            select: {
              id: true,
              prompt: true,
              helperText: true,
              type: true,
              required: true,
              order: true,
              config: true,
              followUp: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  const now = new Date();
  const withState = activities
    .map((a) => {
      const isOpen =
        (!a.openAt || a.openAt <= now) &&
        (!a.closeAt || a.closeAt >= now) &&
        a.status === "PUBLISHED";
      const isPlanned = a.openAt !== null && a.openAt > now;
      const isClosed =
        a.status === "CLOSED" ||
        (a.closeAt !== null && a.closeAt < now && a.status !== "DRAFT");
      const state = isOpen ? "OPEN" : isPlanned ? "PLANNED" : isClosed ? "CLOSED" : "OTHER";
      return { ...a, state };
    })
    .filter((a) => a.state === "OPEN" || a.responses.length === 0); // keep open ones; already-submitted can be shown even if closed

  return NextResponse.json({ activities: withState });
}
