import Card from '../models/Card.model';
import { broadcastCardExpired } from './realtimeBroadcast';

/**
 * Background worker to reset expired cards and broadcast expiration events.
 * Runs every 10 seconds.
 */
export function startExpirationChecker() {
  setInterval(async () => {
    const now = new Date();
    try {
      // Find all cards that are expired and still owned
      const expiredCards = await Card.find({
        expiresAt: { $lt: now },
        ownerId: { $ne: null },
      });
      for (const card of expiredCards) {
        // Reset ownership and expiration
        card.ownerId = null;
        card.expiresAt = null;
        await card.save();
        // Broadcast expiration event
        broadcastCardExpired(card);
      }
    } catch (err) {
      console.error('[ExpirationChecker] Error:', err);
    }
  }, 10000);
}
