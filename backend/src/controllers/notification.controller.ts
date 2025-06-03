import { Request, Response } from 'express';
import Notification from '../models/notification';
import { AuthenticatedRequest } from '../types/CustomRequests';

export const getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notifications = await Notification.find({ user: req.user!._id }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user!._id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.json({ success: true, message: "Marked as read", notification });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating notification" });
    }
};


export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
    await Notification.updateMany({ user: req.user!._id }, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
};
