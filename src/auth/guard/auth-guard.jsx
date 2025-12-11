'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

import { usePrivy } from '@privy-io/react-auth';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const signInPaths = {
  privy: paths.auth.privy.signIn,
};

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, ready, user } = usePrivy();

  const [isChecking, setIsChecking] = useState(true);

  const createRedirectPath = (currentPath) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  };

  useEffect(() => {
    const handleBackendSignIn = async () => {
      console.log('User authenticated with Privy, calling backend sign-in', user);
      try {
        const response = await axiosInstance.post(endpoints.users.signin);
        console.log('Backend sign-in successful:', response.data);
      } catch (backendError) {
        console.error('Failed to sign in with backend:', backendError);
      }
    }

    if (user) {
      handleBackendSignIn();
    }
  }, [user]);

  const checkPermissions = async () => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      const { method } = CONFIG.auth;

      const signInPath = signInPaths[method];
      const redirectPath = createRedirectPath(signInPath);

      router.replace(redirectPath);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, ready]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
