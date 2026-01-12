# Workspace Multi-Tenant Audit Report

## 📊 Audit Summary

**Date**: 2026-01-12  
**Total Routes**: 32  
**Routes with Tenancy**: 11  
**Routes WITHOUT Tenancy**: 21 ⚠️

## 🔴 BLOCKER Issues

### 1. Participant Endpoints - No Workspace Scoping

#### `/api/participants/activities` ❌
**Issue**: Filtruoja tik pagal `groupId` iš session, bet netikrina workspace ownership.

**Current Code**:
```typescript
const activities = await prisma.activity.findMany({
  where: {
    groupId: auth.session.groupId,
    status: "PUBLISHED",
  },
  // ❌ No workspaceId filter
});
```

**Risk**: Participant gali pasiekti activities iš kito workspace, jei žino groupId.

**Fix Required**:
- Patikrinti, kad `groupId` priklauso workspace
- Filtruoti activities pagal workspaceId

#### `/api/participants/history` ❌
**Issue**: Netikrina workspace ownership.

**Current Code**:
```typescript
const responses = await prisma.response.findMany({
  where: {
    participantId: auth.session.sub,
  },
  // ❌ No workspaceId filter
});
```

**Risk**: Participant gali matyti responses iš kito workspace.

**Fix Required**:
- Filtruoti responses pagal workspaceId per activity

### 2. Activity Responses Endpoint - Weak Validation

#### `/api/activities/[activityId]/responses` ⚠️
**Issue**: Tikrina tik `groupId`, bet netikrina workspace ownership.

**Current Code**:
```typescript
if (auth.session.groupId && activity.groupId !== auth.session.groupId) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
// ❌ No workspace validation
```

**Risk**: Participant gali pateikti response į activity iš kito workspace.

**Fix Required**:
- Naudoti `validateResourceWorkspace` arba patikrinti workspaceId

### 3. Legacy Organization Endpoint

#### `/api/orgs` ⚠️
**Issue**: Dar naudoja seną `Organization` modelį vietoj `Workspace`.

**Current Code**:
```typescript
const org = await prisma.organization.create({
  // ❌ Should use Workspace instead
});
```

**Risk**: Sukuria duplikatą duomenų struktūrą.

**Fix Required**:
- Migruoti į Workspace modelį
- Arba pažymėti kaip DEPRECATED ir nukreipti į workspace endpoint'us

## 🟡 MEDIUM Priority Issues

### 4. Admin Endpoints - May Need Workspace Context

#### `/api/admin/*` ⚠️
**Status**: Admin endpoint'ai gali reikalauti workspace context, bet tai priklauso nuo business logic.

**Endpoints**:
- `/api/admin/audit` - gali filtruoti pagal workspaceId
- `/api/admin/users` - gali reikalauti workspace context
- `/api/admin/gdpr/*` - gali reikalauti workspace context

**Recommendation**: Patikrinti, ar admin endpoint'ai turi filtruoti pagal workspace.

### 5. Health/CSRF Endpoints - OK

#### `/api/health` ✅
**Status**: OK - nereikalauja workspace context.

#### `/api/csrf-token` ✅
**Status**: OK - nereikalauja workspace context.

## ✅ Routes WITH Proper Tenancy

1. ✅ `/api/activities/[activityId]/analytics` - Uses `requireWorkspaceRole` + `validateResourceWorkspace`
2. ✅ `/api/activities/[activityId]/export` - Uses `requireWorkspaceRole` + `validateResourceWorkspace`
3. ✅ `/api/activities/[activityId]/status` - Uses `requireWorkspaceRole` + `validateResourceWorkspace`
4. ✅ `/api/activities/route` - Uses `requireWorkspace` + `validateResourceWorkspace`
5. ✅ `/api/groups/route` - Uses `requireWorkspace`
6. ✅ `/api/groups/[groupId]/activities` - Uses `requireWorkspaceRole` + `validateResourceWorkspace`
7. ✅ `/api/groups/[groupId]/participants` - Uses `requireWorkspaceRole` + `validateResourceWorkspace`
8. ✅ `/api/groups/[groupId]/participants/import` - Uses `requireWorkspaceRole` + `validateResourceWorkspace`
9. ✅ `/api/auth/login` - Creates workspace context
10. ✅ `/api/workspaces/*` - All workspace endpoints OK

## 🔍 Detailed Analysis

### Routes WITHOUT Tenancy (Need Review)

1. ❌ `/api/participants/activities` - **BLOCKER**
2. ❌ `/api/participants/history` - **BLOCKER**
3. ⚠️ `/api/activities/[activityId]/responses` - **BLOCKER** (weak validation)
4. ⚠️ `/api/orgs` - **MEDIUM** (legacy endpoint)
5. ⚠️ `/api/admin/audit` - **MEDIUM** (may need workspace filter)
6. ⚠️ `/api/admin/users` - **MEDIUM** (may need workspace filter)
7. ⚠️ `/api/admin/gdpr/*` - **MEDIUM** (may need workspace filter)
8. ✅ `/api/auth/register` - OK (creates workspace)
9. ✅ `/api/auth/me` - OK (reads from session)
10. ✅ `/api/participants/login` - OK (creates session with groupId)
11. ✅ `/api/health` - OK (no workspace needed)
12. ✅ `/api/csrf-token` - OK (no workspace needed)

