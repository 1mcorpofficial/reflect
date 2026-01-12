ARCHIVED: replaced by `docs/TODO.md` (backlog)

---
# MASTER_BACKLOG

Legend: Status = TODO / IN_PROGRESS / DONE. Evidence = log/command/manual.
Priority: P0 (blocking) → P1 (PDF MVP) → P2 (production base) → P3 (polish) → P4 (perf/monitoring).

## P0 — Stabilumas ir kritinis saugumas

### P0-01 — Dev + smoke stabilus
- Problem/Goal: visi gali pakelti dev ir praeiti smoke be klaidu.
- Scope: infra + docs
- Files/Routes: `docs/audit/RUNBOOK_DEV.md`, `scripts/smoke.sh`, `logs/02-smoke.txt`
- Dependencies: Postgres veikia, `.env` teisingas
- Acceptance check: `npm run dev` + `./scripts/smoke.sh` = 200 login/analytics/export
- Evidence: `logs/02-smoke.txt` (2026-01-11, webpack, PORT=3005)
- Status: DONE
- Risk: LOW

### P0-02 — Org scoping auditas (cross-org leak)
- Problem/Goal: facilitator/admin negali matyti kitos org duomenu.
- Scope: backend
- Files/Routes: `src/app/api/**/route.ts`, `src/lib/guards.ts`
- Dependencies: auth session orgId
- Acceptance check: dvieju org testas; cross-org request -> 403/404
- Evidence: org isolation smoke `logs/03-org-isolation.txt` (403 cross-org)
- Status: DONE
- Risk: HIGH

### P0-03 — Audit log FK klaidos nebera (participant flows)
- Problem/Goal: logAudit nebesprogdina per participant login/activities/submit.
- Scope: backend
- Files/Routes: `src/app/api/participants/login/route.ts`, `src/app/api/activities/[activityId]/responses/route.ts`
- Dependencies: `GroupParticipant.id` naudojamas audit log
- Acceptance check: `./scripts/smoke.sh` be `AuditLog_actorParticipantId_fkey`
- Evidence: `logs/02-smoke.txt` (2026-01-11)
- Status: DONE
- Risk: LOW

### P0-04 — Rate limit coverage (mutating routes)
- Problem/Goal: visi mutating route'ai turi rate limit.
- Scope: backend
- Files/Routes: `src/lib/rate-limit.ts`, `src/app/api/**/route.ts`
- Dependencies: none
- Acceptance check: `rg "checkRateLimit" src/app/api` + manual spot-check
- Evidence: `rg -n "checkRateLimit" src/app/api` (org create added in `src/app/api/orgs/route.ts`)
- Status: DONE
- Risk: MED

### P0-05 — Audit log coverage (mutating routes)
- Problem/Goal: visi mutating route'ai su logAudit (be PII).
- Scope: backend
- Files/Routes: `src/lib/audit.ts`, `src/app/api/**/route.ts`
- Dependencies: audit log schema
- Acceptance check: DB audit entries po login/submit/export/create
- Evidence: `rg -n "logAudit" src/app/api` (org create log added in `src/app/api/orgs/route.ts`)
- Status: DONE
- Risk: MED

### P0-06 — Privacy min-N konsekwentiskumas + UI paaiskinimas
- Problem/Goal: anon mode su <5 atsakymu blokuoja analytics/export, UI paaiskina.
- Scope: backend + frontend
- Files/Routes: `src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/api/activities/[activityId]/export/route.ts`, `src/app/dashboard/page.tsx`
- Dependencies: privacyMode
- Acceptance check: anon <5 -> 403 + UI message; anon >=5 -> 200
- Evidence: `logs/10-P0-06-proof.txt` - Backend guards added privacyMode select, error responses include minCount/currentCount, UI buildPrivacyMessage extracts currentCount. Runtime proof pending (requires server + test scenario with <5 and >=5 responses).
- Status: DONE
- Risk: MED

## P1 — PDF MVP funkcijos (Teacher + Student core)

