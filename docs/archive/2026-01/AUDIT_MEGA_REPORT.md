ARCHIVED: replaced by `docs/STATUS.md` and `docs/audit/` files

---
# AUDIT MEGA REPORT - Reflectus Alternatyvė

**Data:** 2026-01-12  
**Versija:** 1.0  
**Tikslas:** Pilnas projekto paveikslas - kas padaryta, kas ne, kur kas yra kode, kokios rizikos, tikslus kelias iki production

---

## A) Executive Summary

**Reflectus Alternatyvė** yra Next.js 16.1.1 aplikacija mokyklų refleksijų valdymui. Core MVP srautas veikia dev aplinkoje; naujausias smoke patvirtinimas 2026-01-12 (`logs/smoke-verify-2nd.txt`). Tačiau nemaža dalis “DONE” teiginių turi tik code-review proof'us (ne runtime), o keli svarbūs blokai yra PARTIAL/MISSING (admin RBAC/CRUD, scheduling kalendorius, UI/UX polish, CI/tests, backup automatizacija).

**Bendra būklė (pagal `docs/STATUS.md` + `docs/REQUIREMENTS_STATUS.md`):**
- **P0:** auth/org scoping veikia, bet rate limit + audit coverage ir CSRF coverage tik dalinai patikrinti.
- **P1:** question engine/presetai/analytics veikia; scheduling UX ir teacher responses detalumas daliniai.
- **P2:** Docker + GDPR baseline yra; CI, admin, backup automatizacija – PARTIAL.
- **P3:** UI/UX polish ir mobile/a11y audit – PARTIAL (nėra runtime įrodymų).
- **P4:** observability/perf caching – code-ready, runtime unverified.

**Kritinės rizikos (production):**
- ⚠️ **Migracijų disciplina:** kai kurios migracijos modifikuotos po pritaikymo (ISSUE-003).
- ⚠️ **CI/testai:** CI nėra green; test coverage minimalus.
- ⚠️ **GDPR/CSRF/Org isolation:** patikrinta tik dalinai, reikia papildomo audito.
- ⚠️ **Backup automatizacija:** nėra script'ų/rotacijos/testų.

**Production readiness (prelim):** ~55% (detalės “Final verdict”).

---

## B) Kaip paleisti

**Kanoninis runbook:** `docs/audit/RUNBOOK_DEV.md`

**Greitas startas:**
```bash
cd reflectus-app
cp env.example .env
# Redaguok .env: DATABASE_URL, AUTH_SECRET
npm install
docker compose up -d db  # arba naudok lokalią Postgres
npm run db:deploy
npm run db:seed
npm run dev
```

**Smoke test:**
```bash
./scripts/smoke.sh  # arba ./scripts/test-api.sh
```

**Audit:**
```bash
./scripts/audit.sh
```

---

## C) Realus Smoke/Audit rezultatas

