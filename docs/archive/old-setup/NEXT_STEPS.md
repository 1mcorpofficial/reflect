# Sekantys žingsniai po Postgres įdiegimo

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

## ✅ Postgres įdiegtas ir duomenų bazė sukurta!

Dabar reikia:

## 1. Eikite į projekto katalogą

```bash
cd "/home/mcorpofficial/projektai/julios projekt/reflectus-app"
```

## 2. Patikrinkite ar .env failas teisingas

Jei `.env` failas jau egzistuoja, patikrinkite ar `DATABASE_URL` teisingas.

Lokali Postgres dažniausiai naudoja:
- Vartotojas: `postgres`
- Slaptažodis: dažniausiai tuščias (jei įdėjote per pg_hba.conf) arba jūsų nustatytas

Redaguokite `.env` failą:
```bash
nano .env
```

Jei Postgres neturi slaptažodžio (default), naudokite:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/reflectus"
```

Arba jei turite slaptažodį:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/reflectus"
```

## 3. Patikrinkite ar Postgres veikia

```bash
sudo systemctl status postgresql
```

Jei neveikia:
```bash
sudo systemctl start postgresql
```

## 4. Migruokite duomenų bazę

```bash
cd "/home/mcorpofficial/projektai/julios projekt/reflectus-app"
npm run db:migrate
```

## 5. Įdėkite demo duomenis

```bash
npm run db:seed
```

## 6. Paleiskite dev server

```bash
npm run dev
```

Tada atidarykite http://localhost:3000

## Troubleshooting

### Jei migracija nepavyko su "authentication failed"

1. Patikrinkite Postgres authentication:
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

2. Raskite eilutę su `localhost` ir `md5` arba `scram-sha-256`, pakeiskite į `trust`:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
```

3. Perkraukite Postgres:
```bash
sudo systemctl restart postgresql
```

4. Tada migruokite dar kartą:
```bash
npm run db:migrate
```

### Jei vis dar neveikia

Patikrinkite ar duomenų bazė tikrai sukurta:
```bash
psql -U postgres -l | grep reflectus
```

Jei nemato, sukurkite dar kartą:
```bash
sudo -u postgres psql -c "CREATE DATABASE reflectus;"
```
