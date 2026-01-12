import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSessionCookie, signSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const orgSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(60).optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "org";
}

async function uniqueSlug(base: string) {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

export async function POST(req: Request) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  const limiterKey = buildRateLimitKey(req, "org-create");
  const allowed = checkRateLimit(limiterKey, 5, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(allowed.retryAfter ?? 60) },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = orgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const slug = await uniqueSlug(parsed.data.slug ?? parsed.data.name);

  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      createdById: auth.session.sub,
    },
    select: { id: true, name: true, slug: true },
  });

  const membership = await prisma.orgMember.create({
    data: {
      orgId: org.id,
      userId: auth.session.sub,
      role: "ORG_ADMIN",
      status: "ACTIVE",
      activatedAt: new Date(),
    },
    select: { role: true },
  });

  // Optionally refresh session to new org
  const token = signSession({
    sub: auth.session.sub,
    role: "facilitator",
    orgId: org.id,
    orgRole: membership.role,
  });
  const response = NextResponse.json({ org, orgRole: membership.role }, { status: 201 });
  response.cookies.set(buildSessionCookie(token));
  void logAudit({
    action: "org.create",
    targetType: "Organization",
    targetId: org.id,
    actorUserId: auth.session.sub,
  });
  return response;
}

export async function GET(req: Request) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  const orgs = await prisma.orgMember.findMany({
    where: { userId: auth.session.sub, status: "ACTIVE" },
    select: {
      org: { select: { id: true, name: true, slug: true, createdAt: true } },
      role: true,
    },
  });

  return NextResponse.json({
    orgs: orgs.map((m) => ({ ...m.org, role: m.role })),
  });
}
