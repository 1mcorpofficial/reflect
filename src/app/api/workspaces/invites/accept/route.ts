/**
 * Workspace invite acceptance endpoint.
 * 
 * Accepts a workspace invite token and:
 * - If user exists: creates/activates membership
 * - If user doesn't exist: creates user account and membership
 * 
 * Security:
 * - Token is validated (hash match, expiry, one-time use)
 * - Rate limited
 * - CSRF protected
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCsrfToken } from "@/lib/csrf";
import { hashSecret, signSession, buildSessionCookie, verifySecret } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import type { Prisma, WorkspaceRole } from "@/generated/prisma/client";

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  // Optional: if user doesn't exist, create account with these fields
  name: z.string().min(1).max(120).optional(),
  password: z.string().min(8).optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "org";
}

async function uniqueOrgSlug(
  tx: Prisma.TransactionClient,
  base: string,
): Promise<string> {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const exists = await tx.organization.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

async function ensureLegacyOrgForWorkspace(
  tx: Prisma.TransactionClient,
  workspace: { id: string; name: string; type: string; slug?: string | null },
  userId: string,
  intendedRole: WorkspaceRole,
): Promise<{ orgId: string; orgRole: "ORG_ADMIN" | "FACILITATOR" }> {
  const slug = await uniqueOrgSlug(tx, workspace.slug ?? workspace.name);
  await tx.organization.upsert({
    where: { id: workspace.id },
    update: { name: workspace.name, slug },
    create: {
      id: workspace.id,
      name: workspace.name,
      slug,
      createdById: userId,
    },
  });

  const orgRole = intendedRole === "ORG_ADMIN" ? "ORG_ADMIN" : "FACILITATOR";
  await tx.orgMember.upsert({
    where: {
      orgId_userId: {
        orgId: workspace.id,
        userId,
      },
    },
    update: {
      role: orgRole,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
    create: {
      orgId: workspace.id,
      userId,
      role: orgRole,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });

  return { orgId: workspace.id, orgRole };
}

async function ensureLegacyOrgForUser(
  tx: Prisma.TransactionClient,
  userId: string,
  nameHint: string,
): Promise<{ orgId: string; orgRole: "ORG_ADMIN" | "FACILITATOR" }> {
  const existing = await tx.orgMember.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { orgId: true, role: true },
  });
  if (existing) {
    return { orgId: existing.orgId, orgRole: existing.role };
  }

  const slug = await uniqueOrgSlug(tx, nameHint);
  const org = await tx.organization.create({
    data: {
      name: nameHint,
      slug,
      createdById: userId,
    },
    select: { id: true },
  });
  const membership = await tx.orgMember.create({
    data: {
      orgId: org.id,
      userId,
      role: "ORG_ADMIN",
      status: "ACTIVE",
      activatedAt: new Date(),
    },
    select: { role: true },
  });
  return { orgId: org.id, orgRole: membership.role };
}

/**
 * Validates invite token and returns invite if valid.
 * 
 * Security: Uses verifySecret to compare plain token with stored hash.
 * This prevents timing attacks and ensures proper bcrypt comparison.
 */
async function validateInviteToken(token: string): Promise<
  | { valid: true; invite: { id: string; workspaceId: string; email: string; intendedRole: WorkspaceRole; workspace: { id: string; name: string; type: string } } }
  | { valid: false; error: string }
> {
  // Find all non-accepted, non-expired invites
  // We need to check all because we can't query by hash directly
  const invites = await prisma.workspaceInvite.findMany({
    where: {
      acceptedAt: null,
      expiresAt: { gte: new Date() },
    },
    include: {
      workspace: {
        select: { id: true, name: true, type: true, slug: true },
      },
    },
  });

  // Compare token with each invite's hash
  for (const invite of invites) {
    const isValid = await verifySecret(token, invite.tokenHash);
    if (isValid) {
      return { valid: true, invite };
    }
  }

  return { valid: false, error: "Invalid invite token" };
}

