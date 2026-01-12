import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    await prisma.$queryRaw`SELECT 1`;
    const migrationCount = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT COUNT(*)::bigint AS count FROM "_prisma_migrations"`;
    return NextResponse.json({
      db: "ok",
      migrations: Number(migrationCount[0]?.count ?? 0),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const requestId = crypto.randomUUID();
    console.error(`[${requestId}] Admin health check failed`, String(error));
    return NextResponse.json(
      { error: "DB check failed", requestId },
      { status: 500, headers: { "x-request-id": requestId } },
    );
  }
}
