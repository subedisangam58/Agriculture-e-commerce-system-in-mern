import { Router } from 'express';
import multer from 'multer';
import {
    signup,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth,
    updateProfile
} from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer();

// Public Auth Routes
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected Routes
router.get('/check-auth', verifyToken, checkAuth);
router.post('/update-profile', verifyToken, upload.single('image'), updateProfile);

export default router;