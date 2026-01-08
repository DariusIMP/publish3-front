'use client'

import { Button, Stack, Typography } from "@mui/material";
import { usePrivy, useLogin } from "@privy-io/react-auth";

export function PrivySignInView() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  const disableLogin = !ready || authenticated;

  return (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{ maxWidth: 420, mx: "auto", mt: 8, textAlign: "center" }}
    >

      <Typography variant="body2" color="text.secondary">
        Sign in to start publishing and managing your work.
      </Typography>

      <Button
        fullWidth
        color="primary"
        size="large"
        variant="contained"
        disabled={disableLogin}
        onClick={login}
      >
        Get started with Privy
      </Button>
    </Stack>
  );
}
