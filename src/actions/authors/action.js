'use client';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export const getAuthorsList = async () => {
  try {
    const response = await axiosInstance.get(endpoints.authors.list);
    return response.data.authors || [];
  } catch (error) {
    console.error('Error during get authors list:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const searchAuthorsByName = async (name) => {
  try {
    const response = await axiosInstance.get(endpoints.authors.search, {
      params: { name }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error during search authors by name:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const createAuthor = async (authorData) => {
  try {
    const response = await axiosInstance.post(endpoints.authors.create, authorData);
    return response.data;
  } catch (error) {
    console.error('Error during create author:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const updateAuthor = async (privyId, authorData) => {
  try {
    const response = await axiosInstance.put(endpoints.authors.update(privyId), authorData);
    return response.data;
  } catch (error) {
    console.error('Error during update author:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const deleteAuthor = async (privyId) => {
  try {
    await axiosInstance.delete(endpoints.authors.delete(privyId));
  } catch (error) {
    console.error('Error while deleting author:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const getAuthorDetails = async (privyId) => {
  try {
    const response = await axiosInstance.get(endpoints.authors.get(privyId));
    return response.data;
  } catch (error) {
    console.error('Error retrieving author details:', error);
    throw error;
  }
};
