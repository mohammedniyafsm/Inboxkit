import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
    name: string;
    description?: string;
    category?: string;
    image: string;
    points: number;
    duration: number;
    type: 'normal' | 'rare' | 'trap';
    ownerId: mongoose.Types.ObjectId | null;
    expiresAt: Date | null;
    createdAt: Date;
}

const cardSchema = new Schema<ICard>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, 'Card name must be at least 2 characters long'],
            maxlength: [50, 'Card name cannot exceed 50 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        category: {
            type: String,
            trim: true,
            maxlength: [50, 'Category cannot exceed 50 characters'],
            default: '',
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
        points: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['normal', 'rare', 'trap'],
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

cardSchema.index({ type: 1 });
cardSchema.index({ ownerId: 1 });
cardSchema.index({ expiresAt: 1 });
cardSchema.index({ ownerId: 1, expiresAt: 1 });

const Card = mongoose.model<ICard>('Card', cardSchema);
export default Card;
