import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { usePrivy } from '@privy-io/react-auth';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, sx, ...other }) {
  const router = useRouter();

  const { ready, authenticated, logout } = usePrivy();

  const disableLogout = !ready || (ready && !authenticated);

  const handleLogout = useCallback(async () => {
    try {
      await logout();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [authenticated, onClose, router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      disabled={disableLogout}
      {...other}
    >
      Logout
    </Button>
  );
}
