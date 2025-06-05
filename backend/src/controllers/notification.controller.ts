import { Response } from 'express';
import Notification from '../models/notification';
import { AuthenticatedRequest } from '../types/CustomRequests';

export const getUserNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, notifications });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Marked as read', notification });
    } catch (error: any) {
        console.error('Error updating notification:', error);
        res.status(500).json({ success: false, message: 'Error updating notification' });
    }
};

export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        await Notification.updateMany({ user: userId }, { read: true });

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Error marking all notifications:', error);
        res.status(500).json({ success: false, message: 'Error updating notifications' });
    }
};