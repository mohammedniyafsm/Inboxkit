import { ICard } from '../../shared/models/Card.model';
import * as cardRepo from './card.repository';
import User from '../../shared/models/User.model';
import ClaimLog from '../../shared/models/ClaimLog.model';
import { broadcastCardUpdate, broadcastLeaderboardUpdate } from '../../shared/services/realtimeBroadcast';

const MAX_CLAIMS = parseInt(process.env.MAX_CLAIMS || '3', 10);
const CLAIM_WINDOW_MINUTES = parseInt(process.env.CLAIM_WINDOW_MINUTES || '2', 10);
const MAX_ACTIVE_CARDS = parseInt(process.env.MAX_ACTIVE_CARDS || '2', 10);
const BASE_COOLDOWN_SECONDS = parseInt(process.env.BASE_COOLDOWN_SECONDS || '60', 10);
const TRAP_EXTRA_COOLDOWN_SECONDS = parseInt(process.env.TRAP_EXTRA_COOLDOWN_SECONDS || '300', 10);

export const getAllCards = async (): Promise<ICard[]> => {
    return cardRepo.findAll();
};

export const getCardById = async (id: string): Promise<ICard> => {
    const card = await cardRepo.findById(id);
    if (!card) throw new Error('Card not found');
    return card;
};

export const claimCard = async (cardId: string, userId: string): Promise<ICard> => {
    const now = new Date();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // 1. Cooldown check
    if (user.cooldownUntil && user.cooldownUntil > now) {
        const remainingSeconds = Math.ceil((user.cooldownUntil.getTime() - now.getTime()) / 1000);
        throw new Error(`Cooldown active. Wait ${remainingSeconds} seconds.`);
    }

    // 2. Active cards limit check
    const activeCardsCount = await cardRepo.countActiveByOwner(userId, now);
    if (activeCardsCount >= MAX_ACTIVE_CARDS) {
        throw new Error(`You can only have ${MAX_ACTIVE_CARDS} active cards.`);
    }

    // 3. Rate limit check
    const windowStart = new Date(now.getTime() - CLAIM_WINDOW_MINUTES * 60000);
    const recentClaims = await ClaimLog.countDocuments({
        userId,
        claimedAt: { $gte: windowStart },
    });

    if (recentClaims >= MAX_CLAIMS) {
        throw new Error(`Rate limit exceeded. Max ${MAX_CLAIMS} claims every ${CLAIM_WINDOW_MINUTES} minutes.`);
    }

    // 4. Availability check (pre-flight)
    const card = await cardRepo.findById(cardId);
    if (!card) throw new Error('Card not found');

    const isAvailable = !card.ownerId || (card.expiresAt && card.expiresAt < now);
    if (!isAvailable) throw new Error('Card is already taken');

    // 5. Atomic Capture
    const durationSeconds = card.duration;
    const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

    const updatedCard = await cardRepo.atomicClaim(cardId, userId, expiresAt, now);
    if (!updatedCard) {
        throw new Error('Card was just claimed by someone else.');
    }

    // 6. Points and Cooldown calculation
    let pointsChange = 0;
    let cooldownSeconds = BASE_COOLDOWN_SECONDS;

    if (updatedCard.type === 'normal') {
        pointsChange = updatedCard.points;
    } else if (updatedCard.type === 'rare') {
        pointsChange = updatedCard.points * 2;
    } else if (updatedCard.type === 'trap') {
        pointsChange = -Math.abs(updatedCard.points);
        cooldownSeconds += TRAP_EXTRA_COOLDOWN_SECONDS;
    }

    const currentCooldownEnd = user.cooldownUntil && user.cooldownUntil > now ? user.cooldownUntil.getTime() : now.getTime();
    const newCooldownUntil = new Date(currentCooldownEnd + cooldownSeconds * 1000);

    // 7. Update User and Log
    const [updatedUser] = await Promise.all([
        User.findByIdAndUpdate(userId, {
            $inc: { totalPoints: pointsChange },
            cooldownUntil: newCooldownUntil,
        }, { new: true }),
        ClaimLog.create({
            userId,
            cardId,
            claimedAt: now,
        })
    ]);

    // 8. Notify Realtime Server
    broadcastCardUpdate(updatedCard);
    if (updatedUser) {
        broadcastLeaderboardUpdate({
            userId: updatedUser._id.toString(),
            username: updatedUser.username,
            totalPoints: updatedUser.totalPoints
        });
    }

    return updatedCard;
};

export const createCard = async (data: any): Promise<ICard> => {
    return cardRepo.create(data);
};

export const deleteCard = async (id: string): Promise<ICard> => {
    const card = await cardRepo.remove(id);
    if (!card) throw new Error('Card not found');
    return card;
};

export const updateCard = async (id: string, updates: Partial<ICard>): Promise<ICard> => {
    const card = await cardRepo.update(id, updates);
    if (!card) throw new Error('Card not found');
    return card;
};
