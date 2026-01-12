# Next Steps - Deployment Plan

## 🎯 Current Status

✅ **Implementation Complete**
- All BLOCKER issues fixed
- All MEDIUM issues resolved
- Tenant isolation enforced everywhere
- TypeScript compilation: 0 errors

## 📋 Pre-Deployment Checklist

### 1. Database Migration (CRITICAL)

#### Step 1.1: Backup Database
```bash
# Create backup before migration
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh backup-*.sql
```

#### Step 1.2: Review Migrations
```bash
cd reflectus-app

# Check migration status
npx prisma migrate status

# Review migration files
cat prisma/migrations/20260112075226_add_workspace_model/migration.sql
cat prisma/migrations/20260112080723_harden_workspace_constraints/migration.sql
```

#### Step 1.3: Apply Migrations (Development First)
```bash
# Apply migrations
npm run db:migrate

# Verify tables created
psql $DATABASE_URL -c "\d \"Workspace\""
psql $DATABASE_URL -c "\d \"WorkspaceMembership\""
psql $DATABASE_URL -c "\d \"WorkspaceInvite\""
```

#### Step 1.4: Generate Prisma Client
```bash
npm run db:generate
```

### 2. Data Migration (If Existing Data)

#### Step 2.1: Dry-Run Backfill
```bash
# Test backfill script (dry-run)
tsx --env-file=.env scripts/backfill-workspaces.ts

# Review output - check what would be migrated
```

#### Step 2.2: Execute Backfill
```bash
# IMPORTANT: Only after verifying dry-run looks correct!
tsx --env-file=.env scripts/backfill-workspaces.ts --execute

# Verify no NULL workspace_id
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Group\" WHERE \"workspaceId\" IS NULL;"
# Should be 0

psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Activity\" WHERE \"workspaceId\" IS NULL;"
# Should be 0
```

#### Step 2.3: Verify Data Integrity
```bash
# Check workspace counts
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Workspace\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"WorkspaceMembership\";"

# Check that all users have workspaces
psql $DATABASE_URL -c "SELECT COUNT(DISTINCT u.id) FROM \"User\" u LEFT JOIN \"WorkspaceMembership\" wm ON u.id = wm.\"userId\" WHERE wm.id IS NULL;"
# Should be 0 (all users have at least one workspace)
```

### 3. Testing

#### Step 3.1: Run Integration Tests
```bash
# Run workspace isolation tests
npm test tests/integration/workspace-isolation.test.ts

# If tests fail, debug and fix
```

#### Step 3.2: Manual Testing Checklist

**Registration Flow**:
```bash
# Test new user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.local",
    "password": "test1234",
    "name": "Test User"
  }'

# Verify:
# - User created
# - Personal Workspace created
# - OWNER membership created
# - Session has activeWorkspaceId
```

**Login Flow**:
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.local",
    "password": "test1234"
  }'

# Verify:
# - Session has activeWorkspaceId
# - Workspace context set correctly
```

**Workspace Switching**:
```bash
# Get workspaces
curl http://localhost:3000/api/workspaces \
  -H "Cookie: reflectus_session=..."

# Switch workspace
curl -X POST http://localhost:3000/api/workspaces/{workspaceId}/switch \
  -H "Cookie: reflectus_session=..." \
  -H "x-csrf-token: ..."
```

**Tenant Isolation**:
```bash
# Create two users, two workspaces
# User A tries to access User B's group
# Should return 404 (not 403)

# Test participant endpoints
curl http://localhost:3000/api/participants/activities \
  -H "Cookie: participant_session=..."
# Should only return activities from user's workspace
```

#### Step 3.3: Test Deprecated Endpoints
```bash
# Test deprecated /api/orgs
curl -X POST http://localhost:3000/api/orgs \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Org"}'
# Should return 410 Gone with migration message

curl http://localhost:3000/api/orgs \
  -H "Cookie: reflectus_session=..."
