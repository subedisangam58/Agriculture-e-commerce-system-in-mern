import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Route imports
import userRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import notificationRoutes from './routes/notification.routes';
import recommendationRoutes from './routes/recommendation.routes';
import mlRoutes from './routes/ml.routes';

// Rate limiters
import {
    globalLimiter,
    authLimiter,
    notificationLimiter,
    recommendationLimiter,
    transactionalLimiter
} from './middlewares/ratelimiters.middleware';

dotenv.config();
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Log directory setup
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

// Global Middleware
app.use(globalLimiter);
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

// Logging
app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate-limited routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/signup', authLimiter);
app.use('/api/recommendations', recommendationLimiter);
app.use('/api/orders', transactionalLimiter);
app.use('/api/cart', transactionalLimiter);

// Main routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ml', mlRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));