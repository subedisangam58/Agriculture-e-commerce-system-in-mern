"use client";
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/ml';

const soilTypes = ['Loamy', 'Sandy', 'Clayey', 'Black', 'Red'];
const cropTypes = ['Wheat', 'Buckwheat', 'Millet', 'Maize', 'Paddy', 'Barley'];
const districts = [
    'KAILALI', 'KANCHANPUR', 'BARA', 'BHOJPUR', 'DHANKUTA', 'ILLAM', 'TAPLEJUNG',
    'SOLUKHUMBU', 'PANCHTHAR', 'SANKHUWASHAVA', 'TERHATHUM', 'DOTI', 'DADELDHURA',
    'BAITADI', 'ACHHAM', 'BAJURA', 'BAJHANG', 'DAILEKH', 'DANG', 'PYUTHAN', 'POKHARA', 'KATHMANDU'
];

const fertilizerDescriptions: Record<string, string> = {
    "10-26-26": "Contains 10% Nitrogen (N), 26% Phosphorous (P), and 26% Potassium (K) — Promotes root development and flowering.",
    "14-35-14": "Contains 14% Nitrogen (N), 35% Phosphorous (P), and 14% Potassium (K) — High Phosphorous mix, promotes root growth in early stages.",
    "17-17-17": "Contains 17% Nitrogen (N), 17% Phosphorous (P), and 17% Potassium (K) — Balanced fertilizer for general crop support.",
    "20-20": "Contains 20% Nitrogen (N), 20% Phosphorous (P). Potassium not specified — Supports overall plant health and early growth.",
    "28-28": "Contains 28% Nitrogen (N), 28% Phosphorous (P). Potassium not specified — Encourages strong early plant development."
};

