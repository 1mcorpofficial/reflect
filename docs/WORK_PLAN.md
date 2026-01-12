# WORK_PLAN (Aktualus)

**Atnaujinta:** 2026-01-11  
**Pastaba:** detalesnė istorija ir jau padaryti darbai yra `docs/audit/WORK_DONE.md`.

## P0 - Stabilumas ir apsauga

1. Išplėsti rate limit coverage visiems mutating endpoint'ams.
2. Išplėsti audit log coverage (visi svarbūs mutating veiksmai).
3. Patikrinti CSRF token naudojimą visuose kliento POST/PATCH/DELETE srautuose.

## P1 - MVP funkcijos/polish

1. Admin RBAC: pilnas RBAC + org/user CRUD UI.
2. Teacher atsakymų peržiūra (detail UI, filtrai, export per respondentą).
3. Scheduling UX: aiškesni statusai, kalendoriaus vaizdas, priminimai (jei reikalinga).
4. UI/UX polish: design tokens, global spacing, empty states, mobile audit.

## P2 - Production ir kokybė

1. Integraciniai testai (login, submit, analytics, export) + CI proof.
2. GDPR retention policy aprašymas + priežiūros procedūros.
3. Observability/alerts (jei deployinama): logs, health checks, backup proof.

## Done (sutraukta)

- Admin allowlist + UI + API.
- Builder presets + scheduling laukai.
- EMOTION question type (config + UI).
- Universal "Nežinau/Nenoriu" su follow-up ir grįžimu.
- Analytics trend + privacy guard + dashboard filtrai.
- Export CSV/JSON/PDF/XLSX.
- Admin session role + admin actions (export/anonymize).
- Teacher responses UI (dashboard).
- CSRF token + same-origin guard.
- Dockerfile + prod compose + health endpoint.
