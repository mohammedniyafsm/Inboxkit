import Card, { ICard } from '../../shared/models/Card.model';
import mongoose from 'mongoose';

export const findById = async (id: string): Promise<ICard | null> => {
    return Card.findById(id).populate('ownerId', 'username email');
};

export const findAll = async (): Promise<ICard[]> => {
    return Card.find().populate('ownerId', 'username email').sort({ createdAt: -1 });
};

export const findByOwner = async (userId: string): Promise<ICard[]> => {
    return Card.find({ ownerId: userId }).sort({ createdAt: -1 });
};

export const findOne = async (filter: any): Promise<ICard | null> => {
    return Card.findOne(filter);
};

export const countActiveByOwner = async (userId: string, now: Date): Promise<number> => {
    return Card.countDocuments({
        ownerId: userId,
        expiresAt: { $gt: now },
    });
};

export const findExpiredWithOwners = async (now: Date): Promise<ICard[]> => {
    return Card.find({
        ownerId: { $ne: null },
        expiresAt: { $lte: now },
    });
};

export const clearExpired = async (cardIds: string[], now: Date): Promise<void> => {
    await Card.updateMany(
        {
            _id: { $in: cardIds },
            expiresAt: { $lte: now },
        },
        {
            $set: { ownerId: null, expiresAt: null },
        }
    );
};

export const atomicClaim = async (cardId: string, userId: string, expiresAt: Date, now: Date): Promise<ICard | null> => {
    return Card.findOneAndUpdate(
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
    ).populate('ownerId', 'username email');
};

export const create = async (data: any): Promise<ICard> => {
    return Card.create(data);
};

export const update = async (id: string, updates: Partial<ICard>): Promise<ICard | null> => {
    return Card.findByIdAndUpdate(id, updates, { new: true }).populate('ownerId', 'username email');
};

export const remove = async (id: string): Promise<ICard | null> => {
    return Card.findByIdAndDelete(id);
};
