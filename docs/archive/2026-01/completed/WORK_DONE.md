# WORK_DONE (latest changes)

- Added privacy guard for anonymous data:
  - `src/app/api/activities/[activityId]/export/route.ts`: returns 403 if `privacyMode=ANONYMOUS` and responses < 5 (MIN_ANON_COUNT=5).
  - `src/app/api/activities/[activityId]/analytics/route.ts`: returns 403 if anonymous and responses < 5; invalid question configs are handled gracefully with a warning instead of 500.
- Rate limiting expanded to more mutating routes:
  - Group creation (`group-create`, 10 req/60s) in `src/app/api/groups/route.ts`.
  - Activity creation (`activity-create`, 10 req/60s) in `src/app/api/activities/route.ts`.
  - Participant import (`participant-import`, 5 req/60s) in `src/app/api/groups/[groupId]/participants/import/route.ts`.
  - Activity status change (`activity-status`, 10 req/60s) with audit log in `src/app/api/activities/[activityId]/status/route.ts`.
- Turbopack root pinned to project root in `next.config.ts` to avoid lockfile workspace warnings from higher-level package-lock.
- Documentation updates:
  - `docs/audit/ISSUES_LOG.md`: new entries for privacy guards and turbopack note.
  - `docs/STATUS.md` and `docs/REQUIREMENTS_STATUS.md`: privacy guard marked DONE.
  - Setup guides under `docs/setup/` flagged as “Deprecated” with pointer to canonical `docs/audit/RUNBOOK_DEV.md`.
  - `docs/audit/RUNBOOK_DEV.md`: added script references (`scripts/audit.sh`, `scripts/smoke.sh`) and lockfile warning note.
- Utility scripts added:
  - `scripts/audit.sh` — captures audit info into `docs/audit/AUDIT_CONTEXT.md`.
  - `scripts/smoke.sh` — curl-based smoke (login, activities, analytics, export) with env overrides.

Recent smoke (with dev server running previously):
- Facilitator/participant login OK, analytics 200, CSV export 200 on seeded demo data.

- Fixed audit log foreign key mismatch for participant flows:
  - `src/app/api/participants/login/route.ts`: use `GroupParticipant.id` for `actorParticipantId`.
  - `src/app/api/activities/[activityId]/responses/route.ts`: use `membershipId` for `actorParticipantId`.
  - Smoke re-run `logs/02-smoke.txt` shows no audit FK error.

- Org creation hardening:
  - `src/app/api/orgs/route.ts`: added rate limit (`org-create`) and audit log (`org.create`).

- Added org isolation smoke helper:
  - `scripts/org-isolation.sh` (timeout-safe, uses existing facilitator login + /api/orgs to create alternate org context).

- Builder scheduling + presets:
  - `src/app/builder/page.tsx` now supports openAt/closeAt/timezone inputs and preset buttons (lesson/week/test/project).
  - `src/app/facilitator/(protected)/[groupId]/page.tsx` presets + ISO conversion for openAt/closeAt.

- "Nežinau" flow enforcement:
  - `src/app/participant/page.tsx` now requires final answer (UNKNOWN is not submittable) and provides “Grįžti” button after helper questions.

- Export stubs:
  - `src/app/api/activities/[activityId]/export/route.ts` now returns 501 for `format=pdf` and `format=xlsx`.
  - Added `participantId` to named exports (CSV/JSON) to support pending lists.

- Analytics trend groundwork:
  - `src/app/api/activities/[activityId]/analytics/route.ts` now computes `trend` array when `from/to` are provided.

- Admin visibility in auth:
  - `src/app/api/auth/me/route.ts` now returns `isAdmin` based on `ADMIN_EMAILS` allowlist.

- Emotion question type (partial, runtime proof pending):
  - `prisma/schema.prisma` adds `EMOTION` to `QuestionType` enum with migration.
  - `src/lib/question-types.ts` adds EMOTION config + defaults.
  - UI support in `src/components/question-config-editor.tsx` and `src/app/participant/page.tsx`.

