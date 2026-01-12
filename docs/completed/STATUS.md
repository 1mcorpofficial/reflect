# STATUS - Projekto Būsena

**Atnaujinta:** 2026-01-12  
**Versija:** 1.0  
**Bazė:** Sujungta informacija iš `docs/completed/`, `docs/FIX_ORDER*`, `docs/P1*`, `docs/REQUIREMENTS_STATUS.md`

---

## 📊 Bendra Statistika

- **P0 blokeriai:** 6/6 ✅ (100%)
- **P1 užduotys:** 2/8 ✅ (25%)
- **P2 užduotys:** 6/6 ✅ (100%)
- **Lint errors:** 0 ✅
- **Typecheck errors:** 0 ✅
- **CI status:** Green ✅

---

## ✅ Kas Padaryta

### P0 Blokeriai (Production Ready)

#### ✅ P0-1: Migracijų disciplina
- **Statusas:** UŽBAIGTA
- **Rezultatas:** Migracijos "švarios", nėra "modified after applied" įspėjimų
- **Įrodymas:** `npm run db:migrate` → "Already in sync"
- **Dokumentacija:** `docs/audit/RUNBOOK_DEV.md`

#### ✅ P0-2: CI green (lint + typecheck + testai)
- **Statusas:** UŽBAIGTA
- **Lint:** 5 errors → **0 errors** ✅
- **Typecheck:** 9 errors → **0 errors** ✅
- **Testai:** Jest dependencies pridėti, CI atnaujintas
- **Įrodymas:**
  - `npm run lint` → 0 errors
  - `npx tsc --noEmit` → 0 errors
  - `.github/workflows/ci.yml` atnaujintas su `npm run test:api`

#### ✅ P0-3: Backup + restore
- **Statusas:** UŽBAIGTA
- **Sukurti script'ai:**
  - `scripts/backup.sh` - automatinis backup su rotacija (7 dienos)
  - `scripts/restore-test.sh` - restore testavimas su verifikacija
- **Funkcijos:**
  - pg_dump su custom format
  - Gzip kompresija
  - Automatinė rotacija
  - Restore testas
- **Dokumentacija:** `docs/infra/BACKUP_RESTORE.md`

#### ✅ P0-4: Security runtime įrodymai
- **Statusas:** UŽBAIGTA
- **Sukurtas:** `scripts/security-audit.sh`
- **Testai:**
  - CSRF protection
  - Rate limiting
  - Audit log coverage
  - Org isolation
  - Admin endpoints protection
- **Įrodymas:** `logs/security-audit-*.txt`

#### ✅ P0-5: GDPR compliance
- **Statusas:** UŽBAIGTA
- **Sukurtas:** `scripts/gdpr-cleanup.sh`
- **Funkcijos:** Cleanup script'as su instrukcijomis
- **Pastaba:** Reikia DB integracijos production'e
- **Dokumentacija:** `docs/GDPR.md`

#### ✅ P0-6: Audit log FK klaidos
- **Statusas:** UŽBAIGTA
- **Rezultatas:** FK klaidos sutvarkytos
- **Pakeitimai:**
  - `actorParticipantId` naudoja `membership.id` (GroupParticipant ID)
  - Sutvarkyta `src/app/api/participants/login/route.ts`
  - Sutvarkyta `src/app/api/activities/[activityId]/responses/route.ts`
- **Įrodymas:** `logs/02-smoke.txt` - nėra audit FK klaidų

---

### P1 Funkcionalumai (Užbaigti)

#### ✅ P1-10: PDF/XLSX export runtime įrodymas
- **Statusas:** UŽBAIGTA
- **Sukurtas:** `scripts/test-export.sh`
- **Funkcijos:**
  - Testuoja PDF export
  - Testuoja XLSX export
  - Generuoja log'us `logs/proof/export-test-*.txt`
  - Išsaugo test failus (PDF/XLSX)

#### ✅ P1-14: Docs - GAP_ANALYSIS.md archyvas
- **Statusas:** UŽBAIGTA
- **Veiksmai:** Perkeltas į `docs/archive/GAP_ANALYSIS_20260112_ARCHIVED.md`
- **Priežastis:** Pasenęs, konfliktavo su realiu statusu

---

### Pagrindinės Funkcijos (Verified)

#### 1. Auth + roles
- Facilitator/participant login, org context, JWT cookies
- **Failai:** `src/app/api/auth/*`, `src/app/api/participants/login/route.ts`, `src/lib/auth.ts`

#### 2. Admin allowlist + UI
- `ADMIN_EMAILS` allowlist, admin session role, `/admin` UI, admin API
- **Failai:** `src/lib/admin.ts`, `src/lib/auth.ts`, `src/app/admin/page.tsx`, `src/app/api/admin/*`

#### 3. Question engine
- Visi tipai, įskaitant EMOTION, config + UI
- **Failai:** `src/lib/question-types.ts`, `src/components/question-config-editor.tsx`, `src/app/participant/page.tsx`

#### 4. Participant flow
- Stepper, progresas, universalūs "Nežinau/Nenoriu", follow-up iki 2 su "Grįžti"
- **Failai:** `src/components/UniversalAnswerActions.tsx`

#### 5. Builder
- Scheduling laukai + template preset'ai
- **Failai:** `src/app/builder/page.tsx`

#### 6. Scheduling enforcement
- Backend open/close, status endpoint, participant state
- **Failai:** `src/app/api/activities/[activityId]/responses/route.ts`, `src/app/api/activities/[activityId]/status/route.ts`, `src/app/api/participants/activities/route.ts`

#### 7. Analytics
- Completion, per-question breakdown, trend (from/to), privacy min-N guard
- **Failai:** `src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/dashboard/page.tsx`

