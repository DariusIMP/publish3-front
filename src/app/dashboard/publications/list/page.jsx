import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Browse Papers | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Browse Papers" description="This page will display a list of all publications. Feature coming soon!" />;
}
