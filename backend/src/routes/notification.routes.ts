import express from 'express';
import { protect } from '../middlewares/protect';
import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '../controllers/notification.controller';

const router = express.Router();

// GET /api/notifications - get all notifications for logged-in user
router.get('/', protect, getUserNotifications);

// PATCH /api/notifications/:id/read - mark a specific notification as read
router.patch('/:id/read', protect, markNotificationRead);

// PATCH /api/notifications/mark-all-read - mark all notifications as read
router.patch('/mark-all-read', protect, markAllNotificationsRead);

export default router;
