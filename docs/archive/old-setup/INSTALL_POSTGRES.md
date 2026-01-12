# Postgres įdiegimas be Docker

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

Jei neturite Docker, galite naudoti lokalią PostgreSQL instaliaciją.

## Ubuntu/Debian

```bash
# Įdiekite Postgres
sudo apt update
sudo apt install postgresql postgresql-contrib

# Paleiskite Postgres servisą
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Sukurkite duomenų bazę
sudo -u postgres psql
```

PostgreSQL konsolėje:
```sql
CREATE DATABASE reflectus;
CREATE USER reflectus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE reflectus TO reflectus_user;
\q
```

Tada `.env` faile:
```env
DATABASE_URL="postgresql://reflectus_user:your_password@localhost:5432/reflectus"
```

## macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16

# Sukurkite duomenų bazę
createdb reflectus
```

`.env` faile:
```env
DATABASE_URL="postgresql://localhost:5432/reflectus"
```

## Windows

1. Atsisiųskite PostgreSQL iš https://www.postgresql.org/download/windows/
2. Įdiekite ir paleiskite
3. Naudokite pgAdmin arba psql, kad sukurtumėte duomenų bazę:

```sql
CREATE DATABASE reflectus;
```

`.env` faile:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/reflectus"
```

## Patikrinimas

Patikrinkite ar Postgres veikia:

```bash
# Linux/macOS
psql -d reflectus -c "SELECT version();"

# Arba tiesiog
psql -l
```

Jei matote `reflectus` duomenų bazę, viskas gerai!
