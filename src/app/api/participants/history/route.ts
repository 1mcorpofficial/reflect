import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  const responses = await prisma.response.findMany({
    where: {
      participantId: auth.session.sub,
    },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      activity: {
        select: {
          id: true,
          title: true,
          privacyMode: true,
        },
      },
    },
  });

  return NextResponse.json({ responses });
}

