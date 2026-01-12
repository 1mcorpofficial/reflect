# Workspace Implementation - Quick Start Guide

## 🚀 Greitas Startas

### 1. Migracijos
```bash
# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 2. Backfill (jei yra esami duomenys)
```bash
# IMPORTANT: Pirmiausia padarykite DB backup!
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Dry-run (tik peržiūra)
tsx --env-file=.env scripts/backfill-workspaces.ts

# Execute (tikrasis vykdymas)
tsx --env-file=.env scripts/backfill-workspaces.ts --execute

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Group\" WHERE \"workspaceId\" IS NULL;"
# Turi būti 0
```

### 3. Testavimas
```bash
# Start dev server
npm run dev

# Test registration (sukuria Personal Workspace)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.local","password":"test1234","name":"Test"}'

# Test workspace list
curl http://localhost:3000/api/workspaces \
  -H "Cookie: reflectus_session=..."
```

## ✅ Patikrinimas

### Registration Flow
1. Registruokite naują user
2. Patikrinkite DB: `SELECT * FROM "Workspace" WHERE "type" = 'PERSONAL';`
3. Patikrinkite membership: `SELECT * FROM "WorkspaceMembership" WHERE "role" = 'OWNER';`

### Workspace Switching
1. Sukurkite kelis workspaces (per super-admin arba registraciją)
2. Prisijunkite ir patikrinkite workspace switcher UI
3. Perjunkite workspace ir patikrinkite, kad duomenys filtruojami

### Tenant Isolation
1. Sukurkite du users su skirtingais workspaces
2. User A bandykite pasiekti User B grupę
3. Turėtų grąžinti 404 (ne 403)

## 📋 Checklist

- [ ] Migracijos pritaikytos
- [ ] Backfill paleistas (jei reikia)
- [ ] Registration sukuria Personal Workspace
- [ ] Login nustato active workspace
- [ ] Workspace switcher veikia
- [ ] Tenant isolation veikia (404 cross-tenant)
- [ ] Invite flow veikia (jei testuojate)

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm run db:generate
```

### "workspaceId IS NULL"
```bash
# Run backfill
tsx --env-file=.env scripts/backfill-workspaces.ts --execute
```

### TypeScript errors
```bash
# Regenerate Prisma client
npm run db:generate
```

## 📚 Dokumentacija

- `docs/WORKSPACES_SPEC.md` - Architektūra
- `docs/MIGRATION_GUIDE.md` - Migracijos vadovas
- `docs/VERIFICATION_CHECKLIST.md` - Patikrinimo checklist
- `docs/SECURITY_AUDIT.md` - Security audit
