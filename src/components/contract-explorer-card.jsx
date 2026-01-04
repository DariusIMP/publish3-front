import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function ContractExplorerCard({ sx, ...other }) {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const explorerUrl = contractAddress
    ? `https://explorer.movementnetwork.xyz/account/${contractAddress}/modules/code/publication_registry?network=bardock+testnet`
    : 'https://explorer.movementnetwork.xyz/';

  return (
    <Card
      sx={[
        (theme) => ({
          p: 5,
          display: 'flex',
          alignItems: 'center',
          color: 'common.white',
          background: `radial-gradient(70% 70% at 0% 0%, ${theme.vars.palette.grey[700]} 0%, ${theme.vars.palette.common.black} 100%)`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component="img"
        alt="Movement Explorer"
        src={`${CONFIG.assetsDir}/assets/illustrations/movement_logo.png`}
        sx={{
          right: 16,
          zIndex: 9,
          width: 120,
          height: 120,
          position: 'absolute',
        }}
      />

      <SvgColor
        src={`${CONFIG.assetsDir}/assets/background/shape-circle-1.svg`}
        sx={{
          zIndex: 8,
          width: 200,
          right: -32,
          height: 200,
          opacity: 0.12,
          position: 'absolute',
        }}
      />

      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ maxWidth: 180 }}>
          Check the Publish3 smart contract
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 180 }}>
          View the deployed contract on the Movement network explorer.
        </Typography>

        <Button
          color="primary"
          variant="contained"
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Explorer
        </Button>
      </Stack>
    </Card>
  );
}
