import { Router } from 'express';
import { getPlayerStats } from '../controllers/statsController.js';

const router = Router();

router.get('/', getPlayerStats);

export default router;
