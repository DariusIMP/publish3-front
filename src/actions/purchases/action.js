'use client';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export const getPurchasesCount = async () => {
    try {
        const response = await axiosInstance.get(endpoints.purchases.count);
        return response.data.total || 0;
    } catch (error) {
        console.error('Error during get purchases count:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------
