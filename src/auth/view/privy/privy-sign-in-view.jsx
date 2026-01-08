'use client'

import { usePrivy, useLogin } from "@privy-io/react-auth";

import { Box, Stack, Button, Typography } from "@mui/material";

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

      <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
        Welcome to <Box component="span" sx={{ color: 'primary.main' }}>Publish3</Box>
      </Typography>

      <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
        Publish3 enables fair and open academic publishing by putting ownership and payments on-chain. Authors publish instantly and get paid directly, while readers gain permanent access to research without traditional gatekeepers.
      </Typography>

      <Typography variant="body1" sx={{ mb: 6, color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
        Powered by Movement and Privy embedded wallets, Publish3 delivers decentralized guarantees with a familiar sign-in experience—no crypto setup required.
      </Typography>

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
