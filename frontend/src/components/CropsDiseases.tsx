"use client";

import { useState } from "react";
import diseasesData from "@/data/crops-diseases.json";

interface DiseaseEntry {
    Name: string;
    Description: string;
    Picture: string;
    Solution: string;
}

type CropsDiseasesJson = {
    [cropName: string]: Array<{ [diseaseId: string]: DiseaseEntry }>;
};

export default function CropsDiseases() {
    const rawData = diseasesData as unknown as CropsDiseasesJson;
    const cropNames = Object.keys(rawData);
    const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

    const getFirstImage = (crop: string): string | null => {
        const diseasesObj = rawData[crop]?.[0];
        if (!diseasesObj) return null;

        const firstDisease = Object.values(diseasesObj)[0];
        return firstDisease?.Picture || null;
    };

    return (
        <div className="p-6 pt-0">
            <h1 className="text-3xl font-bold mb-6 text-green-700 pl-20 pr-20">बाली अनुसार रोग जानकारी</h1>

            {!selectedCrop ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pl-20 pr-20">
                    {cropNames.map((crop) => {
                        const image = getFirstImage(crop);
                        return (
                            <div
                                key={crop}
                                onClick={() => setSelectedCrop(crop)}
                                className="cursor-pointer border border-gray-200 rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white"
                            >
                                {image && (
                                    <img
                                        src={image}
                                        alt={crop}
                                        className="h-48 w-full object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold capitalize text-center">
                                        {crop}
                                    </h2>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <>
                    <button
                        className="mb-4 text-blue-600 underline pl-20 pr-20"
                        onClick={() => setSelectedCrop(null)}
                    >
                        ← अन्य बाली हेर्नुहोस्
                    </button>

                    <div className="space-y-6 pl-20 pr-20">
                        {Object.entries(rawData[selectedCrop][0]).map(([id, disease]) => (
                            <div
                                key={id}
                                className="border border-gray-300 rounded p-4 shadow-md bg-white"
                            >
                                <h2 className="text-xl font-semibold text-indigo-700 mb-2">
                                    {disease.Name}
                                </h2>
                                {disease.Picture && (
                                    <img
                                        src={disease.Picture}
                                        alt={disease.Name}
                                        className="max-w-md w-full mb-4 rounded"
                                    />
                                )}
                                <p className="mb-2 whitespace-pre-line">
                                    <strong>लक्षण:</strong> {disease.Description}
                                </p>
                                <p className="whitespace-pre-line">
                                    <strong>उपाय:</strong> {disease.Solution}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