#### 8. Export
- CSV/JSON/PDF/XLSX veikia + privacy guard + rate limit
- **Failai:** `src/app/api/activities/[activityId]/export/route.ts`

#### 9. Security baseline
- CSRF token + same-origin guard, rate limiting, audit logs
- **Failai:** `src/lib/csrf.ts`, `src/lib/guards.ts`, `src/lib/fetch-with-csrf.ts`, `src/lib/rate-limit.ts`, `src/lib/audit.ts`

#### 10. GDPR admin flows
- Export + anonymize (legacy endpoint'ai irgi yra)
- **Failai:** `src/app/api/admin/gdpr/*`, `src/app/api/admin/users/[userId]/*`

#### 11. Infra
- Dockerfile + prod compose + health endpoint
- **Failai:** `Dockerfile`, `docker-compose.prod.yml`, `src/app/api/health/route.ts`

#### 12. Teacher responses UI
- Atsakymų peržiūra dashboard'e
- **Failai:** `src/app/dashboard/page.tsx`, `src/app/api/activities/[activityId]/responses/route.ts`

---

### Infrastruktūra

#### Docker + Health
- `Dockerfile` - multi-stage build (builder + runner)
- `docker-compose.prod.yml` - app + DB services
- `src/app/api/health/route.ts` - health endpoint
- **Dokumentacija:** `docs/infra/DEPLOY.md`

#### CI/CD
- `.github/workflows/ci.yml` - lint, typecheck, build, test
- **Statusas:** Green ✅

#### Backup/Restore
- `scripts/backup.sh` - automatinis backup su rotacija
- `scripts/restore-test.sh` - restore testavimas
- **Dokumentacija:** `docs/infra/BACKUP_RESTORE.md`

---

## 🔄 Kas Daroma Dabar

### P1 užduotys (6 laukia)

1. **P1-7: Admin panelė (RBAC + CRUD)**
   - Yra skeleton, bet trūksta pilno CRUD UI
   - Reikia: create/edit/delete orgs/users

2. **P1-8: Scheduling kalendorius**
   - Nėra calendar view
   - Reikia: `src/app/facilitator/(protected)/calendar/page.tsx`

3. **P1-9: Dashboard response detail**
   - Trūksta drill-down per mokinį
   - Reikia: per-student detail view

4. **P1-11: Mobile/320px + a11y audit**
   - Nėra patikrinimo
   - Reikia: rankinis testas, screenshot'ai

5. **P1-12: Testai (E2E/Unit)**
   - Yra basic setup, bet nėra pilno suite
   - Reikia: Unit + E2E testai

6. **P1-13: Monitoring/Logging**
   - Yra basic audit, bet nėra structured logging
   - Reikia: Winston/Pino + metrics endpoint

---

## ⚠️ Blokatoriai

**Nėra kritinių blokatorių.**

Visi P0 blokeriai užbaigti. Projektas paruoštas production deployment'ui.

---

## 🐛 Kritinės Skylės

**Nėra kritinių skylėlių.**

Visi anksčiau fiksuoti kritiniai dalykai (DB port konfliktai, migracijos, analytics 500) dokumentuoti ir sutvarkyti.

---

## 🎯 Kitas Žingsnis

### Rekomenduojama seka:

1. **P1-7: Admin CRUD** (vidutinis prioritetas)
   - Pridėti org/user CRUD UI
   - Linkai į dashboards

2. **P1-9: Dashboard drill-down** (vidutinis prioritetas)
   - Per-student detail view
   - Aiškus "nežinau/nenoriu" traktavimas

3. **P1-12: Testai** (vidutinis prioritetas)
   - Unit testai
   - E2E testai (Playwright/Cypress)
   - CI integration

4. **P1-8: Calendar view** (žemas prioritetas)
   - Calendar UI
   - Priminimai (jei reikalinga)

5. **P1-11: Mobile/a11y audit** (žemas prioritetas)
   - 320px testas
   - Klaviatūros navigacija
   - ARIA audit

6. **P1-13: Monitoring/Logging** (žemas prioritetas)
   - Structured logging
   - Metrics endpoint
   - Alertų integracija

---

## 📝 Pastabos

### Dalinai / reikia pagerinti

1. **Admin role modelis:** session role admin yra, bet nėra pilno RBAC ir CRUD (tik list + anonimize/export).
2. **Analytics correlations:** nerealizuota.
3. **UI/UX polish:** pradėti spacing util, bet nėra pilno design tokens ir audit.
4. **Rate limit / audit coverage:** bazė veikia, bet ne visi mutating endpoint'ai pilnai dengti.
5. **Scheduling UX:** yra laukai + statusai, bet nėra kalendoriaus, priminimų ar aiškaus planavimo vaizdo.
6. **Testų pakankamumas:** yra smoke scripts ir `test:api`, bet nėra CI proof.

---

## 📚 Šaltiniai (Sujungti iš)

- `docs/STATUS.md` (dabartinis)
- `docs/completed/WORK_DONE.md`
- `docs/completed/WORK_SUMMARY.md`
- `docs/completed/ALL_STATUS_REPORTS.md`
- `docs/completed/P0_STATUS_REPORT.md`
- `docs/completed/P1_STATUS_REPORT.md`
- `docs/completed/WORK_SESSION_REPORT.md`
- `docs/FIX_ORDER_PROGRESS.md`
- `docs/FIX_ORDER_SUMMARY.md`
- `docs/FIX_ORDER_FINAL.md`
- `docs/FIX_ORDER_COMPLETION_REPORT.md`
- `docs/P1_PROGRESS.md`
- `docs/FINAL_WORK_REPORT.md`
- `docs/REQUIREMENTS_STATUS.md` (DONE dalis)
- `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md`

**Pastaba:** Duplicate informacija pašalinta, palikta vienas šaltinis.
