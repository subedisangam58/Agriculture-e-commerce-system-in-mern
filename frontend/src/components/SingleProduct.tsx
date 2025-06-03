"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Product {
    createdBy: any;
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
}

interface SingleProductProps {
    productId: string;
}

function SingleProduct({ productId }: SingleProductProps) {
    const { user } = useAuth(); // Access current user
    const [product, setProduct] = useState<Product | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8000/api/products/${productId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to fetch product");

            setProduct(data.product);

            // Fetch related products
            const relatedRes = await fetch(
                `http://localhost:8000/api/products?category=${data.product.category}`
            );
            const relatedData = await relatedRes.json();
            const filtered = relatedData.products.filter(
                (p: Product) => p._id !== productId
            );
            setRelated(filtered);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) fetchProduct();
    }, [productId, fetchProduct]);

    const handleAddToCart = async () => {
        if (!product || user?.role !== "user") return;

        try {
            const response = await fetch("http://localhost:8000/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ productId: product._id, quantity: 1 }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert("Product added to cart!");
        } catch (err: any) {
            alert(err.message || "Failed to add product to cart.");
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-700">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
    if (!product) return null;

    return (
        <div className="pl-4 pr-4 md:pl-60 md:pr-60 bg-[#fdfced] p-6 pt-30">
            {/* Product Details */}
            <div className="flex flex-col md:flex-row gap-10">
                <img
                    src={product.imageUrl || "/images/placeholder.jpg"}
                    alt={product.name}
                    className="w-full md:w-1/2 h-96 object-cover rounded shadow"
                />
                <div className="flex flex-col justify-between w-full">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            {product.name}
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            Sold by: <strong>{product.createdBy?.name || "Unknown Seller"}</strong>
                        </p>
                        <p className="text-gray-700 mb-4">{product.description}</p>
                        <hr className="mb-4" />
                        <p className="text-green-600 text-2xl font-bold">
                            Rs. {product.price.toFixed(2)}{" "}
                            <span className="text-base font-normal text-gray-600">/ lb</span>
                        </p>
                    </div>

                    {user?.role === "user" && (
                        <button
                            onClick={handleAddToCart}
                            className="mt-6 bg-orange-500 text-white py-3 rounded hover:bg-orange-600 text-lg font-semibold"
                        >
                            🛒 Add to Cart
                        </button>
                    )}

                    {user?.role === "farmer" && (
                        <p className="mt-6 text-red-500 text-sm">
                            Only customers can add products to cart.
                        </p>
                    )}
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-700">
                        This product is fresh and high quality! —{" "}
                        <span className="text-sm text-gray-500">User123</span>
                    </p>
                </div>
            </div>

            {/* Similar Products */}
            {related.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Similar Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {related.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <img
                                    src={item.imageUrl || "/images/placeholder.jpg"}
                                    alt={item.name}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">Locally Sourced</p>
                                    <p className="text-green-600 font-bold mt-1">
                                        Rs. {item.price.toFixed(2)}
                                    </p>
                                    <Link
                                        href={`/products/${item._id}`}
                                        className="mt-2 inline-block text-sm text-white bg-orange-500 px-4 py-1 rounded hover:bg-orange-600"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SingleProduct;
