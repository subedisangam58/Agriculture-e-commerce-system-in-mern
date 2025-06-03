'use client';
import React from 'react';
import CropsDetails from '@/components/CropDetails';

const CropDetailsPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Crop Details</h1>
            <CropsDetails />
        </div>
    );
};

export default CropDetailsPage;