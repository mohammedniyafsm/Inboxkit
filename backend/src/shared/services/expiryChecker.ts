import Card from '../models/Card.model';
import { broadcastCardExpired } from './realtimeBroadcast';

const CHECK_INTERVAL_MS = 5000;

let intervalId: NodeJS.Timeout | null = null;

async function checkExpiredCards() {
    try {
        const now = new Date();
        const expiredCards = await Card.find({
            ownerId: { $ne: null },
            expiresAt: { $lte: now },
        });

        if (expiredCards.length === 0) return;

        await Card.updateMany(
            {
                _id: { $in: expiredCards.map((c: any) => c._id) },
                expiresAt: { $lte: now },
            },
            { $set: { ownerId: null, expiresAt: null } }
        );

        for (const card of expiredCards) {
            const clearedCard = card.toObject();
            clearedCard.ownerId = null;
            clearedCard.expiresAt = null;
            broadcastCardExpired(clearedCard);
        }
    } catch (err) {
        console.error('[ExpiryChecker] Error:', err);
    }
}

export function startExpiryChecker() {
    if (intervalId) return;
    intervalId = setInterval(checkExpiredCards, CHECK_INTERVAL_MS);
}

export function stopExpiryChecker() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}
