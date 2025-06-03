"use client";

import cropData from '@/data/crops-details.json';
import { useEffect, useState } from 'react';

interface Crop {
    name: string;
    category: string;
    introduction: string;
    seed_selection: string;
    fertilization_and_tilling: string;
    irrigation: string;
    crop_rotation_and_intercropping: string;
    production: string;
    climate_and_soil: string;
    uses_and_importance: string;
    main_varieties: string[];
    spacing: string;
}

const CropDetailCard = ({ crop, isOpen, toggleOpen }: {
    crop: Crop;
    isOpen: boolean;
    toggleOpen: () => void;
}) => {
    return (
        <div className="mb-4 border rounded-lg shadow-sm overflow-hidden">
            <div
                className="p-4 bg-green-50 flex justify-between items-center cursor-pointer"
                onClick={toggleOpen}
            >
                <div>
                    <h3 className="text-xl font-bold text-green-800">{crop.name}</h3>
                    <span className="text-sm text-green-600">{crop.category}</span>
                </div>
                <span className="text-green-800">
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {isOpen && (
                <div className="p-4 bg-white">
                    <p className="mb-4">{crop.introduction}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold text-green-700">Seed Selection</h4>
                                <p>{crop.seed_selection}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-green-700">Fertilization & Tilling</h4>
                                <p>{crop.fertilization_and_tilling}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-green-700">Irrigation</h4>
                                <p>{crop.irrigation}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-green-700">Crop Rotation & Intercropping</h4>
                                <p>{crop.crop_rotation_and_intercropping}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold text-green-700">Production</h4>
                                <p>{crop.production}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-green-700">Climate & Soil</h4>
                                <p>{crop.climate_and_soil}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-green-700">Uses & Importance</h4>
                                <p>{crop.uses_and_importance}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-green-700">Spacing</h4>
                                <p>{crop.spacing}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold text-green-700">Main Varieties</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {crop.main_varieties.map((variety, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                >
                                    {variety}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CropFilter = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm
}: {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}) => {
    return (
        <div className="pt-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-end md:gap-4">
                {/* Search Input */}
                <div className="flex-1 mb-4 md:mb-0">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search Crops
                    </label>
                    <input
                        type="text"
                        id="search"
                        className="w-full p-2 border rounded-md"
                        placeholder="Search by crop name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="flex-1">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Category
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">All</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

const CropDetails = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [openCropId, setOpenCropId] = useState<string | null>(null);

    useEffect(() => {
        try {
            setCrops(cropData.crops);
            setLoading(false);
        } catch (err) {
            setError('Error loading crop data. Please try again later.');
            setLoading(false);
            console.error('Error loading crop data:', err);
        }
    }, []);

    const categories = [...new Set(crops.map(crop => crop.category))];

    const filteredCrops = crops.filter(crop => {
        const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || crop.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleCrop = (cropName: string) => {
        setOpenCropId(prev => (prev === cropName ? null : cropName));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading crop data...</div>;
    }

    if (error) {
        return <div className="text-red-600 p-4 border border-red-300 rounded">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-green-800 mb-6">Crop Information</h1>

                <CropFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {filteredCrops.length > 0 ? (
                    <div>
                        {filteredCrops.map((crop) => (
                            <CropDetailCard
                                key={crop.name}
                                crop={crop}
                                isOpen={openCropId === crop.name}
                                toggleOpen={() => toggleCrop(crop.name)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <p className="text-lg text-gray-600">No crops found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropDetails;
