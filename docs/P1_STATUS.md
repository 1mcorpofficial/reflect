# P1 Status - Svarbūs neužbaigti funkcionalumai

**Data:** 2026-01-12  
**Statusas:** P1 užduotys (ne blokeriai, bet svarbu)

---

## P1 užduotys (8 punktų)

### ⚠️ 7. Admin panelė (RBAC + CRUD) — PARTIAL
- **Statusas:** Yra skeleton, bet trūksta pilno CRUD UI
- **Kas yra:** `src/app/admin/page.tsx` - rodo orgs/users, bet nėra edit/delete/create
- **Kas reikia:** Pridėti CRUD operacijas (create/edit/delete orgs/users)

### ⚠️ 8. Scheduling kalendorius/planavimas — PARTIAL
- **Statusas:** Nėra calendar view
- **Kas yra:** Scheduling laukai DB (openAt/closeAt/timezone), bet nėra UI
- **Kas reikia:** Sukurti `src/app/facilitator/(protected)/calendar/page.tsx`

### ⚠️ 9. Teacher dashboard "response detail" — PARTIAL
- **Statusas:** Dashboard yra, bet trūksta drill-down
- **Kas yra:** `src/app/dashboard/page.tsx` - rodo analytics, bet nėra per-student detail
- **Kas reikia:** Drill-down per mokinį + aiškus "nežinau/nenoriu" traktavimas

### ⚠️ 10. PDF/XLSX export runtime įrodymas
- **Statusas:** Export veikia kode, bet nėra runtime įrodymo
- **Kas yra:** `src/app/api/activities/[activityId]/export/route.ts` - palaiko PDF/XLSX
- **Kas reikia:** Curl testai + log'ai `logs/proof/export-*.txt`

### ⚠️ 11. Mobile/320px + a11y audit
- **Statusas:** Nėra patikrinimo
- **Kas reikia:** Rankinis testas (320px), klaviatūros navigacija, ARIA audit, screenshot'ai

### ⚠️ 12. Testai (E2E/Unit) — PARTIAL
- **Statusas:** Yra basic test setup, bet nėra pilno suite
- **Kas yra:** `tests/integration/api.test.ts` - basic testai
- **Kas reikia:** Unit testai + E2E (Playwright/Cypress) + CI integration

### ⚠️ 13. Monitoring/Logging — PARTIAL
- **Statusas:** Yra basic audit log, bet nėra structured logging
- **Kas yra:** `src/lib/audit.ts` - basic audit logging
- **Kas reikia:** Winston/Pino structured logging + metrics endpoint + alertų integracija

### ⚠️ 14. Docs: pasenęs `docs/pending/GAP_ANALYSIS.md`
- **Statusas:** Dokumentas konfliktuoja su realiu statusu
- **Kas reikia:** Atnaujinti arba archyvuoti

---

## Prioritetai

**Greitai padaryti:**
1. P1-14: Docs - atnaujinti/archyvuoti GAP_ANALYSIS.md
2. P1-10: PDF/XLSX export runtime įrodymas (curl testai)

**Vidutinio prioriteto:**
3. P1-7: Admin panelė CRUD
4. P1-9: Dashboard drill-down
5. P1-12: Testai (E2E/Unit)

**Ilgesnio prioriteto:**
6. P1-8: Calendar view
7. P1-11: Mobile/a11y audit
8. P1-13: Monitoring/Logging

---

## Pastabos

- P1 nėra production blokeriai
- Gali būti daroma paraleliai su P0
- Rekomenduojama pradėti nuo greitai padaromų (docs, export testai)