const CropsRecommendation: React.FC = () => {
    const [cropResult, setCropResult] = useState('');
    const [fertResult, setFertResult] = useState('');
    const [yieldResult, setYieldResult] = useState<any>(null);

    const [cropInput, setCropInput] = useState<{
        temperature: number | undefined,
        humidity: number | undefined,
        moisture: number | undefined,
        soil_type: string,
        nitrogen: number | undefined,
        phosphorous: number | undefined,
        potassium: number | undefined
    }>({
        temperature: undefined,
        humidity: undefined,
        moisture: undefined,
        soil_type: '',
        nitrogen: undefined,
        phosphorous: undefined,
        potassium: undefined
    });

    const [fertInput, setFertInput] = useState<{
        crop_type: string,
        nitrogen: number | undefined,
        phosphorous: number | undefined,
        potassium: number | undefined
    }>({
        crop_type: '',
        nitrogen: undefined,
        phosphorous: undefined,
        potassium: undefined
    });

    const [yieldInput, setYieldInput] = useState<{
        crop: string,
        district: string,
        land_area: number | undefined
    }>({
        crop: '',
        district: '',
        land_area: undefined
    });

    const handleCropSubmit = async () => {
        try {
            const res = await axios.post(`${API_BASE}/predict-crop`, cropInput);
            setCropResult(res.data.recommended_crop);
        } catch (err) {
            setCropResult('Error predicting crop');
        }
    };

    const handleFertSubmit = async () => {
        try {
            const res = await axios.post(`${API_BASE}/recommend-fertilizer`, fertInput);
            setFertResult(res.data.recommended_fertilizer);
        } catch (err) {
            setFertResult('Error recommending fertilizer');
        }
    };

    const handleYieldSubmit = async () => {
        try {
            const res = await axios.post(`${API_BASE}/estimate-yield`, yieldInput);
            setYieldResult(res.data);
        } catch (err) {
            setYieldResult({ error: 'Error estimating yield' });
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center">🌾 Crop, Fertilizer & Yield Recommender</h1>

            {/* Crop Predictor */}
            <div className="p-6 border rounded-lg shadow bg-white">
                <h2 className="text-xl font-semibold mb-4">🌱 Crop Recommender</h2>
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col">
                        Soil Type
                        <select className="border p-2 rounded" value={cropInput.soil_type} onChange={e => setCropInput({ ...cropInput, soil_type: e.target.value })}>
                            <option value="">Select Soil Type</option>
                            {soilTypes.map(type => <option key={type}>{type}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col">
                        Temperature (°C)
                        <input type="number" placeholder="e.g., 28" value={cropInput.temperature ?? ''} onChange={e => setCropInput({ ...cropInput, temperature: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Humidity (%)
                        <input type="number" placeholder="e.g., 60" value={cropInput.humidity ?? ''} onChange={e => setCropInput({ ...cropInput, humidity: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Moisture (%)
                        <input type="number" placeholder="e.g., 45" value={cropInput.moisture ?? ''} onChange={e => setCropInput({ ...cropInput, moisture: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Nitrogen (N)
                        <input type="number" placeholder="e.g., 30" value={cropInput.nitrogen ?? ''} onChange={e => setCropInput({ ...cropInput, nitrogen: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Phosphorous (P)
                        <input type="number" placeholder="e.g., 15" value={cropInput.phosphorous ?? ''} onChange={e => setCropInput({ ...cropInput, phosphorous: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Potassium (K)
                        <input type="number" placeholder="e.g., 10" value={cropInput.potassium ?? ''} onChange={e => setCropInput({ ...cropInput, potassium: +e.target.value })} className="border p-2 rounded" />
                    </label>
                </div>
                <button onClick={handleCropSubmit} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">Predict Crop</button>
                {cropResult && <p className="mt-2 text-green-600 font-medium">Recommended Crop: <strong>{cropResult}</strong></p>}
            </div>

            {/* Fertilizer Recommender */}
            <div className="p-6 border rounded-lg shadow bg-white">
                <h2 className="text-xl font-semibold mb-4">💊 Fertilizer Recommender</h2>
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col">
                        Crop Type
                        <select className="border p-2 rounded" value={fertInput.crop_type} onChange={e => setFertInput({ ...fertInput, crop_type: e.target.value })}>
                            <option value="">Select Crop Type</option>
                            {cropTypes.map(crop => <option key={crop}>{crop}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col">
                        Nitrogen (N)
                        <input type="number" placeholder="e.g., 30" value={fertInput.nitrogen ?? ''} onChange={e => setFertInput({ ...fertInput, nitrogen: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Phosphorous (P)
                        <input type="number" placeholder="e.g., 20" value={fertInput.phosphorous ?? ''} onChange={e => setFertInput({ ...fertInput, phosphorous: +e.target.value })} className="border p-2 rounded" />
                    </label>
                    <label className="flex flex-col">
                        Potassium (K)
                        <input type="number" placeholder="e.g., 10" value={fertInput.potassium ?? ''} onChange={e => setFertInput({ ...fertInput, potassium: +e.target.value })} className="border p-2 rounded" />
                    </label>
                </div>
                <button onClick={handleFertSubmit} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">Recommend Fertilizer</button>
                {fertResult && (
                    <div className="mt-2 text-green-600 font-medium">
                        Recommended Fertilizer: <strong>{fertResult}</strong><br />
                        <span className="text-sm text-gray-600">{fertilizerDescriptions[fertResult] || "No description available."}</span>
                    </div>
                )}
            </div>

            {/* Yield Estimator */}
            <div className="p-6 border rounded-lg shadow bg-white">
                <h2 className="text-xl font-semibold mb-4">📊 Yield Estimator</h2>
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col">
                        Crop
                        <select className="border p-2 rounded" value={yieldInput.crop} onChange={e => setYieldInput({ ...yieldInput, crop: e.target.value })}>
                            <option value="">Select Crop</option>
                            {cropTypes.map(crop => <option key={crop}>{crop}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col">
                        District
                        <select className="border p-2 rounded" value={yieldInput.district} onChange={e => setYieldInput({ ...yieldInput, district: e.target.value })}>
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col">
                        Land Area (hectares)
                        <input type="number" placeholder="e.g., 2.5" value={yieldInput.land_area ?? ''} onChange={e => setYieldInput({ ...yieldInput, land_area: +e.target.value })} className="border p-2 rounded" />
                    </label>
                </div>
                <button onClick={handleYieldSubmit} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 cursor-pointer">Estimate Yield</button>
                {yieldResult && (
                    <div className="mt-2">
                        {yieldResult.error ? (
                            <p className="text-red-600">{yieldResult.error}</p>
                        ) : (
                            <p className="text-green-600">
                                Avg Yield/ha: <strong>{yieldResult.average_yield_per_ha}</strong><br />
                                Estimated Total Yield: <strong>{yieldResult.estimated_total_yield} kg</strong>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropsRecommendation;