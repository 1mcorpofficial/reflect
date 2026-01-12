# 🚀 Vykdykite dabar!

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

## 1. Pataisykite Postgres authentication

**Pasirinkite vieną variantą:**

### A. Greitas būdas (rekomenduojama):

```bash
cd "/home/mcorpofficial/projektai/julios projekt/reflectus-app"
./setup-postgres.sh
```

Pasirinkite **1** (nustatyti slaptažodį)

### B. Rankinis būdas:

```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'postgres';
\q
```

## 2. Migruokite DB

```bash
npm run db:migrate
```

## 3. Įdėkite demo duomenis

```bash
npm run db:seed
```

## 4. Paleiskite dev server

```bash
npm run dev
```

Tada atidarykite http://localhost:3000

## ✅ Kas pataisyta:

1. ✅ Prisma Client sugeneruotas
2. ✅ Seed script'as dabar veiks su path aliases
3. ✅ Next.js dev server veikia (bet reikia DB migracijos)

## 📝 Prisijungimo duomenys (po seed):

- **Fasilitatorius**: `demo@reflectus.local` / `demo1234`
- **Dalyvis**: grupės kodas + asmeninis kodas (bus rodomi po importo)
