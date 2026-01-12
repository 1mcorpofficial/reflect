# Reflectus MVP 2.0

Refleksijų platforma grupėms (mokyklos, terapinės grupės, darbovietės). Mobile-first pildymas, desktop-first dashboard su aiškia statistika.

## Funkcijos (MVP 2.0)

- **Grupių valdymas**: fasilitatorius kuria grupes, importuoja dalyvius, gauna prisijungimo kodus
- **Veiklų kūrimas**: refleksijų klausimynai su privatumo režimais (vardinė/anominė)
- **Klausimų tipai**: šviesoforas, skalė/termometras, neužbaigtos frazės, laisvas tekstas
- **Mobile-first pildymas**: dalyviai užpildo telefone, su autosave ir offline palaikymu
- **Dashboard**: completion rate, pasiskirstymai, trendai, individualus progresas
- **Eksportas**: CSV/JSON su privatumo režimo gerbimu

## Nauja (MVP 4.0 – darbe)

- **Organizacijos ir rolės**: ORG_ADMIN / FACILITATOR, grupės pririštos prie org
- **Planavimas**: open/close langai veikloms, laiko zonos
- **Atsakymų statusai**: „Nežinau“ (follow-up grandinė 3–5 klausimai), „Nenoriu atsakyti“
- **Analitika**: answered/unknown/declined skaičiai per klausimą, laiko filtrai
- **Eksportai**: statusas ir follow-up meta CSV/XLSX/PDF (API)

## Reikalavimai

- Node.js 18+ ir npm
- Docker ir Docker Compose (arba lokali Postgres)
- Git

## Greitas startas

### 1. Klonuokite ir įdiekite dependencies

```bash
cd reflectus-app
npm install
```

### 2. Sukurkite `.env` failą

```bash
cp env.example .env
```

Redaguokite `.env` ir nustatykite:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reflectus"
AUTH_SECRET="pakeiskite-i-tikra-atsitiktine-eilute-min-32-simboliai"
```

**Svarbu**: `AUTH_SECRET` turi būti tikras, ilgas atsitiktinis stringas (pvz. 32+ simbolių). Galite generuoti su:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Paleiskite Postgres (Docker)

```bash
docker-compose up -d db
```

Patikrinkite, kad Postgres veikia:

```bash
docker-compose ps
```

### 4. Migruokite duomenų bazę

```bash
npm run db:migrate
```

Tai sukurs visas lenteles PostgreSQL.

### 5. Įdėkite demo duomenis (pasirenkama)

```bash
npm run db:seed
```

Sukurs:
- Demo fasilitatorių: `demo@reflectus.local` / `demo1234`
- Demo grupę su keliais dalyvais
- Demo veiklą su klausimais

### 6. Paleiskite dev server

```bash
npm run dev
```

Atsidarykite [http://localhost:3000](http://localhost:3000) naršyklėje.

## NPM Scripts

- `npm run dev` - Paleidžia Next.js dev server (frontend + backend API)
- `npm run build` - Build production versiją
- `npm run start` - Paleidžia production server
- `npm run lint` - Tikrina kodo kokybę
- `npm run db:migrate` - Migruoja duomenų bazę
- `npm run db:generate` - Generuoja Prisma Client
- `npm run db:seed` - Įdeda demo duomenis

## Struktūra

- **Frontend (UI)**: `/src/app/*` - Next.js App Router
  - `/` - Home page
  - `/facilitator` - Fasilitatoriaus grupių sąrašas
  - `/facilitator/[groupId]` - Grupės valdymas (importas, veiklos)
  - `/participant/login` - Dalyvio prisijungimas
  - `/participant` - Dalyvio veiklų sąrašas ir istorija
  - `/dashboard` - Analytics dashboard

- **Backend (API)**: `/src/app/api/*` - Next.js API routes
  - `/api/auth/*` - Autentifikacija (register, login, me)
  - `/api/groups/*` - Grupių valdymas
  - `/api/activities/*` - Veiklų kūrimas ir valdymas
  - `/api/participants/*` - Dalyvio endpointai

- **Duomenų bazė**: `prisma/schema.prisma` - Prisma schema
  - User, Participant, Group, Activity, Questionnaire, Question, Response, Answer
  - AnalyticsSnapshot, DataExport, AuditLog

## Testavimas

### Demo prisijungimas (po seed)

**Fasilitatorius**:
- Email: `demo@reflectus.local`
- Password: `demo123`
- URL: [http://localhost:3000/facilitator](http://localhost:3000/facilitator)

**Dalyvis**:
- Grupės kodas: pažiūrėkite `/facilitator/[groupId]` puslapyje po importo
- Asmeninis kodas: bus sugeneruotas importuojant dalyvius

### Srautai

1. **Fasilitatorius kuria veiklą**:
   - Eikite į `/facilitator`
   - Sukurkite grupę arba pasirinkite esamą
   - Importuokite dalyvius (CSV arba rankiniu būdu)
   - Sukurkite veiklą su klausimais
   - Publikuokite (`PUBLISHED` statusas)

2. **Dalyvis užpildo**:
   - Eikite į `/participant/login`
   - Įveskite grupės kodą ir asmeninį kodą
   - Matysite aktyvias veiklas (tik PUBLISHED)
   - Užpildykite ir pateikite (vieną kartą per veiklą)

3. **Fasilitatorius mato rezultatus**:
   - Dashboard: `/dashboard?activityId=...`
   - Eksportas: `/api/activities/[id]/export?format=csv`

## Troubleshooting

### Postgres neveikia

```bash
docker-compose down
docker-compose up -d db
# Palaukite 5 sekundes, tada:
npm run db:migrate
# jei migracijos buvo rollback'intos:
# npm run db:deploy
```

### "AUTH_SECRET is not set"

Patikrinkite `.env` failą - `AUTH_SECRET` turi būti nustatytas.

### "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### Duomenų bazės migracija nepavyko

```bash
# Ištrinkite ir perkurite DB (ATSAKOMINGAI - prarasite duomenis!)
docker-compose down -v
docker-compose up -d db
npm run db:migrate
# jei gaunate pranešimą apie pritaikytas migracijas arba rollback:
# npm run db:deploy
npm run db:seed
```

## Kitas žingsnis

Kai viskas veikia, galite:
- Sukurti tikrą grupę ir dalyvius
- Sukurti veiklas su klausimais
- Testuoti mobile view (Chrome DevTools → Device Toolbar)

## Technologijos

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, TypeScript
- **Duomenų bazė**: PostgreSQL + Prisma ORM
- **Auth**: JWT cookies + bcrypt
- **Deployment**: Docker Compose (dev), Vercel/Railway (production)

## Licencija

Private / Internal use only
