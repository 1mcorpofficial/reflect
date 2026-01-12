# REQUIREMENTS_STATUS

Legend: **DONE** / **PARTIAL** / **MISSING** / **BROKEN**. Evidence = file/endpoint/log.

## 1) Roles & Auth

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| R1 | Student (participant) login via groupCode+personalCode | **DONE** | API exists + DEV_PROOF | `src/app/api/participants/login/route.ts` |
| R2 | Teacher/Facilitator login + org context | **DONE** | API exists + org context in session | `src/app/api/auth/login/route.ts`, `src/lib/auth.ts` |
| R3 | Admin role (tas pats login, bet admin UI pagal role) | **PARTIAL** | Admin session role + allowlist, `role`/`isAdmin` in `/api/auth/me`, admin UI exists | `src/lib/auth.ts`, `src/lib/admin.ts`, `src/app/api/auth/me/route.ts`, `src/app/admin/page.tsx` |
| R4 | Session/JWT cookie auth | **DONE** | JWT cookie in auth lib | `src/lib/auth.ts` |
| R5 | Auth guards endpoint'uose | **DONE** | `requireRole` naudojamas, CSRF check | `src/lib/guards.ts` |

## 2) Teacher (Pagrindinis fokusas)

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| T1 | Teacher sukuria refleksijos "template" (Lesson/Week/Test/Project) | **DONE** | Preset'ai builder UI | `src/app/builder/page.tsx` |
| T2 | Teacher priskiria refleksiją klasei/grupei (group code/membership) | **DONE** | Activity su `groupId` | `src/app/api/activities/route.ts` |
| T3 | Teacher mato aktyvius klausimynus + completion rate | **DONE** | Analytics endpoint + dashboard | `src/app/api/activities/[activityId]/analytics/route.ts`, `src/app/dashboard/page.tsx` |
| T4 | Teacher peržiūri studentų atsakymus (list + detail) | **PARTIAL** | API + dashboard responses UI | `src/app/api/activities/[activityId]/responses/route.ts`, `src/app/dashboard/page.tsx` |
| T5 | Teacher exportuoja rezultatus (CSV/XLSX/PDF) | **DONE** | CSV/JSON/PDF/XLSX veikia | `src/app/api/activities/[activityId]/export/route.ts` |

## 3) Student

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| S1 | Student mato Active questionnaires | **DONE** | Activities endpoint su state | `src/app/api/participants/activities/route.ts` |
| S2 | Student užpildo refleksiją (UX patogus) | **DONE** | UI stepper + submit | `src/app/participant/page.tsx`, responses route |
| S3 | Student mato progresą (progress) | **PARTIAL** | Basic progress bar | `src/app/participant/page.tsx` |
| S4 | Student istorija | **DONE** | History UI + API | `src/app/participant/page.tsx`, `src/app/api/participants/history/route.ts` |

## 4) Question Engine (Privalomas)

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| Q1 | Traffic light (green/yellow/red) | **DONE** | `QuestionType.TRAFFIC_LIGHT` | `prisma/schema.prisma`, `src/lib/question-types.ts` |
| Q2 | Scale (1–5 / 1–10) | **DONE** | `QuestionType.SCALE` + `THERMOMETER` | schema + UI |
| Q3 | Emotions (ikonos) | **DONE** | `QuestionType.EMOTION` + UI | `prisma/schema.prisma`, `src/lib/question-types.ts`, `src/app/participant/page.tsx` |
| Q4 | Single-select / Multi-select | **DONE** | `QuestionType.MULTI_SELECT` | schema + UI |
| Q5 | Free text | **DONE** | `QuestionType.FREE_TEXT` | schema + UI |
| Q6 | "100% paskirstymas" (slideriai sum=100) | **DONE** | `QuestionType.PIE_100` | schema + UI |
| Q7 | KIEKVIENAM klausimui "Nenoriu atsakyti" | **DONE** | Universal actions | `src/components/UniversalAnswerActions.tsx` |
| Q8 | KIEKVIENAM klausimui "Nežinau" su nukrypamuoju flow | **DONE** | Follow-up UI + meta | `src/components/UniversalAnswerActions.tsx`, `src/app/participant/page.tsx` |
| Q9 | "Nežinau" helper flow: 1–2 nukrypimai → grįžti | **DONE** | Follow-up limit 2 + "Grįžti" | `src/components/UniversalAnswerActions.tsx` |
| Q10 | Validacija: negali užbaigti be galutinio atsakymo | **DONE** | Responses validation | `src/app/api/activities/[activityId]/responses/route.ts` |

