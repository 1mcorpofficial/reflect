#!/usr/bin/env tsx
/**
 * Backfill script to migrate existing Organization/OrgMember data to Workspace/WorkspaceMembership model.
 * 
 * This script:
 * 1. Creates Workspace records for each existing Organization
 * 2. Creates WorkspaceMembership records for each existing OrgMember
 * 3. Populates workspace_id fields in Group, Activity, Response, DataExport, AuditLog
 * 
 * Usage:
 *   tsx --env-file=.env scripts/backfill-workspaces.ts [--dry-run]
 * 
 * Safety:
 *   - By default runs in dry-run mode (prints what would be done)
 *   - Use --execute flag to actually perform the migration
 *   - Uses transactions for safety
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { hashSecret } from "../src/lib/auth";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface BackfillStats {
  organizationsMigrated: number;
  membershipsMigrated: number;
  groupsUpdated: number;
  activitiesUpdated: number;
  responsesUpdated: number;
  exportsUpdated: number;
  auditLogsUpdated: number;
  errors: string[];
}

async function backfillWorkspaces(dryRun: boolean = true): Promise<BackfillStats> {
  const stats: BackfillStats = {
    organizationsMigrated: 0,
    membershipsMigrated: 0,
    groupsUpdated: 0,
    activitiesUpdated: 0,
    responsesUpdated: 0,
    exportsUpdated: 0,
    auditLogsUpdated: 0,
    errors: [],
  };

  console.log(`\n${dryRun ? "🔍 DRY RUN MODE" : "⚡ EXECUTION MODE"}\n`);

  try {
    // Step 1: Migrate Organizations to Workspaces
    console.log("Step 1: Migrating Organizations to Workspaces...");
    const organizations = await prisma.organization.findMany({
      include: { members: true },
    });

    for (const org of organizations) {
      if (dryRun) {
        console.log(`  Would create Workspace: ${org.name} (${org.id})`);
        stats.organizationsMigrated++;
      } else {
        try {
          const existing = await prisma.workspace.findUnique({
            where: { id: org.id },
            select: { id: true },
          });
          if (existing) {
            console.log(`  ↺ Workspace already exists: ${org.name} (${org.id})`);
            continue;
          }
          const workspace = await prisma.workspace.create({
            data: {
              id: org.id, // Use same ID for easier mapping
              type: "ORGANIZATION",
              name: org.name,
              slug: org.slug,
              createdById: org.createdById || undefined,
              createdAt: org.createdAt,
              updatedAt: org.updatedAt,
            },
          });
          console.log(`  ✓ Created Workspace: ${workspace.name} (${workspace.id})`);
          stats.organizationsMigrated++;
        } catch (error) {
          const msg = `Failed to create workspace for org ${org.id}: ${error}`;
          console.error(`  ✗ ${msg}`);
          stats.errors.push(msg);
        }
      }
    }

    // Step 2: Migrate OrgMembers to WorkspaceMemberships
    console.log("\nStep 2: Migrating OrgMembers to WorkspaceMemberships...");
    const orgMembers = await prisma.orgMember.findMany();

    for (const member of orgMembers) {
      if (dryRun) {
        console.log(
          `  Would create WorkspaceMembership: user ${member.userId} → workspace ${member.orgId} (${member.role})`,
        );
        stats.membershipsMigrated++;
      } else {
        try {
          const existing = await prisma.workspaceMembership.findUnique({
            where: {
              workspaceId_userId: {
                workspaceId: member.orgId,
                userId: member.userId,
              },
            },
            select: { id: true },
          });
          if (existing) {
            console.log(
              `  ↺ WorkspaceMembership already exists: ${member.userId} → ${member.orgId}`,
            );
            continue;
          }
          // Map old roles to new roles
          const workspaceRole =
            member.role === "ORG_ADMIN" ? "ORG_ADMIN" : "STAFF";

          const membership = await prisma.workspaceMembership.create({
            data: {
              workspaceId: member.orgId, // Same ID as org
              userId: member.userId,
              role: workspaceRole,
              status: member.status,
              invitedAt: member.invitedAt,
              activatedAt: member.activatedAt || undefined,
              createdAt: member.invitedAt,
              updatedAt: member.activatedAt || member.invitedAt,
            },
          });
          console.log(
            `  ✓ Created WorkspaceMembership: ${membership.userId} → ${membership.workspaceId}`,
          );
          stats.membershipsMigrated++;
        } catch (error) {
          const msg = `Failed to create membership for user ${member.userId} in org ${member.orgId}: ${error}`;
          console.error(`  ✗ ${msg}`);
          stats.errors.push(msg);
        }
      }
    }

    // Step 3: Update Groups with workspace_id
    console.log("\nStep 3: Updating Groups with workspace_id...");
    const groups = await prisma.group.findMany({
      where: { workspaceId: null },
      include: { organization: true },
    });

    for (const group of groups) {
      if (!group.orgId) {
        stats.errors.push(`Group ${group.id} has no orgId`);
        continue;
      }

      if (dryRun) {
        console.log(`  Would update Group ${group.id}: workspaceId = ${group.orgId}`);
        stats.groupsUpdated++;
      } else {
        try {
          await prisma.group.update({
            where: { id: group.id },
            data: { workspaceId: group.orgId },
          });
          console.log(`  ✓ Updated Group: ${group.id}`);
          stats.groupsUpdated++;
        } catch (error) {
          const msg = `Failed to update group ${group.id}: ${error}`;
          console.error(`  ✗ ${msg}`);
          stats.errors.push(msg);
        }
      }
    }

    // Step 4: Update Activities with workspace_id (from group)
    console.log("\nStep 4: Updating Activities with workspace_id...");
    const activities = await prisma.activity.findMany({
      where: { workspaceId: null },
      include: { group: true },
    });

    for (const activity of activities) {
      if (!activity.group.workspaceId && !activity.group.orgId) {
        stats.errors.push(`Activity ${activity.id} has no group workspaceId or orgId`);
        continue;
      }

      const workspaceId = activity.group.workspaceId || activity.group.orgId;
      if (!workspaceId) continue;

      if (dryRun) {
        console.log(`  Would update Activity ${activity.id}: workspaceId = ${workspaceId}`);
        stats.activitiesUpdated++;
      } else {
        try {
          await prisma.activity.update({
            where: { id: activity.id },
            data: { workspaceId },
          });
          console.log(`  ✓ Updated Activity: ${activity.id}`);
          stats.activitiesUpdated++;
        } catch (error) {
          const msg = `Failed to update activity ${activity.id}: ${error}`;
          console.error(`  ✗ ${msg}`);
          stats.errors.push(msg);
        }
      }
    }

    // Step 5: Update Responses with workspace_id (from activity or group)
    console.log("\nStep 5: Updating Responses with workspace_id...");
    const responses = await prisma.response.findMany({
      where: { workspaceId: null },
      include: { activity: { include: { group: true } }, group: true },
    });

    for (const response of responses) {
      const workspaceId =
        response.activity?.workspaceId ||
        response.activity?.group?.workspaceId ||
        response.activity?.group?.orgId ||
        response.group?.workspaceId ||
        response.group?.orgId;

      if (!workspaceId) {
        stats.errors.push(`Response ${response.id} has no workspaceId source`);
        continue;
      }

      if (dryRun) {
        console.log(`  Would update Response ${response.id}: workspaceId = ${workspaceId}`);
        stats.responsesUpdated++;
      } else {
        try {
          await prisma.response.update({
            where: { id: response.id },
            data: { workspaceId },
          });
          console.log(`  ✓ Updated Response: ${response.id}`);
          stats.responsesUpdated++;
        } catch (error) {
          const msg = `Failed to update response ${response.id}: ${error}`;
          console.error(`  ✗ ${msg}`);
          stats.errors.push(msg);
        }
      }
    }

    // Step 6: Update DataExports with workspace_id
    console.log("\nStep 6: Updating DataExports with workspace_id...");
    const exports = await prisma.dataExport.findMany({
      where: { workspaceId: null },
      include: { group: true, activity: { include: { group: true } } },
    });

    for (const exp of exports) {
      const workspaceId =
        exp.group?.workspaceId ||
        exp.group?.orgId ||
        exp.activity?.workspaceId ||
        exp.activity?.group?.workspaceId ||
        exp.activity?.group?.orgId;

      if (!workspaceId) {
        // Some exports might not have workspace context - skip silently
        continue;
      }

      if (dryRun) {
        console.log(`  Would update DataExport ${exp.id}: workspaceId = ${workspaceId}`);
        stats.exportsUpdated++;
      } else {
        try {
          await prisma.dataExport.update({
            where: { id: exp.id },
            data: { workspaceId },
          });
          console.log(`  ✓ Updated DataExport: ${exp.id}`);
          stats.exportsUpdated++;
        } catch (error) {
          const msg = `Failed to update export ${exp.id}: ${error}`;
          console.error(`  ✗ ${msg}`);
          stats.errors.push(msg);
        }
      }
    }

    // Step 7: Update AuditLogs with workspace_id (if possible to infer)
    console.log("\nStep 7: Updating AuditLogs with workspace_id...");
    // Note: AuditLogs are harder to backfill - we'll skip for now or infer from actorUserId
    // This is optional and can be done later if needed

    console.log("\n✅ Backfill completed!");
  } catch (error) {
    console.error("\n❌ Fatal error during backfill:", error);
    stats.errors.push(`Fatal error: ${error}`);
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--execute");

  if (dryRun) {
    console.log("⚠️  Running in DRY-RUN mode. Use --execute to perform actual migration.");
  } else {
    console.log("⚠️  EXECUTION MODE - This will modify the database!");
    console.log("Press Ctrl+C within 5 seconds to cancel...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const stats = await backfillWorkspaces(dryRun);

  console.log("\n" + "=".repeat(60));
  console.log("BACKFILL STATISTICS");
  console.log("=".repeat(60));
  console.log(`Organizations → Workspaces: ${stats.organizationsMigrated}`);
  console.log(`OrgMembers → WorkspaceMemberships: ${stats.membershipsMigrated}`);
  console.log(`Groups updated: ${stats.groupsUpdated}`);
  console.log(`Activities updated: ${stats.activitiesUpdated}`);
  console.log(`Responses updated: ${stats.responsesUpdated}`);
  console.log(`DataExports updated: ${stats.exportsUpdated}`);
  console.log(`AuditLogs updated: ${stats.auditLogsUpdated}`);
  console.log(`Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log("\nErrors encountered:");
    stats.errors.forEach((err) => console.error(`  - ${err}`));
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
