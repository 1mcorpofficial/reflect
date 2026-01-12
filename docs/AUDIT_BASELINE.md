# Audit Baseline Snapshot

**Date**: 2026-01-12  
**Branch**: `feature/saas-workspaces`  
**Phase**: PH0 - Baseline Snapshot

## Summary

This document captures the baseline state of the codebase before debug mode fixes.

### Route Coverage

**Total Route Files**: 31

**Routes WITH Tenancy Guards**: 11
- `src/app/api/activities/[activityId]/responses/route.ts`
- `src/app/api/activities/[activityId]/export/route.ts`
- `src/app/api/activities/[activityId]/status/route.ts`
- `src/app/api/activities/[activityId]/analytics/route.ts`
- `src/app/api/activities/route.ts`
- `src/app/api/groups/[groupId]/activities/route.ts`
- `src/app/api/groups/[groupId]/participants/import/route.ts`
- `src/app/api/groups/[groupId]/participants/route.ts`
- `src/app/api/groups/route.ts`
- `src/app/api/workspaces/[workspaceId]/route.ts`

**Routes WITHOUT Tenancy Guards**: 20

#### Public/Health Endpoints (SAFE - No tenant data)
- `src/app/api/health/route.ts` - Health check, no tenant data
- `src/app/api/csrf-token/route.ts` - CSRF token generation, no tenant data

#### Auth Endpoints (PARTIALLY COVERED)
- `src/app/api/auth/login/route.ts` - ✅ Uses workspace context but doesn't use tenancy guard (creates workspace if needed)
- `src/app/api/auth/register/route.ts` - ✅ Creates Personal Workspace but doesn't use tenancy guard
- `src/app/api/auth/me/route.ts` - ✅ Returns workspace info but doesn't use tenancy guard

#### Workspace Management (PARTIALLY COVERED)
- `src/app/api/workspaces/route.ts` - ✅ Lists user's workspaces (uses session, no guard needed)
- `src/app/api/workspaces/[workspaceId]/switch/route.ts` - ✅ Validates membership directly
- `src/app/api/workspaces/invites/accept/route.ts` - ✅ Invite acceptance (public endpoint)

#### Admin Endpoints (NEEDS REVIEW)
- `src/app/api/admin/audit/route.ts` - ⚠️ **BLOCKER**: Optional workspaceId filter but no enforcement
- `src/app/api/admin/users/route.ts` - ⚠️ **BLOCKER**: Optional workspaceId filter but no enforcement
- `src/app/api/admin/orgs/route.ts` - ⚠️ **BLOCKER**: Returns all organizations, no workspace filtering
- `src/app/api/admin/workspaces/route.ts` - ✅ Super-admin only, creates workspace
- `src/app/api/admin/health/route.ts` - ✅ Health check, no tenant data
- `src/app/api/admin/gdpr/delete/[userId]/route.ts` - ⚠️ **BLOCKER**: No workspace validation
- `src/app/api/admin/gdpr/export/[userId]/route.ts` - ⚠️ **BLOCKER**: No workspace filtering
- `src/app/api/admin/users/[userId]/anonymize/route.ts` - ⚠️ **BLOCKER**: No workspace validation
- `src/app/api/admin/users/[userId]/export/route.ts` - ⚠️ **BLOCKER**: No workspace filtering

#### Participant Endpoints (NEEDS REVIEW)
- `src/app/api/participants/activities/route.ts` - ✅ Filters by groupId from session, includes workspace filter
- `src/app/api/participants/history/route.ts` - ✅ Filters by workspaceId through activity
- `src/app/api/participants/login/route.ts` - ✅ Participant login, no tenant data needed

#### Legacy/Deprecated
- `src/app/api/orgs/route.ts` - ⚠️ Deprecated endpoint, returns workspaces for backward compatibility

## Build Status

- **Build**: ✅ PASSES (`npm run build` - Compiled successfully)
- **Lint**: ⚠️ FAILS (155 problems: 101 errors, 54 warnings)
  - Most errors are TypeScript `@typescript-eslint/no-explicit-any` in test files
  - One error in `workspace-isolation.test.ts:72` - `Unexpected any`
- **Tests**: ❌ NO TEST SCRIPT (`npm test` - Missing script)

## Test Coverage

**Test File**: `tests/integration/workspace-isolation.test.ts`
- Exists but cannot run (no test script configured)
- Contains tests for:
  - Cross-tenant read prevention
  - List endpoint isolation
  - Update/delete isolation
  - Invite token security

## Critical Findings

### BLOCKER Issues (Must Fix)

1. **Admin Endpoints Missing Workspace Enforcement**
   - `/api/admin/audit` - Optional filter but no enforcement
   - `/api/admin/users` - Optional filter but no enforcement
   - `/api/admin/orgs` - Returns all orgs, no filtering
   - `/api/admin/gdpr/*` - No workspace validation
   - `/api/admin/users/[userId]/*` - No workspace validation

2. **Participant Endpoints**
   - `/api/participants/activities` - ✅ Has workspace filtering
   - `/api/participants/history` - ✅ Has workspace filtering

3. **Legacy Endpoints**
   - `/api/orgs` - Deprecated but still accessible

### HIGH Priority Issues

1. **Lint Errors**: 101 TypeScript errors (mostly `any` types in tests)
2. **No Test Runner**: Cannot verify isolation tests

### MEDIUM Priority Issues

1. **Auth Endpoints**: Use workspace context but don't use tenancy guard (acceptable for auth flows)
2. **Workspace Management**: Direct membership validation (acceptable pattern)

## Next Steps

1. **PH1**: Compare with WORKSPACE_ENDPOINT_MAP.md
2. **PH2**: Static analysis + runtime instrumentation for tenant isolation
3. **PH3**: RBAC + Invite security audit
4. **PH4**: Backfill/migrations hardening
5. **PH5**: Fix blockers, expand tests, remove instrumentation

## Route Classification

### Safe (No Tenant Data)
- `/api/health`
- `/api/csrf-token`
- `/api/admin/health`

### Auth Flow (Creates Workspace)
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/me`

### Workspace Management (Direct Validation)
- `/api/workspaces`
- `/api/workspaces/[workspaceId]/switch`
- `/api/workspaces/invites/accept`

### Protected (Needs Tenancy Guard)
- All `/api/groups/*` - ✅ COVERED
- All `/api/activities/*` - ✅ COVERED
- All `/api/participants/*` - ✅ COVERED (via session/group)

### Admin (Needs Workspace Enforcement)
- `/api/admin/audit` - ⚠️ BLOCKER
- `/api/admin/users` - ⚠️ BLOCKER
- `/api/admin/orgs` - ⚠️ BLOCKER
- `/api/admin/gdpr/*` - ⚠️ BLOCKER
- `/api/admin/users/[userId]/*` - ⚠️ BLOCKER
