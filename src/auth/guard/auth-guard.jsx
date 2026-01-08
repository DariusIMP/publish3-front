'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const signInPaths = {
  privy: paths.auth.privy.signIn,
};

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, ready } = usePrivy();

  const [isChecking, setIsChecking] = useState(true);

  const createRedirectPath = useCallback((currentPath) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  }, [pathname]);

  const checkPermissions = useCallback(async () => {
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
  }, [authenticated, ready, router, createRedirectPath]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
