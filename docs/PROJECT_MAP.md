# PROJECT_MAP

Repo root: `/home/mcorpofficial/projektai/julios projekt/reflectus-app`

## Tech stack (from `package.json`)

- Runtime: Node.js (README says `18+`)
- Frontend: Next.js `16.1.1` (App Router), React `19.2.3`, TypeScript
- Styling/UI: Tailwind CSS (`tailwind.config.ts`), `tailwindcss-animate`, Radix (`@radix-ui/react-slot`), custom UI components in `src/components/ui/*`
- Backend: Next.js API routes (`src/app/api/**/route.ts`)
- Validation: Zod (`zod`)
- Database: PostgreSQL (`pg`) + Prisma ORM (`prisma`, `@prisma/client`, `@prisma/adapter-pg`)
- Auth: JWT (`jsonwebtoken`) stored in HTTP-only cookie (`src/lib/auth.ts`)
- Password hashing: `bcryptjs`
- Export tooling: `pdf-lib` (PDF), `xlsx` (Excel)

## NPM scripts (from `package.json`)

- `npm run dev` → `next dev`
- `npm run build` → `next build`
- `npm run start` → `next start`
- `npm run lint` → `eslint`
- `npm run db:migrate` → `prisma migrate dev`
- `npm run db:deploy` → `prisma migrate deploy`
- `npm run db:generate` → `prisma generate`
- `npm run db:seed` → `tsx --env-file=.env prisma/seed.ts`

## Environment/config entrypoints

- `.env` (example: `env.example`)
  - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reflectus"`
  - `AUTH_SECRET="replace-with-strong-secret"`
- Postgres dev container: `docker-compose.yml` (service: `db`, image: `postgres:16`, port `5432`)

## Folder map (excluding build artifacts; `tree` unavailable, used `find` summary)

- Root docs/config: `README.md`, `docker-compose.yml`, `env.example`, `tsconfig.json`, `tailwind.config.ts`, `prisma.config.ts`, `next.config.ts`
- `docs/` — canonical docs + audit (`STATUS.md`, `REQUIREMENTS_STATUS.md`, `WORK_PLAN.md`, `PROJECT_MAP.md`, `DOCS_SUMMARY.md`, `GDPR.md`, `audit/*`, `infra/*`)
- `src/app/` — Next.js App Router pages/layouts
  - `layout.tsx`, `page.tsx`, `globals.css`
  - Facilitator UI: `facilitator/login/page.tsx`, `facilitator/(protected)/layout.tsx`, `facilitator/(protected)/page.tsx`, `facilitator/(protected)/[groupId]/page.tsx`
  - Participant UI: `participant/login/page.tsx`, `participant/page.tsx`
  - Builder UI: `builder/page.tsx`
  - Dashboard UI: `dashboard/page.tsx`
- `src/app/api/` — backend routes
  - Auth (facilitator): `api/auth/register/route.ts`, `api/auth/login/route.ts`, `api/auth/me/route.ts`
  - Auth (participant): `api/participants/login/route.ts`
  - Orgs: `api/orgs/route.ts`
  - Admin: `api/admin/health`, `api/admin/audit`, `api/admin/orgs`, `api/admin/users`, `api/admin/users/[userId]/export`, `api/admin/users/[userId]/anonymize`
  - Groups: `api/groups/route.ts`, `api/groups/[groupId]/participants`, `api/groups/[groupId]/activities`
  - Activities: `api/activities/route.ts`, `api/activities/[activityId]/analytics|export|responses|status`
  - Participant data: `api/participants/activities/route.ts`, `api/participants/history/route.ts`
  - Health: `api/health/route.ts`
- `src/lib/` — shared server utilities (`prisma.ts`, `auth.ts`, `guards.ts`, `rate-limit.ts`, `question-types.ts`, `audit.ts`, `hmac.ts`, `codes.ts`, `utils.ts`)
- `src/components/` — UI components and `question-config-editor.tsx`; `src/components/ui/*` for basic controls
- `src/generated/prisma/*` — Prisma client output
- `prisma/` — schema/migrations/seed
  - `schema.prisma`, `migrations/*/migration.sql`, `seed.ts`
- `public/` — static assets
- `types/` — TypeScript helpers

## Data model entrypoint (from `prisma/schema.prisma`)

Enums:
- `PrivacyMode`, `OrgRole`, `MemberStatus`, `ActivityStatus`, `QuestionType`, `ExportFormat`, `ExportStatus`, `AnswerStatus`

Models:
- `User`, `Participant`, `Organization`, `OrgMember`, `Group`, `GroupParticipant`, `ParticipantInvite`, `Activity`, `Questionnaire`, `Question`, `Response`, `Answer`, `AnalyticsSnapshot`, `DataExport`, `AuditLog`

## Setup docs

- Canonical runbook: `docs/audit/RUNBOOK_DEV.md`
- Deprecated quick setup docs: `docs/setup/*`
