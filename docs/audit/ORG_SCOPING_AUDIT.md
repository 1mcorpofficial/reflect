# Org Scoping Audit

**Data:** 2026-01-11  
**Tikslas:** Patikrinti, kad visi facilitator/admin endpoint'ai yra org-scoped

---

## Endpoint'ų sąrašas

### ✅ DONE - Org scoping yra

1. **`GET /api/groups`** - `src/app/api/groups/route.ts:81`
   - `where: { orgId: auth.session.orgId ?? undefined }`
   - ✅ OK

2. **`POST /api/groups`** - `src/app/api/groups/route.ts:55`
   - `orgId: auth.session.orgId` (sukuria su orgId)
   - ✅ OK

3. **`GET /api/groups/[groupId]/activities`** - `src/app/api/groups/[groupId]/activities/route.ts:20`
   - `if (auth.session.orgId && group.orgId !== auth.session.orgId) return 403`
   - ✅ OK

4. **`POST /api/activities`** - `src/app/api/activities/route.ts:95`
   - `if (auth.session.orgId && group.orgId !== auth.session.orgId) return 403`
   - ✅ OK

5. **`GET /api/activities/[activityId]/analytics`** - `src/app/api/activities/[activityId]/analytics/route.ts:54`
   - `if (auth.session.orgId && activity.group.orgId !== auth.session.orgId) return 403`
   - ✅ OK

6. **`GET /api/activities/[activityId]/export`** - `src/app/api/activities/[activityId]/export/route.ts:95`
   - `if (auth.session.orgId && activity.group.orgId !== auth.session.orgId) return 403`
   - ✅ OK

7. **`PATCH /api/activities/[activityId]/status`** - `src/app/api/activities/[activityId]/status/route.ts:46`
   - `if (auth.session.orgId && activity.group.orgId !== auth.session.orgId) return 403`
   - ✅ OK

### ⚠️ REIKIA PATIKRINTI

8. **`GET /api/groups/[groupId]/participants`** - `src/app/api/groups/[groupId]/participants/route.ts`
   - Reikia patikrinti ar yra orgId check

9. **`POST /api/groups/[groupId]/participants/import`** - `src/app/api/groups/[groupId]/participants/import/route.ts`
   - Reikia patikrinti ar yra orgId check

### ✅ Participant endpoint'ai (nereikia org scoping)

- `GET /api/participants/activities` - participant scope (groupId)
- `POST /api/participants/login` - public
- `GET /api/participants/history` - participant scope (groupId)
- `POST /api/activities/[activityId]/responses` - participant scope (groupId)

### ✅ Admin endpoint'ai (reikia admin guard, ne org scoping)

- `GET /api/admin/*` - admin guard per `requireAdmin()`

---

## Rizika

**HIGH:** Cross-org data leak jei trūksta orgId check

---

## Veiksmai

1. Patikrinti `GET /api/groups/[groupId]/participants`
2. Patikrinti `POST /api/groups/[groupId]/participants/import`
3. Jei trūksta - pridėti orgId check
