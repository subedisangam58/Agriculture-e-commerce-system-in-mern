import Product from '../models/product';
import UserActivity from '../models/useractivity';

export const getHybridRecommendations = async (userId: string) => {
    // Fetch recent user activity (views/purchases)
    const recentActivities = await UserActivity.find({
        userId,
        action: { $in: ['view', 'purchase'] }
    })
        .sort({ timestamp: -1 })
        .limit(5);

    // Get product IDs user interacted with
    const interactedProductIds = recentActivities.map(a => a.productId.toString());

    if (interactedProductIds.length === 0) {
        // Fallback: popular products with viewCount >= 10
        return await Product.find({ viewCount: { $gte: 10 } })
            .sort({ viewCount: -1 })
            .limit(8);
    }

    // Fetch details of interacted products
    const interactedProducts = await Product.find({ _id: { $in: interactedProductIds } }) as Array<any>;
    const categories = [...new Set(interactedProducts.map((p: any) => p.category.toLowerCase()))];

    // Content-based filtering: products in same categories, excluding already interacted, with viewCount >= 10
    const contentBased = await Product.find({
        category: { $in: categories },
        _id: { $nin: interactedProductIds },
        viewCount: { $gte: 10 },
    }).limit(10) as Array<any>;

    // Popularity-based filtering: products not yet interacted, with viewCount >= 10, sorted by viewCount desc
    const popular = await Product.find({
        _id: { $nin: interactedProductIds },
        viewCount: { $gte: 10 },
    })
        .sort({ viewCount: -1 })
        .limit(10) as Array<any>;

    // Merge both lists with weighted scoring (content-based gets 0.6, popularity gets 0.4)
    const scoreMap = new Map<string, { product: any; score: number }>();

    for (const p of contentBased) {
        scoreMap.set(p._id.toString(), { product: p, score: 0.6 });
    }

    for (const p of popular) {
        const id = p._id.toString();
        const existing = scoreMap.get(id);
        scoreMap.set(id, {
            product: p,
            score: (existing?.score || 0) + 0.4,
        });
    }

    // Sort by combined score descending
    const results = Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .map(r => r.product);

    return results;
};