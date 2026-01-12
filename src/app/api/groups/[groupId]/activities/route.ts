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
