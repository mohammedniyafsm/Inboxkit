import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/me', authenticate as any, authController.getMe);
router.get('/leaderboard', authController.getLeaderboard);

export default router;
