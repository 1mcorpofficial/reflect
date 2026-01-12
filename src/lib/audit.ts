import { prisma } from "./prisma";
import { Prisma } from "@/generated/prisma/client";

type AuditParams = {
  action: string;
  targetType: string;
  targetId?: string | null;
  actorUserId?: string | null;
  actorParticipantId?: string | null;
  workspaceId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit(entry: AuditParams) {
  try {
    const workspaceId =
      entry.workspaceId ??
      (typeof entry.metadata?.workspaceId === "string"
        ? entry.metadata.workspaceId
        : null);
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        workspaceId: workspaceId ?? null,
        actorUserId: entry.actorUserId ?? null,
        actorParticipantId: entry.actorParticipantId ?? null,
        metadata: (entry.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    // Audit never blocks user flow; best-effort.
    console.error("Audit log failed", error);
  }
}
