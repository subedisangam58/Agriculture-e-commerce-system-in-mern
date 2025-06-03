"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
}

function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:8000/api/products')
            .then((res) => res.json())
            .then((data) => {
                setProducts(data.products || []);
                setFilteredProducts(data.products || []);
            })
            .catch((err) => console.error('Error fetching products:', err));
    }, []);

    useEffect(() => {
        let filtered = products;
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }
        if (priceFilter === 'low') {
            filtered = filtered.sort((a, b) => a.price - b.price);
        } else if (priceFilter === 'high') {
            filtered = filtered.sort((a, b) => b.price - a.price);
        }
        setFilteredProducts([...filtered]);
    }, [searchTerm, categoryFilter, priceFilter]);

    const categories = Array.from(new Set(products.map((p) => p.category)));

    return (
        <div className="bg-[#fdfced] px-4 sm:px-6 lg:px-20 py-10 pt-30">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Fresh Produce</h1>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border rounded"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border rounded"
                    >
                        <option value="">Default</option>
                        <option value="low">Price: Low to High</option>
                        <option value="high">Price: High to Low</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border rounded"
                    />
                    <button className="bg-gray-800 text-white px-4 py-2 rounded">Filter</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            src={product.imageUrl || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-500">Locally Sourced</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {product.description.split(" ").slice(0, 12).join(" ")}...
                            </p>
                            <p className="text-green-600 font-bold mt-2">Rs. {product.price.toFixed(2)}</p>
                            <button
                                onClick={() => router.push(`/products/${product._id}`)}
                                className="mt-4 inline-block text-sm text-white bg-orange-500 px-4 py-2 rounded hover:bg-orange-600 cursor-pointer"
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;
