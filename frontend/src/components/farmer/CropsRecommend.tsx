"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type FormDataKeys =
    | 'Temparature'
    | 'Humidity'
    | 'Moisture'
    | 'SoilType'
    | 'Nitrogen'
    | 'Potassium'
    | 'Phosphorous';

interface FormDataType {
    Temparature: string;
    Humidity: string;
    Moisture: string;
    SoilType: string;
    Nitrogen: string;
    Potassium: string;
    Phosphorous: string;
}

interface RecommendationResult {
    recommended_crop: string;
    recommended_fertilizer: string;
}

const CropsRecommendation = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const hasShownToast = useRef(false);

    const [formData, setFormData] = useState<FormDataType>({
        Temparature: '',
        Humidity: '',
        Moisture: '',
        SoilType: '',
        Nitrogen: '',
        Potassium: '',
        Phosphorous: ''
    });

    const [result, setResult] = useState<RecommendationResult | null>(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            if (!hasShownToast.current) {
                toast.warn('Please login first');
                hasShownToast.current = true;
            }
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setShowModal(false);

        try {
            const response = await axios.post('http://localhost:8000/api/ml/predict', formData);
            console.log("API Response:", response.data);
            setResult(response.data);
            setShowModal(true);
        } catch (err: any) {
            console.error("API Error:", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to get recommendation.');
        }
    };

    return (
        <div className="relative max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
            {/* Inline Modal directly above form */}
            {showModal && result && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-80 text-center border relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
                        >
                            &times;
                        </button>
                        <h3 className="text-lg font-bold mb-3">Recommendation</h3>
                        <p>🌱 <strong>Crop:</strong> {result.recommended_crop}</p>
                        <p>💊 <strong>Fertilizer:</strong> {result.recommended_fertilizer}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold mb-4">Crop & Fertilizer Recommendation</h2>
            <form onSubmit={handleSubmit}>
                {(['Temparature', 'Humidity', 'Moisture', 'Nitrogen', 'Potassium', 'Phosphorous'] as FormDataKeys[]).map((key) => (
                    <div key={key} className="mb-3">
                        <label className="block mb-1 capitalize">{key}</label>
                        <input
                            type="number"
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-1"
                            required
                        />
                    </div>
                ))}

                <div className="mb-3">
                    <label className="block mb-1">Soil Type</label>
                    <select
                        name="SoilType"
                        value={formData.SoilType}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                        required
                    >
                        <option value="">Select Soil Type</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Clayey">Clayey</option>
                        <option value="Red">Red</option>
                        <option value="Black">Black</option>
                    </select>
                </div>

                <button
                    className="bg-green-600 text-white px-4 py-2 rounded mt-4 cursor-pointer hover:bg-green-700 w-full"
                    type="submit"
                >
                    Get Recommendation
                </button>
            </form>

            {error && (
                <div className="mt-4 text-red-600 font-medium">{error}</div>
            )}
        </div>
    );
};

export default CropsRecommendation;