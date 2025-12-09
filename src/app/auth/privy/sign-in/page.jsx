import { CONFIG } from 'src/global-config';

import { PrivySignInView } from 'src/auth/view/privy';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in | Privy - ${CONFIG.appName}` };

export default function Page() {
  return <PrivySignInView />;
}
