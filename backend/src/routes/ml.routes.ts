// backend/src/routes/mlRoutes.ts
import express from 'express';
import {
    predictCrop,
    recommendFertilizer,
    estimateYield
} from '../controllers/ml.controller';

const router = express.Router();

router.post('/predict-crop', predictCrop);

router.post('/recommend-fertilizer', recommendFertilizer);

router.post('/estimate-yield', estimateYield);

export default router;