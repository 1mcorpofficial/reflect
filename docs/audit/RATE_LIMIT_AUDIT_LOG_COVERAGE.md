# Rate Limit + Audit Log Coverage

**Data:** 2026-01-11  
**Tikslas:** Patikrinti, kad visi mutating route'ai turi rate limit + audit log

---

## Mutating Route'ai (POST/PATCH/DELETE)

### ✅ DONE - Rate Limit + Audit Log yra

1. **`POST /api/auth/login`** - `src/app/api/auth/login/route.ts`
   - Rate limit: ✅ line 55-65
   - Audit log: ✅ line 115-120
   - ✅ OK

2. **`POST /api/participants/login`** - `src/app/api/participants/login/route.ts`
   - Rate limit: ✅ line 19-29
   - Audit log: ✅ line 89-94
   - ✅ OK

3. **`POST /api/groups`** - `src/app/api/groups/route.ts`
   - Rate limit: ✅ line 30-37
   - Audit log: ✅ line 66-71
   - ✅ OK

4. **`POST /api/activities`** - `src/app/api/activities/route.ts`
   - Rate limit: ✅ line 68-75
   - Audit log: ✅ line 166-171
   - ✅ OK

5. **`POST /api/activities/[activityId]/responses`** - `src/app/api/activities/[activityId]/responses/route.ts`
   - Rate limit: ✅ line 37-47
   - Audit log: ⚠️ REIKIA PATIKRINTI

6. **`GET /api/activities/[activityId]/export`** - `src/app/api/activities/[activityId]/export/route.ts`
   - Rate limit: ✅ line 60-70
   - Audit log: ✅ line 177-183 (CSV) ir 202-208 (JSON)
   - ✅ OK

7. **`PATCH /api/activities/[activityId]/status`** - `src/app/api/activities/[activityId]/status/route.ts`
   - Rate limit: ✅ line 19-26
   - Audit log: ⚠️ REIKIA PATIKRINTI

8. **`POST /api/groups/[groupId]/participants/import`** - `src/app/api/groups/[groupId]/participants/import/route.ts`
   - Rate limit: ✅ line 53-60
   - Audit log: ✅ line 160-166
   - ✅ OK

### ✅ DONE - Rate Limit + Audit Log yra

9. **`POST /api/auth/register`** - `src/app/api/auth/register/route.ts`
   - Rate limit: ✅ line 55-67
   - Audit log: ✅ line 119-124
   - ✅ OK

10. **`POST /api/orgs`** - `src/app/api/orgs/route.ts`
    - Rate limit: ✅ line 37-47
    - Audit log: ✅ line 89-94
    - ✅ OK

11. **`POST /api/activities/[activityId]/responses`** - `src/app/api/activities/[activityId]/responses/route.ts`
    - Rate limit: ✅ line 37-47
    - Audit log: ✅ line 359-364
    - ✅ OK

12. **`PATCH /api/activities/[activityId]/status`** - `src/app/api/activities/[activityId]/status/route.ts`
    - Rate limit: ✅ line 19-26
    - Audit log: ✅ line 60-66
    - ✅ OK

### ✅ GET Route'ai (nereikia rate limit/audit log)

- `GET /api/groups` - read-only
- `GET /api/groups/[groupId]/activities` - read-only
- `GET /api/groups/[groupId]/participants` - read-only
- `GET /api/participants/activities` - read-only
- `GET /api/participants/history` - read-only
- `GET /api/activities/[activityId]/analytics` - read-only
- `GET /api/auth/me` - read-only

### ✅ Admin Route'ai (reikia admin guard)

- `GET /api/admin/*` - admin guard per `requireAdmin()`

---

## Veiksmai

1. Patikrinti `POST /api/activities/[activityId]/responses` - ar yra audit log
2. Patikrinti `PATCH /api/activities/[activityId]/status` - ar yra audit log
3. Patikrinti `POST /api/auth/register` - ar yra rate limit + audit log
4. Patikrinti `POST /api/orgs` - ar yra rate limit + audit log
5. Jei trūksta - pridėti
