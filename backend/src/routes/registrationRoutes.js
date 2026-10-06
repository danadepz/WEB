import { Router } from 'express';
import { submitRegistration, getRegistrations } from '../controllers/registrationController.js';
import { verifyToken } from '../controllers/authController.js';

const router = Router();

router.post('/', submitRegistration);
router.get('/', verifyToken, getRegistrations);

export default router;
