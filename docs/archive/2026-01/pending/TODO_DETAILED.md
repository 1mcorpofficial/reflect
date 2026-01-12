# TODO DETAILED - Kas trūksta / nebaigta / tik dalinai padaryta

**Data:** 2026-01-11  
**Bazė:** STATUS.md, REQUIREMENTS_STATUS.md, GAP_ANALYSIS.md, WORK_PLAN.md, DOCS_SUMMARY.md, RETHINK_NOTES.md

---

## 1) Rolės ir administravimas

### 1.1 Admin role + Admin UI – **TODO**

**Kas trūksta:**
- ❌ Nėra admin role "payload'e" ir guard'ų (sesija neturi admin flag)
- ⚠️ Admin folder + API egzistuoja (`src/app/admin/page.tsx`, `src/app/api/admin/*`, `src/lib/admin.ts` su `requireAdmin`), bet reikia patikrinti ar veikia
- ❌ Nėra admin įrankių: pilna diagnostika, audit log peržiūra, org/user valdymas

**Kodėl tai svarbu:**
- Be admin UI realus produkto valdymas bus "per DB/terminalą"
- Sunku daryti moderavimą/diagnostiką/piloto palaikymą mokykloje (support)

**Ko reikia, kad būtų "padaryta":**
- `/api/auth/me` (ar analogas) grąžina role (student/teacher/admin)
- Admin guard veikia (ne admin neprieina)
- Admin puslapyje: "DB ok", "migrations ok", "build/version", audit įrašai, greitos nuorodos

**Failai:**
- `src/lib/auth.ts` - pridėti admin flag į session
- `src/lib/admin.ts` - patikrinti ar veikia (jau egzistuoja)
- `src/app/admin/page.tsx` - patikrinti ar veikia (jau egzistuoja)
- `src/app/api/admin/*` - patikrinti ar veikia (jau egzistuoja)

### 1.2 Org scoping pilnas auditas – **PARTIAL**

**Kas trūksta:**
- ⚠️ Org scoping pritaikytas kai kur (pvz. groups filtruojasi pagal orgId), bet nėra patikrinta/užtikrinta visur per visus endpoint'us (activities, exports, analytics ir t.t.)

**Rizika:**
- "Cross-org data leak" (mokytojas gali netyčia pamatyti kitos organizacijos duomenis). Tai yra kritinė production rizika.

**Ko reikia:**
- Auditas visų endpoint'ų: `api/activities/*`, `api/exports/*`, `api/analytics/*`
- Užtikrinti, kad visur būtų orgId check

**Failai:**
- `src/app/api/activities/[activityId]/analytics/route.ts` - patikrinti orgId check (jau yra line 54)
- `src/app/api/activities/[activityId]/export/route.ts` - patikrinti orgId check (jau yra line 95)
- `src/app/api/activities/route.ts` - patikrinti orgId check
- Visi kiti activity-related endpoints

---

## 2) Scheduling / galiojimo langai / planavimas

### 2.1 openAt / closeAt / timezone UI + logika – **PARTIAL**

**Kas yra:**
- ✅ DB schema turi openAt/closeAt/timezone laukus (schema padaryta)
- ✅ Backend validuoja openAt/closeAt (responses/route.ts lines 91-100)

**Kas trūksta:**
- ❌ Nėra pilno UI (mokytojui) nustatyti atsidarymo/užsidarymo laiką
- ⚠️ Nėra pilnos "planned/open/closed" būsenos logikos visur (participant list, submit, teacher view)

**Ko reikia:**
- Builder UI turi leisti pasirinkti laiką + rodyti statusą
- Participant UI:
  - "Planned" → nerodyti kaip aktyvaus arba rodyti disabled su "atsidarys X"
  - "Closed" → neleisti submit (403 su aiškiu kodu) - **jau veikia backend'e**
- Teacher UI aiškiai rodo statusą ir filtruoja

**Failai:**
- `src/app/builder/page.tsx` - pridėti openAt/closeAt/timezone inputs
- `src/app/api/participants/activities/route.ts` - filtering pagal status
- `src/app/participant/page.tsx` - UI status logic

### 2.2 Reminders / priminimai – **TODO**

- ❌ Nėra scheduler/queue mechanizmo priminimams (tai reikalauja infra sprendimo: cron/queue)

**Komentaras:** Tai gali būti vėlesnis etapas (P2), reikalauja infra (cron/queue/bullmq)

---

## 3) "Nežinau / Nenoriu atsakyti" – privalomas UX sluoksnis

### 3.1 API palaiko, bet UI nėra universali – **PARTIAL**

**Kas yra:**
- ✅ API palaiko `UNKNOWN` ir `DECLINED` statusus
- ✅ UI turi mygtukus participant page (participant/page.tsx lines 734-755)

