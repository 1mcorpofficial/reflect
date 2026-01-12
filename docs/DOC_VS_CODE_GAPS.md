# Documentation vs Code Gaps Analysis

**Date**: 2026-01-12  
**Phase**: PH1 - Spec vs Code Comparison

## Summary

Comparison between `WORKSPACE_ENDPOINT_MAP.md` and actual route implementations.

## Endpoints Missing from WORKSPACE_ENDPOINT_MAP.md

### Auth Endpoints
- ✅ `/api/auth/login` - **DOCUMENTED** ✅ Uses workspace context
- ✅ `/api/auth/register` - **DOCUMENTED** ✅ Creates Personal Workspace
- ✅ `/api/auth/me` - **DOCUMENTED** ✅ Returns workspace info

### Workspace Management
- ✅ `/api/workspaces` - **DOCUMENTED** ✅ Lists user workspaces
- ✅ `/api/workspaces/[workspaceId]` - **DOCUMENTED** ✅ PATCH workspace name
- ✅ `/api/workspaces/[workspaceId]/switch` - **MISSING FROM DOC** ⚠️ Switch active workspace
- ✅ `/api/workspaces/invites/accept` - **DOCUMENTED** ✅ Accept invite

### Admin Endpoints
- ✅ `/api/admin/workspaces` - **DOCUMENTED** ✅ Create org workspace
- ⚠️ `/api/admin/audit` - **DOCUMENTED** but status unclear (optional filter)
- ⚠️ `/api/admin/users` - **DOCUMENTED** but status unclear (optional filter)
- ⚠️ `/api/admin/orgs` - **DOCUMENTED** but status unclear (returns all)
- ⚠️ `/api/admin/gdpr/delete/[userId]` - **DOCUMENTED** but status unclear
- ⚠️ `/api/admin/gdpr/export/[userId]` - **DOCUMENTED** but status unclear
- ⚠️ `/api/admin/users/[userId]/anonymize` - **DOCUMENTED** but status unclear
- ⚠️ `/api/admin/users/[userId]/export` - **DOCUMENTED** but status unclear
- ✅ `/api/admin/health` - **NOT DOCUMENTED** (health check, safe)

### Participant Endpoints
- ✅ `/api/participants/activities` - **DOCUMENTED** ✅ Has workspace filtering
- ✅ `/api/participants/history` - **DOCUMENTED** ✅ Has workspace filtering
- ✅ `/api/participants/login` - **DOCUMENTED** ✅ Participant login

### Groups Endpoints
- ✅ `POST /api/groups` - **DOCUMENTED** ✅ Uses workspace_id
- ✅ `GET /api/groups` - **DOCUMENTED** ✅ Filters by workspace_id
- ✅ `GET /api/groups/[groupId]/activities` - **DOCUMENTED** ✅ Validates workspace
- ✅ `GET /api/groups/[groupId]/participants` - **DOCUMENTED** ✅ Validates workspace
- ✅ `POST /api/groups/[groupId]/participants/import` - **DOCUMENTED** ✅ Validates workspace

### Activities Endpoints
- ✅ `POST /api/activities` - **DOCUMENTED** ✅ Uses workspace_id
- ✅ `GET /api/activities/[activityId]/analytics` - **DOCUMENTED** ✅ Validates workspace
- ✅ `GET /api/activities/[activityId]/responses` - **DOCUMENTED** ✅ Validates workspace
- ✅ `POST /api/activities/[activityId]/responses` - **DOCUMENTED** ✅ Participant scope
- ✅ `PATCH /api/activities/[activityId]/status` - **DOCUMENTED** ✅ Validates workspace
- ✅ `GET /api/activities/[activityId]/export` - **DOCUMENTED** ✅ Validates workspace

### Legacy/Deprecated
- ⚠️ `/api/orgs` - **DOCUMENTED** ⚠️ Deprecated but still accessible

### Public Endpoints (Not in Doc)
- ✅ `/api/health` - Health check (no tenant data)
- ✅ `/api/csrf-token` - CSRF token (no tenant data)
- ✅ `/api/admin/health` - Admin health check (no tenant data)

## Status Discrepancies

### WORKSPACE_ENDPOINT_MAP.md Claims vs Reality

#### Admin Endpoints - Status Mismatch

