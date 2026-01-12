# TODO (remaining priorities)

P0:
- Fix lockfile warning: decide on handling `/home/mcorpofficial/package-lock.json` vs project root `package-lock.json` (turbopack root already pinned).
- Expand rate-limit/audit coverage (check remaining mutating routes).
- Participant UI: stepper/card flow with progress; universal “Nežinau/Nenoriu” actions; helper follow-ups and validation.
- Scheduling enforcement/UX: show status labels (planned/open/closed) to participant; ensure submit blocked if not open.

P1:
- Teacher builder presets (lesson/week/test/project) + scheduling inputs + group assignment UX.
- Teacher dashboard polish (completion/distribution cards, filters, export CTA).
- Admin skeleton (guard + diagnostics + audit log list).

P2:
- Export: PDF/Excel stub/implementation.
- Analytics: trends (from/to) + correlations roadmap.
- UI polish mobile-first (spacing tokens, empty states, cards).
- Security/production: CSRF strategy, security headers, Docker/CI, GDPR export/delete plan.
