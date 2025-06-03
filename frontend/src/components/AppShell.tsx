"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div className="pt-16">
                {children}
            </div>
            <Footer />
        </>
    );
}