**WORKSPACE_ENDPOINT_MAP.md says:**
- ⚠️ `GET /api/admin/users` - **NEEDS UPDATE**: Turi filtruoti pagal workspace (jei ne super-admin)
- ⚠️ `GET /api/admin/orgs` - **NEEDS UPDATE**: Turi grąžinti visus workspaces
- ⚠️ `GET /api/admin/audit` - **NEEDS UPDATE**: Turi filtruoti pagal workspace_id
- ⚠️ `GET /api/admin/gdpr/export/[userId]` - **NEEDS UPDATE**: Turi patikrinti workspace membership
- ⚠️ `POST /api/admin/gdpr/delete/[userId]` - **NEEDS UPDATE**: Turi patikrinti workspace membership
- ⚠️ `POST /api/admin/users/[userId]/anonymize` - **NEEDS UPDATE**: Turi patikrinti workspace membership
- ⚠️ `GET /api/admin/users/[userId]/export` - **NEEDS UPDATE**: Turi patikrinti workspace membership

**Reality:**
- `/api/admin/users` - ✅ Has optional `workspaceId` query param filter, but no enforcement
- `/api/admin/audit` - ✅ Has optional `workspaceId` query param filter, but no enforcement
- `/api/admin/orgs` - ❌ Returns ALL organizations, no filtering
- `/api/admin/gdpr/*` - ❌ No workspace validation at all
- `/api/admin/users/[userId]/*` - ❌ No workspace validation at all

**Verdict**: ⚠️ **BLOCKER** - Admin endpoints have optional filters but no enforcement. Super-admin check exists but doesn't prevent cross-workspace data access.

#### Participant Endpoints - Status Match

**WORKSPACE_ENDPOINT_MAP.md says:**
- ✅ `GET /api/participants/activities` - **UPDATED**: Participant scope per groupId session
- ✅ `GET /api/participants/history` - **UPDATED**: Participant scope per participantId session

**Reality:**
- `/api/participants/activities` - ✅ Filters by `groupId` from session, includes workspace filter
- `/api/participants/history` - ✅ Filters by `workspaceId` through activity

**Verdict**: ✅ **PASS** - Participant endpoints properly filter by workspace.

#### Groups/Activities Endpoints - Status Match

**WORKSPACE_ENDPOINT_MAP.md says:**
- ✅ All groups/activities endpoints are **UPDATED** with workspace validation

**Reality:**
- All groups/activities endpoints use `requireWorkspaceRole` and `validateResourceWorkspace`

**Verdict**: ✅ **PASS** - Groups/activities endpoints properly enforce workspace isolation.

## Missing Endpoints in Documentation

1. **`/api/workspaces/[workspaceId]/switch`** - Switch active workspace
   - **Status**: ✅ Implemented correctly
   - **Risk**: LOW (validates membership directly)
   - **Action**: Add to WORKSPACE_ENDPOINT_MAP.md

2. **`/api/health`** - Health check
   - **Status**: ✅ Public endpoint, no tenant data
   - **Risk**: NONE
   - **Action**: Document as public endpoint

3. **`/api/admin/health`** - Admin health check
   - **Status**: ✅ Admin-only, no tenant data
   - **Risk**: NONE
   - **Action**: Document as admin health check

## Critical Gaps

### 1. Admin Endpoints Enforcement Gap

**Issue**: Admin endpoints have optional workspace filters but don't enforce workspace membership validation.

**Impact**: Super-admin could access data from any workspace without proper validation.

**Fix Required**:
- Add workspace membership validation for admin endpoints
- Enforce workspace filter when `workspaceId` is provided
- Return 404 if admin is not a member of requested workspace

### 2. GDPR/User Export Endpoints

**Issue**: GDPR export/delete endpoints don't filter by workspace.

**Impact**: Admin could export/delete user data from any workspace.

**Fix Required**:
- Add workspace membership validation
- Filter exported data by workspace
- Prevent deletion of users from workspaces admin is not a member of

### 3. Admin Users List

**Issue**: Optional workspace filter but no enforcement.

**Impact**: Admin could list users from any workspace without membership check.

**Fix Required**:
- Enforce workspace membership when `workspaceId` is provided
- Return 404 if admin is not a member

## Recommendations

1. **Update WORKSPACE_ENDPOINT_MAP.md**:
   - Add `/api/workspaces/[workspaceId]/switch`
   - Mark admin endpoints as **BLOCKER** with enforcement gaps
   - Document public endpoints (`/api/health`, `/api/admin/health`)

2. **Fix Admin Endpoints** (PH2):
   - Add workspace membership validation
   - Enforce workspace filter
   - Return 404 for non-members

3. **Fix GDPR Endpoints** (PH2):
   - Add workspace membership validation
   - Filter exported data by workspace
   - Prevent cross-workspace operations

4. **Update Documentation**:
   - Clarify super-admin vs workspace-admin distinction
   - Document workspace enforcement requirements