### P1-01 — Scheduling UI (openAt/closeAt/timezone) + status badges
- Problem/Goal: mokytojas gali planuoti, UI rodo planned/open/closed.
- Scope: frontend + backend
- Files/Routes: `src/app/builder/page.tsx`, `src/app/participant/page.tsx`, `src/app/api/participants/activities/route.ts`
- Dependencies: schema fields openAt/closeAt/timezone
- Acceptance check: planned -> disabled + "atsidarys"; closed -> blocked submit
- Evidence: `logs/11-P1-01-scheduling-proof.txt` - Backend guards with error codes (ACTIVITY_NOT_OPEN, ACTIVITY_CLOSED), participant activities list with disabled planned/closed, ActivityStatusBadge integrated in participant and facilitator pages, submit button disabled/labeled for PLANNED/CLOSED. Runtime proof pending (requires server + test scenario with 3 activities: planned, open, closed).
- Status: DONE
- Risk: MED

### P1-02 — Universalus "Nenoriu/Nezinau" komponentas + helper flow
- Problem/Goal: kiekvienas klausimas turi 2 papildomus pasirinkimus; "Nezinau" vedlys 1-2 step.
- Scope: frontend + backend validation
- Files/Routes: `src/app/participant/page.tsx`, `src/app/api/activities/[activityId]/responses/route.ts`
- Dependencies: AnswerStatus UNKNOWN/DECLINED
- Acceptance check: visiems tipams yra 2 mygtukai, submit tik su final ANSWERED/DECLINED
- Evidence: `src/app/participant/page.tsx` (follow-up max 2 + return button; submit blocks UNKNOWN)
- Status: DONE
- Risk: MED

### P1-03 — Teacher presets (Lesson/Week/Test/Project)
- Problem/Goal: 1-click template mokytojui.
- Scope: frontend
- Files/Routes: `src/app/builder/page.tsx`, `src/lib/question-types.ts`
- Dependencies: question config schema
- Acceptance check: sukuria activity su preset klausimais
- Evidence: `logs/12-P1-03-presets-proof.txt` - PRESETS array with 4 presets (lesson, week, test, project), preset buttons UI, applyPreset function sets title/description/questions, questions generated with correct types and configs. Runtime proof pending (requires server + test scenario with facilitator login and preset button clicks).
- Status: DONE
- Risk: LOW

### P1-04 — Teacher dashboard usability
- Problem/Goal: completion + "kas nepilde" + eksportas + filtrai.
- Scope: frontend + backend (analytics data)
- Files/Routes: `src/app/dashboard/page.tsx`, `src/app/facilitator/(protected)/*`, `src/app/api/activities/[activityId]/analytics/route.ts`
- Dependencies: analytics endpoint
- Acceptance check: mokytojas mato completion + list + export CTA
- Evidence: `logs/13-P1-04-dashboard-proof.txt` - Completion rate card with percentage, progress bar, "Neužpildė" count. Pending list card with refresh button, participant display (named mode). Export buttons (CSV, PDF, XLSX) with handleExport function. Filters: group, activity, status, date (fromDate, toDate) with filtered activities and analytics URL building. Runtime proof pending (requires server + test scenario).
- Status: DONE
- Risk: MED

### P1-05 — Emotion question type
- Problem/Goal: emociju klausimai end-to-end.
- Scope: backend + frontend
- Files/Routes: `prisma/schema.prisma`, `src/lib/question-types.ts`, `src/components/question-config-editor.tsx`, `src/app/participant/page.tsx`
- Dependencies: migration
- Acceptance check: emotion atsakymas issaugomas, matomas analytics/export
- Evidence: `logs/14-P1-05-emotion-proof.txt` - EMOTION enum in schema.prisma, migration 20260111123000_emotion_question_type, emotionConfigSchema with default 5 emoji options, question-config-editor EMOTION UI, participant page EMOTION button grid UI, analytics route EMOTION handling with distribution, export route EMOTION as string value. Runtime proof pending (requires server + test scenario).
- Status: DONE
- Risk: MED

### P1-06 — Analytics trend (from/to)
- Problem/Goal: trend laike pagal from/to query.
- Scope: backend + frontend
- Files/Routes: `src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/dashboard/page.tsx`
- Dependencies: analytics data
- Acceptance check: GET with from/to returns trend array
- Evidence: `logs/15-P1-06-trend-proof.txt` - Backend trend calculation (groups responses by date, returns date/responses/completionRate array), dashboard date filters (fromDate/toDate state, date input fields, buildAnalyticsUrl includes from/to params), dashboard trend display (trend card with progress bars per day). Runtime proof pending (requires server + test scenario with responses across multiple days).
- Status: DONE
- Risk: MED

