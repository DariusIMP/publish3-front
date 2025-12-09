'use client';

import Button from '@mui/material/Button';
import { useLogin, usePrivy } from '@privy-io/react-auth';

// ----------------------------------------------------------------------

export function PrivySignInView() {

  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  const disableLogin = !ready || (ready && authenticated);

  return (<Button
    fullWidth
    color="inherit"
    size="large"
    type="submit"
    variant="contained"
    disabled={disableLogin}
    onClick={login}
  >
    Get started
  </Button>);
}
