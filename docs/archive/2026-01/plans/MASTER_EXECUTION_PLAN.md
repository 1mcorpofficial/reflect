ARCHIVED: replaced by `docs/TODO.md` (backlog)

---
# MASTER EXECUTION PLAN - Reflectus Alternatyvė

> Pastaba: kanoniniai statuso dokumentai perkelti į `docs/STATUS.md` ir `docs/REQUIREMENTS_STATUS.md`. Nuorodos į `docs/STATUS.md` ar `docs/REQUIREMENTS_STATUS.md` šiame faile yra istorinės.

**Data:** 2026-01-11  
**Versija:** 1.0  
**Tikslas:** Pilnas, detalus darbo planas nuo dabartinės būsenos iki production-ready produkto

**Bazė:** Sujungti CHAT GPT planas + CODEX planas + papildomi trūkstami elementai

---

## 📋 TURINYS

1. [Vykdymo taisyklės](#vykdymo-taisyklės)
2. [Master Backlog](#master-backlog)
3. [Fazė 0: Realybės patikrinimas](#fazė-0-realybės-patikrinimas)
4. [Fazė 1: MVP 5.0 - Stabilus dev + Core MVP](#fazė-1-mvp-50---stabilus-dev--core-mvp)
5. [Fazė 2: MVP 5.0 Fix Pack - Stabilumas + Saugumas](#fazė-2-mvp-50-fix-pack---stabilumas--saugumas)
6. [Fazė 3: MVP 5.1 - PDF MVP funkcijos](#fazė-3-mvp-51---pdf-mvp-funkcijos)
7. [Fazė 4: MVP 5.2 - Production bazė](#fazė-4-mvp-52---production-bazė)
8. [Fazė 5: MVP 5.3 - UI/UX Polish + Accessibility](#fazė-5-mvp-53---uiux-polish--accessibility)
9. [Fazė 6: MVP 5.4 - Performance + Monitoring](#fazė-6-mvp-54---performance--monitoring)
10. [Iteracijų vykdymo formatas](#iteracijų-vykdymo-formatas)

---

## Vykdymo taisyklės

### Disciplina (privaloma kiekvienai užduočiai)

1. **Patikrinimas** → komanda/curl/manual → output į `logs/`
2. **Minimalus fix** → mažiausias pakeitimas, kuris išsprendžia problemą
3. **Proof** → tikslinis curl/smoke/manual įrodymas
4. **Docs update** → STATUS.md, REQUIREMENTS_STATUS.md, ISSUES_LOG.md, MASTER_BACKLOG.md
5. **Commit** → vienas tikslas per commit, aiškus message, nepushinti automatiškai

### Source of Truth

- **Statusai:** `docs/STATUS.md`, `docs/REQUIREMENTS_STATUS.md`
- **Realūs lūžiai:** `docs/audit/ISSUES_LOG.md`
- **Runbook:** `docs/audit/RUNBOOK_DEV.md`
- **Backlog:** `docs/plans/MASTER_BACKLOG.md` (bus sukurtas)
- **Latest changes:** `docs/audit/WORK_DONE.md`

### Prioritetai

- **P0:** Smoke/dev/critical security (blokatoriai)
- **P1:** PDF MVP (UX + scheduling + teacher + universal answers)
- **P2:** Production base (admin/GDPR/CSRF/CI/docker)
- **P3:** Polish (UI/UX/Accessibility)
- **P4:** Performance/Monitoring

### Definition of Done (DoD)

**Bendras DoD:**
1. Dev paleidimas stabilus pagal RUNBOOK_DEV.md
2. Smoke test žalias (200 iš login/analytics/export)
3. Įrodymas (curl/log/manual) kad veikia
4. Dokumentacija atnaujinta
5. Mažas commit su aiškiu message

**Specifinis DoD kiekvienam task:**
- Acceptance check (kaip įrodysi)
- Evidence (failai/logai/curl)
- Risk assessment (LOW/MED/HIGH)

---

## Master Backlog

### Task 0.1 - Sukurti kanoninį backlog failą

**Tikslas:** Vienas "source of truth" visiems darbams

**Kur:** `docs/plans/MASTER_BACKLOG.md`

**Checklist:**
- Sujungti užduotis iš REQUIREMENTS_STATUS.md
- Sujungti užduotis iš TODO_DETAILED.md
- Sujungti užduotis iš GAP_ANALYSIS.md
- Sujungti epikus iš WORK_PLAN.md
- Kiekvienam item pridėti:
  - Goal / Problem
  - Scope (frontend/backend/both)
  - Files + Endpoints
  - Dependencies
  - Acceptance check
  - Evidence (vėliau užpildysi)
  - Estimated risk (LOW/MED/HIGH)
  - Priority (P0/P1/P2/P3/P4)

**Priklausomybės:** nėra

**DoD:** MASTER_BACKLOG.md egzistuoja ir apima visas identifikuotas spragas (be dublikatų)

**Risk:** Dublikatų/konfliktų tarp doc'ų (sprendžiam: MASTER_BACKLOG tampa kanonu)

---

## Fazė 0: Realybės patikrinimas

### Task 0.1 - Smoke test + Audit patikrinimas

**Tikslas:** Patvirtinti realią būseną prieš pradedant darbus

**Kur:** `scripts/audit.sh`, `scripts/smoke.sh`, `logs/`

**Checklist:**
1. Paleisti `./scripts/audit.sh` → output į `logs/01-audit.txt`
2. Paleisti `./scripts/smoke.sh` → output į `logs/02-smoke.txt`
3. Jei smoke nesėkmingas → P0 "stabilumas" kol smoke OK
4. Atnaujinti `docs/STATUS.md` ir `docs/REQUIREMENTS_STATUS.md` tik po realaus patikrinimo

**Priklausomybės:** Dev serveris turi būti paleistas

**DoD:**
- `logs/01-audit.txt` egzistuoja su pilnu output
- `logs/02-smoke.txt` egzistuoja
- Smoke grįžta 0 (be crash) su veikiančiu localhost:3000
- 02-smoke.txt turi 200 iš login/analytics/export (arba aiškiai dokumentuota kas praleista)

**Risk:** Connection refused jei dev serveris ne paleistas (dokumentuoti)

---

## Fazė 1: MVP 5.0 - Stabilus dev + Core MVP

**Orientacija:** Stabilus dev, veikiantys core flow, tvarkingas minimalus UI

### Task 1.1 - Stabilus dev paleidimas + smoke "žalias"

**Tikslas:** Bet kas gali pakelti dev ir praeiti smoke

**Kur:** `docs/audit/RUNBOOK_DEV.md`, `scripts/audit.sh`, `scripts/smoke.sh`

**Checklist:**
1. `npm install`
2. `cp env.example .env` + AUTH_SECRET realus (generuoti pagal env.example)
3. DB paruošimas (lokali arba Docker; port konfliktai pagal runbook)
4. `npm run db:deploy`
5. `npm run db:seed`
6. `npm run dev` (background)
7. `./scripts/smoke.sh` su veikiančiu dev serveriu
8. Output išsaugoti į `logs/01-audit.txt` ir `logs/02-smoke.txt`

**Priklausomybės:** Postgres prieinamas, .env teisingas

**DoD:**
- Smoke.sh grįžta 0 (be crash) su veikiančiu localhost:3000
- 02-smoke.txt turi 200 iš login/analytics/export (arba aiškiai dokumentuota kas praleista)
- RUNBOOK_DEV.md atnaujintas jei reikia

**Risk:** Port 5432 konfliktas (minima RUNBOOK_DEV.md)

**Acceptance:**
```bash
# Proof
curl -s http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}' | jq .
# Turi grąžinti 200 arba 401 (ne 500)
```

---

### Task 1.2 - Canonical docs konsolidacija

**Tikslas:** Vienas kanoninis runbook, kiti deprecated

**Kur:** `docs/audit/RUNBOOK_DEV.md`, `docs/setup/*.md`

**Checklist:**
1. Palikti `docs/audit/RUNBOOK_DEV.md` kaip vienintelį kanoninį
2. Jei repo turi kitus setup failus – pažymėti "Deprecated" su nuoroda į RUNBOOK_DEV.md
3. Patikrinti, kad visi setup failai turi deprecated ženklą

**Priklausomybės:** nėra

**DoD:**
- Visi setup failai pažymėti deprecated
- README.md (jei yra) rodo į RUNBOOK_DEV.md

**Risk:** LOW

---

### Task 1.3 - Scheduling "planned/open/closed" enforcement (minimalus MVP)

**Tikslas:** Mokinys negali pildyti, jei veikla dar neprasidėjo arba jau užsidarė; UI tai aiškiai rodo

**Kur:**
- Backend: `src/app/api/activities/[activityId]/responses/route.ts`, `src/app/api/participants/activities/route.ts`
- Frontend: `src/app/builder/page.tsx`, `src/app/participant/page.tsx`
- Schema: `prisma/schema.prisma` (laukus jau turi pagal planus)

**Checklist:**
1. **Backend:**
   - Status skaičiavimas: `getActivityStatus(activity)` helper funkcija
   - API: status grąžinimas activities list'e
   - Submit: jei ne open → 403 su aiškiu kodu (`ACTIVITY_NOT_OPEN`)
   - Timezone handling: UTC saugojimas, timezone field tik UI/rodymui

2. **Frontend:**
   - Builder UI: įvestys openAt, closeAt, timezone (datetime-local inputs)
   - Participant activities list: planned/closed rodomi su label/disabled
   - Participant UI: "atsidarys X" / "uždaryta" pranešimai
   - Teacher view: status badge (PLANNED/OPEN/CLOSED)

**Priklausomybės:** Laukai DB egzistuoja (pagal REQUIREMENTS_STATUS.md)

**DoD (įrodymas):**
- curl/UI: planned activity → submit blokuojamas (403 ACTIVITY_NOT_OPEN)
- curl/UI: open activity → submit ok (200)
- curl/UI: closed activity → submit blokuojamas (403 ACTIVITY_CLOSED)
- smoke.sh nepradeda 500 (net jei activity state ne OPEN)
- UI rodo aiškų statusą visur

**Risk:** Timezone klaidos (minėta RETHINK_NOTES.md) - sprendžiam: UTC saugojimas, timezone tik display

**Acceptance:**
```bash
# Proof - planned
curl -X POST http://localhost:3000/api/activities/{activityId}/responses \
  -H "Cookie: reflectus_session=..." \
  -H "Content-Type: application/json" \
  -d '{"answers":[...]}'
# Turi grąžinti 403 su "Activity not open yet"

# Proof - open
# Turi grąžinti 200

# Proof - closed
# Turi grąžinti 403 su "Activity closed"
```

---

### Task 1.4 - Universalūs "Nenoriu atsakyti / Nežinau" visiems klausimams (MVP lygis)

**Tikslas:** Kiekviename klausime yra 2 papildomi pasirinkimai; "Nežinau" veda per 1–2 helper klausimus ir grąžina į originalų

**Kur:**
- Frontend: `src/app/participant/page.tsx`, naujas `src/components/UniversalAnswerActions.tsx`
- Backend: `src/app/api/activities/[activityId]/responses/route.ts`

**Checklist:**
1. **Komponentas:**
   - Sukurti `src/components/UniversalAnswerActions.tsx`
   - Props: `questionId`, `onDecline`, `onUnknown`, `onFollowUpComplete`
   - UI: 2 mygtukai "Nenoriu atsakyti" ir "Nežinau"

2. **"Nenoriu atsakyti" flow:**
   - Mygtukas → final status DECLINED
   - Payload: `{ questionId, status: "DECLINED" }`

3. **"Nežinau" flow:**
   - Mygtukas → wizard modal/stepper
   - Helper klausimai (max 2): iš `question.followUp` arba default helper prompts
   - Po helper'ų → grįžti į originalų klausimą su "suggested answer" (bet user gali pakeisti)
   - Payload: `{ questionId, status: "UNKNOWN", followUpAnswers: [...], value: ... }`

4. **Integracija:**
   - Visuose question render komponentuose privalai integruoti šitą universalų bloką
   - Validacija: refleksija submit tik su final (ANSWERED arba DECLINED)

**Priklausomybės:** Backend turi palaikyti UNKNOWN/DECLINED (pagal REQUIREMENTS_STATUS.md tai PARTIAL - reikia patikrinti)

**DoD:**
- Manual: kiekvienam question type matosi abu mygtukai
- DB: submit įrašo statusą + meta (follow-up) pagal flow
- UI: "Nežinau" wizard veikia ir grąžina į originalų klausimą
- Validacija: negali submit be final status (ANSWERED arba DECLINED)

**Risk:** UX frikcija (minima PLAN_MVP.md) - sprendžiam: švelnus wizard, ne priverstinis

**Acceptance:**
```bash
# Proof - submit su DECLINED
curl -X POST http://localhost:3000/api/activities/{activityId}/responses \
  -H "Cookie: reflectus_session=..." \
  -d '{"answers":[{"questionId":"q1","status":"DECLINED"}]}'
# Turi grąžinti 200

# Proof - submit su UNKNOWN + followUp
curl -X POST http://localhost:3000/api/activities/{activityId}/responses \
  -H "Cookie: reflectus_session=..." \
  -d '{"answers":[{"questionId":"q1","status":"UNKNOWN","followUpAnswers":[{"prompt":"Helper","value":"answer"}],"value":"suggested"}]}'
# Turi grąžinti 200
```

---

### Task 1.5 - Mokytojo pusės minimalus "usable" dashboard + export CTA

**Tikslas:** Mokytojas be "activityId ranka" gali matyti completion ir atsisiųsti CSV

**Kur:**
- UI: `src/app/dashboard/page.tsx`, `src/app/facilitator/(protected)/page.tsx`, `src/app/facilitator/(protected)/[groupId]/page.tsx`
- API: `src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/api/activities/[activityId]/export/route.ts`

**Checklist:**
1. **UI pasirinkimas:**
   - Group dropdown (jei daugiau nei 1 grupė)
   - Activity dropdown (pagal pasirinktą grupę)
   - "Refresh" mygtukas

2. **Kortelės:**
   - Total participants
   - Completed count
   - Pending count
   - Completion percentage (progress bar)

3. **"Kas nepildė" sąrašas:**
   - Minimaliai: participant codes/names (pagal privacy mode)
   - List su badge'ais (completed/pending)

4. **Export mygtukas:**
   - "Download CSV" CTA
   - Loading state
   - Error handling (403 min-N guard paaiškinimas)

5. **Empty/loading/error states:**
   - Empty: "No activities yet" / "No responses yet"
   - Loading: skeleton arba spinner
   - Error: aiškus pranešimas

**Priklausomybės:** Analytics + export endpoint'ai veikia

**DoD:**
- Manual: mokytojas pasirenka activity ir mato completion + gali parsisiųsti CSV
- UI: empty/loading/error states veikia
- Privacy: min-N guard aiškiai paaiškinamas UI (jei 403)

**Risk:** Privatumas (min-N anon taisyklės turi būti aiškiai paaiškintos UI)

**Acceptance:**
```bash
# Proof - dashboard load
curl http://localhost:3000/api/groups \
  -H "Cookie: reflectus_session=..."
# Turi grąžinti groups list

# Proof - export
curl http://localhost:3000/api/activities/{activityId}/export?format=csv \
  -H "Cookie: reflectus_session=..."
# Turi grąžinti CSV arba 403 su aiškiu pranešimu
```

---

## Fazė 2: MVP 5.0 Fix Pack - Stabilumas + Saugumas

**Orientacija:** Užrakinti "produkciškai pavojingas" vietas, bet dar be didelio infra

### Task 2.1 - Org scoping auditas (kritinė production rizika)

**Tikslas:** Mokytojas negali matyti/eksportuoti/analizuoti kitos organizacijos duomenų

**Kur:**
- API audit: visi `src/app/api/**/route.ts` (ypač activities/analytics/export/groups)
- Guard utils: `src/lib/guards.ts`, `src/lib/auth.ts`

**Checklist:**
1. **Sudaryti endpoint'ų sąrašą:**
   - `/api/groups` - turi filtruoti pagal `orgId`
   - `/api/activities` - turi filtruoti pagal `orgId`
   - `/api/activities/[activityId]/analytics` - turi patikrinti `activity.group.orgId === session.orgId`
   - `/api/activities/[activityId]/export` - turi patikrinti `activity.group.orgId === session.orgId`
   - `/api/activities/[activityId]/responses` - turi patikrinti `activity.groupId === session.groupId` (participant) arba `activity.group.orgId === session.orgId` (facilitator)
   - `/api/participants/activities` - turi filtruoti pagal `session.groupId`
   - Visi kiti activity-related endpoints

2. **Patikrinti kiekvieną endpoint'ą:**
   - Ar yra `orgId` check?
   - Ar yra `where: { orgId: session.orgId }` arba panašus filter?
   - Ar yra 403 jei orgId nesutampa?

3. **Pridėti smoke "org isolation":**
   - Script arba manual doc su 2 org + users
   - Test: org1 user negali pasiekti org2 duomenų

**Priklausomybės:** Turi būti būdas sukurti 2 org + users (seed arba per API)

**DoD:**
- Bandymas pasiekti kitos org group/activity/analytics/export → 403 arba 404
- Įrodymas: `logs/org-isolation-test.txt` + įrašas ISSUES_LOG.md
- Visi endpoint'ai dokumentuoti su org scoping check

**Risk:** "Cross-org data leak" (kritinė) - HIGH

**Acceptance:**
```bash
# Proof - org isolation
# 1. Login kaip org1 user
# 2. Bandyti pasiekti org2 activity
curl http://localhost:3000/api/activities/{org2_activityId}/analytics \
  -H "Cookie: reflectus_session=org1_session..."
# Turi grąžinti 403 Forbidden
```

---

### Task 2.2 - Rate limit + audit log coverage "per visas mutacijas"

**Tikslas:** Visos mutacijos turi rate limit + audit įrašą (be PII)

**Kur:**
- `src/lib/rate-limit.ts`, `src/lib/audit.ts`
- API routes: auth, groups, activities, responses, export, admin

**Checklist:**
1. **Susirašyti mutating route'us:**
   - POST `/api/auth/login` - ✅ (jau turi)
   - POST `/api/auth/register` - ✅ (jau turi)
   - POST `/api/groups` - ✅ (jau turi)
   - POST `/api/activities` - ✅ (jau turi)
   - POST `/api/activities/[activityId]/responses` - ✅ (jau turi)
   - GET `/api/activities/[activityId]/export` - ✅ (jau turi)
   - POST `/api/groups/[groupId]/participants/import` - ✅ (jau turi)
   - PATCH `/api/activities/[activityId]/status` - ✅ (jau turi)
   - POST `/api/participants/login` - ✅ (jau turi)
   - Visi admin endpoints - patikrinti

2. **Pridėti rateLimit() ten, kur trūksta:**
   - Patikrinti kiekvieną mutating route
   - Pridėti `checkRateLimit()` jei nėra

3. **Pridėti logAudit() ten, kur trūksta:**
   - Patikrinti kiekvieną mutating route
   - Pridėti `logAudit()` jei nėra
   - Užtikrinti, kad audit meta nėra jautrų duomenų (tik ID + action + minimal meta)

**Priklausomybės:** Org scoping (kad audit neišduotų kitos org info)

**DoD:**
- `rg checkRateLimit` įrodo coverage (komanda + output į `logs/rate-limit-coverage.txt`)
- `rg logAudit` įrodo coverage (komanda + output į `logs/audit-coverage.txt`)
- DB: audit įrašai atsiranda po login/submit/export/create
- Audit log be PII (tik ID, action, timestamp, orgId - ne email/name)

**Risk:** PII loguose (minėta RETHINK_NOTES.md) - MED

**Acceptance:**
```bash
# Proof - rate limit
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done
wait
# Po 20 request'ų turi grąžinti 429

# Proof - audit log
curl -X POST http://localhost:3000/api/activities \
  -H "Cookie: reflectus_session=..." \
  -d '{"title":"Test"}'
# DB turi turėti naują audit log įrašą
```

---

### Task 2.3 - Migracijų disciplina (nebepersi-rašinėti pritaikytų)

**Tikslas:** Nuo dabar – tik naujos migracijos, jokių "edit applied migration"

**Kur:**
- `prisma/migrations/*`
- Docs: `docs/audit/ISSUES_LOG.md`, `docs/audit/RUNBOOK_DEV.md`

**Checklist:**
1. **Įrašyti taisyklę į runbook:**
   - NIEKADA neperrašyti pritaikytų migracijų
   - Jei reikia pakeisti schema - sukurti naują migraciją

2. **Aprašyti SAFE dev reset kelią:**
   - Tik dev aplinkoje
   - `prisma migrate reset` (su data loss warning)
   - Arba: nauja DB `reflectus_dev_YYYYMMDD`

3. **Aprašyti production kelią:**
   - Tik `prisma migrate deploy` (ne dev)
   - Backup prieš migraciją
   - Rollback planas

**Priklausomybės:** nėra

**DoD:**
- Aiškus doc RUNBOOK_DEV.md
- Dev komandos neveda į "reset" be paaiškinimo
- Production komandos aiškios

**Risk:** Netyčinis duomenų praradimas - HIGH

---

### Task 2.4 - Privacy min-N paaiškinimas UI (ne tik 403)

**Tikslas:** Jei anon režime negalima rodyti <5 atsakymų – UI turi gražų paaiškinimą ir ką daryti toliau

**Kur:** Teacher dashboard UI (`src/app/dashboard/page.tsx` ir facilitator pages)

**Checklist:**
1. **Jei export/analytics 403 dėl min-N:**
   - Rodyti "Per mažai atsakymų anon režimui"
   - Paaiškinimas: "Reikia bent 5 atsakymų anon režimui dėl privatumo"
   - Rodyti rekomendaciją:
     - "Palaukite daugiau atsakymų"
     - "Arba pakeiskite privacy mode į NAMED" (jei toks nustatymas bus)

2. **UI komponentas:**
   - `PrivacyGuardMessage` komponentas
   - Props: `reason`, `minCount`, `currentCount`, `suggestions`

**Priklausomybės:** Anon/privacyMode modelis

**DoD:**
- Manual: 403 atvejis rodo aiškų "why" UI
- Komponentas reusable

**Risk:** Privatumo policy nesupratimas mokykloje - MED

---

### Task 2.5 - Error handling (500 negalima be request ID)

**Tikslas:** 500 negalima rodyti be aiškaus "request id" ir be PII

**Kur:** Visi API routes, error handling middleware

**Checklist:**
1. **Request ID generavimas:**
   - Middleware arba helper funkcija
   - UUID arba short ID
   - Header: `X-Request-ID`

2. **Error handling:**
   - Try-catch visur
   - Structured error response: `{ error, requestId, details? }`
   - Log su requestId (be PII)

3. **500 handling:**
   - Never expose stack trace production'e
   - Log su requestId + stack trace (dev only)
   - User mato: "Something went wrong. Request ID: xxx"

**Priklausomybės:** nėra

**DoD:**
- Sąmoningai sukelta klaida → grįžta structured error su requestId
- Log turi correlation id
- Production neleidžia stack trace

**Risk:** LOW

**Acceptance:**
```bash
# Proof - error handling
curl http://localhost:3000/api/activities/invalid-id/analytics \
  -H "Cookie: reflectus_session=..."
# Turi grąžinti 404 su requestId, ne 500
```

---

## Fazė 3: MVP 5.1 - PDF MVP funkcijos

**Orientacija:** "Jau atrodo kaip produktas" mokytojui ir mokiniui

### Task 3.1 - Teacher preset'ai (Pamoka / Savaitė / Kontrolinis / Projektas)

**Tikslas:** 1 click → sugeneruoja pradinį klausimyną

**Kur:**
- `src/app/builder/page.tsx` (ir/ar facilitator group page)
- `src/lib/question-types.ts`
- `src/components/question-config-editor.tsx`

**Checklist:**
1. **4 preset mygtukai:**
   - "Pamokos refleksija"
   - "Savaitės refleksija"
   - "Kontrolinio refleksija"
   - "Projekto refleksija"

2. **Kiekvienas preset sugeneruoja klausimus:**
   - Pamoka: Traffic light (kaip pavyko), Thermometer (motyvacija), Free text (ką išmokau)
   - Savaitė: Scale (savijauta), Multi-select (veikla), Free text (atsiliepimai)
   - Kontrolinis: Traffic light (pasiruošimas), Scale (sunkumas), Free text (pastabos)
   - Projektas: Pie 100 (laiko paskirstymas), Free text (iššūkiai), Free text (pasiekimai)

3. **Galima edit'inti prieš publish/assign:**
   - Preset sukuria activity draft
   - Galima pridėti/pašalinti klausimus
   - Galima keisti preset klausimus

**Priklausomybės:** Question engine turi priimti config struktūrą

**DoD:**
- Mokytojas sukuria activity su preset ir mato ją participant pusėje
- Preset klausimai yra relevant ir naudingi

**Risk:** Per daug "hardcode" (sprendžiam: preset = generatorius su config)

**Acceptance:**
```bash
# Proof - preset creation
curl -X POST http://localhost:3000/api/activities \
  -H "Cookie: reflectus_session=..." \
  -d '{"groupId":"...","title":"Pamokos refleksija","preset":"LESSON",...}'
# Turi grąžinti activity su preset klausimais
```

---

### Task 3.2 - Emotion question type (schema + UI + analytics + export)

**Tikslas:** Emocijų pasirinkimas (ikonos) veikia end-to-end

**Kur:**
- DB: `prisma/schema.prisma` + nauja migracija
- Validation: `src/lib/question-types.ts`
- UI render: participant flow (`src/app/participant/page.tsx` ar extracted components)
- Builder config: `src/components/question-config-editor.tsx`
- Analytics/export: `src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/api/activities/[activityId]/export/route.ts`

**Checklist:**
1. **Pridėti enum value:**
   - `QuestionType.EMOTION` į schema
   - Migracija

2. **UI komponentas:**
   - Emotion picker (ikonos arba emoji)
   - Single arba multi – pagal spec nuspręsti ir užfiksuoti doc
   - Default emotions: 😊 😢 😠 😐 😰 😴 (arba custom icons)

3. **Atsakymo validacija + saugojimas:**
   - Value: emotion ID arba emoji
   - Validation: turi būti valid emotion

4. **Teacher peržiūra + distribution analytics + CSV export:**
   - Analytics: emotion distribution
   - Export: emotion value CSV stulpelyje

**Priklausomybės:** Universal "Nenoriu/Nežinau" turi veikti su šiuo tipu

**DoD:**
- Smoke/manual: emocija išsaugoma, matosi analytics, yra CSV
- UI: emotion picker veikia su universal answer actions

**Risk:** Migruojant schema (tvarkom per naują migraciją) - MED

**Acceptance:**
```bash
# Proof - emotion submit
curl -X POST http://localhost:3000/api/activities/{activityId}/responses \
  -H "Cookie: reflectus_session=..." \
  -d '{"answers":[{"questionId":"emotion_q1","value":"😊","status":"ANSWERED"}]}'
# Turi grąžinti 200

# Proof - emotion analytics
curl http://localhost:3000/api/activities/{activityId}/analytics \
  -H "Cookie: reflectus_session=..."
# Turi grąžinti emotion distribution
```

---

### Task 3.3 - Analytics trend (from/to) "real"

**Tikslas:** Mokytojas mato pokytį laike, ne tik snapshot

**Kur:**
- `src/app/api/activities/[activityId]/analytics/route.ts`
- `src/app/dashboard/page.tsx`

**Checklist:**
1. **from/to query param'ai:**
   - ISO date format
   - Validacija (ne NaN, ne ateityje)
   - Default: last 30 days

2. **Trend serija:**
   - Per dienas: completion rate
   - Key klausimų avg/distribution per laiką
   - Data points: `[{ date, completion, keyMetrics }]`

3. **UI kortelė "trend":**
   - Net jei pradžiai be grafiko – bent lentelė / mini sparkline
   - Chart library (pvz. recharts) arba simple table

**Priklausomybės:** Pakankamai istorinių responses

**DoD:**
- curl su from/to grąžina trend array
- UI rodo trend (lentelė arba chart)

**Risk:** Našumas (sprendžiam: riboti range + agreguoti) - MED

**Acceptance:**
```bash
# Proof - trend API
curl "http://localhost:3000/api/activities/{activityId}/analytics?from=2026-01-01&to=2026-01-31" \
  -H "Cookie: reflectus_session=..."
# Turi grąžinti trend array su date + metrics
```

---

### Task 3.4 - Scheduling UX "pilnai" teacher + student pusėse

**Tikslas:** Mokytojas mato statusą ir gali filtruoti, mokinys aiškiai supranta kada atsidarys/užsidarė

**Kur:**
- `src/app/participant/page.tsx`
- `src/app/facilitator/(protected)/*`
- `src/app/dashboard/page.tsx`

**Checklist:**
1. **Status badge:**
   - PLANNED/OPEN/CLOSED
   - Spalvos: yellow/green/red

2. **Filtrai pagal statusą:**
   - Teacher: filter by status (planned/open/closed/all)
   - Participant: automatinis (rodo tik open, planned su "atsidarys X")

3. **Copy:**
   - "Atsidarys 2026-01-15 08:00"
   - "Užsidarė 2026-01-20 18:00"
   - Timezone aiškiai nurodytas

**Priklausomybės:** Task 1.3 enforcement

**DoD:**
- Manual per UI: status aiškiai matomas
- Filtrai veikia
- Copy aiškus

**Risk:** Timezone UI (aiškiai rodyti, kokia timezone) - LOW

---

### Task 3.5 - Teacher dashboard usability (completion, "kas nepildė", answers list+detail, filtrai)

**Tikslas:** Mokytojas aiškiai mato: total, completed, pending, ir konkrečius vardus/kodus

**Kur:**
- `src/app/dashboard/page.tsx`
- `src/app/facilitator/(protected)/[groupId]/page.tsx`

**Checklist:**
1. **Completion metrics:**
   - Total participants
   - Completed count
   - Pending count
   - Completion percentage (progress bar)

2. **"Kas nepildė" sąrašas:**
   - Participant codes/names (pagal privacy mode)
   - List su badge'ais (completed/pending)
   - Click → detail view

3. **Answers list + detail:**
   - List: participant + completion status
   - Detail: visi atsakymai per klausimą
   - Filter: per klausimą, per participant

4. **Filtrai:**
   - Group (jei daugiau nei 1)
   - Activity
   - Status (completed/pending)
   - Date range

5. **Export vienu mygtuku:**
   - "Download CSV" CTA
   - Loading state
   - Error handling

**Priklausomybės:** Analytics + export endpoint'ai veikia

**DoD:**
- Mokytojas aiškiai mato: total, completed, pending, ir konkrečius vardus/kodus
- Filtrai veikia
- Export veikia

**Risk:** Privatumas (min-N anon taisyklės) - MED

---

## Fazė 4: MVP 5.2 - Production bazė

**Orientacija:** "Deploy-ready bazė", dar nereiškia pilno production, bet jau be kritinių skylų

### Task 4.1 - Admin skeleton (realus, ne tik folderis)

**Tikslas:** Admin turi vieną vietą diagnostikai, audit peržiūrai, baziniam valdymui

**Kur:**
- UI: `src/app/admin/page.tsx` (jau egzistuoja - patikrinti)
- API: `src/app/api/admin/*` (jau egzistuoja - patikrinti)
- Auth/guard: `src/lib/auth.ts`, `src/lib/admin.ts` (jau egzistuoja - patikrinti)
- Env: `env.example` (ADMIN_EMAILS jau numatytas)

**Checklist:**
1. **Patikrinti ar veikia:**
   - Admin folder + API + lib egzistuoja
   - `requireAdmin` funkcija veikia
   - Guard'ai veikia

2. **Guard:**
   - Ne-admin negali pasiekti `/admin`
   - Ne-admin negali pasiekti `/api/admin/*`
   - Redirect arba 403

3. **Diagnostics:**
   - DB ok (connection test)
   - Migrations ok (count)
   - Version/build info (package.json version, git commit)

4. **Audit log list:**
   - Paged (50 per page)
   - Filter: action, date range
   - Search: targetId, actorUserId

5. **Org/user list:**
   - Read-only pradžiai
   - Org list su user count
   - User list su org assignment

**Priklausomybės:** Org scoping auditas (Task 2.1)

**DoD:**
- Manual + curl į admin endpoint'us (200 admin, 403 non-admin)
- Diagnostics veikia
- Audit log viewer veikia

**Risk:** RBAC klaidos (kritinė) - HIGH

**Acceptance:**
```bash
# Proof - admin guard
curl http://localhost:3000/api/admin/health \
  -H "Cookie: reflectus_session=non_admin..."
# Turi grąžinti 403

curl http://localhost:3000/api/admin/health \
  -H "Cookie: reflectus_session=admin..."
# Turi grąžinti 200 su diagnostics
```

---

### Task 4.2 - CSRF strategija (jei naudojami cookies)

**Tikslas:** State-changing request'ai apsaugoti

**Kur:**
- Auth/session mechanizmas: `src/lib/auth.ts`
- API routes (POST/PATCH/DELETE)
- Frontend fetch layer

**Checklist:**
1. **Pasirinkti strategiją:**
   - Double-submit token (cookie + header)
   - Arba: SameSite=Strict + Origin check
   - Dokumentuoti pasirinkimą

2. **Token išdavimas:**
   - GET `/api/csrf-token` endpoint
   - Cookie: `csrf-token` (httpOnly, sameSite=strict)
   - Response: token value (header)

3. **Validacija server side:**
   - Middleware arba helper
   - POST/PATCH/DELETE request'ai turi turėti `X-CSRF-Token` header
   - Patikrinti: header === cookie

4. **Docs:**
   - Kaip veikia
   - Kaip testuoti

**Priklausomybės:** Stabilus auth

**DoD:**
- POST be token → 403
- POST su token → 200
- Docs aiškūs

**Risk:** Netyčinis flow sulaužymas (reikia smoke papildymo) - MED

**Acceptance:**
```bash
# Proof - CSRF
curl -X POST http://localhost:3000/api/activities \
  -H "Cookie: reflectus_session=..." \
  -d '{"title":"Test"}'
# Turi grąžinti 403 (be CSRF token)

curl -X GET http://localhost:3000/api/csrf-token \
  -H "Cookie: reflectus_session=..."
# Turi grąžinti token

curl -X POST http://localhost:3000/api/activities \
  -H "Cookie: reflectus_session=...; csrf-token=xxx" \
  -H "X-CSRF-Token: xxx" \
  -d '{"title":"Test"}'
# Turi grąžinti 200
```

---

### Task 4.3 - GDPR baseline (admin scope): export/delete + retention notes

**Tikslas:** Turėti minimalų mechanizmą mokyklai (duomenų eksportas / trynimas / retention)

**Kur:**
- Nauji admin API route'ai: `src/app/api/admin/gdpr/*`
- Docs: naujas `docs/GDPR.md` arba į RETHINK_NOTES.md

**Checklist:**
1. **Export user data:**
   - GET `/api/admin/gdpr/export/:userId`
   - Format: JSON/CSV
   - Duomenys: user info, responses, activities (pagal scope)

2. **Soft-delete/anonymize:**
   - POST `/api/admin/gdpr/delete/:userId`
   - Soft-delete: mark as deleted, anonymize PII
   - Hard-delete: tik po retention periodo

3. **Retention taisyklės:**
   - Dokumentuoti: kiek laiko laikomi duomenys
   - Automatinis cleanup (cron arba manual)

4. **Audit log įrašai:**
   - Be PII (tik ID, action, timestamp)

**Priklausomybės:** Admin skeleton

**DoD:**
- Admin gali eksportuoti ir "delete/anonymize" test user'į dev aplinkoje
- Docs aiškūs

**Risk:** Nepilnamečių duomenys (aukštas) - HIGH

**Acceptance:**
```bash
# Proof - GDPR export
curl http://localhost:3000/api/admin/gdpr/export/{userId} \
  -H "Cookie: reflectus_session=admin..."
# Turi grąžinti JSON/CSV su user data

# Proof - GDPR delete
curl -X POST http://localhost:3000/api/admin/gdpr/delete/{userId} \
  -H "Cookie: reflectus_session=admin..."
# Turi grąžinti 200, user anonymized
```

---

### Task 4.4 - CI (lint/typecheck/prisma validate/build)

**Tikslas:** "Clean env" patikra kiekvienam PR/commit

**Kur:**
- `.github/workflows/ci.yml` (naujas)

**Checklist:**
1. **Workflow:**
   - Trigger: push, pull_request
   - Jobs: lint, typecheck, prisma validate, build

2. **Steps:**
   - `npm ci`
   - `npm run lint`
   - `npm run typecheck` (jei atskiras script – pridėti)
   - `npx prisma validate`
   - `npm run build`

3. **Env:**
   - Minimal env (stub values)
   - No secrets

**Priklausomybės:** Repo turi veikti be lokalios būsenos

**DoD:**
- CI praeina ant clean env
- Workflow dokumentuotas

**Risk:** Flaky build dėl env (sprendžiam: minimal env ir stub'ai) - LOW

---

### Task 4.5 - Dockerize app + db + healthcheck + minimal deploy doc

**Tikslas:** Vienu docker compose up pakelti app+db dev/prod-like režimu

**Kur:**
- `Dockerfile` (naujas)
- `docker-compose.prod.yml` (naujas)
- `docs/infra/DEPLOY.md` (naujas)

**Checklist:**
1. **App Dockerfile:**
   - Build stage: npm install, npm run build
   - Run stage: npm start
   - Healthcheck: `/api/health` endpoint

2. **Compose:**
   - App service
   - DB service (jau yra)
   - Env variables
   - Volumes
   - Networks

3. **Health endpoint:**
   - GET `/api/health`
   - Response: `{ status: "ok", db: "ok", timestamp }`

4. **Dokumentacija:**
   - Kaip deployinti be secrets repo
   - Env variables
   - Backup strategy

**Priklausomybės:** Stabilus build

**DoD:**
- `docker compose -f docker-compose.prod.yml up` → app pasiekiama + smoke praeina
- Health endpoint veikia

**Risk:** Secret management (sprendžiam: env per runtime) - MED

**Acceptance:**
```bash
# Proof - docker
docker compose -f docker-compose.prod.yml up -d
sleep 10
curl http://localhost:3000/api/health
# Turi grąžinti {"status":"ok","db":"ok",...}
```

---

### Task 4.6 - Backup/restore gairės (pg_dump/pg_restore) + testas

**Tikslas:** Mokykla/hosteris gali saugiai daryti backup

**Kur:**
- `docs/infra/BACKUP_RESTORE.md` (naujas)

**Checklist:**
1. **pg_dump komandos:**
   - Custom format: `pg_dump -Fc -f backup.dump`
   - Plain format: `pg_dump -f backup.sql`
   - Compression: gzip

2. **pg_restore komandos:**
   - Custom format: `pg_restore -d target_db backup.dump`
   - Plain format: `psql -d target_db -f backup.sql`

3. **Kur laikyti:**
   - Local filesystem
   - S3/cloud storage (gairės)
   - Rotacija: keep last 7 days, weekly, monthly

4. **Šifravimas:**
   - Gairės: encrypt backup files
   - Key management

5. **Testas:**
   - Restore test DB dev aplinkoje
   - Įrodymas log'e

**Priklausomybės:** Docker/DB aiškus

**DoD:**
- Atkurta test DB dev aplinkoje (įrodymas log'e)
- Docs aiškūs

**Risk:** Duomenų nutekėjimas per backup failus - HIGH

---

### Task 4.7 - Minimalūs testai (bent critical API integration)

**Tikslas:** Automatiškai pagauti regresijas auth/submit/analytics/export

**Kur:**
- `tests/` (nauja struktūra) arba minimal scriptai `scripts/test-*.sh`

**Checklist:**
1. **Test login:**
   - Facilitator login
   - Participant login
   - Invalid credentials

2. **Test submit:**
   - Valid response
   - Invalid response
   - Required validation

3. **Test analytics:**
   - 200 (tuščia DB neturi 500)
   - 403 min-N guard

4. **Test export:**
   - CSV export
   - 403 min-N guard

**Priklausomybės:** CI

**DoD:**
- Testai paleidžiami CI
- Testai praeina

**Risk:** Testų flakiness (sprendžiam: seed + izoliuota DB) - MED

---

## Fazė 5: MVP 5.3 - UI/UX Polish + Accessibility

**Orientacija:** Apple-inspired, mobile-first, accessible

### Task 5.1 - Global spacing tokens + layout suvienodinimas

**Tikslas:** "Niekas negali būti krašte", consistent padding/margin

**Kur:**
- `src/app/globals.css`
- `src/app/layout.tsx`
- Layout components

**Checklist:**
1. **Design tokens:**
   - Spacing: 4, 8, 12, 16, 20, 24, 32, 48, 64
   - Container padding: 16-20px
   - Max-width: 1280px (desktop)

2. **Global styles:**
   - Container class
   - Section spacing
   - Card padding

3. **Layout suvienodinimas:**
   - Consistent header/footer
   - Consistent page padding

**Priklausomybės:** nėra

**DoD:**
- Manual: 320px plotyje nėra overflow
- Visi CTA pasiekiami
- Consistent spacing visur

**Risk:** LOW

---

### Task 5.2 - Cards + empty/loading/error states

**Tikslas:** Apple-inspired cards, aiškūs empty/loading/error states

**Kur:**
- `src/components/ui/card.tsx` (jau yra - patobulinti)
- `src/components/EmptyState.tsx` (naujas)
- `src/components/LoadingState.tsx` (naujas)
- `src/components/ErrorState.tsx` (naujas)

**Checklist:**
1. **Cards:**
   - Consistent padding
   - Shadow/border
   - Hover states

2. **Empty states:**
   - Icon
   - Message
   - CTA (jei reikia)

3. **Loading states:**
   - Skeleton arba spinner
   - Message

4. **Error states:**
   - Icon
   - Message
   - Retry CTA

**Priklausomybės:** nėra

**DoD:**
- Visi ekranai turi empty/loading/error states
- Cards consistent

**Risk:** LOW

---

### Task 5.3 - Accessibility (WCAG 2.1 AA)

**Tikslas:** Accessible visiems vartotojams

**Kur:**
- Visi UI komponentai
- Forms
- Navigation

**Checklist:**
1. **Keyboard navigation:**
   - Tab order
   - Focus indicators
   - Skip links

2. **Screen readers:**
   - ARIA labels
   - Alt text
   - Semantic HTML

3. **Color contrast:**
   - WCAG AA (4.5:1)
   - Color not only indicator

4. **Forms:**
   - Labels
   - Error messages
   - Required indicators

**Priklausomybės:** nėra

**DoD:**
- Keyboard navigation veikia
- Screen reader friendly
- Color contrast OK

**Risk:** MED

---

### Task 5.4 - Mobile-first responsive (0 horizontal scroll @ 320px)

**Tikslas:** Perfect mobile experience

**Kur:**
- Visi pages
- Components

**Checklist:**
1. **320px width:**
   - No horizontal scroll
   - All CTA accessible
   - Text readable

2. **Breakpoints:**
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

3. **Touch targets:**
   - Min 44x44px
   - Adequate spacing

**Priklausomybės:** nėra

**DoD:**
- Manual: 320px plotyje nėra overflow
- All CTA pasiekiami
- Touch targets OK

**Risk:** LOW

---

## Fazė 6: MVP 5.4 - Performance + Monitoring

**Orientacija:** Production-ready performance ir monitoring

### Task 6.1 - Performance optimization

**Tikslas:** Fast page loads, smooth interactions

**Kur:**
- API routes
- Frontend components
- Database queries

**Checklist:**
1. **API optimization:**
   - Query optimization (Prisma select)
   - Pagination
   - Caching (jei reikia)

2. **Frontend optimization:**
   - Code splitting
   - Lazy loading
   - Image optimization

3. **Database:**
   - Indexes
   - Query optimization

**Priklausomybės:** nėra

**DoD:**
- Page load < 2s
- API response < 500ms (p95)

**Risk:** MED

---

### Task 6.2 - Error tracking (Sentry arba panašus)

**Tikslas:** Production error tracking

**Kur:**
- Error boundary
- API error handling
- Sentry integration

**Checklist:**
1. **Sentry setup:**
   - DSN configuration
   - Error boundary
   - API error tracking

2. **Error context:**
   - User ID (be PII)
   - Request ID
   - Stack trace

**Priklausomybės:** nėra

**DoD:**
- Errors tracked
- Alerts configured

**Risk:** LOW

---

### Task 6.3 - Logging strategy (structured logging)

**Tikslas:** Production logging

**Kur:**
- API routes
- Error handling
- Audit logs

**Checklist:**
1. **Structured logging:**
   - JSON format
   - Log levels
   - Correlation IDs

2. **Log aggregation:**
   - Gairės: ELK, CloudWatch, arba panašus

**Priklausomybės:** nėra

**DoD:**
- Structured logs
- Docs aiškūs

**Risk:** LOW

---

### Task 6.4 - Monitoring + Health checks

**Tikslas:** Production monitoring

**Kur:**
- Health endpoint
- Metrics endpoint
- Monitoring setup

**Checklist:**
1. **Health endpoint:**
   - GET `/api/health`
   - DB connection
   - Migrations status

2. **Metrics:**
   - Request count
   - Error rate
   - Response time

3. **Monitoring:**
   - Gairės: Prometheus, Grafana, arba panašus

**Priklausomybės:** nėra

**DoD:**
- Health endpoint veikia
- Metrics available
- Docs aiškūs

**Risk:** LOW

---

## Iteracijų vykdymo formatas

### Kiekviena iteracija turi:

1. **Goal** (1 sakinys)
2. **Commands run** (terminal)
3. **Result** (output)
4. **Fix** (files changed)
5. **Proof** (smoke/curl/manual)
6. **Docs update** (MASTER_BACKLOG + STATUS + REQUIREMENTS_STATUS + ISSUES_LOG)
7. **Commit** (message)

### Dokumentai atnaujinami po kiekvienos iteracijos:

- `docs/STATUS.md`
- `docs/REQUIREMENTS_STATUS.md`
- `docs/audit/ISSUES_LOG.md` (jei buvo bug)
- `docs/plans/MASTER_BACKLOG.md` (progress)
- `docs/audit/WORK_DONE.md` (latest changes)

### Commit message formatas:

```
feat(scope): short description

Longer description if needed.

- Change 1
- Change 2

Closes #issue
```

**Scopes:**
- `auth` - authentication
- `participant` - participant flow
- `teacher` - teacher/facilitator flow
- `admin` - admin features
- `scheduling` - scheduling features
- `ui` - UI/UX changes
- `api` - API changes
- `db` - database changes
- `docs` - documentation
- `infra` - infrastructure
- `security` - security
- `test` - tests

---

## Pirmas output (prieš taisymus)

### 1) Smoke rezultatas

**Status:** TBD (reikia paleisti)

**Santrauka:** TBD

### 2) Top 12 nepabaigtų darbų iš MASTER_BACKLOG

1. **P0:** Smoke test + Audit patikrinimas
2. **P0:** Org scoping auditas (kritinė production rizika)
3. **P0:** Rate limit + audit log coverage
4. **P1:** Scheduling UI + enforcement
5. **P1:** Universal "Nenoriu/Nežinau" visiems klausimams
6. **P1:** Teacher preset'ai
7. **P1:** Emotion question type
8. **P1:** Analytics trend
9. **P1:** Teacher dashboard usability
10. **P2:** Admin skeleton (patikrinti ar veikia)
11. **P2:** CSRF strategija
12. **P2:** GDPR baseline

### 3) Iteracija 1 planas (max 10 punktų)

1. Paleisti `./scripts/audit.sh` → `logs/01-audit.txt`
2. Paleisti `./scripts/smoke.sh` → `logs/02-smoke.txt`
3. Jei smoke nesėkmingas → P0 "stabilumas" kol smoke OK
4. Sukurti `docs/plans/MASTER_BACKLOG.md`
5. Atnaujinti `docs/STATUS.md` pagal realų patikrinimą
6. Atnaujinti `docs/REQUIREMENTS_STATUS.md` pagal realų patikrinimą
7. Pradėti nuo P0: Org scoping auditas (jei smoke OK)
8. Pridėti org isolation test
9. Dokumentuoti rezultatus
10. Commit: "chore(docs): create MASTER_BACKLOG and update status"

---

## Papildomi trūkstami elementai (pridėti)

### Testing strategija

- Unit tests (critical functions)
- Integration tests (API endpoints)
- E2E tests (critical flows)
- Test coverage target: 70%+

### Documentation

- End user documentation
- API documentation
- Admin guide
- Teacher guide
- Student guide

### Onboarding flow

- First-time user experience
- Tutorial/walkthrough
- Help system

### Internationalization (jei reikia)

- i18n setup
- Translation files
- Language switcher

### Security audit checklist

- OWASP Top 10
- Dependency scanning
- Secret scanning
- Penetration testing (gairės)

---

**PABAIGA**
