# 📚 REFLECT PROJECT - IŠSAMI PROJEKTO INFORMACIJA

## 🎯 Projekto Aprašymas

**Reflect** (arba **Reflectus**) - tai edukacinė platforma mokiniams ir mokytojams, skirta refleksijų valdymui. Sistema leidžia mokiniams kurti ir pildyti refleksijas apie savo mokymąsi, o mokytojams - peržiūrėti, komentuoti ir stebėti mokinių progresą.

### Pagrindinė idėja
Aplikacija skirta mokinių refleksijų valdymui - mokiniai gali atsakyti į refleksijų klausimynus, o mokytojai gali matyti statistiką, peržiūrėti atsakymus ir palikti komentarus.

---

## 🏗️ Projekto Struktūra

### Dabar (Po Reorganizacijos)
```
reflect/
├── backend/              # Node.js + Express serveris
│   ├── src/
│   │   ├── config/       # Duomenų bazės konfigūracija
│   │   ├── controllers/  # Verslo logika (auth, groups, questionnaires)
│   │   ├── middleware/   # Autentifikacija, validacija
│   │   ├── models/       # Duomenų modeliai
│   │   ├── routes/       # API maršrutai (auth, groups, questionnaires)
│   │   └── server.js     # Pagrindinis serverio failas
│   ├── package.json
│   └── node_modules/
│
├── frontend/             # React + Vite kliento aplikacija
│   ├── src/
│   │   ├── api/          # API iškvietimų funkcijos
│   │   ├── components/   # UI komponentai
│   │   ├── data/         # Statiniai duomenys (templates)
│   │   ├── hooks/        # React custom hooks
│   │   ├── lib/          # Bibliotekos (api, mockApi, storage)
│   │   ├── pages/        # Puslapiai (student/, teacher/)
│   │   ├── stores/       # Zustand state management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── router.jsx    # React Router konfigūracija
│   │   ├── routes.js     # Route konstantos
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── README.md             # Pagrindinė projekto dokumentacija
├── IMPLEMENTATION_COMPLETE.md  # Įgyvendinimo suvestinė
├── TESTING.md            # Testavimo instrukcijos
└── PROJEKTO_INFORMACIJA.md  # Šis failas
```

---

## 🛠️ Technologijų Stekas

