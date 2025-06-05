import express from 'express';
import {
    getRecommendationsByProduct,
    getUserRecommendations,
    logUserActivity,
    getHybridRecommendationsController
} from '../controllers/recommendation.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/product/:productId', verifyToken, getRecommendationsByProduct);

router.get('/user', verifyToken, getUserRecommendations);

router.post('/activity', verifyToken, logUserActivity);

router.get('/hybrid', verifyToken, getHybridRecommendationsController);

export default router;
