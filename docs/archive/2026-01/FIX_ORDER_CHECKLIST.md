# FIX ORDER CHECKLIST — Production Blokeriai

**Data:** 2026-01-12  
**Statusas:** Prioritetizuotas veiksmų sąrašas pagal P0/P1/P2

---

## P0 / BLOCKER — Prieš production (būtina)

### ✅ 1. Migracijų disciplina (ISSUE-003) — **BLOCKER**

**Problema:** Migracijos modifikuotos po pritaikymo → gali sulaužyti production deploy'us.

**Veiksmai:**

1. **Patikrinti, ar yra "modified after applied" įspėjimų:**
   ```bash
   cd reflectus-app
   npm run db:migrate
   ```
   Jei matote įspėjimus apie modifikuotas migracijas → STOP.

2. **Jei yra įspėjimų — išvalyti dev DB (prarasite duomenis!):**
   ```bash
   # Dev/staging tik
   npm run db:migrate reset
   npm run db:seed
   ```

3. **Patikrinti, kad migracijos yra "švarios":**
   ```bash
   npm run db:migrate
   # Turi būti: "No pending migrations" arba tik naujos migracijos
   ```

4. **Production deploy'e naudoti tik `db:deploy` (ne `db:migrate`):**
   - CI/CD turi naudoti: `npm run db:deploy`
   - Dokumentuoti: `docs/infra/DEPLOY.md`

**Įrodymas:** `npm run db:migrate` neturi "modified after applied" įspėjimų.

---

### ✅ 2. CI "green" (lint + typecheck + testai) — **BLOCKER**

**Problema:** CI krenta: lint (5 errors), typecheck (9 errors), testai neveikia.

**Veiksmai:**

#### 2.1. Sutvarkyti lint klaidas (5 errors)

**Klaidos:**
- `src/app/admin/page.tsx:174,211,243` — `any` tipai
- `src/app/builder/page.tsx:399` — unescaped `'`
- `src/components/UniversalAnswerActions.tsx:92` — unescaped `"`

**Komandos:**
```bash
cd reflectus-app
npm run lint
# Sutvarkyti kiekvieną klaidą
npm run lint  # Patikrinti, kad viskas OK
```

#### 2.2. Sutvarkyti typecheck klaidas (9 errors)

**Klaidos:**
- `src/app/admin/page.tsx:4` — trūksta `swr` modulio
- `src/app/api/activities/[activityId]/export/route.ts:221,306` — type klaidos
- `src/app/participant/page.tsx:520,599,620` — type klaidos
- `tests/integration/api.test.ts` — Jest konfigūracija

**Komandos:**
```bash
# Įdiegti trūkstamus paketus
npm install --save swr
npm install --save-dev @types/jest jest @jest/globals

# Patikrinti typecheck
npx tsc --noEmit
# Sutvarkyti kiekvieną klaidą
npx tsc --noEmit  # Patikrinti, kad viskas OK
```

#### 2.3. Pridėti minimalų test suite

**Komandos:**
```bash
# Atnaujinti package.json su test scripts
# Pridėti: "test": "jest", "test:ci": "jest --ci"
npm run test:api  # Patikrinti, kad veikia
```

**Įrodymas:** 
- `npm run lint` → 0 errors
- `npx tsc --noEmit` → 0 errors
- `npm run test:api` → visi testai praeina
- CI pipeline → green

---

### ✅ 3. Automatiniai backup'ai + rotacija + restore testas — **BLOCKER**

**Problema:** Nėra įgyvendinto backup skripto, rotacijos ir restore testų.

**Veiksmai:**

#### 3.1. Sukurti `scripts/backup.sh`

**Komandos:**
```bash
cd reflectus-app
# Sukurti scripts/backup.sh (žr. docs/infra/BACKUP_RESTORE.md pavyzdį)
chmod +x scripts/backup.sh
```

**Turinys (minimalus):**
- `pg_dump` su custom format (`-Fc`)
- Išsaugoti į `backups/backup_YYYYMMDD_HHMMSS.dump`
- Gzip kompresija
- Rotacija (ištrinti >7 dienų senumo)

#### 3.2. Sukonfigūruoti cron (kasdien 2:00)

**Komandos:**
```bash
# Pridėti į crontab
crontab -e
# Pridėti:
0 2 * * * cd /path/to/reflectus-app && ./scripts/backup.sh >> logs/backup.log 2>&1
```

#### 3.3. Padaryti restore testą

**Komandos:**
```bash
# Sukurti test DB
docker compose -f docker-compose.prod.yml exec db psql -U postgres -c "CREATE DATABASE reflectus_test;"

# Restore į test DB
cat backups/backup_YYYYMMDD_HHMMSS.dump | \
  docker compose -f docker-compose.prod.yml exec -T db pg_restore \
    -U postgres -d reflectus_test -c

# Patikrinti
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d reflectus_test -c "SELECT COUNT(*) FROM \"User\";"

# Išvalyti
docker compose -f docker-compose.prod.yml exec db psql -U postgres -c "DROP DATABASE reflectus_test;"
```