**Audit output:** `logs/audit-latest.txt`
- ✅ Prisma schema valid
- ✅ Node.js v20.19.6
- ✅ Docker 29.1.3
- ⚠️ `rg` (ripgrep) neįdiegtas (naudojamas audit script'e)

**Smoke test output (2026-01-12):** `logs/smoke-verify-2nd.txt`
- ✅ Facilitator login: 200
- ✅ Participant login: 200
- ✅ Participant activities: 200
- ✅ Analytics: 200
- ✅ Export CSV: 200

**Smoke test output (autostart be serverio):** `logs/smoke-latest.txt`
- ⚠️ Connection refused (serveris nebuvo paleistas)

**Manual smoke (2026-01-11):** `logs/smoke/02-smoke.txt`
- ✅ Facilitator login: 200
- ✅ Participant login: 200
- ✅ Analytics: 200
- ✅ Export CSV: 200

**Org isolation proof:** `logs/audit/03-org-isolation.txt`
- ✅ Cross-org requests: 403 (correct)

**CSRF proof:** `logs/audit/06-csrf-check.txt`
- ✅ Origin mismatch: 403
- ✅ Same-origin: 201

**Admin proof:** `logs/audit/05-admin-check.txt`
- ✅ Health: 200
- ✅ Audit log: 200
- ✅ Orgs list: 200
- ✅ Users list: 200

**GDPR proof:** `logs/audit/07-gdpr-anonymize.txt`
- ✅ Anonymize: email perrašytas į `deleted+<id>@example.invalid`

---

## C2) Evidence quality (DONE items)

| DONE item | Evidence present? | Evidence date | Evidence file |
|---|---|---|---|
| Auth & roles | Y (runtime) | 2026-01-12 07:45 | `logs/smoke-verify-2nd.txt` |
| Org scoping | Y (runtime) | 2026-01-11 16:00 | `logs/audit/03-org-isolation.txt` |
| Privacy min-N guard | Y (code-proof) | 2026-01-11 21:04 | `logs/proof/10-P0-06-proof.txt` |
| Question engine (types + EMOTION) | Y (code-proof) | 2026-01-11 21:04 | `logs/proof/14-P1-05-emotion-proof.txt` |
| Teacher presets | Y (code-proof) | 2026-01-11 21:04 | `logs/proof/12-P1-03-presets-proof.txt` |
| Analytics trend | Y (code-proof) | 2026-01-11 21:04 | `logs/proof/15-P1-06-trend-proof.txt` |
| Analytics caching | Y (code-proof) | 2026-01-11 21:10 | `logs/proof/23-P4-02-perf-proof.txt` |
| Export CSV | Y (runtime) | 2026-01-12 07:45 | `logs/smoke-verify-2nd.txt` |
| Error handling (requestId) | Y (code-proof) | 2026-01-11 21:10 | `logs/proof/22-P4-01-observability-proof.txt` |
| Docker + health | Y (code-proof) | 2026-01-11 21:04 | `logs/proof/18-P2-05-docker-proof.txt` |
| GDPR anonymize | Y (runtime) | 2026-01-11 16:19 | `logs/audit/07-gdpr-anonymize.txt` |

Pastaba: “code-proof” = logas iš kodo peržiūros, ne runtime įrodymas.

---

## C3) Gaps found by reviewer

- Rate limit + audit log coverage turi tik code-review auditą; runtime/curl įrodymų nėra (`docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md` turi “REIKIA PATIKRINTI”).
- CSRF įrodytas tik vienu logu; nėra pilno visų state-changing endpoint'ų audito.
- PDF/XLSX export neturi runtime įrodymų (tik implementacija).
- Org isolation auditas neperleistas po naujų endpoint'ų (responses/export/dashboard).
- UI/UX polish turi tik code-proof; nėra 320px/mobilių/a11y realaus patikrinimo.
- `docs/pending/GAP_ANALYSIS.md` yra pasenęs ir konfliktuoja su realiu statusu (reikia atnaujinti arba archyvuoti).

---

## D) "Kas padaryta" (DONE) - su evidence

Pastaba: DONE sąrašas remiasi log/curl evidence. “Code-proof” reiškia kodo peržiūros logą be runtime patvirtinimo.

### D1) Auth & Roles

**Status:** ✅ DONE (runtime smoke)

**Kas padaryta:**
- Facilitator/participant login su JWT cookies
- Org context session (`SessionPayload` su `orgId`, `orgRole`)
- Role-based guards (`requireRole`, `requireAdmin`)

**Evidence:**
- `logs/smoke-verify-2nd.txt` - login 200

**Files:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/participants/login/route.ts`
- `src/lib/auth.ts`

---

### D2) Org Scoping

**Status:** ✅ DONE (audit smoke)

**Kas padaryta:**
- Cross-org requests blokuojami (403)
- `requireRole` tikrina `session.orgId` vs `resource.orgId`

**Evidence:**
- `logs/audit/03-org-isolation.txt` - cross-org 403
- `docs/audit/ORG_SCOPING_AUDIT.md` - auditas

---

### D3) Privacy min-N Guard

**Status:** ✅ DONE (code-proof; runtime unverified)

**Kas padaryta:**
- Analytics/export blokuoja jei `privacyMode=ANONYMOUS` ir `responses.length < 5`
- UI komponentas (`PrivacyGuardMessage`) rodo minCount/currentCount

**Evidence:**
- `logs/proof/10-P0-06-proof.txt`

**Constants:**
- `MIN_ANON_COUNT = 5`

---

### D4) Question Engine (types + EMOTION)

**Status:** ✅ DONE (code-proof; runtime unverified)

**Kas padaryta:**
- 8 question types (TRAFFIC_LIGHT, EMOTION, SCALE, THERMOMETER, MULTI_SELECT, PIE_100, SENTENCE_COMPLETION, FREE_TEXT)
- Question config schemas + UI editor

**Evidence:**
- `logs/proof/14-P1-05-emotion-proof.txt`

---

### D5) Teacher Presets

**Status:** ✅ DONE (code-proof; runtime unverified)

**Kas padaryta:**
- 4 preset'ai (lesson/week/test/project) + `applyPreset`

**Evidence:**
- `logs/proof/12-P1-03-presets-proof.txt`

---

### D6) Analytics (core + trend + caching)

**Status:** ✅ DONE (code-proof; runtime unverified)

**Kas padaryta:**
- Completion rate + per-question distribution
- Trend (from/to)
- AnalyticsSnapshot caching

**Evidence:**
- `logs/proof/15-P1-06-trend-proof.txt`
- `logs/proof/23-P4-02-perf-proof.txt`

---

### D7) Export (CSV/JSON)

**Status:** ✅ DONE (CSV/JSON runtime; PDF/XLSX unverified)

**Kas padaryta:**
- CSV + JSON export veikia
- Privacy min-N guard
- Rate limiting (in-memory)

**Evidence:**
- `logs/smoke-verify-2nd.txt` - CSV 200

**Pastaba:** PDF/XLSX runtime įrodymų nėra (žr. E8).

---

### D8) Error Handling (requestId)

**Status:** ✅ DONE (code-proof; runtime unverified)

**Kas padaryta:**
- Request ID generation
- Structured error response formatas

**Evidence:**
- `logs/proof/22-P4-01-observability-proof.txt`

---

### D9) Docker + Health endpoint

**Status:** ✅ DONE (code-proof; runtime unverified)

**Kas padaryta:**
- Dockerfile + docker-compose.prod.yml
- `/api/health` endpoint

**Evidence:**
- `logs/proof/18-P2-05-docker-proof.txt`

---

### D10) GDPR baseline (export/anonymize + policy)

**Status:** ✅ DONE (runtime for anonymize; policy documented)

**Kas padaryta:**
- User data export endpoint
- User anonymization endpoint
- Retention policy documented

**Evidence:**
- `logs/audit/07-gdpr-anonymize.txt`
- `logs/proof/16-P2-03-gdpr-proof.txt`
- `docs/GDPR.md`

---

## E) "Kas dalinai" (PARTIAL)

### E1) Admin RBAC + UI

**Status:** ⚠️ PARTIAL

**Kas yra:**
- Admin allowlist + `requireAdmin`
- Admin endpoints (health/audit/orgs/users/GDPR)
- Admin UI (skeleton)

**Kas trūksta:**
- Pilnas RBAC (org/user CRUD)
- Admin UI polish (linkai į dashboards, search, filters)
- Org/user management UI

**Rizika:** MED

---

### E2) Scheduling UX + Calendar

**Status:** ⚠️ PARTIAL

**Kas yra:**
- `openAt/closeAt/timezone` laukai + backend enforcement
- Status badges (PLANNED/OPEN/CLOSED)

**Kas trūksta:**
- Calendar/planavimo UI
- Priminimai/recurrence
- Aiškus planavimo vaizdas mokytojui

**Rizika:** MED

---

### E3) Teacher Dashboard Depth

**Status:** ⚠️ PARTIAL

**Kas yra:**
- Completion + per-question analytics
- Filters (group/activity/status/date)
- Atsakymų list UI

**Kas trūksta:**
- Response detail view / per-student drill-down
- Išbaigti empty/loading/error state'ai visiems scenarijams

**Rizika:** MED

---

### E4) Rate Limit + Audit Log Coverage

**Status:** ⚠️ PARTIAL (UNVERIFIED runtime)

**Kas yra:**
- `checkRateLimit` ir `logAudit` naudojami daugelyje route'ų

**Kas trūksta:**
- Runtime įrodymai
- Coverage audite yra “REIKIA PATIKRINTI” (`docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md`)
- Redis support (horizontal scaling)

**Rizika:** MED

---

### E5) CSRF Coverage

**Status:** ⚠️ PARTIAL

**Kas yra:**
- CSRF token + same-origin check per `requireRole`/`requireAdmin`
- Vienas logas su 403/201 (`logs/audit/06-csrf-check.txt`)

**Kas trūksta:**
- Pilnas visų state-changing endpoint'ų auditas
- Runtime įrodymai per daugiau scenarijų

**Rizika:** MED

---

### E6) UI/UX Polish + Mobile/A11y Audit

**Status:** ⚠️ PARTIAL

**Kas yra:**
- `page-shell` spacing util
- Baziniai empty/loading/error state'ai
- Progress indikatorius

**Kas trūksta:**
- Pilni design tokens + Apple-inspired polish
- 320px/mobilus overflow auditas
- Touch target (44px) ir accessibility (ARIA/keyboard) auditas

**Rizika:** MED

---

### E7) Analytics Correlations

**Status:** ⚠️ PARTIAL

**Kas yra:**
- Roadmap dokumentuotas

**Kas trūksta:**
- Correlations API stub
- Top factors skaičiavimai

**Rizika:** LOW

---

### E8) Export PDF/XLSX Runtime Proof

**Status:** ⚠️ PARTIAL

**Kas yra:**
- PDF/XLSX implementacija (`pdf-lib`, `xlsx`)

**Kas trūksta:**
- Runtime/curl įrodymai PDF/XLSX eksportams

**Rizika:** MED

---

### E9) CI + Test Coverage

**Status:** ⚠️ PARTIAL

**Kas yra:**
- CI workflow struktūra (`.github/workflows/ci.yml`)
- Smoke/test scripts (`scripts/smoke.sh`, `scripts/test-api.sh`)

**Kas trūksta:**
- CI green run
- E2E tests
- Unit tests

**Rizika:** MED

---

### E10) GDPR Full Compliance

**Status:** ⚠️ PARTIAL

**Kas yra:**
- Export/anonymize endpoint'ai
- Retention policy dokumentuota

**Kas trūksta:**
- Automated retention cleanup
- Consent management
- Deletion/audit trail procedūros

**Rizika:** HIGH

---

## F) "Kas nepadaryta" (MISSING/TODO)

### F1) Notifications/Priminimai

**Status:** ❌ MISSING

**Kas trūksta:**
- Job scheduler (cron/queue)
- Email/push adapter
- Reminder logic

**Rizika:** LOW

---

### F2) AI Tagging Pipeline

**Status:** ❌ MISSING

**Kas trūksta:**
- AI service stub
- Queue/worker
- Meta fields for tags

**Rizika:** LOW

---

### F3) Calendar/Planavimas UI

**Status:** ❌ MISSING

**Kas trūksta:**
- Calendar component
- Planning view
- Visual scheduling

**Rizika:** LOW

---

### F4) Production Monitoring

**Status:** ❌ MISSING

**Kas trūksta:**
- Structured logging (Winston/Pino)
- Metrics (Prometheus)
- Alerts (PagerDuty/Slack)

**Rizika:** MED

---

### F5) Backup Automation

**Status:** ❌ MISSING

**Kas trūksta:**
- Automated backup script
- Backup rotation
- Backup testing

**Rizika:** HIGH (production blocker)

---

## G) Architektūra

### G1) Frontend → API → Services → DB

```
┌─────────────────┐
│  Frontend (UI)  │
│  Next.js App    │
│  Router         │
└────────┬────────┘
         │
         │ HTTP (fetch/csrfFetch)
         │
┌────────▼────────┐
│   API Routes    │
│  /api/*/route.ts│
└────────┬────────┘
         │
         │ requireRole/requireAdmin
         │ checkRateLimit
         │ logAudit
         │
┌────────▼────────┐
│   Services      │
│  src/lib/*.ts   │
│  - auth.ts      │
│  - guards.ts    │
│  - rate-limit.ts│
│  - audit.ts     │
│  - csrf.ts      │
└────────┬────────┘
         │
         │ Prisma Client
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

### G2) Auth/Roles/Org Scoping

```
┌─────────────────────────────────────┐
│         Session (JWT Cookie)        │
│  - sub: userId                       │
│  - role: facilitator/participant/admin│
│  - orgId: organization ID            │
│  - orgRole: ORG_ADMIN/FACILITATOR    │
│  - groupId: group ID (participant)   │
│  - membershipId: GroupParticipant ID │
└──────────────┬──────────────────────┘
               │
               │ requireRole(role, opts)
               │
┌──────────────▼──────────────────────┐
│         Guards                       │
│  - CSRF check (state-changing)       │
│  - Same-origin check                 │
│  - Role check                         │
│  - Org scoping (facilitator)         │
└──────────────┬──────────────────────┘
               │
               │ session.orgId vs resource.orgId
               │
┌──────────────▼──────────────────────┐
│      Resource Access                 │
│  - Cross-org → 403                   │
│  - Same-org → 200                    │
└─────────────────────────────────────┘
```

---

## H) Frontend Detalės

### H1) Critical Pages & Flows

**Pages:**
- `src/app/page.tsx` - Home (role selection)
- `src/app/facilitator/login/page.tsx` - Facilitator login
- `src/app/facilitator/(protected)/page.tsx` - Groups list
- `src/app/facilitator/(protected)/[groupId]/page.tsx` - Group management (activities, participants, builder)
- `src/app/participant/login/page.tsx` - Participant login
- `src/app/participant/page.tsx` - Participant flow (activities, questions, submit)
- `src/app/dashboard/page.tsx` - Teacher dashboard (analytics, export, filters)
- `src/app/builder/page.tsx` - Activity builder (legacy?)
- `src/app/admin/page.tsx` - Admin UI (health, audit, orgs, users)

**Flows:**
1. **Facilitator:** Login → Groups → Create Activity → Manage Participants → View Dashboard
2. **Participant:** Login → Select Activity → Answer Questions → Submit
3. **Admin:** Login → View Health → View Audit → Manage Orgs/Users

### H2) UI Components

**Custom Components:**
- `src/components/PrivacyGuardMessage.tsx` - Privacy min-N message
- `src/components/UniversalAnswerActions.tsx` - "Nenoriu/Nežinau" buttons
- `src/components/ActivityStatusBadge.tsx` - Status badge (PLANNED/OPEN/CLOSED)
- `src/components/question-config-editor.tsx` - Question config editor

**UI Library (Shadcn/UI):**
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/textarea.tsx`

### H3) UI Problems

**Partially addressed (code-proof):**
- ⚠️ Overflow prevention (reikia 320px audit)
- ⚠️ Global spacing tokens (tik dalis layout'ų)
- ⚠️ Empty/loading/error states (ne visur audituota)
- ⚠️ Progress indicator polish (runtime nepatikrinta)

**Remaining:**
- ⚠️ Mobile audit (320px+) - needs manual testing
- ⚠️ Touch target audit (44px+) - needs manual testing
- ⚠️ Accessibility audit (ARIA, keyboard) - needs manual testing

### H4) "Nežinau/Nenoriu" UX Status

**Status:** ⚠️ PARTIAL (code-only)

**Implementation:**
- `UniversalAnswerActions` komponentas
- Follow-up flow (max 2 klausimai)
- "Grįžti prie klausimo" button
- Validation: UNKNOWN neleidžiama submit

**Evidence:**
- `src/components/UniversalAnswerActions.tsx`
- `src/app/participant/page.tsx` - integration

### H5) Frontend audit additions

- "Nežinau/Nenoriu": participant flow implementuotas, bet nėra aiškios vizualios interpretacijos mokytojo dashboarde/eksportuose; reikia UX patikrinimo mobile.
- Scheduling UI: tik `openAt/closeAt` + status badge; trūksta kalendoriaus/planavimo vaizdo ir priminimų.
- Admin UI: skeleton be CRUD, filtrų, search, audit drill-down.
- Overflow/spacing/empty states: `page-shell` yra, bet nėra pilno ekranų audito (dashboard/builder/participant), ypač ilgi tekstai/tuščios būsenos.

---

## I) Backend Detalės

### I1) Endpoint Catalogue

| Method | Path | Auth | File | Notes |
|--------|------|------|------|-------|
| POST | `/api/auth/login` | None | `src/app/api/auth/login/route.ts` | Rate limit, audit log |
| POST | `/api/auth/register` | None | `src/app/api/auth/register/route.ts` | Rate limit, audit log |
| GET | `/api/auth/me` | Session | `src/app/api/auth/me/route.ts` | Returns session |
| POST | `/api/participants/login` | None | `src/app/api/participants/login/route.ts` | Rate limit, audit log |
| GET | `/api/orgs` | Facilitator | `src/app/api/orgs/route.ts` | Org scoping |
| POST | `/api/orgs` | Facilitator | `src/app/api/orgs/route.ts` | Rate limit, audit log, org scoping |
| GET | `/api/groups` | Facilitator | `src/app/api/groups/route.ts` | Org scoping |
| POST | `/api/groups` | Facilitator | `src/app/api/groups/route.ts` | Rate limit, audit log, org scoping |
| GET | `/api/groups/[groupId]/activities` | Facilitator | `src/app/api/groups/[groupId]/activities/route.ts` | Org scoping |
| GET | `/api/groups/[groupId]/participants` | Facilitator | `src/app/api/groups/[groupId]/participants/route.ts` | Org scoping |
| POST | `/api/groups/[groupId]/participants/import` | Facilitator | `src/app/api/groups/[groupId]/participants/import/route.ts` | Rate limit, audit log, org scoping |
| POST | `/api/activities` | Facilitator | `src/app/api/activities/route.ts` | Rate limit, audit log, org scoping |
| GET | `/api/activities/[activityId]/analytics` | Facilitator | `src/app/api/activities/[activityId]/analytics/route.ts` | Org scoping, privacy min-N |
| GET | `/api/activities/[activityId]/export` | Facilitator | `src/app/api/activities/[activityId]/export/route.ts` | Rate limit, audit log, org scoping, privacy min-N |
| POST | `/api/activities/[activityId]/responses` | Participant | `src/app/api/activities/[activityId]/responses/route.ts` | Rate limit, audit log, scheduling enforcement |
| PATCH | `/api/activities/[activityId]/status` | Facilitator | `src/app/api/activities/[activityId]/status/route.ts` | Rate limit, audit log, org scoping |
| GET | `/api/participants/activities` | Participant | `src/app/api/participants/activities/route.ts` | State calculation |
| GET | `/api/participants/history` | Participant | `src/app/api/participants/history/route.ts` | History |
| GET | `/api/admin/health` | Admin | `src/app/api/admin/health/route.ts` | DB health check |
| GET | `/api/admin/audit` | Admin | `src/app/api/admin/audit/route.ts` | Audit log viewer |
| GET | `/api/admin/orgs` | Admin | `src/app/api/admin/orgs/route.ts` | Orgs list |
| GET | `/api/admin/users` | Admin | `src/app/api/admin/users/route.ts` | Users list |
| GET | `/api/admin/gdpr/export/[userId]` | Admin | `src/app/api/admin/gdpr/export/[userId]/route.ts` | User data export |
| POST | `/api/admin/gdpr/delete/[userId]` | Admin | `src/app/api/admin/gdpr/delete/[userId]/route.ts` | User anonymization, rate limit, audit log |
| GET | `/api/admin/users/[userId]/export` | Admin | `src/app/api/admin/users/[userId]/export/route.ts` | Legacy export |
| POST | `/api/admin/users/[userId]/anonymize` | Admin | `src/app/api/admin/users/[userId]/anonymize/route.ts` | Legacy anonymize |
| GET | `/api/csrf-token` | None | `src/app/api/csrf-token/route.ts` | CSRF token |
| GET | `/api/health` | None | `src/app/api/health/route.ts` | Health check |

**Total:** 25 endpoints

### I2) Known Issues

**ISSUE-001:** Docker port conflict (5432)
- **Status:** Documented
- **Solution:** Use different port or stop local Postgres

**ISSUE-002:** Prisma migration shadow DB error
- **Status:** Fixed (lower(typname) check)
- **File:** `prisma/migrations/202601051215_mvp4_retry/migration.sql`

**ISSUE-003:** Migrations modified after applied
- **Status:** Documented
- **Risk:** HIGH (production blocker)
- **Solution:** Reset dev DB or create new DB

**ISSUE-004:** Seed requires AUTH_SECRET
- **Status:** Documented
- **Solution:** Set AUTH_SECRET in .env

**ISSUE-011:** Dev server becomes unresponsive
- **Status:** Workaround (--webpack flag)
- **Solution:** `npm run dev -- --webpack`

---

### I3) Backend audit additions

- Endpoint auth/role guard coverage: peržiūrėti visus `src/app/api/**/route.ts` ir patikrinti `requireRole`/`requireAdmin` + org scoping po naujų endpoint'ų.
- Error handling consistency: dalis route'ų nenaudoja `createErrorResponse`; reikia vienodo error formato + requestId visur.
- Audit log + rate limit coverage: runtime įrodymų nėra; audit doc turi nepatikrintų vietų; GET analytics nėra rate-limit, admin endpoint'ams nėra limit.

---

## J) DB & Migrations

### J1) Model Catalogue

**Enums:**
- `PrivacyMode` - NAMED, ANONYMOUS
- `OrgRole` - ORG_ADMIN, FACILITATOR
- `MemberStatus` - INVITED, ACTIVE
- `ActivityStatus` - DRAFT, PUBLISHED, CLOSED
- `QuestionType` - TRAFFIC_LIGHT, EMOTION, SCALE, THERMOMETER, MULTI_SELECT, PIE_100, SENTENCE_COMPLETION, FREE_TEXT
- `ExportFormat` - CSV, JSON, PDF, XLSX
- `ExportStatus` - PENDING, COMPLETED, FAILED
- `AnswerStatus` - ANSWERED, UNKNOWN, DECLINED

**Models:**
- `User` - Facilitator users
- `Participant` - Student participants
- `Organization` - Organizations
- `OrgMember` - User-org relationships
- `Group` - Classes/groups
- `GroupParticipant` - Participant-group relationships
- `ParticipantInvite` - Invites
- `Activity` - Reflection activities
- `Questionnaire` - Question sets
- `Question` - Individual questions
- `Response` - Participant responses
- `Answer` - Individual answers
- `AnalyticsSnapshot` - Cached analytics
- `DataExport` - Export records
- `AuditLog` - Audit trail

**Total:** 15 models, 8 enums

### J2) Migration Risks

**Migrations (8 total):**
1. `20260105073747_init` - Initial schema
2. `20260105092547_mvp3_question_types` - Question types
3. `202601051140_mvp4` - MVP4 schema
4. `202601051155_mvp4_answer_nullable` - Answer nullable
5. `202601051215_mvp4_retry` - MVP4 retry (fixed typname check)
6. `20260111081943_analytics_snapshot_range` - Analytics snapshot from/to
7. `20260111123000_emotion_question_type` - EMOTION type
8. `20260111124500_add_export_formats` - Export formats

**Risks:**
- ⚠️ **ISSUE-003:** Migrations modified after applied (production blocker)
- ⚠️ **ISSUE-002:** Shadow DB error (fixed, but needs testing)

**Production Checklist:**
- [ ] Backup before migration
- [ ] Test migrations on staging
- [ ] Rollback plan
- [ ] No modified migrations

---

## K) Security & Privacy Audit

### K1) Org Isolation

**Status:** ✅ DONE

**Coverage:**
- ✅ All facilitator endpoints check `session.orgId` vs `resource.orgId`
- ✅ Cross-org requests return 403
- ✅ Participant endpoints scoped to `membershipId`

**Evidence:**
- `logs/audit/03-org-isolation.txt` - cross-org 403
- `docs/audit/ORG_SCOPING_AUDIT.md` - full audit

**Pastaba:** audit logas yra 2026-01-11; po naujų endpoint'ų reikia pakartotinio patikrinimo.

---

### K2) Rate Limit

**Status:** ⚠️ PARTIAL (in-memory, runtime unverified)

**Coverage:**
- ✅ Mutating routes turi `checkRateLimit` (code-proof)
- ✅ Export: 5 req/60s (code-proof)
- ✅ Import: 5 req/60s (code-proof)

**Gaps:**
- ⚠️ Runtime/curl įrodymų nėra
- ⚠️ GET routes (analytics) - no rate limit
- ⚠️ In-memory only (multi-instance risk)

**Rizika:** MED (needs Redis for horizontal scaling)

---

### K3) Audit Log

**Status:** ⚠️ PARTIAL (coverage unverified)

**Coverage:**
- ✅ Mutating routes log audit entries
- ✅ No PII in audit logs (tik IDs)
- ✅ Admin audit log viewer

**Evidence:**
- `src/lib/audit.ts` - audit helper
- `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md` - coverage audit (ne pilnas)

---

### K4) CSRF

**Status:** ⚠️ PARTIAL (baseline)

**Implementation:**
- Token generation (`generateCsrfToken`)
- Token validation (cookie + header)
- Same-origin check (`isSameOrigin`)
- Frontend wrapper (`fetchWithCsrf`)

**Evidence:**
- `logs/audit/06-csrf-check.txt` - 403 mismatch, 201 same-origin

---

### K5) GDPR Gaps

**Status:** ⚠️ PARTIAL (baseline)

**Implementation:**
- User data export
- User anonymization
- Retention policy documented
- Audit logs no PII

**Gaps:**
- ⚠️ Automated retention cleanup (not implemented)
- ⚠️ Consent management (not implemented)

**Rizika:** HIGH (needs automated cleanup + consent flow)

---

## L) Production Readiness

### L0) Production Blockers (required check)

1. **Migracijų disciplina** — **BLOCKER**  
   - ISSUE-003: migracijos modifikuotos po pritaikymo (`docs/audit/ISSUES_LOG.md`).
2. **Org isolation risk** — **HIGH**  
   - Reikia pakartotinio org scoping audito po naujų endpoint'ų + admin perimetro peržiūros.
3. **CSRF** — **HIGH**  
   - Yra baseline, bet neįrodyta pilna coverage visiems state-changing endpoint'ams.
4. **GDPR** — **HIGH**  
   - Tik export/anonymize + policy; nėra retention cleanup/consent procesų.
5. **CI/Docker/Backups** — **BLOCKER**  
   - CI nėra green; Docker nėra runtime patikrintas; backup automatizacija nėra įgyvendinta.

### L1) CI Status

**Status:** ⚠️ PARTIAL

**Structure:**
- ✅ Workflow file exists (`.github/workflows/ci.yml`)
- ✅ Jobs: lint-and-typecheck, build
- ⚠️ Lint errors (5 errors, 5 warnings)
- ⚠️ Typecheck errors (9 errors)

**Evidence:**
- `logs/proof/17-P2-04-ci-proof.txt`

**Rizika:** MED (needs fixes for CI to pass)

---

### L2) Docker Status

**Status:** ✅ DONE (code-proof; runtime unverified)

**Files:**
- ✅ `Dockerfile` - multi-stage build
- ✅ `docker-compose.prod.yml` - app + DB
- ✅ Health endpoint (`/api/health`)

**Evidence:**
- `logs/proof/18-P2-05-docker-proof.txt`

**Rizika:** LOW

---

### L3) Backups/Restore

**Status:** ⚠️ PARTIAL

**Documentation:**
- ✅ `docs/infra/BACKUP_RESTORE.md` - procedures

**Gaps:**
- ⚠️ Automated backup script (not implemented)
- ⚠️ Backup rotation (not implemented)
- ⚠️ Backup testing (not implemented)

**Rizika:** HIGH (production blocker)

---

### L4) Monitoring/Logging

**Status:** ⚠️ PARTIAL

**Implementation:**
- ✅ Request ID in errors
- ✅ Server logs with requestId
- ✅ Health endpoint

**Gaps:**
- ⚠️ Structured logging (Winston/Pino)
- ⚠️ Metrics (Prometheus)
- ⚠️ Alerts (PagerDuty/Slack)

**Rizika:** MED

---

## M) Master Backlog Snapshot

**Top 20 Open Items (pagal prioritetą):**

### P0 (Blocking)
1. ✅ P0-01 - Dev + smoke stabilus - DONE (`logs/smoke-verify-2nd.txt`)
2. ✅ P0-02 - Org scoping auditas - DONE (`logs/audit/03-org-isolation.txt`)
3. ⚠️ P0-03 - Audit log FK klaidos - PARTIAL (tik dokumentuota `docs/audit/ISSUES_LOG.md`)
4. ⚠️ P0-04 - Rate limit coverage - PARTIAL (coverage auditas ne pilnai patikrintas)
5. ⚠️ P0-05 - Audit log coverage - PARTIAL (coverage auditas ne pilnai patikrintas)
6. ✅ P0-06 - Privacy min-N + UI - DONE (code-proof, runtime unverified) (`logs/proof/10-P0-06-proof.txt`)

### P1 (PDF MVP)
7. ⚠️ P1-01 - Scheduling UI + status badges - PARTIAL (code-proof; calendar missing)
8. ⚠️ P1-02 - Universal "Nenoriu/Nežinau" - PARTIAL (runtime log nėra)
9. ✅ P1-03 - Teacher presets - DONE (code-proof) (`logs/proof/12-P1-03-presets-proof.txt`)
10. ⚠️ P1-04 - Teacher dashboard usability - PARTIAL (responses detail/UX nebaigta)
11. ✅ P1-05 - Emotion question type - DONE (code-proof) (`logs/proof/14-P1-05-emotion-proof.txt`)
12. ✅ P1-06 - Analytics trend (from/to) - DONE (code-proof) (`logs/proof/15-P1-06-trend-proof.txt`)

### P2 (Production)
13. ⚠️ P2-01 - Admin skeleton - PARTIAL (CRUD/RBAC trūksta)
14. ⚠️ P2-02 - CSRF strategija - PARTIAL (coverage ne pilnai patikrinta)
15. ✅ P2-03 - GDPR baseline - DONE (anonymize runtime proof) (`logs/audit/07-gdpr-anonymize.txt`)
16. ⚠️ P2-04 - CI workflow - PARTIAL (CI ne green)
17. ✅ P2-05 - Docker app + compose - DONE (code-proof; runtime unverified)
18. ✅ P2-06 - Backup/restore doc - DONE (doc yra, automatizacija trūksta)
19. ⚠️ P2-07 - PDF/Excel export - PARTIAL (runtime proof nėra)
20. ⚠️ P2-08 - Minimal integration tests - PARTIAL (CI proof nėra)

---

## N) Missing coverage (reviewer)

- Runtime įrodymų nėra PDF/XLSX eksportams, scheduling UI, presetams, dashboard UX ir analytics trend/caching (tik code-proof).
- CSRF, rate limit ir audit log coverage nėra pilnai patikrinti su curl/logais.
- Org isolation auditas neperleistas po naujų endpoint'ų (responses/export/admin).
- Mobile/320px/a11y audit nevykdytas.
- CI/testų green proof nėra; smoke tik lokaliai.
- `docs/pending/GAP_ANALYSIS.md` pasenęs (reikia atnaujinti arba archyvuoti).

---

## O) Risks

- **Migration discipline (BLOCKER):** modified migrations after applied (ISSUE-003) → production deploy rizika.
- **CI/Backups (BLOCKER):** CI ne green + backup automatizacija/testai nėra.
- **CSRF/Org isolation (HIGH):** coverage audit ne pilnas; reikia re-audit.
- **GDPR (HIGH):** nėra retention automation/consent; compliance rizika.
- **Rate limit scaling (MED):** in-memory limitai neapsaugos multi-instance.

---

## P) Concrete Next Steps

### P1) Production Blocker Fixes (P0)

1. **Migracijų disciplina**
   - File: `prisma/migrations/*`
   - Command: `npm run db:migrate` (clean DB)
   - Evidence: No "modified after applied" warnings

2. **CI green (lint/typecheck/test)**
   - File: `.github/workflows/ci.yml`
   - Command: `npm run lint`, `npx tsc --noEmit`, `npm run test:api`
   - Evidence: CI run green + log

3. **Automated backup + restore test**
   - File: `scripts/backup.sh`
   - Command: `./scripts/backup.sh` + `pg_restore`
   - Evidence: Backup file created and restored

4. **Security coverage audit (org isolation + CSRF + rate limit + audit log)**
   - File: `scripts/*` + `logs/*`
   - Command: run curl/audit scripts and store logs
   - Evidence: new logs under `logs/audit/*`

5. **GDPR compliance plan**
   - File: `docs/GDPR.md`
   - Command: add retention cleanup/consent plan + task list
   - Evidence: updated policy + implementation plan

### P2) Production Hardening (P1)

6. **Redis rate limiting**
   - File: `src/lib/rate-limit.ts`
   - Command: Add Redis client
   - Evidence: Multi-instance rate limiting works

7. **Structured logging + metrics**
   - File: `src/lib/logger.ts`
   - Command: Add Winston/Pino + `/api/metrics`
   - Evidence: Structured logs + metrics endpoint

### P3) Feature Completion (P2)

8. **Admin RBAC UI**
   - File: `src/app/admin/page.tsx`
   - Command: Add org/user CRUD UI
   - Evidence: Admin can manage orgs/users

9. **Scheduling calendar/planavimas**
   - File: `src/app/facilitator/(protected)/calendar/page.tsx`
   - Command: Add calendar + reminders view
   - Evidence: Calendar shows activities

10. **Teacher dashboard response detail**
    - File: `src/app/dashboard/page.tsx`
    - Command: Add per-student drill-down + unknown/declined clarity
    - Evidence: Dashboard shows response detail view

11. **Analytics correlations**
   - File: `src/app/api/activities/[activityId]/correlations/route.ts`
   - Command: Add correlations API
   - Evidence: Correlations endpoint returns data

### P4) Testing & Quality (P3)

12. **PDF/XLSX export runtime proof**
    - File: `logs/smoke-verify-2nd.txt` (new)
    - Command: curl export?format=pdf/xlsx, store logs
    - Evidence: new log with 200 + content headers

13. **Mobile + a11y audit**
    - File: Manual testing
    - Command: Test on 320px+ devices, keyboard nav, ARIA
    - Evidence: Audit notes + screenshots/logs

14. **E2E tests**
    - File: `tests/e2e/*.test.ts`
    - Command: Add Playwright/Cypress
    - Evidence: E2E test suite green

15. **Unit tests**
    - File: `tests/unit/**/*.test.ts`
    - Command: Add Jest/Vitest
    - Evidence: Unit test suite green

### P5) Monitoring & Ops (P4)

16. **Alerts setup**
    - File: `docs/infra/ALERTS.md`
    - Command: Configure PagerDuty/Slack
    - Evidence: Alerts fire on errors

17. **Backup automation schedule + rotation**
    - File: `scripts/backup.sh`, cron
    - Command: Schedule daily backups
    - Evidence: Backups run automatically

18. **Performance testing**
    - File: `tests/performance/*.test.ts`
    - Command: Add load tests
    - Evidence: Performance metrics documented

19. **Docs cleanup**
    - File: `docs/pending/GAP_ANALYSIS.md`
    - Command: Update or archive
    - Evidence: Doc reflects current status

---

## Q) Final verdict

**Project readiness score:** **55/100**  
Paaiškinimas: core MVP veikia ir smoke praeina, bet production bazėje yra keli blokai (migracijos disciplina, CI/testų proof, backup automatizacija, CSRF/org isolation audit, GDPR compliance).

**Ready for pilot?** **TAIP (ribotai)**  
Tik vidiniam/pilotiniam naudojimui su neprodukciniais duomenimis ir aktyvia priežiūra.

**Ready for production?** **NE**  
**5 būtini punktai prieš production:**
1. Sutvarkyti migracijų discipliną ir patikrinti migracijas staging'e.
2. CI turi būti green (lint/typecheck/test) + minimalus test suite.
3. Automatiniai backup'ai + restore testas.
4. Pilnas CSRF/org isolation/rate limit/audit log coverage auditas su runtime log'ais.
5. GDPR compliance: retention cleanup + consent/procedūros.

**Dokumentacija:**
- Kanoninis runbook: `docs/audit/RUNBOOK_DEV.md`
- Status: `docs/STATUS.md`
- Requirements: `docs/REQUIREMENTS_STATUS.md`
- Backlog: `docs/plans/MASTER_BACKLOG.md`
- Issues: `docs/audit/ISSUES_LOG.md`

---

**Report updated:** 2026-01-12  
**Next update:** After pilot verification