**Kas trūksta:**
- ⚠️ Frontend'e nėra universalių (visur vienodų) komponentų "Nenoriu atsakyti" ir "Nežinau"
- ⚠️ Nėra pilno "Nežinau" vedlio (helper flow): 1–2 nukrypimai → grįžti į originalų klausimą ir padėti atsakyti
- ⚠️ UI turi follow-up sekciją, bet nėra pilno wizard flow su grįžimu

**Kodėl svarbu:**
- Tai yra vienas iš pagrindinių PDF reikalavimų (be jo produktas "neatitinka spec")

**Ko reikia:**
- Sukurti universalų komponentą `src/components/UniversalAnswerActions.tsx`
- Pagerinti "Nežinau" follow-up wizard su pilnu flow (helper questions → grįžti → suggested answer)

**Failai:**
- `src/app/participant/page.tsx` - pagerinti follow-up wizard
- `src/components/UniversalAnswerActions.tsx` - sukurti (naujas failas)

---

## 4) Question engine / klausimų tipai

### 4.1 "Emotion UI" – **TODO**

- ❌ Nėra emocijų tipo UI įgyvendinimo (pagal requirements status)

**Failai:**
- `src/lib/question-types.ts` - pridėti EMOTION type
- `src/app/participant/page.tsx` - pridėti emotion UI render
- `src/app/builder/page.tsx` - pridėti emotion config

### 4.2 Follow-up klausimai – schema yra, bet UX orkestracija trūksta

- ✅ Schema turi `followUp` JSON
- ⚠️ UI logika, kuri realiai veda vartotoją per follow-up'us, dar nėra pilnai sukurta

**Susiję su 3.1** - reikia pagerinti follow-up wizard

---

## 5) Mokytojo pusė (Teacher) – branduolys dar "ne iki galo"

### 5.1 Template/preset'ai pamoka/savaitė/kontrolinis/projektas – **TODO**

- ❌ Builder egzistuoja, bet nėra "vienu paspaudimu" preset'ų šablonų

**Ko reikia:**
- Preset mygtukai: "Pamokos refleksija", "Savaitės refleksija", "Kontrolinio refleksija", "Projekto refleksija"
- Kiekvienas preset užpildo pradines sekcijas/klausimus

**Failai:**
- `src/app/builder/page.tsx` - pridėti preset mygtukus

### 5.2 Teacher dashboard – completion/analytics yra, bet dar "minimal"

**Kas yra:**
- ✅ Completion duomenys gaunami per analytics, bet UI minimalus

**Kas trūksta:**
- ⚠️ Aiškus "kas nepildė" sąrašas UI (duomenys gali būti, bet nepateikta)
- ❌ Filtrai (group/date/status) – TODO
- ❌ Patogus atsakymų peržiūros "list + detail" UX

**Failai:**
- `src/app/dashboard/page.tsx` - pagerinti UI
- `src/app/facilitator/(protected)/*` - pagerinti dashboard

---

## 6) Analytics – veikia, bet trūksta produkto lygio

### 6.1 Trend (from/to) – **PARTIAL**

- ⚠️ Params priimami (from/to query params parsed), bet trend calculation nėra pilnai implementuotas

**Failai:**
- `src/app/api/activities/[activityId]/analytics/route.ts` - implementuoti trend calculation

### 6.2 Correlations – **TODO**

- ❌ Koreliacijos idėja yra plane, bet nerealizuota (galima palikti vėliau, bet turi būti roadmap)

### 6.3 "min-N" privatumas – padaryta anon režime, bet reikia konsekventiškumo

- ✅ Anon režime min-N guard jau įdėtas (403 jei <5) - analytics ir export
- ✅ Konsekventiškumas - veikia abu endpoint'ai

**Status:** DONE (patvirtinta)

---

## 7) Export

### 7.1 CSV – DONE, bet Excel/PDF – **TODO**

- ✅ CSV yra
- ❌ Excel/PDF nėra (pagal requirements status)

**Failai:**
- `src/app/api/activities/[activityId]/export/route.ts` - pridėti PDF/Excel stub arba implementacija

### 7.2 Export UI + UX

- ⚠️ Net jei endpoint'as yra, mokytojo UI turi turėti aiškų "Download" kelią, tuščias būsenas ("dar nėra atsakymų"), ir privatumo paaiškinimus

**Failai:**
- `src/app/dashboard/page.tsx` - pridėti export UI
- `src/app/facilitator/(protected)/*` - pridėti export buttons

---

## 8) UI/UX (Frontend) – didelė neužbaigta dalis

### 8.1 Mobile-first spacing / Apple-inspired cards – **TODO**

- ❌ Reikia globalių spacing taisyklių ("niekas negali būti krašte"), cards, max-width container, layout suvienodinimo

**Failai:**
- `src/app/globals.css` - pridėti design tokens (spacing, max-width)
- Layout components - suvienodinti spacing

### 8.2 Empty/loading/error states – **PARTIAL**

