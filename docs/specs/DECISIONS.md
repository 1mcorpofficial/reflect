# DECISIONS - Techniniai Sprendimai

**Atnaujinta:** 2026-01-12  
**Bazė:** Ištraukta iš `docs/audit/ISSUES_LOG.md`

---

## DB / Migracijos

### DECISION-001: Migracijų disciplina

**Problema:** Migracijos modifikuotos po pritaikymo → gali sulaužyti production deploy'us.

**Sprendimas:**
- NIEKADA neperrašyti pritaikytų migracijų
- Production deploy'e naudoti tik `npm run db:deploy` (ne `db:migrate`)
- Jei reikia pakeisti migraciją → sukurti naują migraciją

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-003

---

### DECISION-002: Shadow DB klaidos (pg_type.typname)

**Problema:** Prisma shadow DB krenta su `P3006`, nes migracijoje neteisingas `pg_type.typname` tikrinimas.

**Sprendimas:**
- Naudoti `lower(typname) = 'orgrole'` vietoj `typname = 'orgrole'`
- Taip pat `memberstatus`, `answerstatus`

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-002

---

## Env / Runtime

### DECISION-003: AUTH_SECRET privalomas seed'e

**Problema:** Seed krenta, jei nėra `AUTH_SECRET`.

**Sprendimas:**
- `AUTH_SECRET` privalomas env kintamasis
- Seed paleidžiamas su `AUTH_SECRET=...` aplinkos kintamuoju
- Dokumentuota `env.example` ir `docs/SETUP.md`

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-004

---

## API / Schema

### DECISION-004: AnalyticsSnapshot.from/to laukai

**Problema:** `/api/activities/:id/analytics` grąžina 500 dėl DB schemos neatitikimo.

**Sprendimas:**
- Sugeneruota migracija `20260111081943_analytics_snapshot_range/migration.sql`
- DB schema atitinka `prisma/schema.prisma`

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-005

---

## Build / Dev Tooling

### DECISION-005: Turbopack root fiksavimas

**Problema:** Next.js dev įspėjimas apie "workspace root" dėl kelių `package-lock.json`.

**Sprendimas:**
- Turbopack root fiksuotas į projekto šaknį (`next.config.ts`)
- Rekomenduojama pašalinti/ignoruoti aukštesnio lygio `package-lock.json`, jei nebereikalingas

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-006

---

## Privacy / Export

### DECISION-006: Anoniminių eksportų privatumo guard

**Problema:** Anoniminių eksportų privatumo apsauga.

**Sprendimas:**
- Min-N guard eksportui, jei `privacyMode=ANONYMOUS` ir atsakymų < 5
- Konstanta `MIN_ANON_COUNT=5`
- Taip pat analytics endpoint'e

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-007

---

## Security

### DECISION-007: CSRF strategija

**Problema:** CSRF apsauga state-changing request'ams.

**Sprendimas:**
- CSRF token generuojamas ir saugomas cookie
- Token tikrinamas visuose POST/PATCH/DELETE request'uose
- Same-origin guard `src/lib/guards.ts`

**Failai:** `src/lib/csrf.ts`, `src/lib/guards.ts`, `src/lib/fetch-with-csrf.ts`

---

### DECISION-008: Rate limiting

**Problema:** Rate limiting coverage mutating endpoint'ams.

**Sprendimas:**
- Rate limiting pritaikytas visiems mutating endpoint'ams
- Skirtingi limitai skirtingiems endpoint'ams (pvz. `org-create`: 10 req/60s)
- Audit log visiems svarbiems veiksmams

**Failai:** `src/lib/rate-limit.ts`, `src/lib/audit.ts`

---

## Audit / Logging

### DECISION-009: Audit log FK klaidos

**Problema:** Audit log foreign key constraint violation participant flows.

**Sprendimas:**
- `actorParticipantId` naudoja `membership.id` (GroupParticipant ID)
- Sutvarkyta `src/app/api/participants/login/route.ts`
- Sutvarkyta `src/app/api/activities/[activityId]/responses/route.ts`

**Įrodymas:** `docs/STATUS.md` P0-6

---

## Infra

### DECISION-010: Docker port konfliktas

**Problema:** `docker compose up -d db` nepasileidžia, nes užimtas 5432.

**Sprendimas:**
- Jei naudojate lokalią Postgres: nenaudoti Docker db
- Jei norite Docker Postgres: keisti `docker-compose.yml` į kitą portą (pvz. `5433:5432`) + atnaujinti `DATABASE_URL`

**Įrodymas:** `docs/audit/ISSUES_LOG.md` ISSUE-001

---

## Pastabos

- Visi sprendimai dokumentuoti `docs/audit/ISSUES_LOG.md`
- Sprendimai atnaujinami pagal poreikį
- Jei reikia pakeisti sprendimą → dokumentuoti naują sprendimą ir archyvuoti seną
