import { CONFIG } from 'src/global-config';

import { PublicationCreateView } from 'src/sections/publications/view/publication-create-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload Paper | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PublicationCreateView />;
}
