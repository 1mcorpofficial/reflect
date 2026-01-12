import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { buildSessionCookie, hashSecret, signSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "org";
}

async function createDefaultOrgForUser(userId: string, baseName: string) {
  const baseSlug = slugify(baseName);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (!exists) break;
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

  return { org, membership };
}

export async function POST(req: Request) {
  const limiterKey = buildRateLimitKey(req, "auth-register");
  const allowed = checkRateLimit(limiterKey, 5, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(allowed.retryAfter ?? 60),
        },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await hashSecret(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const orgName = parsed.data.name ?? email.split("@")[0] ?? "Organizacija";
  const { org, membership } = await createDefaultOrgForUser(user.id, orgName);

  const isAdmin = isAdminEmail(user.email);
  const token = signSession({
    sub: user.id,
    role: isAdmin ? "admin" : "facilitator",
    orgId: membership.orgId,
    orgRole: membership.role,
  });
  const response = NextResponse.json(
    { user, org: { id: org.id, name: org.name, slug: org.slug } },
    { status: 201 },
  );
  response.cookies.set(buildSessionCookie(token));
  void logAudit({
    action: "user.register",
    targetType: "User",
    targetId: user.id,
    actorUserId: user.id,
  });
  return response;
}
