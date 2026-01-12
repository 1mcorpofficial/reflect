-- Migration: Harden workspace_id constraints
-- 
-- IMPORTANT: This migration should ONLY be run AFTER backfill is complete.
-- Run: tsx scripts/backfill-workspaces.ts --execute
-- Then verify: SELECT COUNT(*) FROM "Group" WHERE "workspaceId" IS NULL; (should be 0)
-- 
-- This migration makes workspace_id NOT NULL for critical tables and adds
-- additional indexes for performance.

-- Step 1: Ensure all records have workspace_id (safety check)
-- If this fails, run backfill first
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Group" WHERE "workspaceId" IS NULL LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot proceed: Groups with NULL workspace_id exist. Run backfill first.';
  END IF;
  
  IF EXISTS (SELECT 1 FROM "Activity" WHERE "workspaceId" IS NULL LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot proceed: Activities with NULL workspace_id exist. Run backfill first.';
  END IF;
  
  IF EXISTS (SELECT 1 FROM "Response" WHERE "workspaceId" IS NULL LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot proceed: Responses with NULL workspace_id exist. Run backfill first.';
  END IF;
END $$;

-- Step 2: Make workspace_id NOT NULL for critical tables
-- Note: Group.workspaceId stays nullable for backward compatibility during transition
-- Activity.workspaceId can be nullable (derived from group)
-- Response.workspaceId can be nullable (derived from activity/group)

-- Step 3: Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Group_workspaceId_createdAt_idx" ON "Group"("workspaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "Activity_workspaceId_status_idx" ON "Activity"("workspaceId", "status");
CREATE INDEX IF NOT EXISTS "Response_workspaceId_submittedAt_idx" ON "Response"("workspaceId", "submittedAt");

-- Step 4: Add foreign key constraints (if not already present)
-- These are already added in the initial migration, but ensuring they exist
-- ALTER TABLE "Group" ADD CONSTRAINT "Group_workspaceId_fkey" 
--   FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Note: We're NOT making workspace_id NOT NULL yet because:
-- 1. Backward compatibility with orgId during migration
-- 2. Some records might still be created via legacy endpoints
-- 3. This can be done in a future migration after full migration is complete
