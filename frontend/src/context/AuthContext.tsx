"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

interface User {
    name: string;
    role: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8000/api/users/check-auth`,
                {
                    credentials: "include",
                }
            );
            const data = await res.json();
            console.log("checkAuth response:", data);
            setUser(data.success ? data.user : null);
        } catch (error) {
            console.error("checkAuth error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
        } catch (error) {
            console.error("logout error:", error);
        }
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    useEffect(() => {
        checkAuth();
        window.addEventListener("focus", checkAuth);
        return () => window.removeEventListener("focus", checkAuth);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, logout, refreshUser, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
