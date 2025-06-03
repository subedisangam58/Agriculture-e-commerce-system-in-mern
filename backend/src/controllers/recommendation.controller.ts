import { Request, Response } from 'express';
import Recommendation from '../models/recommendation';
import UserActivity from '../models/useractivity';
import Product from '../models/product';
import { getHybridRecommendations } from '../utils/hybrid';

export const getRecommendationsByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        const rec = await Recommendation.findOne({ productId }).populate('recommendedProducts');

        if (!rec) {
            res.status(200).json([]); // No recommendations yet
            return;
        }

        res.status(200).json(rec.recommendedProducts);
    } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
};

export const getUserRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const history = await UserActivity.find({
            userId,
            action: { $in: ['view', 'purchase'] }
        })
            .sort({ timestamp: -1 })
            .limit(5);

        const productIds = history.map((h) => h.productId);

        if (productIds.length === 0) {
            res.status(200).json([]);
            return;
        }

        const baseProducts = await Product.find({ _id: { $in: productIds } });
        const categories = baseProducts.map((p) => p.category);

        const recommendations = await Product.find({
            category: { $in: categories },
            _id: { $nin: productIds }
        }).limit(8);

        res.status(200).json(recommendations);
    } catch (err) {
        console.error('Error fetching user recommendations:', err);
        res.status(500).json({ message: 'Failed to fetch user recommendations' });
    }
};

export const logUserActivity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, productId, action } = req.body;

        if (!userId || !productId || !action) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const activity = new UserActivity({ userId, productId, action });
        await activity.save();

        res.status(201).json({ message: 'Activity logged successfully' });
    } catch (err) {
        console.error('Error logging activity:', err);
        res.status(500).json({ message: 'Failed to log user activity' });
    }
};

export const getHybridRecommendationsController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const recommendations = await getHybridRecommendations(userId);
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Hybrid recommendation error:', error);
        res.status(500).json({ message: 'Failed to get recommendations' });
    }
};