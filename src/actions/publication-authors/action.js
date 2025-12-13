'use client';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export const setPublicationAuthors = async (publicationId, authorIds) => {
  try {
    const response = await axiosInstance.post(endpoints.publicationAuthors.set, {
      publication_id: publicationId,
      author_ids: authorIds
    });
    return response.data;
  } catch (error) {
    console.error('Error during set publication authors:', error);
    throw error;
  }
};
