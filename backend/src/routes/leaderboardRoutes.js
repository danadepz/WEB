import { Router } from 'express';
import { getLeaderboard, refreshLeaderboard } from '../controllers/leaderboardController.js';
import { verifyToken } from '../controllers/authController.js';

const router = Router();

// Public read — returns the pre-computed summary document (very low quota cost)
router.get('/', getLeaderboard);

// Protected write — called by coordinators after score updates to rebuild the summary
router.post('/refresh', verifyToken, refreshLeaderboard);

export default router;
