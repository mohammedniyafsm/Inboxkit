import ClaimLog from '../models/ClaimLog.model';
import User from '../models/User.model';
import Card, { ICard } from '../models/Card.model';
import mongoose from 'mongoose';
import { broadcastCardUpdate, broadcastLeaderboardUpdate } from './realtimeBroadcast';

const MAX_CLAIMS = parseInt(process.env.MAX_CLAIMS || '3', 10);
const CLAIM_WINDOW_MINUTES = parseInt(process.env.CLAIM_WINDOW_MINUTES || '2', 10);
const MAX_ACTIVE_CARDS = parseInt(process.env.MAX_ACTIVE_CARDS || '2', 10);
const BASE_COOLDOWN_SECONDS = parseInt(process.env.BASE_COOLDOWN_SECONDS || '60', 10);
const TRAP_EXTRA_COOLDOWN_SECONDS = parseInt(process.env.TRAP_EXTRA_COOLDOWN_SECONDS || '300', 10); // 5 minutes penalty

export const claimCard = async (cardId: string, userId: string): Promise<ICard> => {
    const now = new Date();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.cooldownUntil && user.cooldownUntil > now) {
        const remainingSeconds = Math.ceil((user.cooldownUntil.getTime() - now.getTime()) / 1000);
        throw new Error(`Cooldown active. Wait ${remainingSeconds} seconds.`);
    }

    const activeCardsCount = await Card.countDocuments({
        ownerId: userId,
        expiresAt: { $gt: now },
    });

    if (activeCardsCount >= MAX_ACTIVE_CARDS) {
        throw new Error(`You can only have ${MAX_ACTIVE_CARDS} active cards.`);
    }

    const windowStart = new Date(now.getTime() - CLAIM_WINDOW_MINUTES * 60000);
    const recentClaims = await ClaimLog.countDocuments({
        userId,
        claimedAt: { $gte: windowStart },
    });

    if (recentClaims >= MAX_CLAIMS) {
        throw new Error(`Rate limit exceeded. Max ${MAX_CLAIMS} claims every ${CLAIM_WINDOW_MINUTES} minutes.`);
    }

    const card = await Card.findOne({ _id: cardId });
    if (!card) throw new Error('Card not found');

    const isAvailable = !card.ownerId || (card.expiresAt && card.expiresAt < now);

    if (!isAvailable) {
        throw new Error('Card is already taken');
    }

    const durationMinutes = card.duration;
    const expiresAt = new Date(now.getTime() + durationMinutes * 60000);

    const updatedCard = await Card.findOneAndUpdate(
        {
            _id: cardId,
            $or: [
                { ownerId: null },
                { expiresAt: { $lt: now } }
            ]
        },
        {
            ownerId: userId,
            expiresAt: expiresAt,
        },
        { new: true }
    );

    if (!updatedCard) {
        throw new Error('Card was just claimed by someone else.');
    }

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

    // Execute updates
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

    // Notify Realtime Server
    broadcastCardUpdate(updatedCard);

    // Notify Leaderboard Update
    if (updatedUser) {
        broadcastLeaderboardUpdate({
            userId: updatedUser._id.toString(),
            username: updatedUser.username,
            totalPoints: updatedUser.totalPoints
        });
    }

    return updatedCard;
};

interface CreateCardInput {
    name: string;
    image: string;
    points: number;
    duration: number;
    type: 'normal' | 'rare' | 'trap';
    ownerId?: string;
    expiresAt?: Date;
}

export const createCard = async (data: CreateCardInput): Promise<ICard> => {
    const { name, image, points, type, duration, ownerId, expiresAt } = data;

    const cardData: any = {
        name,
        image,
        points,
        type,
        duration,
        ownerId: ownerId ? new mongoose.Types.ObjectId(ownerId) : null,
        expiresAt: expiresAt || null,
    };

    const card = await Card.create(cardData);
    return card;
};

export const getAllCards = async (): Promise<ICard[]> => {
    const cards = await Card.find().populate('ownerId', 'username email').sort({
        createdAt: -1,
    });
    return cards;
};

export const getCardsForUser = async (userId: string): Promise<ICard[]> => {
    const cards = await Card.find({ ownerId: userId }).sort({
        createdAt: -1,
    });
    return cards;
};

export const deleteCard = async (cardId: string): Promise<ICard> => {
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        throw new Error('Invalid card ID');
    }

    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
        throw new Error('Card not found');
    }

    return card;
};

export const getCardById = async (cardId: string): Promise<ICard> => {
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        throw new Error('Invalid card ID');
    }

    const card = await Card.findById(cardId).populate(
        'ownerId',
        'username email'
    );

    if (!card) {
        throw new Error('Card not found');
    }

    return card;
};

export const updateCard = async (
    cardId: string,
    updates: Partial<ICard>
): Promise<ICard> => {
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        throw new Error('Invalid card ID');
    }

    const card = await Card.findByIdAndUpdate(cardId, updates, {
        new: true,
    }).populate('ownerId', 'username email');

    if (!card) {
        throw new Error('Card not found');
    }

    return card;
};
