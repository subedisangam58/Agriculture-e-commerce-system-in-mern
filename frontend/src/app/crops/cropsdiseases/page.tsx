'use client';
import React from 'react';
import CropsDiseases from '@/components/CropsDiseases';

const CropDiseasesPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Crop Diseases</h1>
            <CropsDiseases />
        </div>
    );
};

export default CropDiseasesPage;
