import { Router } from 'express';
import { checkOrganizerRole, verifyToken } from '../controllers/authController.js';

const router = Router();

router.get('/role', verifyToken, checkOrganizerRole);

export default router;
