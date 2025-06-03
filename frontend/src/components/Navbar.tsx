"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import { cn } from "@/utils/utils";

import SearchBar from "@/components/SearchBar";

function Navbar({ className }: { className?: string }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Lock body scroll on mobile menu open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    }, [isMobileMenuOpen]);

    const getDashboardLink = () => {
        if (!user) return "/";
        return user.role === "farmer" ? "/farmer/dashboard" : "/client/dashboard";
    };

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const navItems = [
        { label: "Home", path: "/" },
        { label: "Products", path: "/products" },
        { label: "About Us", path: "/about" },
        { label: "Contact Us", path: "/contact" },
        { label: "Today Market", path: "/todayprice" },
        { label: "Crops", path: "/crops" },
    ];

    return (
        <header className={cn("fixed top-0 left-0 w-full bg-white z-50 shadow-md", className)}>
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-black">
                    <span className="text-green-500">Fresh</span>Market
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden md:flex gap-8 items-center">
                    {navItems.map(({ label, path }) => (
                        <Link
                            key={label}
                            href={path}
                            className="text-black text-lg font-medium hover:text-green-600 transition"
                        >
                            {label}
                        </Link>
                    ))}
                    <SearchBar />
                    {!loading && user && <NotificationBell />}

                    {!loading && user ? (
                        <>
                            <Link
                                href={getDashboardLink()}
                                className="text-black font-medium hover:text-green-600"
                            >
                                Hello, {user.name?.split(" ")[0]}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-black font-medium hover:text-green-600">
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-green-500 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-green-600 transition"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button
                        aria-label="Toggle mobile menu"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    >
                        {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white px-4 py-4 space-y-4 shadow-md">
                    {navItems.map(({ label, path }) => (
                        <Link
                            key={label}
                            href={path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-black text-base font-medium hover:text-green-600"
                        >
                            {label}
                        </Link>
                    ))}

                    {!loading && user && <NotificationBell />}

                    {!loading && user ? (
                        <>
                            <Link
                                href={getDashboardLink()}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-black font-medium hover:text-green-600"
                            >
                                Hello, {user.name?.split(" ")[0]}
                            </Link>
                            <button
                                onClick={async () => {
                                    await handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left bg-red-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-black font-medium hover:text-green-600"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

export default Navbar;
