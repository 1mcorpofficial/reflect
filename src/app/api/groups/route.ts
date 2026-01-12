import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { generateGroupCode } from "@/lib/codes";
import { requireRole } from "@/lib/guards";
import { requireWorkspaceRole } from "@/lib/tenancy";
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
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  // Resolve workspace context and enforce role
  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

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
  const legacyOrgId =
    workspace.context.workspaceType === "ORGANIZATION"
      ? workspace.context.workspaceId
      : workspace.session.orgId;
  if (!legacyOrgId) {
    return NextResponse.json(
      { error: "Organization context missing" },
      { status: 400 },
    );
  }
  const group = await prisma.group.create({
    data: {
      name: parsed.data.name.trim(),
      description: parsed.data.description,
      code,
      createdById: workspace.session.sub,
      workspaceId: workspace.context.workspaceId,
      // Backward compatibility: also set orgId if available
      orgId: legacyOrgId,
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
    actorUserId: workspace.session.sub,
    workspaceId: workspace.context.workspaceId,
    metadata: { workspaceId: workspace.context.workspaceId },
  });

  return NextResponse.json({ group }, { status: 201 });
}

export async function GET(req: Request) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  // Resolve workspace context and enforce role
  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "STAFF", "OWNER"]);
  if (!workspace.ok) return workspace.response;

  const legacyOrgId =
    workspace.context.workspaceType === "ORGANIZATION"
      ? workspace.context.workspaceId
      : workspace.session.orgId;

  // Filter groups by workspace_id (with backward compatibility for orgId)
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { workspaceId: workspace.context.workspaceId },
        // Backward compatibility: also check orgId if workspaceId is not set
        ...(legacyOrgId
          ? [{ orgId: legacyOrgId, workspaceId: null }]
          : []),
      ],
    },
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
