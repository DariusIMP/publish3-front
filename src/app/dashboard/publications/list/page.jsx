import { CONFIG } from 'src/global-config';

import { PublicationListView } from 'src/sections/publications/view/publication-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Browse Papers | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PublicationListView />;
}
