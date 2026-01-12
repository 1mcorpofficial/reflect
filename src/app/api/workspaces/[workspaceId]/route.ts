import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/guards";
import { requireWorkspaceRole } from "@/lib/tenancy";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(160),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  const workspace = await requireWorkspaceRole(req, ["ORG_ADMIN", "OWNER"]);
  if (!workspace.ok) return workspace.response;

  const { workspaceId } = await params;
  if (workspaceId !== workspace.context.workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: parsed.data.name.trim() },
    select: { id: true, name: true, type: true, slug: true },
  });

  void logAudit({
    action: "workspace.update",
    targetType: "Workspace",
    targetId: updated.id,
    actorUserId: auth.session.sub,
    workspaceId: workspace.context.workspaceId,
    metadata: { workspaceId: workspace.context.workspaceId },
  });

  return NextResponse.json({ workspace: updated });
}
