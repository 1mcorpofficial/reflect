# PLAN_MVP (MVP 5.0 → Fix Pack → 5.1 → 5.2)

Format: Tikslas • Kur keisti • Užduočių checklist • Priklausomybės • DoD • Rizikos

## MVP 5.0 (būtina, kad mokytojas/mokinys naudotų)
- **Stabilus dev/runbook** • `docs/audit/RUNBOOK_DEV.md`, `docs/audit/ISSUES_LOG.md` • ✅ įrodymai turi veikti (login/submit/export/analytics) • Depends: DB up • DoD: šviežia env + migrate dev + seed + curl proof • Rizika: port 5432 konfliktas (dokumentuota).
- **Auth/roles konsolidacija** • `src/lib/auth.ts`, `src/lib/guards.ts`, API auth routes, layouts • [ ] Užtikrinti facilitator/participant srautą; [ ] pasiruošti admin flag schemoje (be UI) • Depends: prisma schema • DoD: login veikia, cookie set, me endpoint grąžina role • Rizika: JWT invalidacija.
- **Question responses “Nežinau/Nenoriu”** • `src/app/api/activities/[activityId]/responses/route.ts`, participant UI pages • [ ] UI mygtukai visiems tipams; [ ] UNKNOWN flow (mini wizard 1–3 klausimai) • Depends: question types config • DoD: UI pateikia UNKNOWN su followUp, DECLINED pasirinkimas; DB status/meta užpildyti • Rizika: UX frikcija, validacija.
- **Analytics 500 fix** • `prisma/migrations/20260111081943_analytics_snapshot_range` (DONE) • DoD: GET /api/activities/:id/analytics 200 • Rizika: sena DB schema (reset).
- **Export bent 1 formatas** • `src/app/api/activities/[activityId]/export/route.ts` • [ ] CSV veikia (DONE), [ ] dokumentuota • DoD: curl atsisiunčia CSV • Rizika: PII, min N (pažymėti TODO).
- **Teacher dashboard minimalus** • `src/app/dashboard/page.tsx`, `src/app/facilitator/(protected)/*` • [ ] Rodyti completion+distributions iš analytics; [ ] error/empty states • Depends: analytics API • DoD: dashboard rodo per-question duomenis be 500 • Rizika: vizualų trūkumas mobilėje.
- **RUNBOOK/env.example atnaujinimas** • `docs/audit/RUNBOOK_DEV.md`, `env.example` • [ ] Aiškios instrukcijos dėl AUTH_SECRET/DATABASE_URL/portų • DoD: naujas dev laikosi runbook • Rizika: neatnaujintos komandos.

## MVP 5.0 Fix Pack (stabilumas/saugumas)
- **Prisma migracijų švara** • `prisma/migrations` • [ ] Sutvarkyti modifikuotas migracijas arba dokumentuoti reset; [ ] workspace root warning (Next.js) • DoD: `npm run db:migrate` ant švarios DB be promptų; dev įspėjimai pašalinti • Rizika: duomenų praradimas.
- **Rate limit/abuse** • `src/lib/rate-limit.ts`, auth routes • [ ] Įrašyti limits į README/RUNBOOK; [ ] svarbiausi POST maršrutai turi limitą • DoD: login + participant login limituoti • Rizika: DoS per kitas API.
- **Audit log konsistencija** • API routes • [ ] logAudit visiems mutaciniams veiksmams • DoD: audit įrašai DB po login/response/export • Rizika: jautrūs duomenys loguose.
- **CSV PII/min N guard** • `export/route.ts` • [ ] if privacyMode=ANONYMOUS ir N<5 → riboti detales • DoD: test export su mažu N rodo įspėjimą • Rizika: privatumo pažeidimas.
- **UI polish base** • `src/app/globals.css`, layout • [ ] max-width, padding tokens, kortelės/empty states, mobile spacing • DoD: pagrindiniai ekranai be overflow, aiškūs CTA • Rizika: regresijos UI.

## MVP 5.1 (patobulinimai)
- **Scheduling UX** • `src/app/builder/page.tsx`, `api/activities/...` • [ ] openAt/closeAt form fields; [ ] status endpoint rodo langą; [ ] “neužpildė” statusas po pabaigos • DoD: sukuri veiklą su langais, status/activities list rodo atidarymą • Rizika: laiko juostos klaidos.
- **Teacher review & filters** • `src/app/facilitator/(protected)/[groupId]/page.tsx` • [ ] Filtrai pagal statusą (answered/unknown/declined); [ ] detail view su follow-up meta • DoD: mokytojas mato kas nepateikė, kas nežinojo • Rizika: dideli duomenys.
- **Admin skeleton** • `src/app/admin` (nauja), guard • [ ] Route guard pagal role; [ ] sąrašas org/users; [ ] tik readonly MVP • DoD: admin role mato valdymo puslapį • Rizika: RBAC klaidos.
- **Analytics trend groundwork** • `analytics/route.ts`, schema • [ ] from/to param support; [ ] minimal trend array • DoD: GET su from/to grąžina per-question buckets • Rizika: našumas.
- **Export PDF/Excel stub** • `export/route.ts` • [ ] papildyti format param handle PDF=501 jei neįgyvendinta; [ ] paruošti CSV->XLSX naudai • DoD: aiškus response + roadmap • Rizika: lūžiai klientui.

## MVP 5.2 (tolimesni)
- **AI tagging pipeline (atviri tekstai)** • server worker / queue planas • [ ] Schema meta laukai; [ ] stub service; [ ] toggles per org • DoD: tekstai gali gauti AI žymes (neprivaloma automatiškai) • Rizika: PII → AI.
- **Correlations/insights** • analytics service • [ ] koreliacijų API stub; [ ] top factors skaičiavimai • DoD: endpoint grąžina basic correlations arba planned= true • Rizika: klaidingos išvados.
- **Notifications/priminimai** • cron/queue • [ ] job scheduler; [ ] email/push adapter stub • DoD: atidėjimo grafikas planuose • Rizika: external services.
- **GDPR flows** • endpoints + UI • [ ] user data export/delete; [ ] retention policy config • DoD: admin gali inicijuoti export/delete; documented • Rizika: teisinių reikalavimų neatitikimas.
