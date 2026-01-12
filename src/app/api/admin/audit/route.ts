import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(take) && take > 0 ? take : 50,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      actorUserId: true,
      actorParticipantId: true,
      createdAt: true,
      metadata: true,
    },
  });

  return NextResponse.json({ logs });
}
