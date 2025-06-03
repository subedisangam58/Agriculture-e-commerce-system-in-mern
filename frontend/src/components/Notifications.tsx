"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import FarmerSidebar from "@/components/farmer/SideNavbar";
import ClientSidebar from "@/components/client/SideNavbar";

interface Notification {
    _id: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

function NotificationsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/notifications", {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) setNotifications(data.notifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("http://localhost:8000/api/notifications/mark-all-read", {
                method: "PATCH",
                credentials: "include",
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchNotifications();
        }
    }, [user, loading]);

    const filterByRole = (notif: Notification) => {
        if (user?.role === "farmer") return ["product", "order"].includes(notif.type);
        return ["order", "account", "feedback", "security", "cart", "profile"].includes(notif.type);
    };

    const sorted = notifications
        .filter(filterByRole)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    function toggleSidebar(): void {
        throw new Error("Function not implemented.");
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {user?.role === "farmer" ? (
                <FarmerSidebar
                    isSidebarOpen={true}
                    toggleSidebar={() => { }}
                    activePage="notifications"
                />
            ) : (
                <ClientSidebar
                    isSidebarOpen={true}
                    toggleSidebar={() => { }}
                    activePage="notifications"
                />
            )}

            {/* Main Content */}
            <main className="flex-1 pl-20 pt-30 pr-6">
                <div className="max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Notifications</h1>
                            <p className="text-sm text-gray-500">
                                Viewing as <span className="font-semibold">{user?.role}</span>
                            </p>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
                        >
                            Mark All as Read
                        </button>
                    </div>

                    {loadingNotifications ? (
                        <p className="text-gray-600">Loading...</p>
                    ) : sorted.length === 0 ? (
                        <p className="text-gray-500">No notifications to display.</p>
                    ) : (
                        <ul className="space-y-4">
                            {sorted.map((notif) => (
                                <li
                                    key={notif._id}
                                    className={`p-4 border rounded shadow-sm ${notif.read ? "bg-gray-100" : "bg-white"}`}
                                >
                                    <p className="font-medium text-gray-800">{notif.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                    <span className="text-xs inline-block mt-2 px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                        {notif.type}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}

export default NotificationsPage;
