import express from 'express';
import {
    getRecommendationsByProduct,
    getUserRecommendations,
    logUserActivity,
    getHybridRecommendationsController
} from '../controllers/recommendation.controller';

const router = express.Router();

router.get('/:productId', getRecommendationsByProduct);
router.get('/user/:userId', getUserRecommendations);
router.post('/activity', logUserActivity);
router.get('/hybrid/:userId', getHybridRecommendationsController);

export default router;