## 5) Analytics

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| A1 | Analytics endpoint'as neegzistuoja arba negrąžina 500 | **DONE** | Endpoint 200 + error handler | `src/app/api/activities/[activityId]/analytics/route.ts` |
| A2 | Bazinės suvestinės: completion, pasiskirstymai | **DONE** | per-question distribution | analytics route |
| A3 | Trend per laiką (from/to) | **DONE** | trend array + from/to params | analytics route + dashboard filters |
| A4 | Koreliacijos | **MISSING** | Nėra implementation | — |
| A5 | Privacy min-N guard (anonymous < N → 403) | **DONE** | `MIN_ANON_COUNT = 5` | analytics route |

## 6) Export

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| E1 | Export bent vienu formatu: CSV/XLSX arba PDF | **DONE** | CSV/JSON veikia | export route |
| E1b | PDF/XLSX | **DONE** | PDF/XLSX generavimas | export route |
| E2 | Teacher eksportuoja pagal klasę/grupę/klausimyną | **DONE** | export by activityId + org scope | export route |
| E3 | Privacy min-N guard (anonymous < N → 403) | **DONE** | `MIN_ANON_COUNT = 5` | export route |

## 7) UI/UX (Apple-inspired, mobile-first)

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| U1 | Mobile-first | **PARTIAL** | Responsive, bet be full audit | `src/app/**/*.tsx` |
| U2 | Niekas neišlenda už kraštų (no overflow) | **PARTIAL** | Nėra pilno audit | layouts/components |
| U3 | Globalūs padding/margin standartai | **PARTIAL** | `page-shell` util (global padding), bet nėra pilnų design tokens | `src/app/globals.css` |
| U4 | Cards, aiškūs CTA, empty/loading/error states | **PARTIAL** | Baziniai komponentai yra | components/pages |
| U5 | Apple Health/Mental Wellbeing inspiracija | **MISSING** | Nėra full polish | — |

## 8) Security / GDPR (Bazė + roadmap)

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| P1 | .env.example + jokio secrets commit'e | **DONE** | `.env*` gitignore + env.example | `.gitignore`, `env.example` |
| P2 | Basic rate-limit (coverage) | **PARTIAL** | `checkRateLimit` ne visur | `src/lib/rate-limit.ts` + routes |
| P3 | Audit log: svarbioms mutacijoms | **PARTIAL** | `logAudit` ne visur | `src/lib/audit.ts` + routes |
| P4 | GDPR: user data export/delete | **DONE** | Admin endpoints | `src/app/api/admin/gdpr/*`, `src/app/api/admin/users/[userId]/*` |
| P5 | CSRF strategy | **PARTIAL** | CSRF token + same-origin guard | `src/lib/csrf.ts`, `src/lib/guards.ts`, `src/lib/fetch-with-csrf.ts` |
| P6 | Minimalus PII, aiškūs duomenų laukai | **DONE** | schema aiški | `prisma/schema.prisma` |

## 9) Scheduling / Galiojimo langas

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| SCH1 | openAt/closeAt/timezone laukai | **DONE** | schema turi laukus | `prisma/schema.prisma` |
| SCH2 | UI: openAt/closeAt form fields | **DONE** | builder inputs | `src/app/builder/page.tsx` |
| SCH3 | Status logika: planned/open/closed | **PARTIAL** | API + participant state, UI ribota | `src/app/api/activities/[activityId]/status/route.ts`, `src/app/api/participants/activities/route.ts` |
| SCH4 | Teacher calendar/planavimas | **MISSING** | Nėra calendar UI | — |
| SCH5 | Priminimai | **MISSING** | Nėra scheduler/queue | — |

## 10) Admin

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| AD1 | Admin role/UI | **PARTIAL** | session role + allowlist + UI | `src/lib/auth.ts`, `src/lib/admin.ts`, `src/app/admin/page.tsx` |
| AD2 | Org/user management (bent skeleton) | **PARTIAL** | list endpoints + export/anonymize actions | `src/app/api/admin/orgs/route.ts`, `src/app/api/admin/users/route.ts`, `src/app/admin/page.tsx` |
| AD3 | Diagnostika (DB health, migrations, logs) | **PARTIAL** | health + audit log | `src/app/api/admin/health/route.ts`, `src/app/api/admin/audit/route.ts` |
| AD4 | Patogūs link'ai į teacher dashboards | **MISSING** | Nėra UI | — |

## 11) Moderation (Jei atsiras upload'ai)

| ID | Requirement | Status | Evidence | Files/Endpoints |
|---|---|---|---|---|
| M1 | Upload moderation stub | **N/A** | Nėra upload funkcijų | — |
