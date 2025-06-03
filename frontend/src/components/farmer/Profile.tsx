"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SideNavbar from "@/components/farmer/SideNavbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const hasShownToast = useRef(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState("/default-profile.png");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        imageFile: null as File | null,
    });

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    useEffect(() => {
        if (!loading && !user) {
            if (!hasShownToast.current) {
                toast.warn("Please login first");
                hasShownToast.current = true;
            }
            router.replace("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                imageFile: null,
            });
            setPreviewImage(user.imageUrl || "/default-profile.png");
        }
    }, [user]);

    useEffect(() => {
        if (formData.imageFile) {
            const objectUrl = URL.createObjectURL(formData.imageFile);
            setPreviewImage(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (user?.imageUrl) {
            setPreviewImage(user.imageUrl);
        }
    }, [formData.imageFile, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, imageFile: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;

        const form = new FormData();
        form.append("name", formData.name);
        form.append("email", formData.email);
        form.append("phone", formData.phone);
        form.append("address", formData.address);
        if (formData.imageFile) {
            form.append("image", formData.imageFile);
        }

        try {
            const res = await fetch("http://localhost:8000/api/users/update-profile", {
                method: "POST",
                body: form,
                credentials: "include",
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                setFormData((prev) => ({ ...prev, imageFile: null }));
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Server error while updating profile");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                imageFile: null,
            });
            setPreviewImage(user.imageUrl || "/default-profile.png");
        }
    };

    if (loading || !user) {
        return <div className="p-8 text-center text-gray-500">Checking authentication...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activePage="profile"
            />
            <main className="flex-1 p-6 ml-0 lg:ml-0 pt-16">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile Overview</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                                <img
                                    src={previewImage}
                                    alt="Profile"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            {isEditing && (
                                <div className="flex flex-col gap-2">
                                    <input
                                        id="profileImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                    />
                                    {formData.imageFile && (
                                        <span className="text-sm text-gray-700">
                                            Selected: {formData.imageFile.name}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-700">{formData.name}</h3>
                                <p className="text-gray-500">{formData.email}</p>
                                <p className="text-gray-500 mt-1">{formData.phone}</p>
                                <p className="text-gray-500 mt-1">{formData.address}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </form>

                    {/* 🔽 Action Buttons OUTSIDE the form */}
                    <div className="mt-6 flex gap-4">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                >
                                    Save Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
