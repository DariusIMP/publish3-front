'use client';

import { useState, useEffect } from 'react';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

import { usePrivy } from '@privy-io/react-auth';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { ready, authenticated } = usePrivy();

  const returnTo = searchParams.get('returnTo') || CONFIG.auth.redirectPath;

  const [isChecking, setIsChecking] = useState(true);

  const checkPermissions = async () => {
    if (!ready) {
      return;
    }

    if (authenticated) {
      router.replace(returnTo);
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
