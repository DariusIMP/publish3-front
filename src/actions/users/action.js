'use client';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export const getUsersCount = async () => {
    try {
        const response = await axiosInstance.get(endpoints.users.count);
        return response.data.total || 0;
    } catch (error) {
        console.error('Error during get users count:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------
