'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';

import Button from '@mui/material/Button';

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
