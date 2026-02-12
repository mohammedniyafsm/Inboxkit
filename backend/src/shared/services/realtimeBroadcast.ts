import fetch from 'node-fetch';
import { ICard } from '../models/Card.model';

const REALTIME_URL = process.env.REALTIME_SERVER_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

function postToRealtime(path: string, body: any) {
    if (!REALTIME_URL || !INTERNAL_SECRET) {
        console.warn('[RealtimeBroadcast] Config missing, skipping broadcast');
        return;
    }
    fetch(`${REALTIME_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': INTERNAL_SECRET,
        },
        body: JSON.stringify(body),
    }).catch((err) => console.error('[RealtimeBroadcast] Failed:', err));
}

export function broadcastCardUpdate(card: ICard) {
    postToRealtime('/internal/broadcast/card-update', { card });
}

export function broadcastCardExpired(card: ICard) {
    postToRealtime('/internal/broadcast/card-expired', { card });
}

export function broadcastLeaderboardUpdate(leaderboardEntry: { userId: string; username: string; totalPoints: number }) {
    postToRealtime('/internal/broadcast/leaderboard-update', { leaderboardEntry });
}
