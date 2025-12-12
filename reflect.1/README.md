# Reflect App - Mokinių Refleksijų Platforma

Aplikacija mokiniams atsakyti į refleksijų klausimynus, o mokytojams matyti statistiką.

## Struktūra

```
reflect.1/
├── backend/              # Node.js + Express serveris
│   ├── src/
│   │   ├── models/      # Duomenų modeliai (jei bus DB)
│   │   ├── routes/      # API maršrutai
│   │   ├── controllers/ # Verslo logika
│   │   ├── middleware/  # Autentifikacija, validacija
│   │   ├── config/      # Konfiguracija
│   │   └── server.js    # Pagrindinis failas
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/            # React + Vite kliento pusė
    ├── src/
    │   ├── components/  # Dažnai naudojami UI komponentai
    │   ├── pages/       # Puslapiai
    │   ├── hooks/       # React custom hooks
    │   ├── api/         # API iškvietimų funkcijos
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── .gitignore
```

## Instaliacija

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Serveris startuos `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacija pasiekiama `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Registracija
- `POST /api/auth/login` - Prisijungimas
- `GET /api/auth/me` - Gauti vartotojo info

### Grupės
- `POST /api/groups` - Sukurti grupę
- `GET /api/groups` - Mano grupės
- `POST /api/groups/join` - Prisijungti su kodu
- `GET /api/groups/:id` - Grupės detalės

### Klausimynai
- `POST /api/questionnaires` - Sukurti klausimyną
- `GET /api/questionnaires` - Sąrašas
- `GET /api/questionnaires/:id` - Detalės
- `POST /api/questionnaires/:id/responses` - Pateikti atsakymus
- `GET /api/questionnaires/:id/responses/summary` - Statistika

## Tolimieji žingsniai

1. **Duomenų bazė** - Integruoti MongoDB su Mongoose
2. **Autentifikacija** - Sustiprinti JWT su refresh tokens
3. **Mokinių UI** - Klausimyno užpildymo forma
4. **Mokytojo UI** - Grupės valdymas, statistikos grafikai
5. **PWA** - Offline režimas, instaliacijos galimybė