## 🛠️ Required Fixes

### Priority 1: BLOCKER Fixes

#### Fix 1: `/api/participants/activities`
```typescript
export async function GET(req: Request) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  if (!auth.session.groupId) {
    return NextResponse.json(
      { error: "Session missing group context" },
      { status: 400 },
    );
  }

  // ✅ ADD: Validate group belongs to workspace
  const group = await prisma.group.findUnique({
    where: { id: auth.session.groupId },
    select: { workspaceId: true },
  });

  if (!group || !group.workspaceId) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const activities = await prisma.activity.findMany({
    where: {
      groupId: auth.session.groupId,
      workspaceId: group.workspaceId, // ✅ ADD: Filter by workspaceId
      status: "PUBLISHED",
    },
    // ... rest of query
  });
}
```

#### Fix 2: `/api/participants/history`
```typescript
export async function GET(req: Request) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  // ✅ ADD: Get participant's workspace from responses
  const responses = await prisma.response.findMany({
    where: {
      participantId: auth.session.sub,
      // ✅ ADD: Filter by workspaceId through activity
      activity: {
        workspaceId: { not: null }, // Only responses in workspaces
      },
    },
    include: {
      activity: {
        select: {
          workspaceId: true, // ✅ ADD: Include workspaceId
        },
      },
    },
    // ... rest of query
  });

  // ✅ ADD: Filter responses by workspace if needed
  // (or validate that all responses belong to same workspace)
}
```

#### Fix 3: `/api/activities/[activityId]/responses`
```typescript
export async function POST(req: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const auth = await requireRole(req, "participant");
  if (!auth.ok) return auth.response;

  const { activityId } = await params;
  // ... existing code ...

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      // ... existing fields ...
      workspaceId: true, // ✅ ADD: Include workspaceId
      group: {
        select: {
          workspaceId: true, // ✅ ADD: Include workspaceId
        },
      },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  // ✅ ADD: Validate workspace ownership
  const workspaceId = activity.workspaceId || activity.group?.workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  // ✅ ADD: Validate participant's group belongs to same workspace
  if (auth.session.groupId) {
    const group = await prisma.group.findUnique({
      where: { id: auth.session.groupId },
      select: { workspaceId: true },
    });
    if (!group || group.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ... rest of code ...
}
```

### Priority 2: MEDIUM Fixes

#### Fix 4: `/api/orgs` - Deprecate or Migrate
```typescript
// Option 1: Mark as DEPRECATED
export async function POST(req: Request) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/admin/workspaces instead." },
    { status: 410 }, // Gone
  );
}

// Option 2: Migrate to Workspace
export async function POST(req: Request) {
  const auth = await requireRole(req, "facilitator", { requireOrg: false });
  if (!auth.ok) return auth.response;

  const workspace = await requireWorkspace(req);
  if (!workspace.ok) return workspace.response;

  // Create Workspace instead of Organization
  // ... workspace creation logic ...
}
```

## 📋 Testing Checklist

### Test Tenant Isolation

- [ ] Participant A cannot see Participant B's activities (different workspace)
- [ ] Participant A cannot submit response to Activity B (different workspace)
- [ ] Participant A cannot see history from different workspace
- [ ] Facilitator A cannot access Group B (different workspace)
- [ ] Facilitator A cannot access Activity B (different workspace)

### Test Backward Compatibility

- [ ] Legacy `/api/orgs` endpoint still works (if not deprecated)
- [ ] Existing sessions with `orgId` still work
- [ ] Migration from `orgId` to `workspaceId` is smooth

## 🎯 Next Steps

1. **IMMEDIATE**: Fix BLOCKER issues (#1, #2, #3)
2. **SOON**: Review admin endpoints for workspace filtering
3. **SOON**: Deprecate or migrate `/api/orgs` endpoint
4. **TEST**: Run integration tests after fixes
5. **VERIFY**: Manual testing of tenant isolation

## 📊 Risk Assessment

| Risk Level | Count | Description |
|------------|-------|-------------|
| 🔴 BLOCKER | 3 | Critical security issues - tenant isolation broken |
| 🟡 MEDIUM | 4 | May need workspace context but not critical |
| 🟢 LOW | 0 | No issues found |

## ✅ Conclusion

**Status**: ⚠️ **NOT PRODUCTION READY**

**Critical Issues Found**: 3 BLOCKER issues that break tenant isolation.

**Action Required**: Fix BLOCKER issues before deployment.