**Įrodymas:**
- `scripts/backup.sh` egzistuoja ir veikia
- Cron sukonfigūruotas
- Restore testas praėjo sėkmingai (log'as `logs/backup-restore-test.log`)

---

### ✅ 4. Security runtime įrodymai (CSRF / rate limit / audit log / org isolation) — **BLOCKER/HIGH**

**Problema:** Trūksta pilno runtime įrodymo per visus endpoint'us.

**Veiksmai:**

#### 4.1. Rate limit runtime įrodymas

**Problema:** GET (analytics) neturi limitų; in-memory limitas netinka multi-instance.

**Komandos:**
```bash
# Paleisti dev serverį
npm run dev -- --webpack -p 3005

# Testuoti rate limit (kitas terminalas)
PORT=3005 ./scripts/audit.sh rate-limit
# Turi būti: 429 po N request'ų

# Patikrinti GET /api/activities/[id]/analytics — ar yra limitas?
curl -X GET http://localhost:3005/api/activities/.../analytics
# Jei nėra — pridėti
```

#### 4.2. Audit log coverage runtime įrodymas

**Komandos:**
```bash
PORT=3005 ./scripts/audit.sh audit-coverage
# Turi būti: visi state-changing endpoint'ai log'uojami
# Generuoti log'ą: logs/audit/coverage-YYYYMMDD.txt
```

#### 4.3. CSRF runtime įrodymas

**Komandos:**
```bash
PORT=3005 ./scripts/audit.sh csrf
# Turi būti: evil origin → 403, same-origin → 200
# Generuoti log'ą: logs/audit/csrf-YYYYMMDD.txt
```

#### 4.4. Org isolation runtime įrodymas

**Komandos:**
```bash
PORT=3005 ./scripts/org-isolation.sh
# Turi būti: cross-org requests → 403
# Generuoti log'ą: logs/audit/org-isolation-YYYYMMDD.txt
```

**Įrodymas:**
- Visi log'ai `logs/audit/*` su timestamp'ais
- Visi endpoint'ai (ypač nauji: responses/export/admin/dashboard) patikrinti
- Rate limit veikia su Redis (jei multi-instance) arba dokumentuota, kad in-memory tik dev

---

### ✅ 5. GDPR compliance — **HIGH/BLOCKER**

**Problema:** Trūksta automatinio retention cleanup ir consent management.

**Veiksmai:**

#### 5.1. Automatinis retention cleanup job'as

**Komandos:**
```bash
# Sukurti scripts/gdpr-cleanup.sh
# Job'as turi:
# - Ištrinti/anonymize'inoti duomenis pagal retention policy
# - Log'uoti veiksmus į audit log
# - Paleisti per cron (pvz. kas savaitę)

chmod +x scripts/gdpr-cleanup.sh
```

**Turinys:**
- Patikrinti `User.lastLoginAt` (pvz. >2 metai)
- Anonymize'inoti per `/api/admin/gdpr/delete/[userId]`
- Log'uoti į `logs/gdpr-cleanup-YYYYMMDD.log`

#### 5.2. Consent management flow

**Komandos:**
```bash
# Sukurti API endpoint'ą: POST /api/gdpr/consent
# Sukurti UI: /gdpr/consent (user-facing)
# Dokumentuoti: docs/GDPR.md
```

**Turinys:**
- User gali pateikti sutikimą/atsisakymą
- Išsaugoti į DB (nauja lentelė `Consent` arba `User.consentGivenAt`)
- Admin gali matyti consent status

**Įrodymas:**
- `scripts/gdpr-cleanup.sh` veikia (testas su mock duomenimis)
- Consent flow veikia (UI + API)
- Dokumentacija atnaujinta

---

### ✅ 6. Audit log FK klaidos (P0-03) — **PARTIAL**

**Problema:** Pažymėta kaip P0, bet tik dokumentuota (neužbaigta).

**Veiksmai:**

#### 6.1. Patikrinti FK schema

**Komandos:**
```bash
# Patikrinti prisma/schema.prisma
# AuditLog.actorParticipantId → GroupParticipant.id (ne Participant.id)
# Jei neteisinga — sutvarkyti migraciją
```

#### 6.2. Backfill esami duomenys (jei reikia)

**Komandos:**
```bash
# Jei yra blogų FK — backfill script'as
npm run db:migrate
# Patikrinti, kad nėra FK constraint klaidų
```

#### 6.3. Runtime įrodymas

**Komandos:**
```bash
PORT=3005 ./scripts/smoke.sh
# Turi būti: nėra FK klaidų log'uose
# Generuoti log'ą: logs/audit/fk-fix-YYYYMMDD.txt
```

**Įrodymas:**
- `docs/audit/ISSUES_LOG.md` atnaujintas su "FIXED" statusu
- Runtime testas praėjo be FK klaidų

---

## P1/P2 — Svarbūs neužbaigti funkcionalumai (ne production blokai)

### ⚠️ 7. Admin panelė (RBAC + CRUD) — PARTIAL

**Veiksmai:**
- Atidaryti `src/app/admin/page.tsx`
- Pridėti org/user CRUD UI
- Įrodyti, kad admin gali tvarkyti orgs/users

**Komandos:**
```bash
# Testuoti admin panelę
npm run dev
# Atsidaryti http://localhost:3000/admin
# Patikrinti, kad veikia CRUD
```

---

### ⚠️ 8. Scheduling kalendorius/planavimas — PARTIAL

**Veiksmai:**
- Atidaryti `src/app/facilitator/(protected)/calendar/page.tsx`
- Pridėti kalendorių + reminders
- Realus rodymas su open/close langais

**Komandos:**
```bash
# Testuoti calendar view
npm run dev
# Atsidaryti http://localhost:3000/facilitator/calendar
```

---

### ⚠️ 9. Teacher dashboard "response detail" — PARTIAL

**Veiksmai:**
- Atidaryti `src/app/dashboard/page.tsx`
- Pridėti drill-down per mokinį
- Aiškus "nežinau/nenoriu" traktavimas

---

### ⚠️ 10. PDF/XLSX export runtime įrodymas

**Veiksmai:**
```bash
# Testuoti export
curl "http://localhost:3005/api/activities/[id]/export?format=pdf" \
  -H "Cookie: ..." \
  -o test-export.pdf

curl "http://localhost:3005/api/activities/[id]/export?format=xlsx" \
  -H "Cookie: ..." \
  -o test-export.xlsx

# Patikrinti, kad grąžina 200 + content headers
# Log'uoti: logs/proof/export-pdf-YYYYMMDD.txt
# Log'uoti: logs/proof/export-xlsx-YYYYMMDD.txt
```

---

### ⚠️ 11. Mobile/320px + a11y audit

**Veiksmai:**
- Rankinis testas (Chrome DevTools → 320px)
- Klaviatūros navigacija
- ARIA audit
- Screenshot'ai: `docs/proof/mobile-320px-*.png`
- Screenshot'ai: `docs/proof/a11y-*.png`

---

### ⚠️ 12. Testai (E2E/Unit) — PARTIAL

**Veiksmai:**
```bash
# Pridėti unit testus
npm install --save-dev jest @testing-library/react

# Pridėti E2E testus (Playwright arba Cypress)
npm install --save-dev @playwright/test

# CI turi paleisti testus
# .github/workflows/ci.yml → pridėti test job'ą
```

---

### ⚠️ 13. Monitoring/Logging — PARTIAL

**Veiksmai:**
```bash
# Pridėti structured logging (Winston arba Pino)
npm install --save winston

# Pridėti metrics endpoint
# GET /api/health/metrics

# Dokumentuoti alertų integraciją
```

---

### ⚠️ 14. Docs: pasenęs `docs/pending/GAP_ANALYSIS.md`

**Veiksmai:**
```bash
# Atnaujinti arba archyvuoti
# Jei atnaujinti — sinchronizuoti su realiu statusu
# Jei archyvuoti — perkelti į docs/archive/
```

---

## "Known issues" (ne kritiniai)

### ℹ️ 15. Docker port conflict (5432)

**Workaround:**
```bash
# Pakeisti docker-compose.yml portą
# ports: "5433:5432"
# Atnaujinti DATABASE_URL
```

---

### ℹ️ 16. Seed reikalauja AUTH_SECRET

**Dokumentuota:** `env.example` turi instrukcijas.

---

### ℹ️ 17. Dev server "pakimba"

**Workaround:**
```bash
npm run dev -- --webpack
```

---

## Prioritetų santrauka

**P0 (BLOCKER — prieš production):**
1. ✅ Migracijų disciplina
2. ✅ CI green
3. ✅ Backup + restore
4. ✅ Security runtime įrodymai
5. ✅ GDPR compliance
6. ✅ Audit log FK

**P1 (svarbu, bet ne blokas):**
7-14. Funkcionalumai (admin, calendar, dashboard, export, mobile, testai, monitoring, docs)

**P2 (known issues):**
15-17. Workaround'ai

---

## Kaip naudoti šį sąrašą

1. **Eikite punktas po punkto** (nuo P0-1 iki P0-6)
2. **Kiekvienam punktui:**
   - Atlikite veiksmus
   - Patikrinkite "Įrodymas" sekciją
   - Pažymėkite ✅, kai baigta
3. **P1/P2 gali būti daroma paraleliai** su P0 (jei laiko)
4. **Dokumentuokite kiekvieną pakeitimą** (commit messages, log'ai)

---

## Kontaktai / Pastabos

- Jei kyla klausimų — žr. `docs/audit/ISSUES_LOG.md`
- Jei reikia pagalbos — dokumentuokite problemą ir pridėkite į ISSUES_LOG.md
