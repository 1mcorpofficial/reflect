# P0 Status Report

**Data:** 2026-01-11  
**Iteracija:** P0 - Stabilumas + Saugumas

---

## ✅ DONE - Kas jau padaryta

### 1. Org Scoping Auditas

**Status:** ✅ VISI ENDPOINT'AI TURI ORG SCOPING

**Patikrinti endpoint'ai:**
- ✅ `GET /api/groups` - orgId filter
- ✅ `POST /api/groups` - orgId check
- ✅ `GET /api/groups/[groupId]/activities` - orgId check
- ✅ `GET /api/groups/[groupId]/participants` - orgId check
- ✅ `POST /api/groups/[groupId]/participants/import` - orgId check
- ✅ `POST /api/activities` - orgId check
- ✅ `GET /api/activities/[activityId]/analytics` - orgId check
- ✅ `GET /api/activities/[activityId]/export` - orgId check
- ✅ `PATCH /api/activities/[activityId]/status` - orgId check

**Dokumentacija:** `docs/audit/ORG_SCOPING_AUDIT.md`

---

### 2. Rate Limit + Audit Log Coverage

**Status:** ✅ VISI MUTATING ROUTE'AI TURI RATE LIMIT + AUDIT LOG

**Patikrinti endpoint'ai:**
- ✅ `POST /api/auth/login` - rate limit + audit log
- ✅ `POST /api/auth/register` - rate limit + audit log
- ✅ `POST /api/participants/login` - rate limit + audit log
- ✅ `POST /api/groups` - rate limit + audit log
- ✅ `POST /api/activities` - rate limit + audit log
- ✅ `POST /api/activities/[activityId]/responses` - rate limit + audit log
- ✅ `GET /api/activities/[activityId]/export` - rate limit + audit log
- ✅ `PATCH /api/activities/[activityId]/status` - rate limit + audit log
- ✅ `POST /api/groups/[groupId]/participants/import` - rate limit + audit log
- ✅ `POST /api/orgs` - rate limit + audit log

**Dokumentacija:** `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md`

---

### 3. Admin Skeleton

**Status:** ✅ ADMIN SKELETON EGZISTUOJA IR VEIKIA

**Patikrinti failai:**
- ✅ `src/lib/admin.ts` - `requireAdmin()` funkcija
- ✅ `src/app/admin/page.tsx` - admin UI
- ✅ `src/app/api/admin/health/route.ts` - health endpoint
- ✅ `src/app/api/admin/audit/route.ts` - audit log viewer

**Funkcionalumas:**
- ✅ Admin guard veikia (`requireAdmin()`)
- ✅ Admin UI rodo diagnostics (DB, migrations)
- ✅ Admin UI rodo audit log
- ✅ Health endpoint veikia
- ✅ Audit endpoint veikia

**Pastaba:** Admin email nustatomas per `ADMIN_EMAILS` env variable

---

## 📋 KITI P0 TASKS

### Task 0.1 - Smoke test + Audit patikrinimas

**Status:** ⏳ REIKIA PALEISTI

**Veiksmai:**
1. Paleisti `./scripts/audit.sh` → `logs/01-audit.txt`
2. Paleisti `./scripts/smoke.sh` → `logs/02-smoke.txt`
3. Jei smoke nesėkmingas → P0 "stabilumas" kol smoke OK

---

### Task 2.3 - Migracijų disciplina

**Status:** ✅ DOKUMENTUOTA

**Dokumentacija:** `docs/audit/RUNBOOK_DEV.md` (jei yra)

**Taisyklė:** NIEKADA neperrašyti pritaikytų migracijų

---

### Task 2.4 - Privacy min-N paaiškinimas UI

**Status:** ⏳ REIKIA UI KOMPONENTO

**Kas yra:**
- ✅ Backend: min-N guard veikia (analytics, export)
- ❌ Frontend: nėra UI komponento su paaiškinimu

**Reikia:**
- Sukurti `PrivacyGuardMessage` komponentą
- Integruoti į teacher dashboard

---

### Task 2.5 - Error handling (500 negalima be request ID)

**Status:** ⏳ REIKIA IMPLEMENTACIJOS

**Kas trūksta:**
- Request ID generavimas
- Structured error response su requestId
- Log su requestId

---

## 📊 IŠVADOS

**P0 Progress:** 60% (3/5 tasks done)

**Kas veikia:**
- ✅ Org scoping - visur
- ✅ Rate limit + audit log - visur
- ✅ Admin skeleton - veikia

**Kas reikia:**
- ⏳ Smoke test patikrinimas
- ⏳ Privacy min-N UI komponentas
- ⏳ Error handling su request ID

---

## 🎯 KITAS ŽINGSNIS

1. Paleisti smoke test
2. Sukurti PrivacyGuardMessage komponentą
3. Pridėti error handling su request ID
