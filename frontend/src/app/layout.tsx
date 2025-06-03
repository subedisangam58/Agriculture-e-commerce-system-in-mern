import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "FreshMarket",
  description: "Best place to buy fresh vegetables and fruits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} h-full antialiased`}>
        <AuthProvider>
          <ToastContainer position="top-center" autoClose={3000} />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