- Scheduling + error codes:
  - `src/app/api/activities/[activityId]/responses/route.ts` now returns `ACTIVITY_NOT_OPEN/ACTIVITY_CLOSED/ACTIVITY_NOT_PUBLISHED`.
  - `src/app/api/participants/activities/route.ts` treats `status=CLOSED` as closed state.
  - Facilitator group view shows planned/open/closed badge.
  - Participant list disables planned/closed activities and labels them.

- Teacher dashboard improvements:
  - Date range filters + analytics trend UI (`src/app/dashboard/page.tsx`).
  - CSV export now uses fetch + blob to surface privacy errors.
  - Privacy guard UI message for anonymous min-N 403.
  - Status filter (DRAFT/PUBLISHED/CLOSED) in dashboard.
  - Added explicit empty-state cards (no groups, no activity, no analytics).

- Smoke (2026-01-11) su `--webpack`:
  - `logs/02-smoke.txt` rodo login + activities + analytics + export 200.

- Org isolation smoke (2026-01-11):
  - `logs/03-org-isolation.txt` rodo 403 cross-org requests (participants/analytics/export).

- Admin smoke (2026-01-11):
  - `logs/05-admin-check.txt` rodo health/audit/orgs/users/export 200 (anonymize skipped).

- CSRF check (2026-01-11):
  - `logs/06-csrf-check.txt` rodo 403 (Origin mismatch) ir 201 (same-origin).

- GDPR anonymize proof (2026-01-11):
  - `logs/07-gdpr-anonymize.txt` rodo test user anonimizacija (email perrasytas i `deleted+<id>@example.invalid`).

- CI + Backup:
  - `.github/workflows/ci.yml` pridėtas (dar nerealuotas CI proof).
  - `docs/infra/BACKUP_RESTORE.md` pridėtas.

- Docker + health:
  - `Dockerfile` ir `docker-compose.prod.yml` pridėti.
  - `src/app/api/health/route.ts` pridėtas.

- Admin + GDPR baseline (partial):
  - Admin guard in UI (`/api/auth/me` check), plus org/user lists.
  - New admin endpoints: `/api/admin/orgs`, `/api/admin/users`.
  - GDPR export/anonymize endpoints: `/api/admin/users/[userId]/export`, `/api/admin/users/[userId]/anonymize`.

- Security hardening:
  - Same-origin CSRF check added in `src/lib/guards.ts`.
  - 500 responses now include request id (admin health + invalid question config).
  - CSRF client wrapper added (`src/lib/csrf-client.ts`) and wired into client POST/PATCH flows.

- GDPR delete hardening:
  - Anonymize email now uses `deleted+<id>@example.invalid`.
  - Audit log metadata stripped of PII (no original email).

- Analytics error handler:
  - `src/app/api/activities/[activityId]/analytics/route.ts` try/catch fixed for `createErrorResponse`.

## Legacy merged summaries (from `docs/AUDIT_COMPLETE.md`)

- Audit artifacts confirmed: `AUDIT_CONTEXT.md`, `PROJECT_MAP.md`, `DOCS_SUMMARY.md`, `ISSUES_LOG.md`, `RUNBOOK_DEV.md`.
- Security baseline confirmed: `.env` gitignore, `AUTH_SECRET` env usage, auth guards, rate limiting, audit logs.
- Dev checks recorded: dev server start, Prisma client generation, DB connection (as of 2026-01-11).
- Core flows confirmed via DEV_PROOF: facilitator login, participant login, submit response, export CSV, analytics 200.

## Legacy fixes merged summaries (from `FIXES_APPLIED.md`)

- Prisma adapter fix: added `@prisma/adapter-pg`, `pg`, `@types/pg` and updated `src/lib/prisma.ts` to use PrismaPg adapter.
- Setup docs added earlier for docker compose vs local Postgres (`INSTALL_POSTGRES.md`, `SETUP.md`, `QUICK_START.md`).
- Dev server startup documented as working at the time of those notes (no new runtime proof added here).
