# Verification Checklist - Workspace Implementation

## ✅ Pre-Deployment Verification

### 1. Code Quality
- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] Prisma schema formatted and valid
- [x] Prisma client generated successfully
- [ ] ESLint passes (some warnings in backend/ - acceptable)

### 2. Database Migrations
- [x] Migration created: `20260112075226_add_workspace_model`
- [x] Migration created: `20260112080723_harden_workspace_constraints`
- [ ] Migrations applied successfully
- [ ] Backfill script tested (dry-run)

### 3. API Endpoints
- [x] `GET /api/workspaces` - Get user workspaces
- [x] `POST /api/workspaces/[workspaceId]/switch` - Switch workspace
- [x] `POST /api/admin/workspaces` - Create organization workspace
- [x] `POST /api/workspaces/invites/accept` - Accept invite
- [x] `GET /api/workspaces/invites/accept?token=...` - Magic link
- [x] `GET /api/auth/me` - Updated with workspace info

### 4. Frontend Components
- [x] `WorkspaceSwitcher` component created
- [x] `WorkspaceInfo` component created
- [x] Integrated into facilitator layout

### 5. Security
- [x] Invite tokens hashed (bcrypt)
- [x] Token expiry enforced
- [x] One-time use tokens
- [x] Rate limiting on all endpoints
- [x] CSRF protection
- [x] Workspace isolation enforced

### 6. Tests
- [x] Integration tests created
- [ ] Tests pass locally
- [ ] Tenant isolation verified

## 🧪 Testing Steps

### Step 1: Database Setup
```bash
# 1. Ensure database is running
docker-compose up -d db

# 2. Run migrations
npm run db:migrate

# 3. Verify migrations applied
psql $DATABASE_URL -c "\d \"Workspace\""
```

### Step 2: Backfill (if existing data)
```bash
# Dry-run first
tsx --env-file=.env scripts/backfill-workspaces.ts

# If looks good, execute
tsx --env-file=.env scripts/backfill-workspaces.ts --execute

# Verify no NULL workspace_id
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Group\" WHERE \"workspaceId\" IS NULL;"
# Should be 0
```

### Step 3: Test Registration
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.local","password":"test1234","name":"Test User"}'

# Verify:
# - User created
# - Personal Workspace created
# - OWNER membership created
# - Session has activeWorkspaceId
```

### Step 4: Test Workspace Switching
```bash
# Get workspaces
curl http://localhost:3000/api/workspaces \
  -H "Cookie: reflectus_session=..."

# Switch workspace (if user has multiple)
curl -X POST http://localhost:3000/api/workspaces/{workspaceId}/switch \
  -H "Cookie: reflectus_session=..." \
  -H "x-csrf-token: ..."
```

### Step 5: Test Tenant Isolation
```bash
# Create two users, two workspaces
# User A tries to access User B's group
# Should return 404 (not 403)
```

### Step 6: Test Invite Flow
```bash
# Super-admin creates organization workspace
curl -X POST http://localhost:3000/api/admin/workspaces \
  -H "Cookie: reflectus_session=..." \
  -H "x-csrf-token: ..." \
  -d '{"name":"Test Org","adminEmail":"admin@test.local"}'

# Accept invite
curl -X POST http://localhost:3000/api/workspaces/invites/accept \
  -H "x-csrf-token: ..." \
  -d '{"token":"...","name":"Admin","password":"password123"}'
```

## 📋 Manual Testing Checklist

### Registration Flow
- [ ] New user registration creates Personal Workspace
- [ ] User can immediately create groups
- [ ] Session contains activeWorkspaceId

### Login Flow
- [ ] Login sets active workspace
- [ ] Workspace switcher appears (if >1 workspace)
- [ ] Workspace info displays correctly

### Workspace Switching
- [ ] User can switch between workspaces
- [ ] After switch, data filters correctly
- [ ] Session updates properly

### Tenant Isolation
- [ ] User A cannot see User B's groups
- [ ] User A cannot access User B's activities
- [ ] Cross-tenant access returns 404

### Invite Flow
- [ ] Super-admin can create organization workspace
- [ ] Invite email sent (or token returned)
- [ ] Invite can be accepted
- [ ] Token cannot be reused
- [ ] Expired tokens rejected

### Backward Compatibility
- [ ] Existing endpoints still work
- [ ] Legacy orgId still supported
- [ ] No breaking changes

## 🐛 Known Issues / Limitations

1. **Import Paths**: Some test files may need path adjustments
2. **TypeScript**: Some type errors in test files (non-critical)
3. **Email Sending**: Invite emails not implemented (stub)
4. **Constraint Hardening**: workspace_id still nullable (backward compatibility)

## ✅ Ready for Production?

### Before Production Deploy:
- [ ] Run full test suite
- [ ] Perform security audit
- [ ] Test with real data
- [ ] Verify all migrations
- [ ] Document rollback procedure
- [ ] Set up monitoring

### Production Checklist:
- [ ] Database backup before migration
- [ ] Run backfill script
- [ ] Verify data integrity
- [ ] Monitor error logs
- [ ] Test critical flows
