import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { buildSessionCookie, signSession, verifySecret } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function ensureOrgContext(userId: string) {
  const existing = await prisma.orgMember.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { orgId: true, role: true, org: { select: { id: true, name: true, slug: true } } },
  });
  if (existing) {
    return existing;
  }

  const baseName = "Organizacija";
  const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "org";
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const existsSlug = await prisma.organization.findUnique({ where: { slug } });
    if (!existsSlug) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const org = await prisma.organization.create({
    data: {
      name: baseName,
      slug,
      createdById: userId,
    },
    select: { id: true, name: true, slug: true },
  });

  const membership = await prisma.orgMember.create({
    data: {
      orgId: org.id,
      userId,
      role: "ORG_ADMIN",
      status: "ACTIVE",
      activatedAt: new Date(),
    },
    select: { orgId: true, role: true },
  });

  return { ...membership, org };
}

export async function POST(req: Request) {
  const limiterKey = buildRateLimitKey(req, "auth-login");
  const allowed = checkRateLimit(limiterKey, 10, 60_000);
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
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifySecret(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const membership = await ensureOrgContext(user.id);

  const isAdmin = isAdminEmail(user.email);
  const token = signSession({
    sub: user.id,
    role: isAdmin ? "admin" : "facilitator",
    orgId: membership.orgId,
    orgRole: membership.role,
  });
  const response = NextResponse.json(
    {
      user: { id: user.id, email: user.email, name: user.name },
      org: membership.org
        ? { id: membership.org.id, name: membership.org.name, slug: membership.org.slug }
        : null,
    },
    { status: 200 },
  );
  response.cookies.set(buildSessionCookie(token));
  void logAudit({
    action: "user.login",
    targetType: "User",
    targetId: user.id,
    actorUserId: user.id,
  });
  return response;
}
