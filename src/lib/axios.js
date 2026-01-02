import axios from 'axios';
import { getAccessToken } from '@privy-io/react-auth';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Failed to add Privy token to the request:', error);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },

  // Publications
  publications: {
    create: '/publications/create',
    simulate: '/publications/simulate',
    get: (id) => `/publications/${id}`,
    list: '/publications/list',
    count: '/publications/count',
    update: (id) => `/publications/${id}`,
    delete: (id) => `/publications/${id}`,
    searchByTitle: '/publications/search/title',
    searchByTag: '/publications/search/tag',
    listByUser: (userId) => `/publications/user/${userId}`,
    getAuthors: (publicationId) => `/publications/${publicationId}/authors`,
    getCitations: (publicationId) => `/publications/${publicationId}/citations`,
    getCitedBy: (publicationId) => `/publications/${publicationId}/cited-by`,
    getPdfUrl: (publicationId) => `/publications/${publicationId}/pdf-url`,
    checkAccess: (publicationId) => `/publications/${publicationId}/access`,
    prepareBlockchainPublish: (publicationId) => `/publications/${publicationId}/prepare-blockchain-publish`,
    purchase: (publicationId) => `/publications/${publicationId}/purchase`,
  },

  // Citations
  citations: {
    create: '/citations/create',
    get: (id) => `/citations/${id}`,
    list: '/citations/list',
    update: (id) => `/citations/${id}`,
    delete: (id) => `/citations/${id}`,
    getByPublications: '/citations/by-publications',
  },

  // Authors
  authors: {
    create: '/authors/create',
    get: (id) => `/authors/${id}`,
    list: '/authors/list',
    topByPurchases: '/authors/top-by-purchases',
    update: (id) => `/authors/${id}`,
    delete: (id) => `/authors/${id}`,
    getStats: (id) => `/authors/${id}/stats`,
  },

  // Users
  users: {
    signin: '/users/privy/sign-in',
    create: '/users/create',
    get: (id) => `/users/${id}`,
    list: '/users/list',
    count: '/users/count',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    getWallet: (id) => `/users/${id}/wallet`,
  },

  // Purchases
  purchases: {
    listByUser: (userId) => `/purchases/user/${userId}`,
    count: '/purchases/count',
  },

  // Publication Authors (junction table)
  publicationAuthors: {
    set: '/publication-authors/set',
  },
};
