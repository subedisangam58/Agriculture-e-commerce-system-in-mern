"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = async (search: string) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/products/semantic-search?query=${encodeURIComponent(search)}`);
            setSuggestions(res.data.results || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Vector search error:", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSelect = (product: any) => {
        setQuery(product.name);
        setShowSuggestions(false);
        router.push(`/products/${product._id}`);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search products..."
                className="border rounded-full px-4 py-2 w-54 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10">
                    {suggestions.map((product) => (
                        <div
                            key={product._id}
                            onClick={() => handleSelect(product)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            {product.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default SearchBar;