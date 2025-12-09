'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {

  return (
    <PrivyProvider
      appId={CONFIG.privyAppId}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}
