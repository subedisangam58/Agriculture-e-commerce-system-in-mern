"use client";
import React, { useEffect, useState } from 'react';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
}

function HeroSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Authenticate user
                const authRes = await fetch('http://localhost:8000/api/users/check-auth', {
                    credentials: 'include',
                });
                const authData = await authRes.json();

                if (authData.success && authData.user?._id) {
                    setUserId(authData.user._id);

                    // Fetch products and hybrid recommendations in parallel
                    const [productRes, recommendationRes] = await Promise.all([
                        fetch('http://localhost:8000/api/products'),
                        fetch(`http://localhost:8000/api/recommendations/hybrid/${authData.user._id}`)
                    ]);

                    const productData = await productRes.json();
                    const recommendationData = await recommendationRes.json();

                    setProducts(productData.products || []);
                    setRecommended(recommendationData || []);
                } else {
                    // User not logged in, just load products
                    const productRes = await fetch('http://localhost:8000/api/products');
                    const productData = await productRes.json();
                    setProducts(productData.products || []);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="bg-[#fdfced]">
            {/* Hero Section */}
            <section className="pt-32 text-center py-20 px-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    Fresh From the Farm, Straight to Your Table
                </h1>
                <p className="text-gray-600 max-w-xl mx-auto mb-6">
                    Discover the best local produce directly from farmers near you. High-quality,
                    fresh vegetables delivered with care.
                </p>
                <a href="/products" className="bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition">
                    Browse Products →
                </a>
            </section>

            {/* Featured Products */}
            <section className="px-6 py-10">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src={product.imageUrl || '/images/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {product.description.split(" ").slice(0, 12).join(" ")}...
                                </p>
                                <p className="text-green-600 font-bold">Rs. {product.price.toFixed(2)}</p>
                                <a
                                    href={`/products/${product._id}`}
                                    className="mt-4 inline-block text-sm text-white bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
                                >
                                    View Details
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Personalized Recommendations */}
            {userId ? (
                loading ? (
                    <p className="text-center text-gray-500 mb-10">Loading recommendations...</p>
                ) : recommended.length > 0 ? (
                    <section className="px-6 py-10 bg-[#fffaf2]">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Recommended Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                            {recommended.map((product) => (
                                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <img
                                        src={product.imageUrl || '/images/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                                        <p className="text-green-600 font-bold">Rs. {product.price.toFixed(2)}</p>
                                        <a
                                            href={`/products/${product._id}`}
                                            className="mt-4 inline-block text-sm text-white bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
                                        >
                                            View Details
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null
            ) : (
                <p className="text-center text-gray-400 mb-10">Sign in to see personalized recommendations.</p>
            )}

            {/* Farmer CTA */}
            <section className="text-center bg-[#fdfced] py-20 px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Are You a Farmer?</h2>
                <p className="text-gray-600 max-w-xl mx-auto mb-6">
                    Join our community of local farmers and reach more customers. List your fresh produce easily and grow your business.
                </p>
                <a href="/signup" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition">
                    Register Your Farm 🌱
                </a>
            </section>
        </div>
    );
}

export default HeroSection;