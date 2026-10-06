import { Router } from 'express';
import { getTournamentData, updateTournamentData, getStandings } from '../controllers/tournamentController.js';
import { verifyToken } from '../controllers/authController.js';

const router = Router();

router.get('/', getTournamentData);
router.put('/', verifyToken, updateTournamentData);
router.get('/standings', getStandings);

export default router;
