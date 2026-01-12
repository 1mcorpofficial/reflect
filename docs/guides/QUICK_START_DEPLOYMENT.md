# Quick Start - Deployment Checklist

## ⚡ Fast Track (5 minutes)

### 1. Backup & Migrate
```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Migrate
cd reflectus-app
npm run db:migrate
npm run db:generate
```

### 2. Backfill (if existing data)
```bash
# Dry-run first
tsx --env-file=.env scripts/backfill-workspaces.ts

# Execute if OK
tsx --env-file=.env scripts/backfill-workspaces.ts --execute
```

### 3. Verify
```bash
# Check no NULL workspace_id
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Group\" WHERE \"workspaceId\" IS NULL;"
# Should be 0

# Test build
npm run build
```

### 4. Deploy
```bash
# Deploy code (your process)
# Monitor logs
# Test critical flows
```

## ✅ Pre-Deployment Checklist

- [ ] Database backup created
- [ ] Migrations reviewed
- [ ] Backfill tested (dry-run)
- [ ] TypeScript compiles (0 errors)
- [ ] Tests pass
- [ ] Build succeeds

## 🚨 Critical Commands

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Migrate
npm run db:migrate

# Backfill
tsx --env-file=.env scripts/backfill-workspaces.ts --execute

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Workspace\";"
```

## 📋 Full Details

See `NEXT_STEPS.md` for complete deployment guide.
