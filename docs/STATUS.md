# STATUS (Realus)

**Atnaujinta:** 2026-01-11  
**Bazė:** kodo peržiūra + `docs/audit/WORK_DONE.md` + `docs/audit/ISSUES_LOG.md`

## Veikia (verified)

1. **Auth + roles:** facilitator/participant login, org context, JWT cookies (`src/app/api/auth/*`, `src/app/api/participants/login/route.ts`, `src/lib/auth.ts`).
2. **Admin allowlist + UI:** `ADMIN_EMAILS` allowlist, admin session role, `/admin` UI, admin API (`src/lib/admin.ts`, `src/lib/auth.ts`, `src/app/admin/page.tsx`, `src/app/api/admin/*`).
3. **Question engine:** visi tipai, įskaitant EMOTION, config + UI (`src/lib/question-types.ts`, `src/components/question-config-editor.tsx`, `src/app/participant/page.tsx`).
4. **Participant flow:** stepper, progresas, universalūs "Nežinau/Nenoriu", follow-up iki 2 su "Grįžti" (`src/components/UniversalAnswerActions.tsx`).
5. **Builder:** scheduling laukai + template preset'ai (`src/app/builder/page.tsx`).
6. **Scheduling enforcement:** backend open/close, status endpoint, participant state (`src/app/api/activities/[activityId]/responses/route.ts`, `src/app/api/activities/[activityId]/status/route.ts`, `src/app/api/participants/activities/route.ts`).
7. **Analytics:** completion, per-question breakdown, trend (from/to), privacy min-N guard (`src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/dashboard/page.tsx`).
8. **Export:** CSV/JSON/PDF/XLSX veikia + privacy guard + rate limit (`src/app/api/activities/[activityId]/export/route.ts`).
9. **Security baseline:** CSRF token + same-origin guard, rate limiting, audit logs (`src/lib/csrf.ts`, `src/lib/guards.ts`, `src/lib/fetch-with-csrf.ts`, `src/lib/rate-limit.ts`, `src/lib/audit.ts`).
10. **GDPR admin flows:** export + anonymize (legacy endpoint'ai irgi yra) (`src/app/api/admin/gdpr/*`, `src/app/api/admin/users/[userId]/*`).
11. **Infra:** Dockerfile + prod compose + health endpoint (`Dockerfile`, `docker-compose.prod.yml`, `src/app/api/health/route.ts`).
12. **Teacher responses UI:** atsakymų peržiūra dashboard'e (`src/app/dashboard/page.tsx`, `src/app/api/activities/[activityId]/responses/route.ts`).

## Dalinai / reikia pagerinti

1. **Admin role modelis:** session role admin yra, bet nėra pilno RBAC ir CRUD (tik list + anonimize/export).
2. **Analytics correlations:** nerealizuota.
3. **UI/UX polish:** pradėti spacing util, bet nėra pilno design tokens ir audit.
4. **Rate limit / audit coverage:** bazė veikia, bet ne visi mutating endpoint'ai pilnai dengti.
5. **Scheduling UX:** yra laukai + statusai, bet nėra kalendoriaus, priminimų ar aiškaus planavimo vaizdo.
6. **Testų pakankamumas:** yra smoke scripts ir `test:api`, bet nėra CI proof.

## Nėra kritinių lūžių

- Visi anksčiau fiksuoti kritiniai dalykai (DB port konfliktai, migracijos, analytics 500) dokumentuoti ir sutvarkyti.

## Artimiausi prioritetai

1. UI/UX polish (design tokens, cards, empty states, mobile audit).
2. Admin RBAC + pagrindinis admin valdymas (org/user CRUD, linkai į dashboards).
3. Analytics koreliacijos (jei reikalinga pagal spec).
4. Rate limit + audit coverage plėtra.
5. Integraciniai testai + CI įrodymai.
