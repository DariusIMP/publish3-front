'use client';

import { useState, useEffect, useCallback } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { CONFIG } from 'src/global-config';
import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

function AuthProviderContent({ children }) {
  const { authenticated, ready } = usePrivy();

  const [user, setUser] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!authenticated) {
      setUser(null);
      setAuthor(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(endpoints.users.signin);
      console.log('Backend data:', response.data);

      setUser(response.data.user);
      setAuthor(response.data.author);
    } catch (err) {
      console.error('Failed to fetch backend data:', err);
      setError(err.message || 'Failed to fetch user data');
      setUser(null);
      setAuthor(null);
    } finally {
      setIsLoading(false);
    }
  }, [authenticated]);

  // Auto-fetch when authentication state changes
  useEffect(() => {
    if (ready) {
      fetchData();
    }
  }, [ready, fetchData]);

  const updateAuthor = useCallback((newAuthorData) => {
    setAuthor(newAuthorData);
  }, []);

  const value = {
    user,           // Backend user data
    author,         // Author data (or null)
    isLoading,
    error,
    refresh: fetchData,
    updateAuthor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  return (
    <PrivyProvider
      appId={CONFIG.privyAppId}
    >
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </PrivyProvider>
  );
}
