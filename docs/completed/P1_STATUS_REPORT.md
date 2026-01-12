# P1 Status Report

**Data:** 2026-01-11  
**Iteracija:** P1 - PDF MVP funkcijos

---

## ✅ DONE - Kas jau padaryta

### 1. Scheduling UI + Enforcement

**Status:** ✅ VISUR YRA

**Patikrinti failai:**
- ✅ `src/app/builder/page.tsx` - turi openAt/closeAt/timezone inputs (lines 201-208, 352-383)
- ✅ `src/app/facilitator/(protected)/[groupId]/page.tsx` - turi openAt/closeAt/timezone inputs (lines 509-533)
- ✅ `src/app/participant/page.tsx` - rodo statusą (PLANNED/OPEN/CLOSED) ir blokuoja submit (lines 365-390, 425-443)
- ✅ Backend: `src/app/api/activities/[activityId]/responses/route.ts` - blokuoja submit jei ne OPEN (lines 91-100)

**Funkcionalumas:**
- ✅ Builder UI turi datetime-local inputs
- ✅ Participant UI rodo statusą su badge'ais
- ✅ Participant UI blokuoja submit jei PLANNED arba CLOSED
- ✅ Backend blokuoja submit su 403 ACTIVITY_NOT_OPEN / ACTIVITY_CLOSED

**Pastaba:** Scheduling UI jau pilnai įgyvendinta!

---

### 2. Universal "Nenoriu/Nežinau" komponentas

**Status:** ⚠️ DALINAIS - UI yra, bet nėra universalaus komponento

**Kas yra:**
- ✅ `src/app/participant/page.tsx` - turi "Nenoriu atsakyti" ir "Nežinau" mygtukus (lines 734-755 pagal search)
- ✅ Backend palaiko UNKNOWN ir DECLINED statusus
- ✅ Follow-up logika veikia

**Kas trūksta:**
- ❌ Nėra universalaus komponento `UniversalAnswerActions.tsx`
- ⚠️ UI logika yra tiesiogiai participant page, ne reusable

**Reikia:**
- Sukurti `src/components/UniversalAnswerActions.tsx`
- Ištraukti logiką iš participant page
- Integruoti į visus question render komponentus

---

## 📋 KITI P1 TASKS

### P1.3 - Emotion UI

**Status:** ⏳ REIKIA PATIKRINTI

**Veiksmai:**
1. Patikrinti ar EMOTION yra QuestionType enum'e
2. Patikrinti ar yra UI komponentas emotion picker'ui
3. Patikrinti ar analytics/export palaiko emotion

---

### P1.4 - Teacher presets

**Status:** ✅ DALINAIS

**Kas yra:**
- ✅ `src/app/builder/page.tsx` - turi PRESETS (lines 64-190)
- ✅ Preset'ai: lesson, week, test, project

**Kas trūksta:**
- ⚠️ Reikia patikrinti ar preset'ai veikia teisingai
- ⚠️ Reikia patikrinti ar preset'ai yra ir facilitator page

---

### P1.5 - Teacher dashboard usability

**Status:** ⏳ REIKIA PATIKRINTI

**Veiksmai:**
1. Patikrinti ar yra completion metrics
2. Patikrinti ar yra "kas nepildė" sąrašas
3. Patikrinti ar yra answers list + detail
4. Patikrinti ar yra filtrai

---

### P1.6 - UI/UX Polish

**Status:** ⏳ REIKIA

**Veiksmai:**
1. Global spacing tokens
2. Cards + empty/loading/error states
3. No overflow @ 320px

---

## 📊 IŠVADOS

**P1 Progress:** 40% (2/6 tasks done/partial)

**Kas veikia:**
- ✅ Scheduling UI - visur
- ⚠️ Universal answers - dalinai (UI yra, bet nėra komponento)

**Kas reikia:**
- ⏳ UniversalAnswerActions komponentas
- ⏳ Emotion UI patikrinimas
- ⏳ Teacher dashboard polish
- ⏳ UI/UX polish

---

## 🎯 KITAS ŽINGSNIS

1. Sukurti UniversalAnswerActions komponentą
2. Patikrinti Emotion UI
3. Patobulinti Teacher dashboard
