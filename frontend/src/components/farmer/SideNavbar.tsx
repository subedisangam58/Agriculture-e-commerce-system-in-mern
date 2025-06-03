"use client";

import {
    LayoutDashboard,
    HelpCircle,
    LogOut,
    Menu,
    Settings,
    ShoppingCart,
    User,
    X,
    Leaf,
    Tractor,
    LineChart,
    PackagePlus,
} from "lucide-react";
import { JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface SideNavbarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    activePage: string;
}

type NavItem = {
    id: string;
    name: string;
    icon: JSX.Element;
    path: string;
};

const navItems: NavItem[] = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/farmer/dashboard" },
    { id: "cropsrecommend", name: "Crops Recommend", icon: <Leaf size={20} />, path: "/farmer/cropsrecommend" },
    { id: "livestock", name: "Livestock", icon: <Tractor size={20} />, path: "/farmer/livestock" },
    { id: "market", name: "Market", icon: <ShoppingCart size={20} />, path: "/farmer/market" },
    { id: "addproduct", name: "Add Product", icon: <PackagePlus size={20} />, path: "/farmer/addproduct" },
    { id: "order", name: "Orders", icon: <Settings size={20} />, path: "/farmer/orders" },
    { id: "reports", name: "Reports", icon: <LineChart size={20} />, path: "/farmer/reports" },
    { id: "resources", name: "Resources", icon: <HelpCircle size={20} />, path: "/farmer/resources" },
    { id: "profile", name: "Profile", icon: <Settings size={20} />, path: "/farmer/profile" },
];

export default function SideNavbar({ isSidebarOpen, toggleSidebar, activePage }: SideNavbarProps) {
    const { logout, user } = useAuth();

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div
                className={`fixed top-16 left-0 z-40 bg-gray-900 text-white h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-20 lg:w-64 lg:translate-x-0 lg:static`}
            >
                <div className="p-4 flex items-center justify-between lg:justify-end">
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-700 lg:hidden">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="mt-4 space-y-1">
                    {navItems.map(({ id, name, icon, path }) => (
                        <Link
                            key={id}
                            href={path}
                            className={`flex items-center w-full py-3 px-2 lg:px-4 transition-all
                ${activePage === id ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                        >
                            <span className="mr-0 lg:mr-3 flex justify-center w-full lg:w-auto">{icon}</span>
                            {isSidebarOpen && <span className="hidden lg:inline">{name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4">
                    <div className={`flex ${isSidebarOpen ? "items-center" : "justify-center"} text-sm`}>
                        <User size={24} className="text-gray-300" />
                        {isSidebarOpen && user && (
                            <div className="ml-3 hidden lg:block">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            toggleSidebar();
                        }}
                        className={`mt-4 flex w-full text-gray-300 hover:text-white ${isSidebarOpen ? "items-center" : "justify-center"}`}
                    >
                        <LogOut size={18} className="mr-2" />
                        {isSidebarOpen && <span className="hidden lg:inline">Log out</span>}
                    </button>
                </div>
            </div>
        </>
    );
}