- ⚠️ Dabar minimalūs tekstai; trūksta pilnų empty states, skeleton/loading, aiškių klaidų UX

**Failai:**
- Visi UI komponentai - pridėti empty/loading/error states

### 8.3 Progress indikatorius studentui – **PARTIAL**

- ⚠️ "Basic" yra, bet ne pagal dizaino brief (Apple-style, aiškiai, gražiai)

**Failai:**
- `src/app/participant/page.tsx` - pagerinti progress indicator

---

## 9) Saugumas ir GDPR (production-kelio blokatoriai)

### 9.1 CSRF strategija – **TODO**

- ⚠️ Dabar remiamasi `sameSite=lax`, bet nėra aiškios CSRF strategijos state-changing request'ams

**Komentaras:** P2 prioritetas, bet reikia planuoti

### 9.2 GDPR data export/delete + retention – **TODO**

- ❌ Nėra endpoint'ų/UI: duomenų eksportas, trynimas/anonymizavimas, retention politika

**Komentaras:** Kritinė production reikalavimas

### 9.3 Audit log coverage ir "surfacing" – **PARTIAL**

- ⚠️ Audit helper egzistuoja, bet nenaudojamas visur
- ⚠️ Admin UI egzistuoja (`src/app/admin/page.tsx`), bet reikia patikrinti
- ⚠️ Reikia taisyklės: audit log be jautrių laukų

**Status:** PARTIAL (admin UI egzistuoja, bet reikia patikrinti)

### 9.4 Rate limit – **PARTIAL**

- ✅ Coverage: login, participant login, submit, export, group create, activity create, participant import, status change (9 routes)
- ⚠️ In-memory reiškia: production multi-instance neapsaugos (reikės Redis)

**Status:** DONE (coverage gerai), bet reikia Redis production'e

---

## 10) Infra / Production readiness

### 10.1 CI/CD – **TODO**

- ❌ Nėra workflow (lint/typecheck/prisma validate/build)

**Failai:**
- `.github/workflows/ci.yml` - sukurti (naujas failas)

### 10.2 App container / reverse proxy / SSL – **TODO**

- ⚠️ Yra Postgres docker dalis, bet nėra pilno "app container" + reverse proxy + SSL gairių

**Failai:**
- `Dockerfile` - sukurti (naujas failas)
- `docker-compose.prod.yml` - sukurti (naujas failas)
- `docs/infra/DEPLOY.md` - sukurti (naujas failas)

### 10.3 Backup/restore – **TODO**

- ❌ Nėra DB backup/restore dokumentacijos (production būtina)

**Failai:**
- `docs/infra/BACKUP.md` - sukurti (naujas failas)

### 10.4 Tests – **TODO**

- ❌ Testų nėra (bent minimalūs integration tests svarbiausiems endpoint'ams)

**Failai:**
- `tests/` - sukurti folderį ir testus

---

## 11) Migracijos – production kritinė disciplina

### 11.1 "Modified migrations after applied" – **PARTIAL / rizika**

- ⚠️ Ataskaitos rodo situaciją, kai egzistuojančioje DB Prisma prašė reset, o sprendimas buvo "nauja DB dev'ui"
- ⚠️ Production'e tai nepriimtina: nuo dabar taisyklė – **tik naujos migracijos**, jokių perrašinėjimų pritaikytoms

**Komentaras:** Dokumentuota ISSUES_LOG.md, bet reikia disciplina - niekada neperrašyti pritaikytų migracijų

---

## 12) Kas sąmoningai "N/A" dabar

### 12.1 Moderation (upload) – N/A

- N/A: Upload'ų nėra, todėl moderavimas kol kas neįgyvendinamas (tik jei atsiras failų įkėlimas)

---

## Prioritetai (P0/P1/P2)

### P0 - Stabilumas (✅ COMPLETE)
- ✅ Privacy guard
- ✅ Rate limit coverage
- ✅ Audit log coverage
- ✅ Smoke test

### P1 - PDF MVP funkcijos

1. **Admin role/UI** - patikrinti ar veikia (folder + API + lib egzistuoja)
2. **"Nežinau" follow-up wizard** - pagerinti (pilnas flow)
3. **Scheduling UI** - pridėti į builder (openAt/closeAt/timezone)
4. **Scheduling enforcement** - participant activities list (planned/open/closed)
5. **Teacher templates** - pridėti į builder (pamoka/savaitė/kontrolinis/projektas)
6. **Teacher dashboard** - polish (completion cards, analytics visuals)

### P2 - Kokybė + production

7. **UI/UX polish** - Apple-inspired (design tokens, spacing, cards)
8. **PDF export** - stub arba implementacija
9. **Analytics trends** - from/to implementation
10. **Security/GDPR** - CSRF strategy + GDPR baseline
11. **CI/CD** - workflow
12. **Docker/Deploy** - app container + reverse proxy
13. **Tests** - minimal integration tests
