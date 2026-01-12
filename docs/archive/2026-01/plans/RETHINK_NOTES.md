ARCHIVED: replaced by `docs/TODO.md` (backlog)

---
# RETHINK_NOTES

Pasitikrinimas prieš hardening:

- **Roles/permissions**: Admin allowlist + guard + UI įdiegta (logs/05-admin-check.txt). Mokytojas mato tik savo org grupes; org scope patikrinta (logs/03-org-isolation.txt).
- **Input validation/sanitization**: Zod naudojamas auth/groups/responses; kiti endpointai (activities export/analytics) minimaliai tikrina. Reikia peržiūrėti papildomus POST/PATCH kai atsiras scheduling/admin.
- **Auth saugumas**: JWT HS256 su httpOnly sameSite=lax; refresh nėra. CSRF: same-origin check per `src/lib/guards.ts`, runtime proof `logs/06-csrf-check.txt`; CORS nenustatytas (Next default).
- **File upload**: nėra upload funkcijų → šiuo metu N/A; jei atsiras, reikės AV/mime limits + AI moderavimo pipeline.
- **Secrets tvarkymas**: AUTH_SECRET būtinas; .env.example yra; repo neturi raktų. Dokumentuoti stiprų secret (32+ simbolių).
- **Log’ų jautrumas**: Prisma dev loguoja queries su PII; production log level turi būti „error“ tik. Audit log naudoti be jautrių laukų (tik ID/meta).
- **GDPR minimum**: admin export/anonymize endpoint'ai veikia (logs/05-admin-check.txt, logs/07-gdpr-anonymize.txt); retention politikos dokumento dar nėra.
- **“Nežinau”/“Nenoriu atsakyti”**: UI srautas įgyvendintas (UNKNOWN neleidžiama submit; helper flow max 2 + “Grįžti”).
- **Cross-cutting**: Rate limit in-memory – multi-instance neapsaugos; reikėtų Redis, jei deploy bus horizontaliai.

Kas pasikeitė plane:
- Į PLAN_MVP pridėta admin skeleton, privacy N guard eksportui, scheduling UX, UNKNOWN/DECLINED UI srautas, analytics trend groundwork, GDPR flows.
