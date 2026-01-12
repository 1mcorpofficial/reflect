# TODO - Ką Reikia Padaryti

**Atnaujinta:** 2026-01-12  
**Bazė:** Sujungta informacija iš `docs/pending/`, `docs/WORK_PLAN.md`, `docs/FIX_ORDER_CHECKLIST.md`, `docs/P1_STATUS.md`

---

## P0 - Kritiniai (Blokeriai)

**Statusas:** ✅ VISI P0 BLOKERIAI UŽBAIGTI

Visi P0 blokeriai užbaigti. Žiūrėti `docs/STATUS.md` "Kas Padaryta" skyrių.

---

## P1 - Svarbu (Ne Blokeriai)

### P1-7: Admin panelė (RBAC + CRUD)

- **Kas:** Pridėti pilną org/user CRUD UI
- **Kodėl:** Admin skeleton yra, bet trūksta create/edit/delete funkcionalumo
- **Priėmimo kriterijai:**
  - Admin gali kurti naujas organizacijas
  - Admin gali redaguoti organizacijas
  - Admin gali trinti organizacijas
  - Admin gali kurti/redaguoti/trinti vartotojus
  - CRUD operacijos turi audit log
- **Kur:** `src/app/admin/page.tsx`, `src/app/api/admin/orgs/route.ts`, `src/app/api/admin/users/route.ts`
- **Statusas:** ⏳ Laukia

---

### P1-8: Scheduling kalendorius

- **Kas:** Sukurti calendar view facilitator'iams
- **Kodėl:** Scheduling laukai DB yra (openAt/closeAt/timezone), bet nėra vizualaus kalendoriaus
- **Priėmimo kriterijai:**
  - Calendar view su visomis veiklomis
  - Galimybė matyti planned/open/closed statusus
  - Galimybė filtruoti pagal datą/grupę
  - Responsive dizainas (mobile/desktop)
- **Kur:** `src/app/facilitator/(protected)/calendar/page.tsx`
- **Statusas:** ⏳ Laukia

---

### P1-9: Dashboard response detail

- **Kas:** Drill-down per mokinį dashboard'e
- **Kodėl:** Dashboard rodo analytics, bet trūksta per-student detail view
- **Priėmimo kriterijai:**
  - Per-student detail view
  - Aiškus "nežinau/nenoriu" traktavimas
  - Galimybė matyti visus atsakymus per mokinį
  - Export per mokinį
- **Kur:** `src/app/dashboard/page.tsx`, `src/app/dashboard/[activityId]/[participantId]/page.tsx`
- **Statusas:** ⏳ Laukia

---

### P1-10: PDF/XLSX export runtime įrodymas

- **Kas:** Runtime įrodymas, kad PDF/XLSX export veikia
- **Kodėl:** Export veikia kode, bet nėra runtime įrodymo
- **Priėmimo kriterijai:**
  - Curl testai su realiais duomenimis
  - Log'ai `logs/proof/export-*.txt`
  - Išsaugoti test failai (PDF/XLSX)
- **Kur:** `scripts/test-export.sh`
- **Statusas:** ✅ UŽBAIGTA

---

### P1-11: Mobile/320px + a11y audit

- **Kas:** Mobile ir accessibility audit
- **Kodėl:** Nėra patikrinimo, ar aplikacija veikia mobile ir ar yra accessibility problemų
- **Priėmimo kriterijai:**
  - Rankinis testas 320px ekrane
  - Klaviatūros navigacija veikia
  - ARIA audit (screen reader compatibility)
  - Screenshot'ai mobile versijos
- **Kur:** `docs/audit/MOBILE_A11Y_AUDIT.md` (sukurti)
- **Statusas:** ⏳ Laukia

---

### P1-12: Testai (E2E/Unit)

- **Kas:** Pridėti pilną test suite
- **Kodėl:** Yra basic test setup, bet nėra pilno suite
- **Priėmimo kriterijai:**
  - Unit testai pagrindinėms funkcijoms
  - E2E testai (Playwright/Cypress) pagrindiniams srautams
  - CI integration (testai automatiškai paleidžiami)
  - Test coverage > 70%
- **Kur:** `tests/unit/`, `tests/e2e/`, `.github/workflows/ci.yml`
- **Statusas:** ⏳ Laukia

---

### P1-13: Monitoring/Logging

