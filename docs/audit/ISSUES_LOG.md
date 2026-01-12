# ISSUES_LOG

Šiame faile: realios klaidos ir jų logai 1:1 (be slaptų reikšmių).

## 2026-01-11 — DEV/DB/INFRA

### ISSUE-001 — `docker compose up -d db` nepasileidžia, nes užimtas 5432

**Klasė:** Infra / DB (port conflict)  
**Komanda:**
```bash
docker compose up -d db
```

**Logas (1:1):**
```
... the attribute `version` is obsolete, it will be ignored ...
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint reflectus-app-db-1 (...): failed to bind host port 0.0.0.0:5432/tcp: address already in use
```

**Diagnozė (faktai):**
- `ss -ltnp | rg ':5432'` rodė, kad klausosi `127.0.0.1:5432`.

**Sprendimo planas:**
- Jei norite Docker Postgres: keisti `docker-compose.yml` į kitą portą (pvz. `5433:5432`) + atnaujinti `DATABASE_URL`.
- Jei naudojate lokalią Postgres: nenaudoti Docker db.

---

### ISSUE-002 — `npm run db:migrate` (Prisma) krenta su `P3006` (shadow DB), nes migracijoje neteisingas `pg_type.typname` tikrinimas

**Klasė:** DB / Migrations  
**Komanda:**
```bash
npm run db:migrate
```

**Logas (1:1):**
```
Error: P3006

Migration `202601051215_mvp4_retry` failed to apply cleanly to the shadow database.
Error:
ERROR: type "OrgRole" already exists
```

**Diagnozė (pagal failus):**
- `prisma/migrations/202601051215_mvp4_retry/migration.sql` turėjo tikrinimą `typname = 'orgrole'`, bet tipas kuriamas kaip `"OrgRole"` (quoted, case-sensitive), todėl check’as nesuveikė ir bandė kurti tipą antrą kartą.

**Minimalus fix (padaryta):**
- `prisma/migrations/202601051215_mvp4_retry/migration.sql` pakeista į `lower(typname) = 'orgrole'` (taip pat `memberstatus`, `answerstatus`).

---

### ISSUE-003 — Prisma praneša, kad migracijos buvo modifikuotos po pritaikymo (esamai DB)

**Klasė:** DB / Migrations state  
**Komanda:**
```bash
npm run db:migrate
```

**Logas (1:1):**
```
- The migration `202601051140_mvp4` was modified after it was applied.
- The migration `202601051215_mvp4_retry` was modified after it was applied.

We need to reset the "public" schema at "localhost:5432"
You may use prisma migrate reset to drop the development database.
All data will be lost.
```

**Diagnozė:**
- Lokali DB (pavadinimu `reflectus`) jau turėjo pritaikytas migracijas, o repo migracijos (bent `202601051215_mvp4_retry`) buvo pakeistos.

**Workaround (naudota audit’ui, kad neprarasti duomenų):**
- Sukurta nauja DB: `reflectus_audit_20260111`.
- Migracijos taikytos į ją su `DATABASE_URL=...` override.

---

### ISSUE-004 — Seed krenta, jei nėra `AUTH_SECRET`

**Klasė:** Env / Runtime  
**Komanda:**
```bash
DATABASE_URL="postgresql://.../reflectus_audit_20260111" npx tsx prisma/seed.ts
```

**Logas (1:1):**
```
Error: AUTH_SECRET not set
    at getSecret (.../src/lib/hmac.ts:5:22)
    at hmacLookup (.../src/lib/hmac.ts:10:38)
    at main (.../prisma/seed.ts:65:34)
```

**Diagnozė:**
- `prisma/seed.ts` naudoja `hmacLookup` (`src/lib/hmac.ts`), kuriam reikia `AUTH_SECRET`.

**Workaround (naudota audit’ui):**
- Seed paleistas su `AUTH_SECRET=...` aplinkos kintamuoju.

---

### ISSUE-005 — `/api/activities/:id/analytics` grąžina 500 dėl DB schemos neatitikimo (`AnalyticsSnapshot.from/to`)

**Klasė:** DB schema / Runtime API  
**Reprodukcija:**
- Paleidus dev serverį, `GET /api/activities/<activityId>/analytics` grąžino `500`.

