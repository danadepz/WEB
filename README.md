# Intramurals Tournament System — Decoupled Monorepo

A clean, decoupled monorepo for the **Intramurals Tournament Management System**, consisting of:
1. **`/backend`**: Node.js / Express REST API, tournament logic, and Firestore read/admin operations.
2. **`/web`**: Responsive, mobile-friendly viewing-only portal for students and spectators with minimal coordinator scoring controls.

---

## 📁 Repository Structure

```
WEB/
├── package.json            ← Root npm workspace config & convenience scripts
├── .gitignore              ← Unified gitignore (node_modules, build outputs, env files)
├── firebase.json           ← Firebase Hosting config (points to web/dist)
├── firestore.rules         ← Firestore security rules (quota-optimised, read-first)
│
├── backend/                ← Node.js / Express REST API
│   ├── package.json        ← Isolated backend dependencies
│   ├── .env.example        ← Environment template (PORT, FIREBASE_*, CORS_ORIGIN)
│   ├── README.md           ← Backend endpoint reference & setup
│   └── src/
│       ├── index.js                ← Express app entry point & CORS
│       ├── config/firebase.js      ← Firebase Admin SDK initialization
│       ├── controllers/            ← Tournament, leaderboard, auth, stats
│       ├── routes/                 ← Express route handlers
│       └── services/               ← Business logic engines (standings, scoring)
│
└── web/                    ← Student Viewing Portal (Vite + React)
    ├── package.json        ← Isolated web dependencies
    ├── .env.example        ← Client env (VITE_FIREBASE_*, VITE_API_BASE_URL)
    ├── README.md           ← Web viewer documentation
    ├── vite.config.js      ← Vite build configuration
    ├── index.html          ← Entry HTML (viewport-optimized for mobile browsers)
    ├── public/             ← Static assets, images, logos
    └── src/
        ├── components/     ← Public viewing screens, bracket, leaderboard, ticker
        ├── context/        ← Tournament & Auth contexts
        ├── modules/        ← Firebase client SDK, domain engines
        └── services/api.js ← Backend REST API client
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install All Dependencies
From the repository root:
```bash
npm install
```

---

## 🏃 Local Development

| Application | Command | Local URL |
|---|---|---|
| **Backend API** | `npm run dev:backend` | `http://localhost:5000` |
| **Web Viewer** | `npm run dev:web` | `http://localhost:5173` |

Or work in either folder independently:
```bash
# Backend
cd backend
cp .env.example .env
npm run dev

# Web Portal
cd web
cp .env.example .env
npm run dev
```

---

## 📱 Web Viewing Portal Highlights

- **Anonymous Public Access**: Students view match tickers, brackets, standings, and leaderboards without requiring login or registration.
- **Live Match Ticker**: Real-time score ticker powered by a targeted Firestore `onSnapshot` query filtered strictly to active matches (`status == 'LIVE'`).
- **Department Leaderboard**: Quota-optimized overall medal and point tally reading from a single summary document (`leaderboard/summary`), with offline fallback.
- **Mobile-Responsive UI**: Built with Tailwind CSS and responsive flex/grid layouts providing an app-like experience in mobile browsers.
- **Coordinator Scoring Panel**: Protected `/admin` control room and match result entry restricted to authenticated event coordinators.

---

## 🌍 Production Deployment

### 1. Web Portal → Vercel
1. In Vercel, import the repository.
2. Set **Root Directory** to `web`.
3. Set **Framework Preset** to `Vite`.
4. Add environment variables from `web/.env.example`.
5. Deploy.

### 2. Web Portal → Firebase Hosting
From repository root (using the root `firebase.json`):
```bash
npm --prefix web run build
firebase deploy --only hosting
```

### 3. Backend API → Render
1. In Render, create a new **Web Service** from this GitHub repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node src/index.js`.
5. Add environment variables from `backend/.env.example`.
