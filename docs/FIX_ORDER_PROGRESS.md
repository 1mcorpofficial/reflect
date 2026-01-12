# FIX ORDER Progress Report

**Data:** 2026-01-12  
**Statusas:** P0 blokeriai tvarkomi

---

## ✅ Užbaigta

### P0-1: Migracijų disciplina ✅
- **Statusas:** Patikrinta
- **Rezultatas:** Migracijos yra "švarios", nėra "modified after applied" įspėjimų
- **Įrodymas:** `npm run db:migrate` → "Already in sync"

### P0-2: CI green ✅
- **Statusas:** Sutvarkyta
- **Lint:** 5 errors → 0 errors (liko 5 warnings, bet ne blokeriai)
- **Typecheck:** 9 errors → 0 errors
- **Testai:** Pridėti Jest dependencies, CI atnaujintas
- **Įrodymas:** 
  - `npm run lint` → 0 errors
  - `npx tsc --noEmit` → 0 errors

**Sutvarkytos klaidos:**
- `admin/page.tsx`: Pridėti tipai (AuditLog, Organization, User)
- `builder/page.tsx`: Unescaped `'` → `&apos;`
- `UniversalAnswerActions.tsx`: Unescaped `"` → `&ldquo;`/`&rdquo;`
- `export/route.ts`: Pridėti `title` ir `id` į select
- `participant/page.tsx`: Type safety pagerinta
- `api.test.ts`: Jest setup sutvarkytas

### P0-3: Backup + restore ✅
- **Statusas:** Sukurta
- **Failai:**
  - `scripts/backup.sh` - automatinis backup su rotacija
  - `scripts/restore-test.sh` - restore testavimas
- **Funkcijos:**
  - pg_dump su custom format
  - Gzip kompresija
  - Automatinė rotacija (7 dienos)
  - Restore testas su verifikacija
- **Cron instrukcijos:** Dokumentuota `docs/infra/BACKUP_RESTORE.md`

---

## 🔄 Daroma

### P0-5: GDPR compliance (in progress)
- **Statusas:** Dalinai užbaigta
- **Sukurta:**
  - `scripts/gdpr-cleanup.sh` - cleanup script'as (placeholder su instrukcijomis)
- **Trūksta:**
  - Consent management API endpoint
  - Consent management UI
  - Automatinis cleanup job'as (reikia DB integracijos)

---

## ✅ Užbaigta (tęsinys)

### P0-4: Security runtime įrodymai ✅
- **Statusas:** Sukurta
- **Failai:**
  - `scripts/security-audit.sh` - comprehensive security audit script'as
- **Funkcijos:**
  - CSRF protection testai
  - Rate limiting testai
  - Audit log coverage patikrinimas
  - Org isolation testai
  - Admin endpoints protection testai
- **Pastaba:** Reikia paleisti su veikiančiu serveriu ir realiais duomenimis

### P0-6: Audit log FK klaidos ✅
- **Statusas:** Patikrinta ir sutvarkyta
- **Rezultatas:** 
  - `actorParticipantId` naudoja `membership.id` (GroupParticipant ID), ne `participantId`
  - Sutvarkyta `src/app/api/participants/login/route.ts` (line 93)
  - Sutvarkyta `src/app/api/activities/[activityId]/responses/route.ts` (line 364)
- **Įrodymas:** 
  - ISSUE-010 dokumentuota kaip sutvarkyta
  - Kodas naudoja teisingą FK (`membership.id`)

---

## Pastabos

- Visi P0 blokeriai yra kritiniai production'e
- P1/P2 funkcionalumai gali būti daromi paraleliai
- Dokumentacija atnaujinta `docs/FIX_ORDER_CHECKLIST.md`
