import express from 'express';
import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '../controllers/notification.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.patch('/mark-all-read', verifyToken, markAllNotificationsRead);
router.patch('/:id/read', verifyToken, markNotificationRead);

export default router;
