"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import SideNavbar from '@/components/farmer/SideNavbar';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

interface Seller {
    _id: string;
    name: string;
}

interface Product {
    name: string;
    price: number;
    createdBy?: Seller | null;
}


interface OrderItem {
    product: Product;
    quantity: number;
}

interface Order {
    _id: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    products: OrderItem[];
    totalAmount: number;
    deliveryAddress: string;
}

function Orders() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const hasShownToast = useRef(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

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
        const fetchOrders = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/orders/user/me", {
                    credentials: "include",
                });

                const data = await res.json();
                console.log("Fetched orders:", data);

                if (data.success && Array.isArray(data.orders)) {
                    setOrders(data.orders);
                } else {
                    console.warn("Data format problem:", data);
                    toast.error(data.message || "Unexpected response format");
                }
            } catch (err) {
                toast.error("Failed to fetch orders.");
            } finally {
                setFetching(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (loading || !user) {
        return <div className="p-8 text-center text-gray-500">Checking authentication...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activePage="orders"
            />
            <div className="flex-1 p-6 pt-16">
                <h1 className="text-2xl font-bold mb-6">Orders Containing My Products</h1>

                {fetching ? (
                    <div className="text-gray-500 text-center">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white shadow-md rounded-lg p-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span><strong>Order ID:</strong> {order._id}</span>
                                    <span>{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                                </div>

                                <div className="text-sm mb-2">
                                    <p><strong>Status:</strong> {order.status}</p>
                                    <p><strong>Payment:</strong> {order.paymentStatus}</p>
                                    <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                                </div>

                                <div className="mt-2">
                                    <h3 className="font-semibold mb-1">Items:</h3>
                                    <ul className="list-disc list-inside text-sm pl-4">
                                        {order.products.map((item, idx) => (
                                            <li key={idx}>
                                                {item.product?.name || "Unknown Product"} x {item.quantity} @ Rs. {item.product?.price?.toFixed(2) || "0.00"}
                                                {(() => {
                                                    const Seller = item.product?.createdBy;
                                                    return Seller ? (
                                                        <div className="text-xs text-gray-500">
                                                            Sold by: {Seller.name}
                                                        </div>
                                                    ) : null;
                                                })()}

                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <span className="font-bold text-lg text-green-700">
                                        Total: Rs. {order.totalAmount.toFixed(2)}
                                    </span>
                                    <button className="px-4 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
