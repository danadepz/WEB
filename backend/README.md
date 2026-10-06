# Backend API — Intramurals Tournament System

Node.js / Express REST API providing business logic, authentication, and Firestore integration.

## Tech Stack

- **Runtime**: Node.js >= 18
- **Framework**: Express 4
- **Auth**: Firebase Admin SDK (token verification)
- **Database**: Firebase Firestore (Admin SDK)
- **Config**: dotenv

## Setup

```bash
cd backend
cp .env.example .env
# Fill in your Firebase service account credentials in .env
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | Environment (`development` / `production`) |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |

Alternatively, set `FIREBASE_SERVICE_ACCOUNT_PATH` pointing to a downloaded `service-account-key.json` file.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Server health check |
| `GET` | `/api/tournaments` | — | Get current tournament data |
| `PUT` | `/api/tournaments` | Bearer | Update tournament data |
| `GET` | `/api/tournaments/standings` | — | Get computed standings |
| `POST` | `/api/registrations` | — | Submit team registration |
| `GET` | `/api/registrations` | Bearer | List all registrations |
| `GET` | `/api/auth/role` | Bearer | Check organizer role |
| `GET` | `/api/stats` | — | Get player statistics |

## Deployment (Render)

1. Connect your GitHub repo to Render.
2. Set **Root Directory** → `backend`
3. Set **Build Command** → `npm install`
4. Set **Start Command** → `node src/index.js`
5. Add all environment variables from `.env.example` in the Render dashboard.
