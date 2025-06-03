"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SideNavbar from "./SideNavbar";
import { toast } from "react-toastify";

const UserProfileCard = () => {
    const { user, loading, refreshUser } = useAuth();
    const router = useRouter();

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        imageUrl: "",
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        if (!loading && !user) {
            toast.warn("Please login first");
            router.replace("/login");
        } else if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                imageUrl: user.imageUrl || "",
            });
        }
    }, [user, loading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Name, phone, and address are required");
            return;
        }

        try {
            const body = new FormData();
            body.append("name", formData.name);
            body.append("phone", formData.phone);
            body.append("address", formData.address);
            if (profileImage) body.append("profileImage", profileImage);

            const res = await fetch("http://localhost:8000/api/users/update-profile", {
                method: "PATCH",
                credentials: "include",
                body,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            toast.success("Profile updated successfully!");
            setEditMode(false);
            setProfileImage(null);
            refreshUser();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        }
    };

    if (loading || !user) {
        return (
            <div className="p-8 text-center text-gray-500">
                {loading ? "Loading..." : "Redirecting to login..."}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activePage="profile"
            />

            <div className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile Overview</h2>

                    <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                            <img
                                src={
                                    profileImage
                                        ? URL.createObjectURL(profileImage)
                                        : formData.imageUrl || "https://via.placeholder.com/150"
                                }
                                alt="Profile"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {editMode && (
                            <div>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <input type="file" onChange={handleFileChange} />
                                </form>
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
                        {["name", "email", "phone", "address"].map((field) => (
                            <div key={field}>
                                <label className="block text-gray-600 font-medium mb-1 capitalize">{field}</label>
                                <input
                                    type="text"
                                    name={field}
                                    value={(formData as any)[field]}
                                    onChange={handleChange}
                                    disabled={field === "email" || !editMode}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-start gap-4">
                        {editMode ? (
                            <>
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setProfileImage(null);
                                    }}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;
