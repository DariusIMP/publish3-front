import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const _account = [
  {
    label: 'Home',
    href: '/',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'My Wallet',
    href: paths.dashboard.wallet.view,
    icon: <Iconify icon="solar:wallet-bold-duotone" />,
  },
];