### Backend
- **Node.js** - Serverio aplinka
- **Express.js** (v4.18.2) - Web framework
- **bcryptjs** (v2.4.3) - Slaptažodžių šifravimas
- **jsonwebtoken** (v9.0.2) - JWT autentifikacija
- **cors** (v2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (v16.3.1) - Aplinkos kintamieji
- **nodemon** (v3.0.2) - Development serveris su auto-reload

### Frontend
- **React** (v18.2.0) - UI biblioteka
- **Vite** (v5.0.8) - Build tool ir dev serveris
- **React Router DOM** (v6.20.1) - Routing sistema
- **Zustand** (v5.0.9) - State management
- **Axios** (v1.6.2) - HTTP klientas
- **Tailwind CSS** (v4.1.18) - CSS framework
- **PostCSS** + **Autoprefixer** - CSS preprocessing
- **clsx** (v2.1.1) - Conditional classnames

### Development Tools
- **Git** - Versijų kontrolė
- **GitHub** - Repository hosting
- **ESLint/TypeScript** - Code quality (jei naudojama)

---

## 🚀 Funkcionalumas

### Mokinių (Student) Funkcijos

1. **Prisijungimas ir Autentifikacija**
   - Prisijungimas su el. paštu ir slaptažodžiu
   - Demo prisijungimo duomenys: `mokinys@pastas.lt` / `test123`

2. **Dashboard (Pagrindinis puslapis)**
   - Statistika (refleksijų skaičius, peržiūrėtos, laukiančios)
   - Greitieji veiksmai:
     - ✍️ **Refleksija** - Sukurti naują refleksiją
     - 📋 **Mano istorija** - Peržiūrėti ankstesnes refleksijas
     - 📝 **Mano užduotys** - Matyti priskirtas užduotis
   - Naujausių refleksijų sąrašas

3. **Naujos Refleksijos Kūrimas**
   - 5 skirtingi refleksijų šablonai:
     - 📚 **Pamokos refleksija** - Apie konkrečią pamoką
     - 📅 **Savaitės refleksija** - Apie savaitę
     - 📝 **Kontrolinio refleksija** - Apie kontrolinį darbą
     - 🎯 **Projekto refleksija** - Apie projektą
     - 😊 **Savijautos refleksija** - Apie emocinę būseną
   - Dinaminė forma pagal pasirinktą šabloną
   - Formos validacija

4. **Refleksijų Istorija**
   - Visų sukurtų refleksijų sąrašas
   - Statusų rodymas:
     - 🟡 **Pateikta** - Laukia mokytojo peržiūros
     - 🟢 **Peržiūrėta** - Mokytojas peržiūrėjo
     - 💬 **Su komentaru** - Mokytojas paliko komentarą
   - Detalus refleksijų peržiūros puslapis
   - Mokytojo komentarų rodymas

5. **Užduotys (Tasks)**
   - Peržiūrėti mokytojo priskirtas užduotis
   - Pildyti refleksijas pagal užduotį
   - Matyti terminus

### Mokytojų (Teacher) Funkcijos

1. **Prisijungimas**
   - Demo prisijungimo duomenys: `mokytojas@pastas.lt` / `test123`

2. **Dashboard**
   - Statistika (aktyvios užduotys, laukiančios peržiūros)
   - Greitieji veiksmai:
     - 📋 **Nauja užduotis** - Sukurti užduotį klasei
     - 🏫 **Mano klasės** - Valdyti klases
     - 👁️ **Peržiūra** - Peržiūrėti mokinių refleksijas

3. **Užduočių Valdymas**
   - Sukurti naują užduotį:
     - Pavadinimas ir aprašymas
     - Klasės pasirinkimas
     - Refleksijų šablono pasirinkimas
     - Termino nustatymas
   - Peržiūrėti sukurtas užduotis

4. **Refleksijų Peržiūra**
   - Matyti visas mokinių refleksijas
   - Filtruoti pagal statusą (laukia, peržiūrėta, su komentaru)
   - Detalus refleksijų peržiūros puslapis
   - Palikti komentarus mokiniams
   - Statusų keitimas (peržiūrėta)

5. **Klasės Valdymas**
   - Peržiūrėti sukurtas klases
   - Matyti klasių narius
   - (Planuojama: kurti/redaguoti klases)

---

## 📁 Pagrindiniai Failai ir Jų Paskirtis

### Backend Failai

**`backend/src/server.js`**
- Express serverio inicijavimas
- Middleware konfigūracija (CORS, body parser)
- Route'ų registracija
- Serverio paleidimas

**`backend/src/routes/`**
- `auth.js` - Autentifikacijos route'ai (login, register, me)
- `groups.js` - Grupių/klasių route'ai
- `questionnaires.js` - Klausimynų/refleksijų route'ai

**`backend/src/controllers/`**
- `authController.js` - Autentifikacijos logika
- `groupController.js` - Grupių valdymo logika
- `questionnaireController.js` - Refleksijų valdymo logika

**`backend/src/middleware/auth.js`**
- JWT token validacija
- Vartotojo autentifikacijos middleware

**`backend/src/config/database.js`**
- Duomenų bazės konfigūracija (kol kas nenaudojama)

### Frontend Failai

**`frontend/src/main.jsx`**
- React aplikacijos entry point
- React DOM renderinimas

**`frontend/src/App.jsx`**
- Pagrindinė aplikacijos komponentė
- RouterProvider wrapper

**`frontend/src/router.jsx`**
- React Router konfigūracija
- Visų route'ų apibrėžimas
- ProtectedRoute wrapper'iai

**`frontend/src/routes.js`**
- Centralizuotos route konstantos
- Naudojamos visoje aplikacijoje vietoj hardcoded string'ų

**`frontend/src/pages/`**
- `LoginPage.jsx` - Prisijungimo puslapis
- `StudentHome.jsx` - Mokinio dashboard
- `TeacherHome.jsx` - Mokytojo dashboard
- `student/` - Mokinio puslapiai (History, NewReflection, Tasks, Detail)
- `teacher/` - Mokytojo puslapiai (Review, Classes, Tasks, Detail)

**`frontend/src/components/`**
- `Layout.jsx` - Pagrindinė aplikacijos struktūra (topbar, content area)
- `PageHeader.jsx` - Puslapio antraštė su subtitle
- `ActionCard.jsx` - Klikuojama kortelė su React Router Link
- `ProtectedRoute.jsx` - Route apsauga pagal rolę
- `ui.jsx` - Bendrieji UI komponentai (Button, Card, Badge, Input, Textarea)
- `LoginForm.jsx` - Prisijungimo forma
- `TemplateCard.jsx` - Refleksijų šablonų kortelės
- `ReflectionActionDialog.jsx` - Dialogas refleksijų veiksmams

**`frontend/src/lib/`**
- `api.js` - Centralizuotas API klientas (axios wrapper)
- `mockApi.js` - Mock backend su localStorage (naudojama dabar)
- `storage.js` - localStorage helper funkcijos

**`frontend/src/stores/authStore.js`**
- Zustand store autentifikacijos valdymui
- User info, login, logout funkcijos

**`frontend/src/data/templates.js`**
- 5 refleksijų šablonų apibrėžimai
- Kiekvieno šablono laukai ir konfigūracija

**`frontend/src/api/`**
- `client.js` - Axios instance su base URL
- `auth.js` - Autentifikacijos API funkcijos
- `groups.js` - Grupių API funkcijos
- `questionnaires.js` - Klausimynų API funkcijos

**`frontend/src/hooks/`**
- `useAuth.js` - Custom hook autentifikacijai
- `useFetch.js` - Custom hook duomenų gavimui

---

## 🔐 Autentifikacija ir Saugumas

### Dabar (Mock Sistema)
- **localStorage** - Duomenys saugomi naršyklėje
- **Zustand store** - State management
- **Mock API** - Simuliuoja backend funkcionalumą
- **Demo vartotojai**:
  - Mokinys: `mokinys@pastas.lt` / `test123`
  - Mokinys 2: `mokinys2@pastas.lt` / `test123`
  - Mokytojas: `mokytojas@pastas.lt` / `test123`

### Planuojama (Backend Integracija)
- **JWT tokens** - Secure autentifikacija
- **bcryptjs** - Slaptažodžių šifravimas
- **Protected routes** - Role-based access control
- **Session management** - Server-side session handling

---

## 🎨 UI/UX Dizainas

### Stilizacija
- **Tailwind CSS v4** - Utility-first CSS framework
- **Responsive design** - Mobile-first požiūris
- **Gradient accents** - Visual hierarchy
- **Smooth transitions** - Hover effects ir animacijos

### Spalvos ir Temos
- Mėlyna - Pagrindinės akcijos
- Žalia - Teigiami veiksmai
- Geltona/Oranginė - Įspėjimai
- Pilka - Neutralūs elementai

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Pagrindiniai UI Elementai
- **ActionCard** - Didelės klikuojamos kortelės su ikonoms
- **Card** - Turinio konteineriai su šešėliais
- **Button** - Stilizuoti mygtukai su variantais
- **Badge** - Statusų rodikliai
- **Input/Textarea** - Formos laukai

---

## 📊 Duomenų Modeliai

### Refleksija (Reflection)
```javascript
{
  id: string,
  studentId: string,
  studentName: string,
  classId: string,
  templateId: string,      // Kuris šablonas naudotas
  status: 'submitted' | 'reviewed' | 'commented',
  answers: {
    // Dinaminiai laukai pagal šabloną
    [fieldName]: string | number
  },
  createdAt: string,       // ISO date string
  teacherComment?: string, // Mokytojo komentaras
  taskId?: string         // Jei susijęs su užduotimi
}
```

### Užduotis (Task)
```javascript
{
  id: string,
  title: string,
  description?: string,
  classId: string,
  templateId: string,
  teacherId: string,
  dueAt: string,          // ISO date string
  createdAt: string
}
```

### Klasė (Class/Group)
```javascript
{
  id: string,
  name: string,           // Pvz. "8A"
  teacherId: string,
  studentIds: string[]    // Mokinių ID masyvas
}
```

### Vartotojas (User)
```javascript
{
  id: string,
  email: string,
  name: string,
  role: 'student' | 'teacher',
  password: string        // Hashed (backend)
}
```

### Šablonas (Template)
```javascript
{
  id: string,
  name: string,           // Pvz. "Pamokos refleksija"
  icon: string,           // Emoji
  color: string,          // Tailwind color
  fields: [
    {
      id: string,
      label: string,
      type: 'text' | 'textarea' | 'number' | 'select',
      required: boolean,
      options?: string[]  // Jei select type
    }
  ]
}
```

---

## 🛣️ Route'ai

### Autentifikacija
- `/login` - Prisijungimo puslapis

### Mokinio Route'ai
- `/student` - Mokinio dashboard
- `/student/new` - Naujos refleksijos kūrimas (šablonų pasirinkimas)
- `/student/new/:templateId` - Refleksijos formos puslapis
- `/student/history` - Refleksijų istorija
- `/student/reflections/:id` - Refleksijos detalės
- `/student/tasks` - Užduočių sąrašas

### Mokytojo Route'ai
- `/teacher` - Mokytojo dashboard
- `/teacher/review` - Refleksijų peržiūros sąrašas
- `/teacher/reflections/:id` - Refleksijos peržiūra ir komentavimas
- `/teacher/tasks/new` - Naujos užduoties kūrimas
- `/teacher/classes` - Klasės valdymas

---

## 🔄 Versijų Istorija ir Pakeitimai

### Paskutiniai Pakeitimai (2024)

**Projekto Reorganizacija**
- Perkeltas `backend/` iš `reflect.1/` į root lygį
- Perkeltas `frontend/` iš `reflect.1/` į root lygį
- Pašalinti dublikatai (`reflectus-alt` katalogai)
- Atnaujinta dokumentacija
- Commit: `57e9465` - "Reorganize project structure"

**Priority A: Navigacija (COMPLETE ✅)**
- Sukurtas `ActionCard` komponentas su React Router Link
- Pataisyta "dead clicks" problema
- Visos kortelės dabar naudoja tikrus Link/navigate()

**Priority B: UI Layout (COMPLETE ✅)**
- Pagerinta Layout sistema su responsive padding
- Gradient backgrounds ir tekstai
- Responsive grid layout
- Professional, spacious dizainas

**Priority C: CTA Consolidation (COMPLETE ✅)**
- Sujungti dublikuojantys CTAs
- Vienas pagrindinis "Refleksija" mygtukas

---

## 🧪 Testavimas

### Manual Testavimo Procesas
Detalūs testavimo scenarijai aprašyti `TESTING.md` faile.

**Pagrindiniai Testai:**
1. Student refleksijos srautas (sukurti → matosi istorijoje)
2. Teacher peržiūra + komentaras (studentas mato)
3. Užduotys srautas (teacher sukuria → student atlieka)
4. Role Guard (mokinys negali pasiekti teacher route'ų)
5. Navigacija (visi mygtukai veikia)

### Demo Prisijungimo Duomenys
- **Mokinys**: `mokinys@pastas.lt` / `test123`
- **Mokinys 2**: `mokinys2@pastas.lt` / `test123`
- **Mokytojas**: `mokytojas@pastas.lt` / `test123`

---

## 🚀 Paleidimas

### Development Mode

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Jei yra
npm run dev           # Nodemon su auto-reload
# Serveris: http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev           # Vite dev server
# Aplikacija: http://localhost:3000
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build         # Build į dist/
npm run preview       # Preview production build
```

---

## 📝 API Endpoints (Backend)

### Autentifikacija
- `POST /api/auth/register` - Naujo vartotojo registracija
- `POST /api/auth/login` - Prisijungimas
- `GET /api/auth/me` - Gauti dabartinio vartotojo info

### Grupės/Klasės
- `POST /api/groups` - Sukurti grupę
- `GET /api/groups` - Gauti mano grupes
- `POST /api/groups/join` - Prisijungti prie grupės su kodu
- `GET /api/groups/:id` - Grupės detalės

### Klausimynai/Refleksijos
- `POST /api/questionnaires` - Sukurti klausimyną
- `GET /api/questionnaires` - Klausimynų sąrašas
- `GET /api/questionnaires/:id` - Klausimyno detalės
- `POST /api/questionnaires/:id/responses` - Pateikti atsakymus
- `GET /api/questionnaires/:id/responses/summary` - Statistika

---

## 🔮 Ateities Planai (Not Implemented)

### Priority D (Optional)
- [ ] Debug overlay elements z-index issues
- [ ] Tailwind v4 errors patikrinimas

### Future Development
- [ ] **Backend Integracija** - Pakeisti mockApi į tikrą backend
- [ ] **Duomenų Bazė** - MongoDB su Mongoose integracija
- [ ] **Pilnas CRUD** - Klasės valdymas (sukurti/redaguoti/trinti)
- [ ] **Failų Įkėlimas** - Pridėti attachments prie refleksijų
- [ ] **Real-time Notifications** - WebSocket arba Server-Sent Events
- [ ] **Data Export** - CSV/PDF eksportavimas
- [ ] **Reporting** - Statistikos grafikai ir ataskaitos
- [ ] **Password Reset** - Slaptažodžio atstatymo funkcionalumas
- [ ] **PWA** - Progressive Web App su offline režimu
- [ ] **Multi-language** - Internacionalizacija (i18n)

---

## 🐛 Žinomos Problemos ir Apribojimai

### Dabar (Mock Sistema)
- Duomenys saugomi tik localStorage - prarandami po clear cache
- Nėra tikro backend serverio - viskas mock
- Nėra duomenų bazės - viskas saugoma naršyklėje
- Nėra failų įkėlimo funkcionalumo
- Nėra real-time atnaujinimų

### UI/UX
- Kai kurie responsive dizaino patobulinimai galimi
- Galimos animacijų optimizacijos

---

## 👥 Vartotojų Role's

### Mokinys (Student)
- Gali kurti refleksijas
- Gali peržiūrėti savo refleksijų istoriją
- Gali matyti priskirtas užduotis
- Gali matyti mokytojo komentarus
- Negali matyti kitų mokinių refleksijų
- Negali kurti užduočių

### Mokytojas (Teacher)
- Gali peržiūrėti visų mokinių refleksijas
- Gali palikti komentarus
- Gali kurti užduotis klasėms
- Gali valdyti klases (kol kas ribota)
- Gali matyti statistiką
- Negali matyti mokinių slaptažodžių

---

## 📚 Šaltiniai ir Dokumentacija

### Projekto Failai
- `README.md` - Pagrindinė dokumentacija
- `IMPLEMENTATION_COMPLETE.md` - Įgyvendinimo suvestinė
- `TESTING.md` - Testavimo instrukcijos
- `PROJEKTO_INFORMACIJA.md` - Šis failas

### GitHub
- Repository: `https://github.com/1mcorpofficial/reflect.git`
- Branch: `main`
- Paskutinis commit: `57e9465` - "Reorganize project structure"

### Technologijų Dokumentacija
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com
- Zustand: https://zustand-demo.pmnd.rs
- Express: https://expressjs.com

---

## 🎓 Projekto Istorija

Projektas pradėtas kaip edukacinė platforma mokinių refleksijų valdymui. 

**Pagrindiniai etapai:**
1. ✅ Projekto struktūros sukūrimas
2. ✅ Frontend React aplikacijos kūrimas
3. ✅ Mock API su localStorage
4. ✅ UI/UX tobulinimas
5. ✅ Navigacijos pataisymai
6. ✅ Projekto reorganizacija (failų tvarkymas)
7. 🔄 Backend integracija (planuojama)
8. 🔄 Duomenų bazės integracija (planuojama)

---

## 📞 Kontaktai ir Palaikymas

Projektas yra aktyvus ir toliau vystomas. Jei turite klausimų ar pasiūlymų:
- GitHub Issues: https://github.com/1mcorpofficial/reflect/issues
- Repository: https://github.com/1mcorpofficial/reflect

---

## ✅ Kas Veikia Dabar (Verified)

✅ **Autentifikacija**
- Demo prisijungimas veikia
- Role-based redirect veikia
- Logout veikia

✅ **Navigacija**
- Visi route'ai veikia
- Nėra "dead clicks"
- React Router veikia tinkamai

✅ **Refleksijos**
- Sukūrimas veikia
- Istorija veikia
- Detalės veikia
- Mokytojo peržiūra veikia
- Komentarai veikia

✅ **Užduotys**
- Mokytojas gali kurti užduotis
- Mokinys mato užduotis
- Užduočių pildymas veikia

✅ **UI/UX**
- Responsive dizainas veikia
- Gradient dizainas veikia
- Hover effects veikia
- Professional layout

---

**Paskutinis atnaujinimas:** 2024-12-30
**Projekto būsena:** 🟢 Aktyvus development
**Versija:** 1.0.0 (Mock API fase)