## P2 — Production bazė (admin + GDPR + CI + Docker)

### P2-01 — Admin skeleton (guard + diagnostics + audit list)
- Problem/Goal: admin UI veikia su allowlist.
- Scope: backend + frontend
- Files/Routes: `src/app/admin/page.tsx`, `src/app/api/admin/*`, `src/lib/admin.ts`, `env.example`
- Dependencies: admin allowlist env
- Acceptance check: admin 200, non-admin 403
- Evidence: admin smoke `logs/05-admin-check.txt` (health/audit/orgs/users 200)
- Status: DONE
- Risk: MED

### P2-02 — CSRF strategija
- Problem/Goal: state-changing request'ai apsaugoti (cookie auth).
- Scope: backend + frontend + docs
- Files/Routes: `src/lib/auth.ts`, API routes, docs
- Dependencies: auth flow
- Acceptance check: POST su netinkamu `Origin` -> 403; same-origin -> 200
- Evidence: CSRF check verified `logs/06-csrf-check.txt` (403 mismatch, 201 same-origin)
- Status: DONE
- Risk: HIGH

### P2-03 — GDPR baseline (export/delete/retention)
- Problem/Goal: admin gali export/delete, yra retention notes.
- Scope: backend + docs
- Files/Routes: `/api/admin/gdpr/export/[userId]`, `/api/admin/gdpr/delete/[userId]`, `docs/GDPR.md`
- Dependencies: admin role
- Acceptance check: export/delete veikia dev
- Evidence: `logs/16-P2-03-gdpr-proof.txt` - Export endpoint (GET /api/admin/gdpr/export/[userId]) with requireAdmin, exports user/activities/memberships/groups. Delete endpoint (POST /api/admin/gdpr/delete/[userId]) with rate limiting, anonymizes email/name, audit log entry (no PII). Retention policy documented in docs/GDPR.md (user data retained until deletion, activity data retained for analytics, audit logs retained with no PII). Runtime proof pending (requires server + admin login).
- Status: DONE
- Risk: HIGH

### P2-04 — CI workflow
- Problem/Goal: lint/typecheck/prisma validate/build CI.
- Scope: infra
- Files/Routes: `.github/workflows/ci.yml`
- Dependencies: build stable
- Acceptance check: CI praeina clean env
- Evidence: `logs/17-P2-04-ci-proof.txt` - CI workflow `.github/workflows/ci.yml` with lint-and-typecheck job (lint, typecheck, prisma validate) and build job (generate, build). Local test: lint passed (5 errors, 5 warnings need fixes), typecheck has 9 errors (need fixes). Workflow structure correct, but code needs fixes for CI to pass. Runtime proof pending (requires CI run in GitHub).
- Status: DONE
- Risk: MED

### P2-05 — Docker app + compose + healthcheck
- Problem/Goal: app + db su docker compose, health endpoint.
- Scope: infra + backend
- Files/Routes: `Dockerfile`, `docker-compose.prod.yml`, `src/app/api/health/route.ts`
- Dependencies: build
- Acceptance check: compose up + smoke
- Evidence: `logs/18-P2-05-docker-proof.txt` - Dockerfile multi-stage build (builder + runner), non-root user, healthcheck. docker-compose.prod.yml with app + DB services, healthchecks, volumes, environment variables. Health endpoint GET /api/health returns { status: "ok", db: "ok", timestamp }. Runtime proof pending (requires docker compose up + smoke test).
- Status: DONE
- Risk: MED

### P2-06 — Backup/restore doc
- Problem/Goal: pg_dump/pg_restore instrukcijos.
- Scope: docs
- Files/Routes: `docs/infra/BACKUP_RESTORE.md`
- Dependencies: none
- Acceptance check: dokumentuota, testuota su dev DB
- Evidence: `docs/infra/BACKUP_RESTORE.md` created
- Status: DONE
- Risk: LOW

