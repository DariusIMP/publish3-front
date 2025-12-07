import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Authors | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Authors Management" description="This page will display a list of all authors. Feature coming soon!" />;
}
