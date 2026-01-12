# Migrations & Backfill Hardening Audit

**Date**: 2026-01-12  
**Phase**: PH4 - Backfill/Migrations Hardening

## Summary

Audit of database migrations and backfill script for workspace model migration.

## Backfill Script Analysis

### File: `scripts/backfill-workspaces.ts`

### Idempotency

**Status**: ✅ **PASS** - Script is idempotent

**Evidence**:
- Line 71-78: Checks for existing Workspace before creating
- Line 112-126: Checks for existing WorkspaceMembership before creating
- Uses `findUnique` to check existence before operations
- Can be run multiple times safely

**Code**:
```typescript
const existing = await prisma.workspace.findUnique({
  where: { id: org.id },
  select: { id: true },
});
if (existing) {
  console.log(`  ↺ Workspace already exists: ${org.name} (${org.id})`);
  continue;
}
```

---

### NULL workspace_id After Backfill

**Status**: ⚠️ **WARN** - Some tables may have NULLs

#### Groups
- **Update Logic**: Line 173-176 - Sets `workspaceId = group.orgId`
- **NULL Check**: Line 163-166 - Skips if `orgId` is null
- **Risk**: Groups without `orgId` will remain NULL
- **Mitigation**: Script logs error for groups without `orgId`

#### Activities
- **Update Logic**: Line 208-211 - Sets `workspaceId` from `group.workspaceId || group.orgId`
- **NULL Check**: Line 195-198 - Skips if both are null
- **Risk**: Activities with orphaned groups may remain NULL
- **Mitigation**: Script logs error

#### Responses
- **Update Logic**: Line 247-250 - Sets from multiple sources (activity/group)
- **NULL Check**: Line 237-240 - Skips if no source found
- **Risk**: Responses with orphaned activities/groups may remain NULL
- **Mitigation**: Script logs error

#### DataExports
- **Update Logic**: Line 286-289 - Sets from multiple sources
- **NULL Check**: Line 276-279 - Skips silently if no source found
- **Risk**: Some exports may legitimately not have workspace context
- **Status**: ✅ Acceptable (some exports may not have workspace)

#### AuditLogs
- **Update Logic**: Line 302-303 - **SKIPPED**
- **Risk**: AuditLogs will have NULL `workspaceId`
- **Status**: ⚠️ **WARN** - Should be backfilled if possible

**Recommendation**: 
- Run verification query after backfill: `SELECT COUNT(*) FROM "Group" WHERE "workspaceId" IS NULL;`
- Handle orphaned records separately
- Consider backfilling AuditLogs from `actorUserId` workspace memberships

---

### Duplicate Prevention

**Status**: ✅ **PASS**

**Evidence**:
- Uses `findUnique` with unique constraints before creating
- WorkspaceMembership uses `workspaceId_userId` unique constraint
- Workspace uses `id` (same as Organization.id) to prevent duplicates

**Code**:
```typescript
const existing = await prisma.workspaceMembership.findUnique({
  where: {
    workspaceId_userId: {
      workspaceId: member.orgId,
      userId: member.userId,
    },
  },
});
```

---

### Transaction Safety

**Status**: ⚠️ **WARN** - No transaction wrapper

**Issue**: Script does NOT wrap operations in a transaction
- If script fails mid-way, partial migration occurs
- No atomic rollback possible

**Risk**: Medium - Partial migration state

**Recommendation**: 
- Wrap each step in a transaction
- Or use a single large transaction (may timeout on large datasets)
- Add checkpoint/resume capability

---

### Error Handling

**Status**: ✅ **PASS** - Good error collection

**Evidence**:
- Collects errors in `stats.errors` array
- Continues processing after errors
- Logs all errors at the end
- Does not crash on individual record failures

---

## Migration Analysis

### Migration: `20260112075226_add_workspace_model/migration.sql`

**Status**: ✅ **PASS**

**Checks**:
- ✅ Creates Workspace, WorkspaceMembership, WorkspaceInvite tables
- ✅ Adds nullable `workspaceId` columns to existing tables
- ✅ Creates indexes on `workspaceId` columns
- ✅ Adds foreign key constraints
- ✅ Uses `ON DELETE SET NULL` for backward compatibility

**Notes**:
- Fields are nullable initially (correct for migration)
- Foreign keys allow NULL (correct for transition)

---

### Migration: `20260112080723_harden_workspace_constraints/migration.sql`

**Status**: ✅ **PASS** - Safety checks present

**Checks**:
- ✅ Validates no NULL `workspaceId` before proceeding
- ✅ Adds composite indexes for performance
- ⚠️ Does NOT make `workspaceId` NOT NULL (deferred)

**Safety Check**:
```sql
IF EXISTS (SELECT 1 FROM "Group" WHERE "workspaceId" IS NULL LIMIT 1) THEN
  RAISE EXCEPTION 'Cannot proceed: Groups with NULL workspace_id exist. Run backfill first.';
END IF;
```

**Status**: ✅ **PASS** - Prevents unsafe migration

---

## Index Analysis

### Existing Indexes

**Status**: ✅ **PASS** - All required indexes present

**Indexes Created**:
- `WorkspaceMembership_workspaceId_idx`
- `WorkspaceMembership_userId_idx`
- `WorkspaceMembership_workspaceId_status_idx` (composite)
- `Group_workspaceId_idx`
- `Activity_workspaceId_idx`
- `Response_workspaceId_idx`
- `DataExport_workspaceId_idx`
- `AuditLog_workspaceId_idx`

