import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Citations | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Citations Management" description="This page will display a list of all citations. Feature coming soon!" />;
}
