import mongoose, { Schema, Document } from 'mongoose';

export interface IClaimLog extends Document {
    userId: mongoose.Types.ObjectId;
    cardId: mongoose.Types.ObjectId;
    claimedAt: Date;
}

const claimLogSchema = new Schema<IClaimLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        cardId: {
            type: Schema.Types.ObjectId,
            ref: 'Card',
            required: true,
        },
        claimedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);


claimLogSchema.index({ userId: 1, claimedAt: -1 });

const ClaimLog = mongoose.model<IClaimLog>('ClaimLog', claimLogSchema);

export default ClaimLog;
