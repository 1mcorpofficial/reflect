# Workspace Migration Guide

## Apžvalga

Šis vadovas aprašo, kaip migruoti esamą Reflectus sistemą į naują Workspace (multi-tenant) architektūrą.

## Migracijos Etapai

### 1. Database Migration

#### 1.1. Paleisti Migraciją
```bash
cd reflectus-app
npx prisma migrate dev --name add_workspace_model
```

Tai sukurs:
- `Workspace` lentelę
- `WorkspaceMembership` lentelę
- `WorkspaceInvite` lentelę
- `workspace_id` stulpelius esamose lentelėse (nullable)

#### 1.2. Backfill Esamiems Duomenims

**SVARBU**: Prieš paleidžiant backfill, padarykite DB backup!

```bash
# Dry-run (tik peržiūra)
tsx --env-file=.env scripts/backfill-workspaces.ts

# Tikrasis vykdymas
tsx --env-file=.env scripts/backfill-workspaces.ts --execute
```

Backfill script:
1. Sukuria Workspace įrašus iš esamų Organization
2. Sukuria WorkspaceMembership įrašus iš esamų OrgMember
3. Užpildo `workspace_id` visose domeno lentelėse

### 2. Code Deployment

#### 2.1. Feature Branch
Visi pakeitimai yra `feature/saas-workspaces` šakoje.

#### 2.2. Backward Compatibility
Sistema palaiko backward compatibility:
- Seni endpoint'ai vis dar veikia su `orgId`
- Nauji endpoint'ai naudoja `workspaceId`
- JWT token'ai turi abu laukus (`orgId` ir `activeWorkspaceId`)

### 3. Testing Checklist

#### 3.1. Auth Flow
- [ ] Naujas vartotojas gauna Personal Workspace po registracijos
- [ ] Login nustato active workspace
- [ ] Session turi `activeWorkspaceId` ir `workspaceRole`

#### 3.2. Data Isolation
- [ ] User A negali matyti User B workspace duomenų
- [ ] Groups filtruojami pagal workspace
- [ ] Activities filtruojami pagal workspace
- [ ] Responses filtruojami pagal workspace

#### 3.3. Endpoint'ai
- [ ] Visi endpoint'ai veikia su workspace context
- [ ] Cross-tenant access grąžina 404 (ne 403)
- [ ] Admin endpoint'ai filtruoja pagal workspace

## Rollback Planas

Jei reikia atšaukti migraciją:

1. **Revert Code Changes**
```bash
git checkout main
```

2. **Rollback Database Migration**
```bash
npx prisma migrate resolve --rolled-back add_workspace_model
# Arba restore iš backup
```

3. **Restore Database**
```bash
# Restore iš backup
psql reflectus < backup.sql
```

## Post-Migration Tasks

Po sėkmingos migracijos:

1. **Monitorinti**
   - Sekti klaidas ir performance
   - Patikrinti, ar visi endpoint'ai veikia

2. **Cleanup (vėliau)**
   - Pašalinti backward compatibility kodą
   - Pašalinti `orgId` iš session
   - Pašalinti Organization/OrgMember modelius (po pilno migravimo)

3. **Hardening**
   - Padaryti `workspace_id` NOT NULL ten, kur privaloma
   - Uždėti papildomus indeksus
   - Uždėti foreign key constraint'us

## Troubleshooting

### Problema: Backfill nepavyko
**Sprendimas**: Patikrinkite DB connection ir permissions. Backfill script turi būti idempotent - galima paleisti kelis kartus.

### Problema: Endpoint'ai grąžina 404
**Sprendimas**: Patikrinkite, ar workspace_id yra nustatytas teisingai. Naudokite `resolveWorkspace()` middleware.

### Problema: Duomenys nesimatomi
**Sprendimas**: Patikrinkite, ar backfill užpildė `workspace_id`. Naudokite SQL query:
```sql
SELECT COUNT(*) FROM "Group" WHERE "workspaceId" IS NULL;
```

## Support

Jei kyla problemų, patikrinkite:
1. `docs/WORKSPACES_SPEC.md` - Architektūros specifikacija
2. `docs/WORKSPACE_ENDPOINT_MAP.md` - Endpoint mapping
3. Logs: `logs/audit/` - Audit logs
