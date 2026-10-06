import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tournamentRoutes from './routes/tournamentRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// --- 404 Fallback ---
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Global Error Handler ---
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Intramurals Backend API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Tournament:   http://localhost:${PORT}/api/tournaments`);
  console.log(`   Standings:    http://localhost:${PORT}/api/tournaments/standings`);
  console.log(`   Leaderboard:  http://localhost:${PORT}/api/leaderboard`);
  console.log(`   Registrations:http://localhost:${PORT}/api/registrations`);
  console.log(`   Stats:        http://localhost:${PORT}/api/stats\n`);
});
