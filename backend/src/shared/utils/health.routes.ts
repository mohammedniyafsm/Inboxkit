import { Router, Request, Response } from 'express';
import { success } from './response.util';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
    const healthData = {
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    };

    success(res, healthData, 'Server is running', 200);
});

export default router;
