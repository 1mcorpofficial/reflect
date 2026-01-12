# RBAC + Invite Security Audit

**Date**: 2026-01-12  
**Phase**: PH3 - RBAC + Invite Security

## Summary

Audit of Role-Based Access Control (RBAC) enforcement and workspace invite security.

## RBAC Enforcement

### Role Hierarchy

```
ORG_ADMIN > STAFF > MEMBER
OWNER (Personal Workspace) > MEMBER
PARTICIPANT (read-only)
```

### Role Update Mechanisms

**Finding**: ✅ **PASS** - No self-promotion possible

- No endpoint allows users to update their own role
- No endpoint allows users to update other users' roles
- Roles are only set during:
  - Invite acceptance (uses `intendedRole` from invite)
  - Workspace creation (super-admin sets ORG_ADMIN)
  - Registration (OWNER for personal workspace)

**Security**: ✅ Roles cannot be escalated by users themselves.

---

### Endpoint Role Requirements

#### 1. Activity Status Update
**Endpoint**: `PATCH /api/activities/[activityId]/status`

**Required Roles**: `["ORG_ADMIN", "STAFF", "OWNER"]`

**Enforcement**: ✅ Uses `requireWorkspaceRole()` - server-side enforced

**Status**: ✅ **PASS**

---

#### 2. Activity Creation
**Endpoint**: `POST /api/activities`

**Required Roles**: `["ORG_ADMIN", "STAFF", "OWNER"]`

**Enforcement**: ✅ Uses `requireWorkspaceRole()` - server-side enforced

**Status**: ✅ **PASS**

---

#### 3. Group Creation
**Endpoint**: `POST /api/groups`

**Required Roles**: `["ORG_ADMIN", "STAFF", "OWNER"]`

**Enforcement**: ✅ Uses `requireWorkspaceRole()` - server-side enforced

**Status**: ✅ **PASS**

---

#### 4. Admin Endpoints
**Endpoints**: All `/api/admin/*`

**Required**: Super-admin (email in ADMIN_EMAILS)

**Enforcement**: ✅ Uses `requireAdmin()` - server-side enforced

**Status**: ✅ **PASS**

---

### Personal Workspace Owner Restrictions

**Question**: Can OWNER of personal workspace perform org admin actions?

**Finding**: ✅ **PASS** - Personal workspace OWNER cannot access organization workspace data

- Personal workspace (`type: "PERSONAL"`) is separate from organization workspaces
- `requireWorkspaceRole()` validates workspace membership
- Personal workspace OWNER cannot access organization workspace resources

**Status**: ✅ **PASS**

---

## Invite Security

### Token Generation

**Location**: `src/app/api/admin/workspaces/route.ts`

**Implementation**:
```typescript
async function generateInviteToken(): Promise<{ token: string; hash: string }> {
  const token = crypto.randomBytes(32).toString("hex"); // 64 hex chars = 256 bits
  const hash = await hashSecret(token); // bcrypt hash
  return { token, hash };
}
```

**Security**: ✅ **PASS**
- Uses cryptographically secure random bytes (32 bytes = 256 bits)
- Token is hashed with bcrypt before storage
- Plain token is never stored in DB

---

### Token Validation

**Location**: `src/app/api/workspaces/invites/accept/route.ts`

**Implementation**:
```typescript
async function validateInviteToken(token: string) {
  // Find all non-accepted, non-expired invites
  const invites = await prisma.workspaceInvite.findMany({
    where: {
      acceptedAt: null,
      expiresAt: { gte: new Date() },
    },
  });

  // Compare token with each invite's hash
  for (const invite of invites) {
    const isValid = await verifySecret(token, invite.tokenHash);
    if (isValid) return { valid: true, invite };
  }
  return { valid: false, error: "Invalid invite token" };
}
```

**Security Analysis**:

