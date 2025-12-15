import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function HomeMinimal({ sx, ...other }) {
  const renderDescription = () => (
    <>
      <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
        Welcome to <Box component="span" sx={{ color: 'primary.main' }}>Publish3</Box>
      </Typography>

      <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
        Publish3 is an x402-powered decentralized publishing and micro-royalty protocol that lets researchers mint their papers as on-chain assets and receive instant payments for both downloads and citations.
      </Typography>

      <Typography variant="body1" sx={{ mb: 6, color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
        Using Movement's x402 payment rails, every purchase or citation of a paper triggers automated, real-time micropayments to the authors and to the researchers whose work was cited—creating the first incentive-aligned economic system for scientific knowledge.
      </Typography>

      <Box
        component={m.div}
        variants={varFade('inUp', { distance: 24 })}
        sx={{ mb: 6 }}
      >
        <Button
          component={RouterLink}
          href={paths.auth.privy.signIn}
          size="large"
          variant="contained"
          sx={{ px: 6, py: 2 }}
        >
          Get Started
        </Button>
      </Box>

      <Stack spacing={6} sx={{ maxWidth: 800, mx: 'auto' }}>
        {ITEMS.map((item) => (
          <Box
            component={m.div}
            variants={varFade('inUp', { distance: 24 })}
            key={item.title}
            sx={[{ gap: 3, display: 'flex', textAlign: 'left' }]}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>
            <Stack spacing={1}>
              <Typography variant="h5" component="h6">
                {item.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  );

  return (
    <Box
      component="section"
      sx={[
        {
          overflow: 'hidden',
          position: 'relative',
          py: { xs: 10, md: 20 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <MotionViewport>
        <Container sx={{ position: 'relative' }}>
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
            {renderDescription()}
          </Box>
        </Container>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const ITEMS = [
  {
    title: 'On-Chain Assets',
    description: 'Mint research papers as verifiable on-chain assets with immutable provenance and ownership tracking.',
    icon: 'A',
  },
  {
    title: 'Micro-Royalties',
    description: 'Automated real-time micropayments for downloads and citations using Movement\'s x402 payment rails.',
    icon: 'M',
  },
  {
    title: 'Incentive-Aligned',
    description: 'Replace legacy paywalls with transparent, programmable micro-royalties ensuring fair rewards for researchers.',
    icon: 'I',
  },
  {
    title: 'Permissionless Access',
    description: 'Users get low-cost, permissionless access to academic content while authors receive fair compensation.',
    icon: 'P',
  },
];
