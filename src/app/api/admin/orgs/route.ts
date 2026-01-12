import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      _count: { select: { members: true, groups: true } },
    },
  });

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      ...org,
      memberCount: org._count.members,
      groupCount: org._count.groups,
    })),
  });
}
