<p align="center">
  <img src="public/images/logo/logo-optimized.png" alt="WEBMASTERS Esports Logo" width="128" />
</p>

<h1 align="center">Web Viewing Portal</h1>

<p align="center">
  <b>Student Live-Viewing Portal & Coordinator Control Room</b><br />
  University of Cebu – Banilad
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Firebase-v12-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
</p>

---

Built with **Vite + React**, styled with **Tailwind CSS v4** and **Bootstrap 5**. Connects directly to Firebase Firestore for real-time live spectator viewing and optionally to the `/backend` Express API.

## Tech Stack

- **Build Tool**: Vite 8
- **Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4, Bootstrap 5, Bootstrap Icons
- **Icons**: Lucide React
- **Database**: Firebase Firestore (Client SDK)
- **Auth**: Firebase Authentication (Coordinator only)

## Setup

```bash
cd web
cp .env.example .env
# Fill in your Firebase project config values
npm install
npm run dev
```

The app runs at **http://localhost:5173** by default.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID |
| `VITE_API_BASE_URL` | Backend API base URL (default: `http://localhost:5000`) |

## Key Viewing Features

| Feature | Component | Description |
|---|---|---|
| **Live Ticker** | `LiveTickerBanner` | Horizontal real-time score marquee for active matches |
| **Leaderboard** | `DepartmentLeaderboard` | Single summary document read for medal/point tally |
| **Landing Page** | `LandingPage` | Home hero and tournament overview |
| **Standings** | `LeagueStandingsPage` | Group standings and match results |
| **Brackets** | `PlayoffBracket` | Single & double elimination playoff brackets |
| **Player Stats** | `PlayerStatsPage` | Top performers and MVP leaderboard |
| **Coordinator Room** | `ControlRoomPage` | Password-protected match result entry |

## Build & Deploy (Firebase Hosting)

```bash
npm run build          # outputs to dist/
firebase deploy --only hosting
```

## Deploy to Vercel

1. Import the repo into Vercel.
2. Set **Root Directory** → `web`
3. Set **Framework** → `Vite`
4. Add environment variables from `.env.example`.
5. Deploy.