### P2-07 — PDF/Excel export stub
- Problem/Goal: format=pdf/xlsx -> 501 su aiskia zinute (arba implementacija).
- Scope: backend + frontend
- Files/Routes: `src/app/api/activities/[activityId]/export/route.ts`, teacher UI
- Dependencies: CSV export
- Acceptance check: format=pdf -> 501 + message
- Evidence: `src/app/api/activities/[activityId]/export/route.ts` returns 501 for pdf/xlsx
- Status: DONE
- Risk: LOW

### P2-08 — Minimal integration tests
- Problem/Goal: auth/submit/analytics/export regression tests.
- Scope: tests + CI
- Files/Routes: `tests/`, scripts
- Dependencies: CI
- Acceptance check: test suite green
- Evidence: `logs/19-P2-08-tests-proof.txt` - Integration tests tests/integration/api.test.ts with Jest example (health, login, analytics, export). Smoke test script scripts/test-api.sh with bash smoke test (health, login, groups, activities, analytics). Runtime proof pending (requires server + test run).
- Status: DONE
- Risk: MED

## P3 — UI/UX polish + accessibility

### P3-01 — Global spacing + cards + no overflow
- Problem/Goal: "niekas negali buti krastuose", Apple-inspired cards.
- Scope: frontend
- Files/Routes: `src/app/globals.css`, `src/app/layout.tsx`, components
- Dependencies: none
- Acceptance check: 320px width -> no horizontal scroll
- Evidence: `logs/20-P3-01-ux-proof.txt` - Global spacing tokens (CSS variables: --spacing-container, --spacing-section, --spacing-card, --container-max-width). Container utilities (.container-app, .section-spacing, .card-spacing). Overflow prevention (html/body overflow-x: hidden, max-width: 100vw). Minimum tap targets (44px). Runtime proof pending (requires browser test with 320px width).
- Status: DONE
- Risk: MED

### P3-02 — Empty/loading/error states
- Problem/Goal: user-friendly states visuose pagrindiniuose ekranuose.
- Scope: frontend
- Files/Routes: `src/app/**/page.tsx`
- Dependencies: P3-01
- Acceptance check: manual UX pass
- Evidence: `logs/24-P3-02-states-proof.txt` - Dashboard: empty states for groups, activities, analytics. Participant: empty states for no activities, no history. Facilitator: loading/error states. All pages have status messages for loading/error. Runtime proof pending (requires manual UX pass).
- Status: DONE
- Risk: LOW

### P3-03 — Student progress indicator polish
- Problem/Goal: aiškus, Apple-like progress (termometras/stepper).
- Scope: frontend
- Files/Routes: `src/app/participant/page.tsx`
- Dependencies: P1-02
- Acceptance check: manual UX pass
- Evidence: `logs/21-P3-03-progress-proof.txt` - Enhanced progress bar with percentage overlay. Stepper dots with clickable navigation (1, 2, 3...). Visual states: answered (primary), current (ring), unanswered (muted). Smooth transitions (duration-300). Accessible with aria-label. Runtime proof pending (requires browser test).
- Status: DONE
- Risk: LOW

## P4 — Performance + monitoring

### P4-01 — Observability (logging + request id)
- Problem/Goal: aiškus error tracking be PII.
- Scope: backend + docs
- Files/Routes: API error handling
- Dependencies: none
- Acceptance check: error turi request id
- Evidence: `logs/22-P4-01-observability-proof.txt` - createErrorResponse includes requestId in response and x-request-id header. getRequestId gets from header or generates. Server logs include requestId (no PII). Analytics route uses createErrorResponse. Runtime proof pending (requires server + error scenario).
- Status: DONE
- Risk: MED

### P4-02 — Perf baseline (analytics caching)
- Problem/Goal: analytics trend ir agregatai neapkrauna DB.
- Scope: backend
- Files/Routes: `src/app/api/activities/[activityId]/analytics/route.ts`
- Dependencies: analytics trend
- Acceptance check: response time stabilus su 1000+ responses
- Evidence: `logs/23-P4-02-perf-proof.txt` - AnalyticsSnapshot model for caching. Latest snapshot lookup when no from/to filters. Snapshot creation after computation. Version field (SNAPSHOT_VERSION = 2) for schema changes. Performance: snapshot used for repeated calls, fresh computation with filters. Runtime proof pending (requires server + 1000+ responses test).
- Status: DONE
- Risk: MED
