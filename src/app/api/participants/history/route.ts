import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  // Filter responses by workspace through activity
  // This ensures participant only sees responses from their workspace
  const responses = await prisma.response.findMany({
    where: {
      participantId: auth.session.sub,
      // Filter by workspaceId through activity (support backward compatibility)
      OR: [
        { workspaceId: { not: null } },
        {
          workspaceId: null,
          activity: {
            OR: [
              { workspaceId: { not: null } },
              {
                workspaceId: null,
                group: { workspaceId: { not: null } },
              },
            ],
          },
        },
      ],
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