**Server logas (1:1 iš `/tmp/reflectus_dev_3005.log`):**
```
PrismaClientKnownRequestError:
... prisma.analyticsSnapshot.findFirst() ...
The column `(not available)` does not exist in the current database.
code: 'P2022'
```

**Diagnozė (pagal failus):**
- `prisma/schema.prisma` modelis `AnalyticsSnapshot` turi laukus `from` ir `to`.
- `prisma/migrations/20260105073747_init/migration.sql` lentelėje `AnalyticsSnapshot` šių stulpelių nesukūrė.

**Minimalus fix (padaryta):**
- Sugeneruota ir pritaikyta migracija `prisma/migrations/20260111081943_analytics_snapshot_range/migration.sql`, kad DB atitiktų `prisma/schema.prisma`.
- Po to `GET /api/activities/<activityId>/analytics` grąžino `200` ir JSON.

---

### ISSUE-006 — Next.js dev įspėjimas apie „workspace root“ dėl kelių `package-lock.json`

**Klasė:** Build/Dev tooling (warning)  
**Logas (1:1):**
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of /home/mcorpofficial/package-lock.json as the root directory.
 Detected additional lockfiles:
   * /home/mcorpofficial/projektai/julios projekt/reflectus-app/package-lock.json
```

**Pastaba:**
- Turbopack root dabar fiksuotas į projekto šaknį (`next.config.ts`) kad nerinktų aukštesnio lockfile. Vis tiek rekomenduojama pašalinti/ignoruoti aukštesnio lygio `package-lock.json`, jei nebereikalingas.

---

### ISSUE-007 — Anoniminių eksportų privatumo guard

**Klasė:** Privacy / Export  
**Kas padaryta:** įdėtas min-N guard eksportui, jei `privacyMode=ANONYMOUS` ir atsakymų < 5.  
**Failas:** `src/app/api/activities/[activityId]/export/route.ts` (konst. `MIN_ANON_COUNT=5`).  
**Elgesys:** grąžina 403 su aiškiu pranešimu, jei bandome eksportuoti per mažai atsakymų.

### ISSUE-008 — Anoniminių analytics min-N guard

**Klasė:** Privacy / Analytics  
**Kas padaryta:** `analytics/route.ts` dabar grąžina 403 jei `privacyMode=ANONYMOUS` ir atsakymų < 5.  
**Failas:** `src/app/api/activities/[activityId]/analytics/route.ts` (MIN_ANON_COUNT=5).  
**Elgesys:** neleidžia matyti suvestinių, kol nepasiektas minimalus atsakymų skaičius.

### ISSUE-009 — Smoke (2026-01-11) po UI stepper/guard pokyčių

**Veiksmai:** `PORT=3005 ./scripts/smoke.sh` (AUTH_SECRET/DATABASE_URL override kaip anksčiau).  
**Rezultatas:** Facilitator login OK, participant login OK, activities list (state=OPEN), analytics 200, CSV export 200.  
**Pastaba:** serveris išjungtas po smoke; 3005 laisvas.

---

### ISSUE-010 — Audit log FK klaida `AuditLog_actorParticipantId_fkey` per participant login/activities

**Klasė:** Runtime / Audit  
**Reprodukcija:** `./scripts/smoke.sh` su veikiančiu dev serveriu  

**Logas (1:1, trumpinta):**
```
Invalid prisma.auditLog.create() ...
Foreign key constraint violated on the constraint: `AuditLog_actorParticipantId_fkey`
```

**Diagnozė (pagal schemas):**
- `AuditLog.actorParticipantId` yra foreign key į `GroupParticipant.id`, ne į `Participant.id` (`prisma/schema.prisma`).
- Kai kuriuose logAudit kvietimuose buvo paduodamas `participantId`, todėl FK lūžo.

**Minimalus fix (padaryta):**
- `src/app/api/participants/login/route.ts`: `actorParticipantId` pakeistas į `membership.id` (GroupParticipant ID).
- `src/app/api/activities/[activityId]/responses/route.ts`: `actorParticipantId` pakeistas į `auth.session.membershipId`.

**Įrodymas (smoke):**
- `logs/02-smoke.txt` (2026-01-11) — participant login + activities + analytics + export 200, be audit FK klaidos.

---

### ISSUE-011 — Dev server (Next.js) tampa neatsakantis, API request'ai timeout

**Klasė:** Dev runtime / Tooling  
**Reprodukcija:** paleidus `npm run dev` (turbopack arba `--webpack`), vėliau `curl` į API endpoint'us grįžta tik po ilgo laiko arba timeout.  

**Logas (1:1):**
```
curl: (28) Operation timed out after 60000 milliseconds with 0 bytes received
```

---

### ISSUE-012 — Smoke (2026-01-11) su `--webpack` ir PORT=3005

**Veiksmai:** `npm run dev -- --webpack -p 3005` + `PORT=3005 ./scripts/smoke.sh`  
**Rezultatas:** Facilitator login OK, participant login OK, activities list OK, analytics 200, CSV export 200.  
**Evidence:** `logs/02-smoke.txt`, `logs/dev-server.txt`

---

### ISSUE-013 — Org isolation smoke (2026-01-11) OK

**Veiksmai:** `PORT=3005 ./scripts/org-isolation.sh`  
**Rezultatas:** Cross-org requests grįžta 403 (participants/analytics/export).  
**Evidence:** `logs/03-org-isolation.txt`

---

### ISSUE-014 — Admin endpoints smoke (2026-01-11) OK

**Veiksmai:** `ADMIN_EMAILS=demo@reflectus.local` + login + `/api/admin/*`  
**Rezultatas:** health/audit/orgs/users/export 200 (anonymize nebuvo vykdytas).  
**Evidence:** `logs/05-admin-check.txt`

---

### ISSUE-015 — CSRF same-origin check verified (2026-01-11)

**Veiksmai:** POST su `Origin: http://evil.local` ir su `Origin: http://localhost:3007`  
**Rezultatas:** evil → 403, same-origin → 201.  
**Evidence:** `logs/06-csrf-check.txt`

---

### ISSUE-016 — GDPR anonymize endpoint verified (2026-01-11)

**Veiksmai:** admin login + sukurtas test user + `POST /api/admin/users/:id/anonymize`  
**Rezultatas:** 200; email perrašytas į `deleted+<id>@example.invalid`.  
**Evidence:** `logs/07-gdpr-anonymize.txt`

**Diagnozė (faktai):**
- `ps` rodo `next-server (v16.1.1)` procesą su ~99% CPU.
- `curl` į `/` ir `/api/*` timeout, nors portas 3000 klausosi.

**Minimalus workaround (kol kas):**
- Užmušti užstrigusį dev server: `kill -9 <next-server PID>`.
- Paleisti dev su `--webpack` ir laukti ilgesnį laiką pirmiems request'ams.

**Statusas:** Nėra galutinio fix (reikia stabilaus dev scenarijaus).


## DEV_PROOF (kas realiai veikė)

### Dev server start (port 3005)

**Logas (1:1 excerpt):**
```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3005
✓ Ready in 3.5s
GET / 200
```

### API (seed + login + submit + export + analytics)

**Facilitator login (1:1):**
```
{"user":{"id":"3606b19a-84c3-4baa-80c5-cc2e9ef80225","email":"demo@reflectus.local","name":"Demo Facilitator"},"org":{"id":"9db5c688-7e65-4555-90d7-efa9400e48ab","name":"Reflectus Demo Organizacija","slug":"reflectus-demo"}}
```

**Participant login (1:1):**
```
{"participant":{"id":"demo-participant","displayName":"Demo Mokinys","group":{"id":"5813ef57-7218-4de0-b812-f2ece81a1ba6","name":"Demo Grupė","code":"DEMO1"}}}
```

**Participant activities (1:1 excerpt):**
```
{"activities":[{"id":"b7f7f323-ac84-4ba5-8757-a59bb443f6b3","title":"Pamokos refleksija (demo)","privacyMode":"NAMED","status":"PUBLISHED",...}]}
```

**Submit response (1:1):**
```
{"responseId":"5a87cc13-3cec-434f-8499-dcb2de1b3907"}
```

**Export CSV (first lines, 1:1):**
```
responseId,submittedAt,participant,email,Kaip pavyko pamoka?,Koks motyvacijos lygis?
5a87cc13-3cec-434f-8499-dcb2de1b3907,2026-01-11T08:18:37.476Z,Demo Mokinys,,green,7
```

**Analytics (1:1):**
```
{"activityId":"b7f7f323-ac84-4ba5-8757-a59bb443f6b3","totalParticipants":1,"totalResponses":1,"completionRate":1,"perQuestion":[...]}
```
