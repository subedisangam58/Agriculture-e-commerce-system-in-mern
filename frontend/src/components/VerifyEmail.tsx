"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VerifyEmail() {
    const params = useSearchParams();
    const router = useRouter();
    const name = params.get("name");
    const email = params.get("email");

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setIsVerifying(true);

        try {
            const response = await fetch("http://localhost:8000/api/users/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code: otp }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Email verified successfully!");
                setTimeout(() => {
                    router.push("/farmer/dashboard"); // ✅ Redirect to dashboard
                }, 1500);
            } else {
                toast.error(data.message || "Invalid or expired OTP");
            }
        } catch (err) {
            toast.error("Verification failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    // const handleResendOtp = async () => {
    //     if (!email) {
    //         toast.error("Email is missing from the URL");
    //         return;
    //     }

    //     try {
    //         const res = await fetch("http://localhost:8000/api/users/resend-otp", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ email }),
    //         });

    //         const data = await res.json();
    //         if (res.ok && data.success) {
    //             toast.success("OTP resent successfully!");
    //         } else {
    //             toast.error(data.message || "Failed to resend OTP.");
    //         }
    //     } catch (err) {
    //         toast.error("Error resending OTP. Please try again.");
    //     }
    // };


    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-green-600 mb-2">Verify Your Email</h1>
                <p className="text-gray-600 mb-2">
                    {name ? `Hi ${name}, ` : "Hi,"} we've sent a verification code to:
                </p>
                <p className="font-semibold text-gray-800 mb-6">{email || "your email"}</p>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-center text-lg tracking-widest"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors ${isVerifying ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-6">
                    Didn't receive the code? <button
                        type="button"
                        // onClick={handleResendOtp}
                        className="text-green-600 hover:underline"
                    >
                        Resend
                    </button>

                </p>

                <Link
                    href="/login"
                    className="mt-4 inline-block text-green-600 hover:underline text-sm"
                >
                    Go to Login
                </Link>
            </div>

            <ToastContainer position="top-center" />
        </div>
    );
}

export default VerifyEmail;