- **Kas:** Structured logging + metrics
- **Kodėl:** Yra basic audit log, bet nėra structured logging
- **Priėmimo kriterijai:**
  - Winston/Pino structured logging
  - Metrics endpoint (`/api/metrics`)
  - Alertų integracija (jei reikalinga)
  - Log rotation ir retention policy
- **Kur:** `src/lib/logger.ts`, `src/app/api/metrics/route.ts`
- **Statusas:** ⏳ Laukia

---

### P1-14: Docs - atnaujinti/archyvuoti GAP_ANALYSIS.md

- **Kas:** Atnaujinti arba archyvuoti pasenusį dokumentą
- **Kodėl:** Dokumentas konfliktuoja su realiu statusu
- **Priėmimo kriterijai:**
  - Dokumentas archyvuotas arba atnaujintas
  - Nuorodos pataisytos
- **Kur:** `docs/archive/GAP_ANALYSIS_20260112_ARCHIVED.md`
- **Statusas:** ✅ UŽBAIGTA

---

## P2 - Gali Palaukti

### P2-1: Analytics correlations

- **Kas:** Koreliacijų analizė tarp klausimų
- **Kodėl:** Nerealizuota, bet nėra kritinė
- **Priėmimo kriterijai:**
  - Koreliacijų algoritmas
  - UI rodymas koreliacijoms
  - Dokumentacija
- **Kur:** `src/app/api/activities/[activityId]/analytics/route.ts`
- **Statusas:** ⏳ Laukia

---

### P2-2: UI/UX polish (design tokens)

- **Kas:** Pilni design tokens ir audit
- **Kodėl:** Pradėti spacing util, bet nėra pilno design tokens
- **Priėmimo kriterijai:**
  - Design tokens sistema (spacing, colors, typography)
  - Empty states visur
  - Loading states visur
  - Error states visur
  - Mobile audit
- **Kur:** `src/app/globals.css`, `src/components/ui/`
- **Statusas:** ⏳ Laukia

---

### P2-3: Rate limit / audit coverage plėtra

- **Kas:** Išplėsti rate limit ir audit log coverage
- **Kodėl:** Bazė veikia, bet ne visi mutating endpoint'ai pilnai dengti
- **Priėmimo kriterijai:**
  - Visi mutating endpoint'ai turi rate limit
  - Visi svarbūs veiksmai turi audit log
  - Dokumentacija
- **Kur:** `src/lib/rate-limit.ts`, `src/lib/audit.ts`, visi API route'ai
- **Statusas:** ⏳ Laukia

---

### P2-4: Scheduling UX polish

- **Kas:** Kalendorius, priminimai, aiškus planavimo vaizdas
- **Kodėl:** Yra laukai + statusai, bet nėra kalendoriaus, priminimų
- **Priėmimo kriterijai:**
  - Calendar view (P1-8)
  - Priminimų sistema (email/push)
  - Aiškus planavimo vaizdas
- **Kur:** `src/app/facilitator/(protected)/calendar/page.tsx`, `src/lib/scheduler.ts`
- **Statusas:** ⏳ Laukia

---

### P2-5: Testų pakankamumas

- **Kas:** CI proof ir pilnas test suite
- **Kodėl:** Yra smoke scripts ir `test:api`, bet nėra CI proof
- **Priėmimo kriterijai:**
  - CI automatiškai paleidžia testus
  - Test coverage > 70%
  - E2E testai pagrindiniams srautams
- **Kur:** `.github/workflows/ci.yml`, `tests/`
- **Statusas:** ⏳ Laukia

---

## Pastabos

### Prioritetai

**Greitai padaryti (dabar):**
- ✅ P1-14: Docs (užbaigta)
- ✅ P1-10: Export testai (užbaigta)

**Kitas žingsnis (vidutinis prioritetas):**
- P1-7: Admin CRUD
- P1-9: Dashboard drill-down
- P1-12: Testai

**Vėliau (žemas prioritetas):**
- P1-8: Calendar view
- P1-11: Mobile/a11y audit
- P1-13: Monitoring/Logging
- P2 užduotys

---

## 📚 Šaltiniai (Sujungti iš)

- `docs/pending/TODO.md`
- `docs/pending/TODO_DETAILED.md`
- `docs/pending/MERGED_TODO.md`
- `docs/WORK_PLAN.md`
- `docs/FIX_ORDER_CHECKLIST.md` (P0 dalis)
- `docs/P1_STATUS.md`
- `docs/plans/MASTER_BACKLOG.md` (backlog dalis)

**Pastaba:** Duplicate informacija pašalinta, palikta vienas šaltinis.
