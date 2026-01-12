# Runtime Logs Summary

**Date**: 2026-01-12  
**Phase**: PH2 - Tenant Isolation Sweep (Runtime Instrumentation)

## Hypotheses

### H1: Workspace Resolution
**Hypothesis**: `resolveWorkspace` correctly validates membership and returns 404 for non-members.

**Instrumentation**: Added logs to `tenancy.ts:39,47,57,99,123`
- Entry point with route/method
- Session validation
- WorkspaceId resolution (header vs session)
- Membership validation
- Success/failure decisions

**Expected Behavior**:
- If user requests workspace they're not a member of → 404
- If user requests workspace they're a member of → ALLOW with workspaceId
- If no workspace requested → Default to personal/first active

---

### H2: Resource Validation
**Hypothesis**: `validateResourceWorkspace` correctly checks if resource belongs to workspace.

**Instrumentation**: Added logs to `tenancy.ts:139,150,154`
- Entry with resourceId, resourceType, workspaceId
- Resource lookup result
- Workspace match result (ALLOW/DENY)

**Expected Behavior**:
- If resource belongs to workspace → ALLOW
- If resource doesn't belong → DENY
- If resource doesn't exist → DENY

---

### H3: Admin GDPR Export Cross-Tenant Access
**Hypothesis**: Admin can export user data from ANY workspace without membership validation.

**Instrumentation**: Added logs to `admin/gdpr/export/[userId]/route.ts:39,48,76`
- Query start (no workspace filter)
- Activities result (count + workspaceIds)
- Groups result (count + workspaceIds)

**Expected Behavior** (CURRENT - VULNERABLE):
- Admin exports ALL activities/groups from ALL workspaces
- No workspace filtering applied

**Expected Behavior** (AFTER FIX):
- Admin can only export data from workspaces they're a member of
- Returns 404 if user is not in admin's workspace

---

### H4: Admin Audit Cross-Tenant Access
**Hypothesis**: Admin can access audit logs from ANY workspace without membership validation.

**Instrumentation**: Added logs to `admin/audit/route.ts:5,28`
- Query start (workspaceId param, no membership check)
- Query result (count + workspaceIds)

**Expected Behavior** (CURRENT - VULNERABLE):
- If workspaceId provided: Returns logs from that workspace (no membership check)
- If workspaceId NOT provided: Returns ALL logs from ALL workspaces

**Expected Behavior** (AFTER FIX):
- If workspaceId provided: Validates membership, returns 404 if not member
- If workspaceId NOT provided: Returns only logs from workspaces admin is a member of

---

## Reproduction Scenarios

### S1: Cross-Tenant Read by ID
**Steps**:
1. Create 2 workspaces (w1, w2) and 2 users (u1 member w1, u2 member w2)
2. In w2, create a group/activity
3. As u1, try to GET that group/activity by ID

**Expected**: 404 (not 403), no data returned

**Logs to Check**:
- `validateResourceWorkspace` logs should show DENY
- No data should be returned in response

---

### S2: Cross-Tenant List
**Steps**:
1. Create 2 workspaces (w1, w2) and 2 users (u1 member w1, u2 member w2)
2. Create groups/activities in both workspaces
3. As u1, call GET /api/groups (or /api/activities)

**Expected**: Only w1 groups/activities returned

**Logs to Check**:
- `resolveWorkspace` logs should show resolved workspaceId = w1
- Query results should only contain w1 data

---

### S3: Cross-Tenant Update/Delete
**Steps**:
1. Create 2 workspaces (w1, w2) and 2 users (u1 member w1, u2 member w2)
2. In w2, create a group/activity
3. As u1, try to PATCH/DELETE that group/activity

**Expected**: 404/403, no DB changes

**Logs to Check**:
- `validateResourceWorkspace` logs should show DENY
- No DB update should occur

---

### S4: Admin Cross-Tenant Export
**Steps**:
1. Create 2 workspaces (w1, w2) and 2 users (u1 member w1, u2 member w2)
2. As admin, call GET /api/admin/gdpr/export/[u2.id]

**Expected** (CURRENT - VULNERABLE): Returns ALL u2 data from ALL workspaces

**Expected** (AFTER FIX): Returns 404 or only data from workspaces admin is a member of

**Logs to Check**:
- `admin gdpr export query start` should show `hasWorkspaceFilter: false`
- `admin gdpr export activities result` should show workspaceIds from ALL workspaces
- After fix: Should show workspace filtering applied

---

### S5: Admin Cross-Tenant Audit Access
**Steps**:
1. Create 2 workspaces (w1, w2) and 2 users (u1 member w1, u2 member w2)
2. Generate audit logs in both workspaces
3. As admin, call GET /api/admin/audit?workspaceId=w2

**Expected** (CURRENT - VULNERABLE): Returns w2 audit logs without membership check

**Expected** (AFTER FIX): Returns 404 if admin is not a member of w2

**Logs to Check**:
- `admin audit query start` should show `hasMembershipCheck: false`
- `admin audit query result` should show logs from w2
- After fix: Should show membership validation

---

## Log Analysis Guide

### Key Log Fields
- `requestId`: Unique ID for each request
- `userId`: User making the request
- `resolvedWorkspaceId`: Workspace resolved by tenancy middleware
- `workspaceId`: Workspace being accessed
- `decision`: ALLOW or DENY
- `hasWorkspaceFilter`: Whether query includes workspace filter
- `hasMembershipCheck`: Whether membership was validated

### What to Look For

**✅ GOOD**:
- `decision: "ALLOW"` only when `resolvedWorkspaceId` matches resource workspace
- `hasWorkspaceFilter: true` in all data queries
- `hasMembershipCheck: true` before accessing workspace data

**❌ BAD**:
- `decision: "ALLOW"` when `resolvedWorkspaceId` doesn't match resource workspace
- `hasWorkspaceFilter: false` in data queries
- `hasMembershipCheck: false` before accessing workspace data
- Multiple `workspaceIds` in query results when only one should be returned

---

## Next Steps

1. **Run Reproduction Scenarios**: Execute S1-S5 and collect logs
2. **Analyze Logs**: Check for cross-tenant data leakage
3. **Fix BLOCKER Issues**: Add workspace membership validation to admin endpoints
4. **Re-run Scenarios**: Verify fixes prevent data leakage
5. **Remove Instrumentation**: Clean up debug logs after verification
