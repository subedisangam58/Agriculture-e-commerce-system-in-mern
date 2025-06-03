"use client";

import {
    LayoutDashboard,
    Bell,
    HelpCircle,
    LogOut,
    Menu,
    Settings,
    ShoppingCart,
    User,
    X
} from "lucide-react";
import { FC, JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type NavItem = {
    id: string;
    name: string;
    icon: JSX.Element;
    path: string;
};

interface SideNavbarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    activePage: string;
}

const SideNavbar: React.FC<SideNavbarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    activePage
}) => {
    const { user, logout } = useAuth();

    const navItems: NavItem[] = [
        { id: "overview", name: "Overview", icon: <LayoutDashboard size={20} />, path: "/client/dashboard" },
        { id: "orders", name: "My Orders", icon: <ShoppingCart size={20} />, path: "/client/orderhistory" },
        { id: "cart", name: "My Cart", icon: <ShoppingCart size={20} />, path: "/client/cart" },
        { id: "notifications", name: "Notifications", icon: <Bell size={20} />, path: "/notifications" },
        { id: "profile", name: "Profile Settings", icon: <Settings size={20} />, path: "/client/profile" },
        { id: "support", name: "Support", icon: <HelpCircle size={20} />, path: "/client/support" },
    ];

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div
                className={`fixed z-50 top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 lg:translate-x-0 lg:static`}
            >
                <div className="p-4 flex items-center justify-between">
                    {isSidebarOpen && <h1 className="text-xl font-bold">Dashboard</h1>}
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-700 lg:hidden">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="mt-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`flex items-center w-full py-3 ${isSidebarOpen ? "px-4" : "justify-center px-2"}
                                ${activePage === item.id
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {isSidebarOpen && <span>{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4">
                    <div className={`flex ${isSidebarOpen ? "items-center" : "justify-center"} text-sm`}>
                        <User size={24} className="text-gray-300" />
                        {isSidebarOpen && user && (
                            <div className="ml-3">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={`mt-4 flex w-full text-gray-300 hover:text-white ${isSidebarOpen ? "items-center" : "justify-center"}`}
                    >
                        <LogOut size={18} className="mr-2" />
                        {isSidebarOpen && <span>Log out</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SideNavbar;
