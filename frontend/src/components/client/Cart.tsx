"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import SideNavbar from "./SideNavbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface CartItem {
    _id: string;
    product: {
        _id: string;
        name: string;
        imageUrl?: string;
        price: number;
        category: string;
    };
    quantity: number;
    selected?: boolean; // <-- New flag
}

function Cart() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loadingCart, setLoadingCart] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const fetchCart = async () => {
        try {
            setLoadingCart(true);
            const res = await fetch("http://localhost:8000/api/cart", {
                credentials: "include",
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }
            const data = await res.json();

            // Set default selection
            setCart((data.cart || []).map((item: CartItem) => ({
                ...item,
                selected: true,
            })));
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoadingCart(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        const subtotal = cart.reduce(
            (sum, item) =>
                item.selected ? sum + item.quantity * item.product.price : sum,
            0
        );
        setTotal(subtotal);
    }, [cart]);

    const updateQuantity = async (itemId: string, delta: number) => {
        const item = cart.find((i) => i._id === itemId);
        if (!item) return;

        const newQuantity = Math.max(1, item.quantity + delta);

        try {
            const res = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: newQuantity }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update quantity");

            setCart((prev) =>
                prev.map((item) =>
                    item._id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (err: any) {
            alert(err.message || "Update failed");
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const contentType = res.headers.get("content-type") || "";

            if (!res.ok) {
                if (contentType.includes("application/json")) {
                    const data = await res.json();
                    throw new Error(data.message || "Failed to remove item");
                } else {
                    const text = await res.text();
                    throw new Error(`Error ${res.status}: ${text}`);
                }
            }

            const data = await res.json();
            setCart((prev) => prev.filter((item) => item._id !== itemId));
        } catch (err: any) {
            alert(err.message || "Delete failed");
        }
    };

    const handleProceedToCheckout = () => {
        const selectedItems = cart.filter((item) => item.selected);
        if (selectedItems.length === 0) return;

        localStorage.setItem("checkoutCart", JSON.stringify(selectedItems));
        router.push("/client/checkout");
    };

    const toggleSelection = (itemId: string) => {
        setCart((prev) =>
            prev.map((item) =>
                item._id === itemId ? { ...item, selected: !item.selected } : item
            )
        );
    };

    if (loading || loadingCart) {
        return <div className="p-10 text-center text-lg">Loading your cart...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activePage="cart"
            />

            <div className="flex-1 overflow-auto pt-0">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <h2 className="font-semibold text-xl text-gray-800">Shopping Cart</h2>
                            <div className="lg:hidden">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                >
                                    <Menu size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="bg-[#fdfced] px-6 md:px-20 py-10 min-h-screen pt-10">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-6">
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500">Your cart is empty.</p>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={item.selected ?? true}
                                                onChange={() => toggleSelection(item._id)}
                                            />
                                            <img
                                                src={item.product.imageUrl || "/images/placeholder.jpg"}
                                                alt={item.product.name}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                                <p className="text-sm text-gray-500">Sold by: Green Acres Farm</p>
                                                <p className="text-sm text-gray-600">
                                                    ${item.product.price.toFixed(2)} / lb
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border rounded px-2 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item._id, -1)}
                                                    className="text-lg px-2"
                                                >
                                                    −
                                                </button>
                                                <span className="mx-2">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 1)}
                                                    className="text-lg px-2"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="font-bold">
                                                ${(item.quantity * item.product.price).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                className="text-red-500 hover:text-red-600 text-xl"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                                {/* List of selected products */}
                                <div className="mb-4 space-y-2">
                                    {cart.filter(item => item.selected).map(item => (
                                        <div key={item._id} className="flex justify-between text-gray-700">
                                            <span>{item.product.name} × {item.quantity}</span>
                                            <span>${(item.quantity * item.product.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Subtotal and Total */}
                                <div className="flex justify-between text-gray-600 mb-2">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between text-lg font-bold mb-6">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>

                                {/* Checkout button */}
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="bg-orange-500 text-white w-full py-3 rounded hover:bg-orange-600 transition"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default Cart;
