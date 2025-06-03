import { Router } from 'express';
import multer from 'multer';
import {
    signup,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAuth
} from '../controllers/auth.controller';

const router = Router();
const upload = multer();

// Auth Routes
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/check-auth', checkAuth);

// ✅ Use multer middleware for multipart/form-data
router.post('/update-profile', upload.single('image'), updateProfile);

export default router;
