# GAP_ANALYSIS (iki MVP 5.0)

## A) Backend
- Auth/roles: facilitator/participant implemented; admin role missing; RBAC limited to `requireRole` helper (no org-level scoping for admin); session payload lacks admin flag.
- DB schema: covers orgs/groups/activities/questions/responses/audit/export; scheduling fields exist; AnalyticsSnapshot now matches schema (added from/to); no retention/soft-delete; no privacy N-threshold in queries.
- API coverage: CRUD for groups/activities/participants responses; missing admin management endpoints; scheduling/notifications not enforced; “Nežinau” follow-up logic only validated server-side, not orchestrated by UI.
- Validation/error handling: zod used in auth/groups; responses route validates per question type; some endpoints lack rate limit (most sensitive ones covered).
- Logging/audit: audit helper exists but not consistently used across all routes; no structured logging config.
- Rate limit: in-memory only (per-process); no Redis/cluster support.
- Tests: none.

## B) Frontend
- Layout/responsive: pages render but lack mobile-first spacing tokens and consistent max-width; no Apple-inspired UI polish; overflow/edge spacing not audited.
- Flows: facilitator dashboard basic; no calendar/scheduling UX; participant flow lacks “Nežinau” follow-up wizard and universal “Nenoriu atsakyti” controls; no admin UI.
- Loading/error states: minimal; dashboard fetch has basic status text only; no empty states for analytics/export.
- Accessibility: not assessed; form controls use basic inputs without aria review.

## C) Infra
- Docker: simple Postgres service; port 5432 conflict risk documented; no app container/reverse proxy.
- SSL/reverse proxy: none.
- Env/secrets: AUTH_SECRET required; .env.example present; no secret management guidance beyond local.
- DB backup/restore: not documented.
- CI/CD: none.

## D) Security/GDPR
- Data minimization: participants use hashed codes; PII limited to emails; no retention policy; no delete/export user flow.
- Access control: teacher/facilitator guard present; admin/owner scoping missing; org scoping enforced for groups but not audited everywhere.
- CSRF/CORS: cookies are sameSite=lax; no CSRF token for state-changing requests.
- Logs: audit log table exists; not surfaced; potential sensitive data in query logs (dev).
- Secrets in repo: none observed; AUTH_SECRET required via env.
- GDPR: consent/notice, right-to-delete/export not implemented; anonymization thresholds not enforced in analytics/export.
