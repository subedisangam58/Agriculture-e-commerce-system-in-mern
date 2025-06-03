import rateLimit from 'express-rate-limit';

// Global limiter - applies to all requests
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: { success: false, message: 'Too many requests from this IP. Try again later.' },
});

// Auth limiter - protects login/signup endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    message: { success: false, message: 'Too many login/signup attempts. Try again later.' },
});

// Notification limiter - email/SMS OTP spam protection
export const notificationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 5,
    message: { success: false, message: 'Too many notification requests. Try again later.' },
});

// Recommendation limiter - protects from heavy request loads
export const recommendationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    message: { success: false, message: 'Too many recommendation requests. Slow down.' },
});

// Order and Cart limiter
export const transactionalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 min
    max: 15,
    message: { success: false, message: 'Too many order/cart requests. Try again later.' },
});
