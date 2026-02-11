import { Router, Request, Response } from 'express';
import { broadcast } from '../websocket';

const router = Router();

const verifyInternalSecret = (req: Request, res: Response, next: Function) => {
    const secret = req.headers['x-internal-secret'];
    const expectedSecret = process.env.INTERNAL_SECRET;

    if (!expectedSecret) {
        console.error('INTERNAL_SECRET not set in environment variables');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid internal secret' });
    }

    next();
};


router.post('/card-update', verifyInternalSecret, (req: Request, res: Response) => {
    const { card } = req.body;

    if (!card) {
        return res.status(400).json({ error: 'Missing card data' });
    }

    try {
        broadcast('cardUpdated', card);
        return res.json({ success: true, message: 'Broadcast triggered' });
    } catch (error) {
        console.error('Broadcast error:', error);
        return res.status(500).json({ error: 'Failed to broadcast' });
    }
});

router.post('/leaderboard-update', verifyInternalSecret, (req: Request, res: Response) => {
    const { leaderboardEntry } = req.body;

    if (!leaderboardEntry) {
        return res.status(400).json({ error: 'Missing leaderboard data' });
    }

    try {
        broadcast('leaderboardUpdated', leaderboardEntry);
        return res.json({ success: true, message: 'Leaderboard broadcast triggered' });
    } catch (error) {
        console.error('Broadcast error:', error);
        return res.status(500).json({ error: 'Failed to broadcast' });
    }
});

export default router;
