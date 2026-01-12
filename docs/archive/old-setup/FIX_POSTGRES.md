# Kaip pataisyti Postgres authentication

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

## Problema: Authentication failed

Postgres autentifikacija nepavyko. Reikia nustatyti slaptažodį arba pakeisti authentication metodą.

## Sprendimas 1: Nustatyti postgres vartotojo slaptažodį

```bash
sudo -u postgres psql
```

Postgres konsolėje:
```sql
ALTER USER postgres PASSWORD 'postgres';
\q
```

Tada `.env` faile palikite kaip yra:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reflectus"
```

## Sprendimas 2: Pakeisti į peer authentication (be slaptažodžio)

1. Redaguokite `pg_hba.conf`:
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

2. Raskite eilutę:
```
host    all             all             127.0.0.1/32            scram-sha-256
```

3. Pakeiskite į:
```
host    all             all             127.0.0.1/32            trust
```

4. Taip pat vietiniems prisijungimams:
```
local   all             all                                     trust
```

5. Perkraukite Postgres:
```bash
sudo systemctl restart postgresql
```

6. Pakeiskite `.env` failą (be slaptažodžio):
```env
DATABASE_URL="postgresql://postgres@localhost:5432/reflectus"
```

## Patikrinkite ar veikia

```bash
cd "/home/mcorpofficial/projektai/julios projekt/reflectus-app"
npm run db:migrate
```

Jei vis dar nepavyko, naudokite **Sprendimą 1** (nustatyti slaptažodį).
