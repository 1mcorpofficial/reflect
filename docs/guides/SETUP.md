# RUNBOOK_DEV

Tikslas: nuo švaraus Ubuntu iki veikiančio dev (UI + API).

Šis runbook remiasi realiu bandymu šioje aplinkoje (faktai ir klaidos užfiksuotos `docs/audit/ISSUES_LOG.md`).

## 0) Priklausomybės

- Node.js (repo `README.md` nurodo `18+`; šioje aplinkoje buvo `v20.19.6`)
- npm (šioje aplinkoje buvo `10.8.2`)
- PostgreSQL (lokaliai arba per Docker)
- Docker (nebūtinas, jei turite lokalią Postgres)
  - šioje aplinkoje: `Docker version 29.1.3`, `Docker Compose version v5.0.1`

## 1) Projekto paruošimas

Repo root: `reflectus-app/`

```bash
cd "reflectus-app"
npm install
```

## 2) `.env` konfiguracija

Repo turi pavyzdį: `env.example`.

```bash
cp env.example .env
```

Minimaliai reikalingi kintamieji:
- `DATABASE_URL` (Postgres connection string)
- `AUTH_SECRET` (naudojamas JWT ir HMAC funkcijoms; be jo API/seed lūžta)

## 3) Postgres paruošimas

### Variant A: lokali Postgres (jei jau klausosi `127.0.0.1:5432`)

Patikra:
```bash
ss -ltn | rg ':5432' || true
psql "postgresql://postgres:postgres@localhost:5432/reflectus" -c 'select 1;'
```

### Variant B: Docker Postgres

Repo turi `docker-compose.yml`, bet šioje aplinkoje `docker-compose` komandos nėra (yra `docker compose`).

```bash
docker compose up -d db
docker compose ps
```

Jei gaunate `failed to bind host port 0.0.0.0:5432: address already in use` — reiškia 5432 jau užimtas (žr. `docs/audit/ISSUES_LOG.md`), reikės:
- sustabdyti lokalią Postgres (jei ją naudojate), arba
- pakeisti `docker-compose.yml` port map’ą (pvz. į `5433:5432`) ir atitinkamai `DATABASE_URL`.

## 4) Migracijos

Repo turi migracijas `prisma/migrations/*`.

Neinteraktyvus variantas:
```bash
npm run db:deploy
```

Dev variantas (Prisma `migrate dev`):
```bash
npm run db:migrate
```

Jei Prisma prašo „reset“ arba rodo, kad migracijos buvo modifikuotos — žr. `docs/audit/ISSUES_LOG.md` (šiame repo jau yra pakeitimų migracijose, ir esamai DB gali reikėti reset arba naujos DB).


### Migracijų disciplina (svarbu)
- **Niekada neperrašykite jau pritaikytų migracijų**. Schemai keisti — kurkite naują migraciją.
- **Dev reset (tik dev):** `npx prisma migrate reset` (su duomenų praradimo įspėjimu) arba susikurti naują DB (pvz. `reflectus_dev_YYYYMMDD`).
- **Production kelias:** tik `npx prisma migrate deploy` + backup prieš migraciją + rollback planas.

## 5) Seed (demo duomenys)

```bash
npm run db:seed
```

Seed įrašo demo prisijungimus į DB (seed rezultatas spausdinamas į konsolę).

## 6) Paleidimas (dev)

```bash
npm run dev
```

Jei dev serveris tampa neatsakantis (žr. `docs/audit/ISSUES_LOG.md` ISSUE-011), bandykite:
```bash
npm run dev -- --webpack
```

## 7) Minimalus API sanity-check (per `curl`)

Facilitator login:
```bash
curl -sS -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -c /tmp/reflectus_fac.cookie \
  --data '{"email":"demo@reflectus.local","password":"demo1234"}'
```

Participant login:
```bash
curl -sS -X POST http://localhost:3000/api/participants/login \
  -H 'content-type: application/json' \
  -c /tmp/reflectus_part.cookie \
  --data '{"groupCode":"DEMO1","personalCode":"CODE1234"}'
```

## 8) Naudingi skriptai
- `scripts/audit.sh` — surenka audit info į `docs/audit/AUDIT_CONTEXT.md`.
- `scripts/smoke.sh` — greitas curl patikrinimas (login, activities, analytics, export). Parametrai: `PORT`, `FAC_EMAIL`, `FAC_PASS`, `GROUP_CODE`, `PERSONAL_CODE`.

## Pastabos / įspėjimai
- Jei Next.js paleidimo metu matote įspėjimą apie kelis lockfile’us ir neteisingą workspace root: palikite tik šio projekto `package-lock.json` arba pašalinkite/ perkelkite aukštesnio lygio lockfile (pvz. `/home/mcorpofficial/package-lock.json`). Alternatyva: paleisti dev iš projekto root ir nurodyti turbopack root, jei taikoma.
