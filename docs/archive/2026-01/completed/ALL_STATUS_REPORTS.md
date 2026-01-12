# STATUS REPORTS - P0 ir P1

**Data:** 2026-01-11  
**Sujungta iš:** P0_STATUS_REPORT.md, P1_STATUS_REPORT.md

---

# P0 Status Report

**Data:** 2026-01-11  
**Iteracija:** P0 - Stabilumas + Saugumas

---

## ✅ DONE - Kas jau padaryta

### 1. Org Scoping Auditas

**Status:** ✅ VISI ENDPOINT'AI TURI ORG SCOPING

**Patikrinti endpoint'ai:**
- ✅ `GET /api/groups` - orgId filter
- ✅ `POST /api/groups` - orgId check
- ✅ `GET /api/groups/[groupId]/activities` - orgId check
- ✅ `GET /api/groups/[groupId]/participants` - orgId check
- ✅ `POST /api/groups/[groupId]/participants/import` - orgId check
- ✅ `POST /api/activities` - orgId check
- ✅ `GET /api/activities/[activityId]/analytics` - orgId check
- ✅ `GET /api/activities/[activityId]/export` - orgId check
- ✅ `PATCH /api/activities/[activityId]/status` - orgId check

**Dokumentacija:** `docs/audit/ORG_SCOPING_AUDIT.md`

---

### 2. Rate Limit + Audit Log Coverage

**Status:** ✅ VISI MUTATING ROUTE'AI TURI RATE LIMIT + AUDIT LOG

**Patikrinti endpoint'ai:**
- ✅ `POST /api/auth/login` - rate limit + audit log
- ✅ `POST /api/auth/register` - rate limit + audit log
- ✅ `POST /api/participants/login` - rate limit + audit log
- ✅ `POST /api/groups` - rate limit + audit log
- ✅ `POST /api/activities` - rate limit + audit log
- ✅ `POST /api/activities/[activityId]/responses` - rate limit + audit log
- ✅ `GET /api/activities/[activityId]/export` - rate limit + audit log
- ✅ `PATCH /api/activities/[activityId]/status` - rate limit + audit log
- ✅ `POST /api/groups/[groupId]/participants/import` - rate limit + audit log
- ✅ `POST /api/orgs` - rate limit + audit log

**Dokumentacija:** `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md`

---

### 3. Admin Skeleton

**Status:** ✅ ADMIN SKELETON EGZISTUOJA IR VEIKIA

**Patikrinti failai:**
- ✅ `src/lib/admin.ts` - `requireAdmin()` funkcija
- ✅ `src/app/admin/page.tsx` - admin UI
- ✅ `src/app/api/admin/health/route.ts` - health endpoint
- ✅ `src/app/api/admin/audit/route.ts` - audit log viewer

**Funkcionalumas:**
- ✅ Admin guard veikia (`requireAdmin()`)
- ✅ Admin UI rodo diagnostics (DB, migrations)
- ✅ Admin UI rodo audit log
- ✅ Health endpoint veikia
- ✅ Audit endpoint veikia

**Pastaba:** Admin email nustatomas per `ADMIN_EMAILS` env variable

---

# P1 Status Report

**Data:** 2026-01-11  
**Iteracija:** P1 - PDF MVP funkcijos

---

## ✅ DONE - Kas jau padaryta

### 1. Scheduling UI + Enforcement

**Status:** ✅ VISUR YRA

**Patikrinti failai:**
- ✅ `src/app/builder/page.tsx` - turi openAt/closeAt/timezone inputs
- ✅ `src/app/facilitator/(protected)/[groupId]/page.tsx` - turi openAt/closeAt/timezone inputs
- ✅ `src/app/participant/page.tsx` - rodo statusą (PLANNED/OPEN/CLOSED) ir blokuoja submit
- ✅ Backend: `src/app/api/activities/[activityId]/responses/route.ts` - blokuoja submit jei ne OPEN

**Funkcionalumas:**
- ✅ Builder UI turi datetime-local inputs
- ✅ Participant UI rodo statusą su badge'ais
- ✅ Participant UI blokuoja submit jei PLANNED arba CLOSED
- ✅ Backend blokuoja submit su 403 ACTIVITY_NOT_OPEN / ACTIVITY_CLOSED

**Pastaba:** Scheduling UI jau pilnai įgyvendinta!

---

### 2. Universal "Nenoriu/Nežinau" komponentas

**Status:** ✅ DONE

**Kas padaryta:**
- ✅ `src/components/UniversalAnswerActions.tsx` - universalus komponentas
- ✅ Integruotas į `src/app/participant/page.tsx`
- ✅ Follow-up logika veikia (max 2 klausimai)
- ✅ "Grįžti prie klausimo" mygtukas

---

### 3. Emotion UI

**Status:** ✅ DONE

**Kas padaryta:**
- ✅ EMOTION yra QuestionType enum'e
- ✅ UI komponentas emotion picker'ui
- ✅ Analytics/export palaiko emotion

---

### 4. Teacher presets

**Status:** ✅ DONE

**Kas padaryta:**
- ✅ `src/app/builder/page.tsx` - turi PRESETS
- ✅ `src/app/facilitator/(protected)/[groupId]/page.tsx` - turi PRESETS
- ✅ Preset'ai: lesson, week, test, project

---

### 5. Teacher dashboard usability

**Status:** ✅ DONE

**Kas padaryta:**
- ✅ Completion metrics
- ✅ "Kas nepildė" sąrašas
- ✅ Answers list + detail
- ✅ Filtrai (group, activity, status, date)

---

## 📊 IŠVADOS

**P0 Progress:** 100% (visi tasks done)
**P1 Progress:** 100% (visi tasks done)

---

## 🎯 KITAS ŽINGSNIS

Visi P0 ir P1 tasks užbaigti! Dabar pereiti prie P2 (production bazė).
