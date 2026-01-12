# Galutinis setup žingsnis po žingsnio

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

## ✅ Prisma Client sugeneruotas!

Dabar reikia tik išspręsti Postgres authentication problemą.

## Greitas sprendimas

### Variantas 1: Automatinis skriptas (rekomenduojama)

```bash
cd "/home/mcorpofficial/projektai/julios projekt/reflectus-app"
./setup-postgres.sh
```

Skriptas paklaus, ką norite:
- **1** - Nustatyti slaptažodį 'postgres' (rekomenduojama)
- **2** - Pakeisti į trust authentication (be slaptažodžio)

### Variantas 2: Rankinis būdas

#### A. Nustatyti slaptažodį (rekomenduojama)

```bash
sudo -u postgres psql
```

Postgres konsolėje:
```sql
ALTER USER postgres PASSWORD 'postgres';
\q
```

Tada `.env` faile palikite:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reflectus"
```

#### B. Trust authentication (be slaptažodžio)

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Raskite ir pakeiskite:
```
# Rasti:
host    all             all             127.0.0.1/32            scram-sha-256

# Pakeisti į:
host    all             all             127.0.0.1/32            trust
```

Taip pat:
```
# Rasti:
local   all             all                                     peer

# Pakeisti į:
local   all             all                                     trust
```

Perkraukite:
```bash
sudo systemctl restart postgresql
```

Tada `.env` faile:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/reflectus"
```

## Po authentication fix

```bash
cd "/home/mcorpofficial/projektai/julios projekt/reflectus-app"

# 1. Migruokite DB
npm run db:migrate

# 2. Įdėkite demo duomenis
npm run db:seed

# 3. Paleiskite dev server
npm run dev
```

## Patikrinimas

Jei migracija pavyko, pamatysite:
```
✔ Applied migration ...
```

Jei vis dar authentication error:
- Patikrinkite ar Postgres veikia: `sudo systemctl status postgresql`
- Patikrinkite ar duomenų bazė sukurta: `sudo -u postgres psql -l | grep reflectus`
- Patikrinkite `.env` failą - ar `DATABASE_URL` teisingas?
