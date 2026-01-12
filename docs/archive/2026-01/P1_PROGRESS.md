# P1 Progress Report

**Data:** 2026-01-12  
**Statusas:** P1 užduotys (ne blokeriai)

---

## ✅ Užbaigta

### P1-14: Docs - GAP_ANALYSIS.md ✅
- **Statusas:** Archyvuotas
- **Veiksmai:** Perkeltas į `docs/archive/GAP_ANALYSIS_20260112_ARCHIVED.md`
- **Priežastis:** Pasenęs, konfliktavo su realiu statusu
- **Įrodymas:** Failas archyvuotas, sukurtas archive note

### P1-10: PDF/XLSX export runtime įrodymas ✅
- **Statusas:** Sukurtas test script'as
- **Failas:** `scripts/test-export.sh`
- **Funkcijos:**
  - Testuoja PDF export
  - Testuoja XLSX export
  - Generuoja log'us `logs/proof/export-test-*.txt`
  - Išsaugo test failus (PDF/XLSX)
- **Naudojimas:**
  ```bash
  ./scripts/test-export.sh http://localhost:3005 <activity-id> "cookie=..."
  ```

---

## ⏳ Laukia (6 užduotys)

### P1-7: Admin panelė (RBAC + CRUD)
- Yra skeleton, bet trūksta pilno CRUD UI
- Reikia: create/edit/delete orgs/users

### P1-8: Scheduling kalendorius
- Nėra calendar view
- Reikia: `src/app/facilitator/(protected)/calendar/page.tsx`

### P1-9: Dashboard response detail
- Trūksta drill-down per mokinį
- Reikia: per-student detail view

### P1-11: Mobile/320px + a11y audit
- Nėra patikrinimo
- Reikia: rankinis testas, screenshot'ai

### P1-12: Testai (E2E/Unit)
- Yra basic setup, bet nėra pilno suite
- Reikia: Unit + E2E testai

### P1-13: Monitoring/Logging
- Yra basic audit, bet nėra structured logging
- Reikia: Winston/Pino + metrics endpoint

---

## Statistika

- **Užbaigta:** 2/8 (25%)
- **Laukia:** 6/8 (75%)

---

## Prioritetai

**Greitai padaryti (dabar):**
- ✅ P1-14: Docs (užbaigta)
- ✅ P1-10: Export testai (užbaigta)

**Kitas žingsnis:**
- P1-7: Admin CRUD (vidutinis prioritetas)
- P1-9: Dashboard drill-down (vidutinis prioritetas)
- P1-12: Testai (vidutinis prioritetas)

**Vėliau:**
- P1-8: Calendar view
- P1-11: Mobile/a11y audit
- P1-13: Monitoring/Logging

---

## Pastabos

- P1 nėra production blokeriai
- Gali būti daroma paraleliai
- Rekomenduojama pradėti nuo greitai padaromų
