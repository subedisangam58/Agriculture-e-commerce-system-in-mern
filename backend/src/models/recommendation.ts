import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
    productId: mongoose.Types.ObjectId;
    recommendedProducts: mongoose.Types.ObjectId[];
    updatedAt: Date;
}

const recommendationSchema: Schema<IRecommendation> = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster product-based recommendation lookup
recommendationSchema.index({ productId: 1 });

// Auto-update `updatedAt` timestamp on save
recommendationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Recommendation = mongoose.model<IRecommendation>('Recommendation', recommendationSchema);

export default Recommendation;
