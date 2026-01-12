/**
 * Super-admin endpoint for creating Organization Workspaces.
 * 
 * This endpoint is protected by requireAdmin() and allows platform admins
 * to create organization workspaces and send invites to workspace admins.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { hashSecret } from "@/lib/auth";
import crypto from "crypto";
import type { Prisma } from "@/generated/prisma/client";

const createOrgWorkspaceSchema = z.object({
  name: z.string().min(2).max(160),
  adminEmail: z.string().email(),
  slug: z.string().min(2).max(40).optional(),
  companyCode: z.string().max(50).optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "org";
}

async function generateUniqueSlug(base: string) {
  let slug = slugify(base);
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.workspace.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${slugify(base)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new Error("Could not generate unique slug");
}

async function generateUniqueOrgSlug(
  base: string,
  tx: Prisma.TransactionClient,
) {
  let slug = slugify(base);
  for (let i = 0; i < 10; i++) {
    const exists = await tx.organization.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${slugify(base)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

/**
 * Generates a secure invite token and returns both plain and hash.
 * The plain token is sent to the user, the hash is stored in DB.
 */
async function generateInviteToken(): Promise<{ token: string; hash: string }> {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await hashSecret(token);
  return { token, hash };
}

/**
 * Creates an organization workspace and sends an invite to the admin email.
 */
export async function POST(req: Request) {
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return adminCheck.response;

  const limiterKey = buildRateLimitKey(req, "admin-create-workspace");
  const allowed = checkRateLimit(limiterKey, 10, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(allowed.retryAfter ?? 60) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrgWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, adminEmail, slug: requestedSlug, companyCode } = parsed.data;
  const normalizedEmail = adminEmail.toLowerCase().trim();

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    // Generate unique slug
    const finalSlug = requestedSlug
      ? await generateUniqueSlug(requestedSlug)
      : await generateUniqueSlug(name);

    // Create workspace and invite in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Organization Workspace
      const workspace = await tx.workspace.create({
        data: {
          type: "ORGANIZATION",
          name: name.trim(),
          slug: finalSlug,
          companyCode: companyCode?.trim() || undefined,
          createdById: adminCheck.session.sub,
        },
        select: { id: true, name: true, slug: true, type: true },
      });

      // Ensure legacy Organization record exists for backward compatibility
      const orgSlug = await generateUniqueOrgSlug(
        workspace.slug ?? finalSlug,
        tx,
      );
      await tx.organization.upsert({
        where: { id: workspace.id },
        update: { name: workspace.name, slug: orgSlug },
        create: {
          id: workspace.id,
          name: workspace.name,
          slug: orgSlug,
          createdById: adminCheck.session.sub,
        },
      });

      // Generate invite token
      const { token, hash } = await generateInviteToken();

      // Create invite (expires in 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invite = await tx.workspaceInvite.create({
        data: {
          workspaceId: workspace.id,
          email: normalizedEmail,
          intendedRole: "ORG_ADMIN",
          tokenHash: hash,
          expiresAt,
          createdById: adminCheck.session.sub,
        },
        select: { id: true, email: true, expiresAt: true },
      });

      // If user already exists, create membership immediately (but still send invite for activation)
      if (existingUser) {
        await tx.workspaceMembership.create({
          data: {
            workspaceId: workspace.id,
            userId: existingUser.id,
            role: "ORG_ADMIN",
            status: "INVITED", // Will be activated when they accept invite
            invitedAt: new Date(),
          },
        });
        await tx.orgMember.upsert({
          where: {
            orgId_userId: {
              orgId: workspace.id,
              userId: existingUser.id,
            },
          },
          update: {
            role: "ORG_ADMIN",
            status: "INVITED",
            invitedAt: new Date(),
          },
          create: {
            orgId: workspace.id,
            userId: existingUser.id,
            role: "ORG_ADMIN",
            status: "INVITED",
            invitedAt: new Date(),
          },
        });
      }

      return { workspace, invite, token };
    });

    // TODO: Send email with magic link
    // For now, we'll return the token in the response (in production, this should be sent via email)
    // In production: await sendInviteEmail(normalizedEmail, result.token, result.workspace.name);

    void logAudit({
      action: "workspace.create",
      targetType: "Workspace",
      targetId: result.workspace.id,
      actorUserId: adminCheck.session.sub,
      workspaceId: result.workspace.id,
      metadata: {
        workspaceType: "ORGANIZATION",
        adminEmail: normalizedEmail,
      },
    });

    return NextResponse.json(
      {
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
          type: result.workspace.type,
        },
        invite: {
          id: result.invite.id,
          email: result.invite.email,
          expiresAt: result.invite.expiresAt,
        },
        // TODO: Remove this in production - token should only be sent via email
        inviteToken: result.token,
        inviteUrl: `/api/workspaces/invites/accept?token=${result.token}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating organization workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