# Should return workspaces + deprecation notice
```

### 4. Code Quality Checks

#### Step 4.1: TypeScript Compilation
```bash
npm run build
# Should complete without errors
```

#### Step 4.2: Linting
```bash
npm run lint
# Fix any critical issues
```

#### Step 4.3: Prisma Schema Validation
```bash
npx prisma validate
# Should pass
```

### 5. Documentation Review

#### Step 5.1: Update Documentation
- [ ] Review `WORKSPACE_ENDPOINT_MAP.md` - ensure all endpoints documented
- [ ] Update `MIGRATION_GUIDE.md` if needed
- [ ] Update `README.md` with workspace features

#### Step 5.2: Create Deployment Notes
```bash
# Create deployment notes
cat > DEPLOYMENT_NOTES.md << EOF
# Deployment Notes - $(date +%Y-%m-%d)

## Changes
- Workspace multi-tenant architecture implemented
- All endpoints now workspace-aware
- Legacy /api/orgs deprecated

## Database Changes
- New tables: Workspace, WorkspaceMembership, WorkspaceInvite
- New columns: workspaceId in Group, Activity, Response, etc.

## Migration Steps
1. Backup database
2. Run migrations
3. Run backfill script
4. Verify data integrity
5. Deploy code

## Rollback Plan
- Revert code deployment
- Database rollback: restore from backup
EOF
```

### 6. Staging Deployment

#### Step 6.1: Deploy to Staging
```bash
# Follow your deployment process
# Example:
git push origin feature/saas-workspaces
# Create PR, merge to staging branch
# Deploy staging environment
```

#### Step 6.2: Staging Verification
- [ ] Test all critical flows in staging
- [ ] Verify tenant isolation
- [ ] Test workspace switching
- [ ] Monitor error logs
- [ ] Check performance

### 7. Production Deployment

#### Step 7.1: Pre-Production Checklist
- [ ] All tests passing
- [ ] Staging verified
- [ ] Database backup created
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring set up

#### Step 7.2: Production Deployment
```bash
# 1. Final database backup
pg_dump $DATABASE_URL > production-backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Apply migrations
npm run db:migrate

# 3. Run backfill (if needed)
tsx --env-file=.env scripts/backfill-workspaces.ts --execute

# 4. Deploy code
# (Follow your deployment process)

# 5. Verify deployment
# - Check health endpoint
# - Test critical flows
# - Monitor logs
```

#### Step 7.3: Post-Deployment Monitoring
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify tenant isolation working
- [ ] Monitor user feedback
- [ ] Check audit logs

## 🚨 Rollback Plan

If issues occur:

### Code Rollback
```bash
# Revert to previous version
git revert <commit-hash>
# Deploy previous version
```

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql

# Or rollback migrations (if supported)
npx prisma migrate resolve --rolled-back <migration-name>
```

## 📊 Success Criteria

Deployment is successful when:
- ✅ All migrations applied successfully
- ✅ All users have workspaces
- ✅ No NULL workspace_id in critical tables
- ✅ Tenant isolation working correctly
- ✅ No increase in error rates
- ✅ Performance acceptable
- ✅ Users can switch workspaces
- ✅ Legacy endpoints return deprecation notices

## 🎯 Priority Order

1. **CRITICAL** (Do First):
   - Database backup
   - Migration review
   - Backfill dry-run

2. **HIGH** (Do Before Staging):
   - Apply migrations
   - Run backfill
   - Integration tests
   - Manual testing

3. **MEDIUM** (Do Before Production):
   - Code quality checks
   - Documentation review
   - Staging deployment
   - Staging verification

4. **LOW** (Ongoing):
   - Monitor logs
   - User feedback
   - Performance optimization

## 📝 Notes

- **Never skip database backup** - Critical for rollback
- **Test in staging first** - Don't deploy directly to production
- **Monitor closely** - Watch for errors after deployment
- **Have rollback ready** - Know how to revert if needed

## 🆘 Support

If issues occur:
1. Check error logs
2. Review `AUDIT_REPORT.md` for known issues
3. Check `FINAL_AUDIT_COMPLETE.md` for fixes applied
4. Review `MIGRATION_GUIDE.md` for migration issues
