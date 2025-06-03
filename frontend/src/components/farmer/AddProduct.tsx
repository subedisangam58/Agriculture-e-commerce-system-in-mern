"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import SideNavbar from '@/components/farmer/SideNavbar';
import 'react-toastify/dist/ReactToastify.css';

function AddProduct() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const hasShownToast = useRef(false);

    interface ProductState {
        name: string;
        price: string;
        quantity: string;
        category: string;
        description: string;
    }

    const [product, setProduct] = useState<ProductState>({
        name: '',
        price: '',
        quantity: '',
        category: '',
        description: ''
    });

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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const fieldName = id.replace('product-', '');
        setProduct(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!product.name || !product.price || !product.quantity || !product.category || !product.description) {
            toast.error("Please fill all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('quantity', product.quantity);
        formData.append('category', product.category);
        formData.append('description', product.description);

        try {
            const res = await fetch("http://localhost:8000/api/products/addproduct", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Product added successfully!");
                setProduct({
                    name: '',
                    price: '',
                    quantity: '',
                    category: '',
                    description: ''
                });
            } else {
                toast.error(data.message || "Something went wrong.");
            }
        } catch (err) {
            toast.error("Server error. Please try again.");
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
                activePage="addproduct"
            />
            <div className="flex-1 p-6 ml-0 lg:ml-0 pt-16">
                <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

                <div className="flex flex-col md:flex-row w-full max-w-6xl gap-6">
                    <div className="w-full md:w-1/2">
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.preventDefault();
                            }}
                            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                        >
                            <div className="mb-4">
                                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input id="product-name" type="text" value={product.name} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Price</label>
                                <input id="product-price" type="number" value={product.price} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="product-quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input id="product-quantity" type="number" value={product.quantity} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="product-category" value={product.category} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2">
                                    <option value="">Select Category</option>
                                    <option value="vegetables">Vegetables</option>
                                    <option value="fruits">Fruits</option>
                                    <option value="grains">Grains</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea id="product-description" value={product.description} onChange={handleChange} className="mt-1 block w-full rounded border border-gray-300 p-2" rows={4}></textarea>
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">Add Product</button>
                        </form>
                    </div>

                    <div className="w-full md:w-1/2">
                        <div className="bg-white shadow-md rounded px-6 pt-6 pb-8">
                            <h2 className="text-xl font-semibold text-center mb-4">Product Preview</h2>
                            <div className="border rounded p-4">
                                <h3 className="text-lg font-bold">{product.name || "Product Name"}</h3>
                                <div className="flex justify-between text-sm my-2">
                                    <span className="text-blue-600">{product.price ? `Rs. ${product.price}` : "Rs. 0.00"}</span>
                                    <span>Stock: {product.quantity || 0}</span>
                                </div>
                                <p className="text-sm text-gray-700">{product.category}</p>
                                <p className="text-sm text-gray-600 mt-2">{product.description || "Product description will appear here..."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;