"use client";
import React from "react";
import Link from "next/link";

const Crops = () => {
    return (
        <div className="bg-[#f9f9f9] min-h-screen py-10 px-6">
            <h1 className="text-4xl font-bold text-center text-green-800 mb-10">Crops Information</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Crop Details Card */}
                <Link href="/crops/cropdetail" passHref>
                    <div className="cursor-pointer bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Crop Details</h2>
                        <p className="text-gray-600">
                            Learn about soil needs, growing seasons, and best practices for each crop.
                        </p>
                    </div>
                </Link>

                {/* Crop Diseases Card */}
                <Link href="/crops/cropsdiseases" passHref>
                    <div className="cursor-pointer bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Crop Diseases</h2>
                        <p className="text-gray-600">
                            Explore common diseases affecting crops and how to prevent or treat them.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Crops;
