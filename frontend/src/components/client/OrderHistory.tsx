"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNavbar from "./SideNavbar";
import { useAuth } from "@/context/AuthContext";

// Updated to match the schema (products[] with product reference)
interface Order {
    _id: string;
    products: {
        product: {
            _id: string;
            name: string;
            price: number;
        };
        quantity: number;
    }[];
    status: string;
    createdAt: string;
}

function OrderHistory() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            try {
                const res = await fetch(`http://localhost:8000/api/orders/user/${user._id}`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Error ${res.status}: ${text}`);
                }

                const data = await res.json();
                setOrders(data.orders || []);
                console.log("Fetched orders:", data.orders);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activePage="orders"
            />

            <div className="flex-1 overflow-auto p-6 pt-10">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    >
                        Toggle Menu
                    </button>
                </header>

                {isLoading ? (
                    <p className="text-gray-600">Loading orders...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : orders.length === 0 ? (
                    <p className="text-gray-500">You have no orders yet.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) =>
                            order.products.map((item, index) => (
                                <div
                                    key={`${order._id}-${item.product._id}-${index}`}
                                    className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Product: {item.product.name}
                                        </h2>
                                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                                        <p className="text-gray-600">Status: {order.status}</p>
                                        <p className="text-gray-500 text-sm">
                                            Ordered on:{" "}
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-600 font-bold">
                                            ${item.product.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;
