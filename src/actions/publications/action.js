'use client';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export const getPublicationsList = async () => {
    try {
        const response = await axiosInstance.get(endpoints.publications.list);
        return response.data.publications || [];
    } catch (error) {
        console.error('Error during get publications list:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------

export const searchPublicationsByTitle = async (title) => {
    try {
        const response = await axiosInstance.get(endpoints.publications.searchByTitle, {
            params: { title }
        });
        return response.data || [];
    } catch (error) {
        console.error('Error during search publications by title:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------

export const searchPublicationsByTag = async (tag) => {
    try {
        const response = await axiosInstance.get(endpoints.publications.searchByTag, {
            params: { tag }
        });
        return response.data || [];
    } catch (error) {
        console.error('Error during search publications by tag:', error);
        throw error;
    }
};

// ----------------------------------------------------------------------

