import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import User from '../models/user';
import { generateVerificationToken } from '../utils/generateVerificationToken';
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail,
} from '../utils/mailer';
import { notifyUser } from '../utils/notifyUser';
import { uploadToCloudinary } from '../utils/cloudinary';

const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone, address, role } = req.body;

    try {
        if (!email || !password || !name || !phone || !address) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }

        const allowedRoles = ['admin', 'farmer', 'user'];
        if (role && !allowedRoles.includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role specified' });
            return;
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = generateVerificationToken();

        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role: role || 'user',
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await user.save();
        await sendVerificationEmail(user.email, verificationToken);
        await notifyUser({ userId: (user._id as string).toString(), message: 'Welcome! Please verify your email.', type: 'account' });

        const { password: _, verificationToken: __, verificationTokenExpiresAt: ___, ...sanitizedUser } = user.toObject();

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            user: sanitizedUser,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
            return;
        }

        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        await notifyUser({ userId: String(user._id), message: 'Email verified successfully!', type: 'account' });

        const token = generateToken((user._id as string).toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...sanitizedUser } = user.toObject();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: sanitizedUser,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: 'Invalid password' });
            return;
        }

        user.lastLogin = new Date();
        await user.save();
        await notifyUser({ userId: String(user._id), message: 'Logged in successfully!', type: 'auth' });

        const token = generateToken(String(user._id));
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...sanitizedUser } = user.toObject();
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: sanitizedUser,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        await notifyUser({ userId: String(user._id), message: 'Password reset link sent to your email.', type: 'security' });

        res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            return;
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        await notifyUser({ userId: String(user._id), message: 'Your password was reset successfully.', type: 'security' });

        res.status(200).json({ success: true, message: 'Password reset successful.' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            res.status(200).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const { password: _, ...sanitizedUser } = user.toObject();
        res.status(200).json({ success: true, user: sanitizedUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { name, phone, address } = req.body;
        if (!name || !phone || !address) {
            res.status(400).json({ success: false, message: 'Name, phone, and address are required' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        user.name = name;
        user.phone = phone;
        user.address = address;

        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.path);
            user.imageUrl = (uploaded as { secure_url: string }).secure_url;
        }

        await user.save();
        await notifyUser({ userId, message: 'Your profile was updated.', type: 'profile' });

        const { password: _, ...sanitizedUser } = user.toObject();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: sanitizedUser,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
