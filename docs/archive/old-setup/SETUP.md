# Greitas paleidimas (Quick Setup)

> ⚠️ Deprecated: naudokite `docs/audit/RUNBOOK_DEV.md` kaip kanoninį runbook.

## 1. Įdiekite dependencies

```bash
npm install
```

## 2. Sukurkite .env failą

```bash
cp env.example .env
```

Redaguokite `.env` ir nustatykite `AUTH_SECRET`. Galite generuoti su:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Paleiskite Postgres

### Variantas A: Docker (rekomenduojama)

```bash
docker-compose up -d db
```

Palaukite 5 sekundes, kad Postgres pilnai užsikrautų.

**Jei neturite Docker Compose:**
```bash
# Ubuntu/Debian
sudo apt install docker-compose

# Arba naudokite docker compose (be brūkšnelio - naujesnė versija)
docker compose up -d db
```

### Variantas B: Lokali Postgres

Jei turite įdiegtą PostgreSQL, tiesiog sukurkite duomenų bazę:

```bash
sudo -u postgres psql
CREATE DATABASE reflectus;
\q
```

Tada `.env` faile naudokite jūsų Postgres connection string.

## 4. Migruokite DB

```bash
npm run db:migrate
```

Jei matote "database does not exist", palaukite dar 5 sekundes ir pakartokite.

## 5. (Pasirenkama) Įdėkite demo duomenis

```bash
npm run db:seed
```

Sukurs:
- Fasilitatorius: `demo@reflectus.local` / `demo1234`
- Demo grupę su dalyviais
- Demo veiklą

## 6. Paleiskite dev server

```bash
npm run dev
```

Atsidarykite [http://localhost:3000](http://localhost:3000)

## Testavimas

### Demo prisijungimas (po seed)

**Fasilitatorius**:
- Eikite į: [http://localhost:3000/facilitator/login](http://localhost:3000/facilitator/login)
- Email: `demo@reflectus.local`
- Password: `demo1234`

**Dalyvis**:
- Eikite į: [http://localhost:3000/participant/login](http://localhost:3000/participant/login)
- Grupės kodas: pažiūrėkite `/facilitator/[groupId]` puslapyje
- Asmeninis kodas: bus sugeneruotas importuojant dalyvius

## Troubleshooting

### "AUTH_SECRET is not set"
Patikrinkite `.env` failą.

### Postgres neveikia
```bash
docker-compose down
docker-compose up -d db
# Palaukite 5 sekundes
npm run db:migrate
```

### Migracija nepavyko
```bash
docker-compose down -v  # Ištrina duomenis!
docker-compose up -d db
npm run db:migrate
npm run db:seed
```