1. ✅ **Hash Comparison**: Uses `verifySecret()` (bcrypt) - constant-time comparison
2. ⚠️ **Performance**: Loads ALL non-accepted invites - could be slow with many invites
3. ✅ **Expiry Check**: Validates `expiresAt >= now()`
4. ✅ **One-time Use**: Checks `acceptedAt === null`

**Potential Issue**: Loading all invites could leak information about number of pending invites, but bcrypt comparison prevents timing attacks on individual tokens.

**Status**: ✅ **PASS** (with performance note)

---

### One-Time Use Enforcement

**Location**: `src/app/api/workspaces/invites/accept/route.ts:307-313`

**Implementation**:
```typescript
const update = await tx.workspaceInvite.updateMany({
  where: { id: invite.id, acceptedAt: null },
  data: { acceptedAt: new Date() },
});
if (update.count === 0) {
  throw new Error("INVITE_ALREADY_USED");
}
```

**Security**: ✅ **PASS**
- Uses `updateMany` with `acceptedAt: null` condition
- Checks `update.count === 0` to detect race conditions
- Transaction ensures atomicity

**Status**: ✅ **PASS**

---

### Token Expiry

**Location**: `src/app/api/admin/workspaces/route.ts:140-141`

**Implementation**:
```typescript
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
```

**Security**: ✅ **PASS**
- 7-day expiry is reasonable
- Validated in `validateInviteToken()` with `expiresAt: { gte: new Date() }`

**Status**: ✅ **PASS**

---

### Rate Limiting

**Location**: `src/app/api/workspaces/invites/accept/route.ts:172-179`

**Implementation**:
```typescript
const limiterKey = buildRateLimitKey(req, "invite-accept");
const allowed = checkRateLimit(limiterKey, 5, 60_000); // 5 per 60s
```

**Security**: ✅ **PASS**
- 5 attempts per 60 seconds prevents brute force
- Rate limit key includes IP/identifier

**Status**: ✅ **PASS**

---

### CSRF Protection

**Location**: `src/app/api/workspaces/invites/accept/route.ts:167-170`

**Implementation**:
```typescript
const csrfCheck = await requireCsrfToken(req);
if (!csrfCheck.ok) {
  return csrfCheck.response;
}
```

**Security**: ✅ **PASS**
- CSRF token required for POST requests
- GET requests redirect (no state change)

**Status**: ✅ **PASS**

---

### Token Substitution Attack

**Question**: Can a token for workspace A be used to join workspace B?

**Analysis**:
- Token is tied to specific `workspaceId` in `WorkspaceInvite` record
- `validateInviteToken()` returns the invite with `workspaceId`
- Membership is created with `workspaceId: invite.workspaceId`
- No way to substitute workspace

**Security**: ✅ **PASS** - Token cannot be used for different workspace

---

## Security Checks Summary

| Check | Status | Notes |
|-------|--------|-------|
| STAFF cannot promote to ORG_ADMIN | ✅ PASS | No endpoint allows role updates |
| OWNER personal workspace cannot do org admin actions | ✅ PASS | Workspace isolation enforced |
| Invite token hash (not plain) | ✅ PASS | bcrypt hash stored |
| Invite token expiry | ✅ PASS | 7 days, validated |
| Invite token one-time use | ✅ PASS | `acceptedAt` check |
| Invite token rate limit | ✅ PASS | 5 per 60s |
| Invite token CSRF protection | ✅ PASS | CSRF token required |
| Token substitution attack | ✅ PASS | Token tied to workspaceId |

## Recommendations

1. **Performance**: Consider indexing `tokenHash` for faster lookup (currently loads all invites)
2. **Token Validation**: Could optimize by querying specific invite if we can derive workspaceId from token context
3. **Audit Logging**: ✅ Already logs invite acceptance

## Conclusion

✅ **All RBAC and invite security checks PASS**

- No role escalation possible
- Invite tokens are secure (hash, expiry, one-time, rate-limited)
- Workspace isolation prevents cross-tenant access
- CSRF protection in place

**Status**: ✅ **READY FOR PRODUCTION** (with performance optimization note)
