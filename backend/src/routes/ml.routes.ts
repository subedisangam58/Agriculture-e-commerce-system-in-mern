import express from 'express';
import { getPrediction } from '../controllers/ml.controller';

const router = express.Router();
router.post('/predict', getPrediction);

export default router;