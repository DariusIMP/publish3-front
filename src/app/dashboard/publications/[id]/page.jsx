import { CONFIG } from 'src/global-config';

import { PublicationPreviewView } from 'src/sections/publications/view/publication-preview-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Publication Preview | Dashboard - ${CONFIG.appName}` };

export default async function Page({ params }) {
  const { id } = await params;
  return <PublicationPreviewView id={id} />;
}
