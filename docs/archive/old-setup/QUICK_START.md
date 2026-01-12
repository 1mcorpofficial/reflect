# Greitas startas (Quick Start)

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

## Problema: Docker nėra įdiegtas

Jei neturite Docker, naudokite lokalią PostgreSQL. Žiūrėkite `INSTALL_POSTGRES.md`.

## Greitas sprendimas (Docker)

Jei turite Docker, bet ne `docker-compose`:

```bash
# Pabandykite naujesnę versiją (docker compose be brūkšnelio)
docker compose up -d db

# Arba įdiekite docker-compose
sudo apt install docker-compose
# Tada
docker-compose up -d db
```

## Patikrinkite ar Postgres veikia

```bash
# Jei naudojate Docker
docker ps | grep postgres

# Arba patikrinkite portą
nc -zv localhost 5432
```

Jei matote "succeeded" - Postgres veikia!

## Kiti žingsniai

Tada tęskite nuo **3. Migruokite DB** žingsnio SETUP.md faile.

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

## Jei vis dar neveikia

1. Patikrinkite `.env` failą - ar `DATABASE_URL` teisingas?
2. Patikrinkite ar Postgres tikrai veikia: `psql -l` arba `docker ps`
3. Patikrinkite ar portas 5432 laisvas: `lsof -i :5432` (Linux/macOS)
