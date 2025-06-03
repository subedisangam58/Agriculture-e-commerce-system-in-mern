"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
    _id: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8000/api/notifications", {
                credentials: "include",
            });

            const contentType = res.headers.get("content-type") || "";

            if (!res.ok) {
                if (contentType.includes("application/json")) {
                    const err = await res.json();
                    throw new Error(err.message || "Failed to fetch notifications");
                } else {
                    const html = await res.text();
                    throw new Error(`Error ${res.status}: ${html}`);
                }
            }

            if (!contentType.includes("application/json")) {
                throw new Error("Invalid response from server");
            }

            const data = await res.json();
            if (data.success) setNotifications(data.notifications);
        } catch (err: any) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };


    const markAsRead = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
                method: "PATCH",
                credentials: "include",
            });
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-600 hover:text-black"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b font-semibold text-gray-700">
                        Notifications
                    </div>
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`px-4 py-2 text-sm border-b hover:bg-gray-100 cursor-pointer ${notif.read ? 'text-gray-500' : 'text-black font-medium'}`}
                                onClick={() => markAsRead(notif._id)}
                            >
                                {notif.message}
                                <div className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
