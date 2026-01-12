import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [orgs, groups, activities, exports] = await Promise.all([
    prisma.orgMember.findMany({
      where: { userId },
      select: {
        role: true,
        status: true,
        org: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.group.findMany({
      where: { createdById: userId },
      select: { id: true, name: true, code: true, createdAt: true },
    }),
    prisma.activity.findMany({
      where: { createdById: userId },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.dataExport.findMany({
      where: { createdById: userId },
      select: { id: true, format: true, status: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    user,
    orgMemberships: orgs,
    groupsCreated: groups,
    activitiesCreated: activities,
    exportsCreated: exports,
    generatedAt: new Date().toISOString(),
  });
}
