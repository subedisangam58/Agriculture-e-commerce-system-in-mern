import Notification from "../models/notification";

export const notifyUser = async ({
    userId,
    message,
    type = "general",
}: {
    userId: string;
    message: string;
    type?: string;
}) => {
    try {
        await Notification.create({
            user: userId,
            message,
            type,
        });
    } catch (error) {
        console.error("Notification error:", error);
    }
};