export async function POST(req: Request) {
  const csrfCheck = await requireCsrfToken(req);
  if (!csrfCheck.ok) {
    return csrfCheck.response;
  }

  const limiterKey = buildRateLimitKey(req, "invite-accept");
  const allowed = checkRateLimit(limiterKey, 5, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(allowed.retryAfter ?? 60) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { token, name, password } = parsed.data;

  // Validate token
  const validation = await validateInviteToken(token);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error || "Invalid invite token" },
      { status: 400 },
    );
  }

  // TypeScript now knows validation.valid === true, so invite exists
  const { invite } = validation;

  try {
    if (!name || !password) {
      const existingUser = await prisma.user.findUnique({
        where: { email: invite.email },
        select: { id: true },
      });
      if (!existingUser) {
        return NextResponse.json(
          { error: "User account required. Please provide name and password." },
          { status: 400 },
        );
      }
    }

    const passwordHash = password ? await hashSecret(password) : null;

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: invite.email },
        select: { id: true, email: true, name: true },
      });

      let userId: string;
      let isNewUser = false;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const newUser = await tx.user.create({
          data: {
            email: invite.email,
            name: name?.trim(),
            passwordHash: passwordHash ?? "",
          },
          select: { id: true, email: true, name: true },
        });

        userId = newUser.id;
        isNewUser = true;

        const personalWorkspace = await tx.workspace.create({
          data: {
            type: "PERSONAL",
            name: `${newUser.name || "Personal"} Workspace`,
            createdById: userId,
          },
          select: { id: true, name: true, type: true },
        });

        await tx.workspaceMembership.create({
          data: {
            workspaceId: personalWorkspace.id,
            userId,
            role: "OWNER",
            status: "ACTIVE",
            activatedAt: new Date(),
          },
        });
      }

      const membership = await tx.workspaceMembership.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId,
          },
        },
        create: {
          workspaceId: invite.workspaceId,
          userId,
          role: invite.intendedRole,
          status: "ACTIVE",
          activatedAt: new Date(),
        },
        update: {
          role: invite.intendedRole,
          status: "ACTIVE",
          activatedAt: new Date(),
        },
        select: {
          id: true,
          workspaceId: true,
          role: true,
          status: true,
        },
      });

      let legacyOrg: { orgId: string; orgRole: "ORG_ADMIN" | "FACILITATOR" };
      if (invite.workspace.type === "ORGANIZATION") {
        legacyOrg = await ensureLegacyOrgForWorkspace(
          tx,
          invite.workspace,
          userId,
          invite.intendedRole,
        );
      } else {
        legacyOrg = await ensureLegacyOrgForUser(
          tx,
          userId,
          name?.trim() || invite.email.split("@")[0] || "Organizacija",
        );
      }

      const update = await tx.workspaceInvite.updateMany({
        where: { id: invite.id, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });
      if (update.count === 0) {
        throw new Error("INVITE_ALREADY_USED");
      }

      return { userId, membership, legacyOrg, isNewUser };
    });

    // Create session
    const isAdmin = isAdminEmail(invite.email);
    const token = signSession({
      sub: result.userId,
      role: isAdmin ? "admin" : "facilitator",
      activeWorkspaceId: invite.workspaceId,
      workspaceRole: result.membership.role,
      orgId: result.legacyOrg.orgId,
      orgRole: result.legacyOrg.orgRole,
    });

    void logAudit({
      action: "workspace.invite.accept",
      targetType: "WorkspaceInvite",
      targetId: invite.id,
      actorUserId: result.userId,
      workspaceId: invite.workspaceId,
      metadata: {
        workspaceId: invite.workspaceId,
        isNewUser: result.isNewUser,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        workspace: {
          id: invite.workspace.id,
          name: invite.workspace.name,
          type: invite.workspace.type,
        },
        membership: {
          role: result.membership.role,
          status: result.membership.status,
        },
        isNewUser: result.isNewUser,
      },
      { status: 200 },
    );

    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "INVITE_ALREADY_USED") {
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 400 },
      );
    }
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for accepting invite via URL (magic link).
 * Redirects to frontend with token in query param.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  // Validate token
  const validation = await validateInviteToken(token);
  if (!validation.valid) {
    // Redirect to frontend error page
    return NextResponse.redirect(
      new URL(`/invite-error?reason=${encodeURIComponent(validation.error || "invalid")}`, req.url),
    );
  }

  // Redirect to frontend invite acceptance page with token
  return NextResponse.redirect(
    new URL(`/accept-invite?token=${encodeURIComponent(token)}`, req.url),
  );
}