**Composite Indexes** (from harden migration):
- `Group_workspaceId_createdAt_idx`
- `Activity_workspaceId_status_idx`
- `Response_workspaceId_submittedAt_idx`

**Coverage**: ✅ All workspace-scoped queries are indexed

---

## NOT NULL Constraint Plan

### Current State

**Tables with NULL workspaceId allowed**:
- `Group.workspaceId` - Nullable (backward compatibility)
- `Activity.workspaceId` - Nullable (derived from group)
- `Response.workspaceId` - Nullable (derived from activity/group)
- `DataExport.workspaceId` - Nullable (some may not have context)
- `AuditLog.workspaceId` - Nullable (not backfilled)

### Future Migration Plan

**Step 1**: After backfill completes successfully
```sql
-- Verify no NULLs exist
SELECT COUNT(*) FROM "Group" WHERE "workspaceId" IS NULL;
SELECT COUNT(*) FROM "Activity" WHERE "workspaceId" IS NULL;
SELECT COUNT(*) FROM "Response" WHERE "workspaceId" IS NULL;
```

**Step 2**: Make NOT NULL (only if counts are 0)
```sql
-- NOT RECOMMENDED YET - Keep nullable for backward compatibility
-- ALTER TABLE "Group" ALTER COLUMN "workspaceId" SET NOT NULL;
-- ALTER TABLE "Activity" ALTER COLUMN "workspaceId" SET NOT NULL;
-- ALTER TABLE "Response" ALTER COLUMN "workspaceId" SET NOT NULL;
```

**Status**: ⚠️ **DEFERRED** - Keep nullable during transition period

**Rationale**:
- Legacy endpoints may still create records without workspaceId
- Backward compatibility during migration
- Can be enforced in application layer

---

## Rollback/Backup Plan

### Current State

**Status**: ⚠️ **WARN** - No explicit rollback plan

### Recommended Rollback Strategy

#### Option 1: Database Backup (Recommended)
```bash
# Before running backfill
pg_dump $DATABASE_URL > backup_before_backfill_$(date +%Y%m%d_%H%M%S).sql

# To rollback
psql $DATABASE_URL < backup_before_backfill_YYYYMMDD_HHMMSS.sql
```

#### Option 2: Transaction Wrapper
```typescript
// Wrap entire backfill in transaction
await prisma.$transaction(async (tx) => {
  // All backfill operations
}, {
  timeout: 60000, // 60 seconds
  isolationLevel: 'ReadCommitted',
});
```

#### Option 3: Revert Script
Create a script to:
1. Delete WorkspaceMembership records created by backfill
2. Delete Workspace records created by backfill
3. Set `workspaceId` to NULL in all tables

**Recommendation**: Use Option 1 (database backup) - simplest and safest

---

## Verification Queries

### After Backfill Execution

```sql
-- Check for NULL workspaceId
SELECT 'Group' as table_name, COUNT(*) as null_count 
FROM "Group" WHERE "workspaceId" IS NULL
UNION ALL
SELECT 'Activity', COUNT(*) FROM "Activity" WHERE "workspaceId" IS NULL
UNION ALL
SELECT 'Response', COUNT(*) FROM "Response" WHERE "workspaceId" IS NULL
UNION ALL
SELECT 'DataExport', COUNT(*) FROM "DataExport" WHERE "workspaceId" IS NULL
UNION ALL
SELECT 'AuditLog', COUNT(*) FROM "AuditLog" WHERE "workspaceId" IS NULL;

-- Verify all Organizations have Workspaces
SELECT COUNT(*) as orgs_without_workspace
FROM "Organization" o
LEFT JOIN "Workspace" w ON o.id = w.id
WHERE w.id IS NULL;

-- Verify all OrgMembers have WorkspaceMemberships
SELECT COUNT(*) as members_without_membership
FROM "OrgMember" om
LEFT JOIN "WorkspaceMembership" wm ON om.orgId = wm.workspaceId AND om.userId = wm.userId
WHERE wm.id IS NULL;
```

**Expected Results**:
- NULL counts should be minimal (only orphaned records)
- Orgs without workspaces: 0
- Members without memberships: 0

---

## Recommendations

### High Priority

1. **Add Transaction Wrapper**: Wrap backfill operations in transaction for atomicity
2. **Add Backup Step**: Document backup procedure before running
3. **Backfill AuditLogs**: Add step to backfill AuditLogs from `actorUserId` workspace memberships

### Medium Priority

4. **Add Verification Step**: Run verification queries automatically after backfill
5. **Handle Orphaned Records**: Document process for records that cannot be backfilled
6. **Add Checkpoint/Resume**: Allow resuming from last checkpoint if script fails

### Low Priority

7. **Performance Optimization**: Batch updates for large datasets
8. **Progress Reporting**: Add progress bar for long-running backfills

---

## Security Considerations

### Data Integrity

**Status**: ✅ **PASS**

- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicates
- No data loss during migration (additive only)

### Access Control

**Status**: ✅ **PASS**

- Script requires database credentials
- No sensitive data exposure
- Dry-run mode prevents accidental execution

---

## Conclusion

### Overall Status: ✅ **READY** (with recommendations)

**Strengths**:
- ✅ Idempotent design
- ✅ Good error handling
- ✅ Safety checks in migrations
- ✅ Proper indexing

**Weaknesses**:
- ⚠️ No transaction wrapper
- ⚠️ AuditLogs not backfilled
- ⚠️ No explicit rollback plan

**Recommendation**: 
- Add transaction wrapper and backup procedure before production use
- Backfill AuditLogs if possible
- Run verification queries after backfill

**Status**: ✅ **SAFE TO RUN** (with backup first)
