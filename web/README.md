# Web Client — Intramurals Tournament Portal

Student live-viewing portal and Admin/Faculty management dashboard. Built with **Vite + React**, styled with **Tailwind CSS v4** and **Bootstrap 5**. Connects to Firebase Firestore directly (client SDK) and optionally to the `/backend` Express API.

## Tech Stack

- **Build Tool**: Vite 8
- **Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4, Bootstrap 5, Bootstrap Icons
- **Icons**: Lucide React
- **Database**: Firebase Firestore (Client SDK)
- **Auth**: Firebase Authentication

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

## Key Screens

| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Home & event overview |
| `/view` | `PublicTournamentView` | Live standings (student view) |
| `/admin/login` | `AdminLoginPage` | Organizer sign-in |
| `/admin` | `ControlRoomPage` | Organizer control room |
| `/admin/teams` | `TeamManagement` | Manage registered teams |
| `/admin/schedule` | `ScheduleGenerator` | Generate match schedule |
| `/admin/results` | `MatchResultEntry` | Enter match results |
| `/admin/standings` | `LeagueStandingsPage` | Full standings view |
| `/admin/stats` | `PlayerStatsPage` | Player statistics |
| `/admin/access` | `AccessControlPage` | Manage organizer access |
| `/register` | `RegistrationPage` | Team registration form |

## Build & Deploy (Firebase Hosting)

```bash
npm run build          # outputs to dist/
firebase deploy --only hosting
```

> Firebase Hosting is configured via the root `firebase.json` pointing to `web/dist`.

## Deploy to Vercel

1. Import the repo into Vercel.
2. Set **Root Directory** → `web`
3. Set **Framework** → `Vite`
4. Add environment variables from `.env.example`.
5. Deploy — Vercel auto-detects Vite and runs `npm run build`.
