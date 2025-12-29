import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Publications Management - For All Users
   */
  {
    subheader: 'Publications',
    items: [
      {
        title: 'Browse Papers',
        path: paths.dashboard.publications.list,
        icon: ICONS.folder,
      },
      {
        title: 'Authors',
        path: paths.dashboard.authors.list,
        icon: ICONS.user,
      },
      {
        title: 'My Purchased Papers',
        path: paths.dashboard.purchasedPapers.list,
        icon: ICONS.file,
        description: 'View papers you have purchased',
      },
      {
        title: 'Citations',
        path: paths.dashboard.citations.list,
        icon: ICONS.label,
      },
    ],
  },
  
  /**
   * Author Dashboard - Only for Registered Authors
   */
  {
    subheader: 'Author Dashboard',
    requiresAuthor: true,
    items: [
      {
        title: 'Upload Paper',
        path: paths.dashboard.publications.create,
        icon: ICONS.file,
        requiresAuthor: true,
      },
      {
        title: 'Author Profile',
        path: paths.dashboard.authors.details.view,
        icon: ICONS.user,
        requiresAuthor: true,
      },
    ],
  },
];
