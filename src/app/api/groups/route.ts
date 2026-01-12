import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { generateGroupCode } from "@/lib/codes";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const createGroupSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(500).optional(),
});

async function generateUniqueGroupCode() {
  for (let i = 0; i < 5; i++) {
    const code = generateGroupCode();
    const exists = await prisma.group.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Could not generate unique group code");
}

export async function POST(req: Request) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;
  if (!auth.session.orgId) {
    return NextResponse.json({ error: "Missing organization" }, { status: 401 });
  }

  const limiterKey = buildRateLimitKey(req, "group-create");
  const allowed = checkRateLimit(limiterKey, 10, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(allowed.retryAfter ?? 60) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const code = await generateUniqueGroupCode();
  const group = await prisma.group.create({
    data: {
      name: parsed.data.name.trim(),
      description: parsed.data.description,
      code,
      createdById: auth.session.sub,
      orgId: auth.session.orgId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      createdAt: true,
    },
  });

  void logAudit({
    action: "group.create",
    targetType: "Group",
    targetId: group.id,
    actorUserId: auth.session.sub,
  });

  return NextResponse.json({ group }, { status: 201 });
}

export async function GET(req: Request) {
  const auth = await requireRole(req, "facilitator");
  if (!auth.ok) return auth.response;

  const groups = await prisma.group.findMany({
    where: { orgId: auth.session.orgId ?? undefined },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ groups });
}
