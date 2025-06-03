import mongoose from 'mongoose';
import Recommendation from '../models/recommendation';

export async function updateRecommendationsForOrder(productIds: string[]) {
    for (let i = 0; i < productIds.length; i++) {
        for (let j = 0; j < productIds.length; j++) {
            if (i === j) continue;
            const currentProduct = productIds[i];
            const recommendedProduct = productIds[j];
            const rec = await Recommendation.findOne({ productId: currentProduct });
            const recommendedProductId = new mongoose.Types.ObjectId(recommendedProduct);
            if (rec) {
                if (!rec.recommendedProducts.includes(recommendedProductId)) {
                    rec.recommendedProducts.push(recommendedProductId);
                    rec.updatedAt = new Date();
                    await rec.save();
                }
            } else {
                await Recommendation.create({
                    productId: currentProduct,
                    recommendedProducts: [recommendedProduct],
                });
            }
        }
    }
}
