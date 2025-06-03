"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SideNavbar from "./SideNavbar";
import { Menu } from "lucide-react";

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
}

const Checkout = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
    const [khaltiLoaded, setKhaltiLoaded] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        const savedCart = localStorage.getItem("checkoutCart");
        if (savedCart) {
            const parsedCart: CartItem[] = JSON.parse(savedCart);
            setCart(parsedCart);
            const sum = parsedCart.reduce(
                (acc, item) => acc + item.quantity * item.product.price,
                0
            );
            setTotal(sum);
        }
    }, []);

    useEffect(() => {
        const existingScript = document.getElementById("khalti-script");

        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://khalti.com/static/khalti-checkout.js";
            script.id = "khalti-script";
            script.onload = () => setKhaltiLoaded(true);
            document.body.appendChild(script);
        } else {
            setKhaltiLoaded(true);
        }
    }, []);

    const submitOrder = async (paymentMethod: string, paymentDetails?: any) => {
        try {
            const response = await fetch("http://localhost:8000/api/orders/createorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    userId: user ? user._id : null,
                    products: cart.map((item) => ({
                        product: item.product._id,
                        quantity: item.quantity,
                    })),
                    totalAmount: total,
                    paymentMethod,
                    paymentDetails,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Order placed successfully!");
                localStorage.removeItem("checkoutCart");
                router.push("/client/orderhistory");
            } else {
                alert(`Failed to place order: ${data.message}`);
            }
        } catch (err) {
            console.error("Order submission failed:", err);
            alert("Something went wrong while placing the order.");
        }
    };

    const khaltiConfig = {
        publicKey: "test_public_key_xxxxxx",
        productIdentity: "1234567890",
        productName: "Farmer Order",
        productUrl: "http://localhost:3000/checkout",
        eventHandler: {
            onSuccess(payload: any) {
                console.log("Khalti Success:", payload);
                submitOrder("Khalti", payload);
            },
            onError(error: any) {
                console.log("Khalti Error:", error);
                alert("Payment Failed!");
            },
            onClose() {
                console.log("Khalti Widget Closed");
            },
        },
        paymentPreference: [
            "KHALTI",
            "EBANKING",
            "MOBILE_BANKING",
            "CONNECT_IPS",
            "SCT",
        ],
    };

    const loadKhaltiCheckout = () => {
        if (!(window as any).KhaltiCheckout) {
            alert("Khalti Checkout is not ready. Please wait...");
            return;
        }
        const checkout = new (window as any).KhaltiCheckout(khaltiConfig);
        checkout.show({ amount: total * 100 });
    };

    if (loading || !user) {
        return (
            <div className="p-10 text-center text-gray-600">
                {loading ? "Loading..." : "Redirecting to login..."}
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="p-10 text-center text-gray-600">
                Your cart is empty. Go back and add some items.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activePage="checkout"
            />

            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm">
                    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <h2 className="font-semibold text-xl text-gray-800">Checkout</h2>
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

                <main className="px-6 md:px-20 py-10 min-h-screen bg-[#fdfced] pt-20">
                    <div className="w-full bg-white p-6 rounded-lg shadow space-y-6">
                        {/* Your Items */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Items</h3>
                            {cart.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-gray-100 rounded p-4 flex justify-between items-center mb-2"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.product.imageUrl || "/images/placeholder.jpg"}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {item.product.name}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-green-600">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Info */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipping Info</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user.name}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user.address}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user.phone}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    >
                                        <option>Cash on Delivery</option>
                                        <option>Khalti</option>
                                        <option>eSewa</option>
                                        <option>Credit/Debit Card</option>
                                    </select>
                                </div>
                            </form>
                        </div>

                        {/* Summary */}
                        <div>
                            <hr className="my-4" />
                            <div className="flex justify-between text-gray-600 mb-2">
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Payment</span>
                                <span>{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold mb-4">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            {paymentMethod === "Khalti" ? (
                                <button
                                    onClick={loadKhaltiCheckout}
                                    disabled={!khaltiLoaded}
                                    className={`w-full py-3 rounded transition ${khaltiLoaded
                                        ? "bg-purple-600 text-white hover:bg-purple-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {khaltiLoaded ? "Pay with Khalti" : "Loading Khalti..."}
                                </button>
                            ) : (
                                <button
                                    onClick={() => submitOrder(paymentMethod)}
                                    className="bg-orange-500 text-white w-full py-3 rounded hover:bg-orange-600 transition"
                                >
                                    Place Order
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Checkout;
