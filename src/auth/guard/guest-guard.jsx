'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useCallback } from 'react';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { ready, authenticated } = usePrivy();

  const returnTo = searchParams.get('returnTo') || CONFIG.auth.redirectPath;

  const [isChecking, setIsChecking] = useState(true);

  const checkPermissions = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (authenticated) {
      router.replace(returnTo);
      return;
    }

    setIsChecking(false);
  }, [authenticated, ready, router, returnTo]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
