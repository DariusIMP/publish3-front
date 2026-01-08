import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { CONFIG } from 'src/global-config';
import { formatMoveBalance } from 'src/lib/aptos';
import { useWalletContext } from 'src/context/wallet-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function WalletCurrentBalance({ balance, sx, ...other }) {
  const showCurrency = useBoolean();
  const { walletAddress } = useWalletContext();

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
    : '';

  return (
    <Box
      sx={[
        (theme) => ({
          ...theme.mixins.bgGradient({
            images: [`url(${CONFIG.assetsDir}/assets/background/background-4.jpg)`],
          }),
          mb: 2,
          borderRadius: 2,
          position: 'relative',
          '&::before, &::after': {
            left: 0,
            right: 0,
            mx: '28px',
            zIndex: -2,
            height: 40,
            bottom: -16,
            content: "''",
            opacity: 0.16,
            borderRadius: 1.5,
            bgcolor: 'grey.500',
            position: 'absolute',
          },
          '&::after': { mx: '16px', bottom: -8, opacity: 0.32 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ p: 3, width: 1, color: 'common.white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ typography: 'subtitle2', opacity: 0.48 }}>Current balance</Box>
          <img
            src={`${CONFIG.assetsDir}/assets/icons/platforms/Privy_Brandmark_White.png`}
            alt="Privy"
            style={{ width: 70, height: 'auto' }}
          />
        </Box>

        <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ typography: 'h4' }}>
            {showCurrency.value ? '********' : formatMoveBalance(balance, 2)}
          </Box>

          <IconButton color="inherit" onClick={showCurrency.onToggle} sx={{ opacity: 0.48 }}>
            <Iconify icon={showCurrency.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
          </IconButton>
        </Box>

        <Box sx={{
          my: 3,
          gap: 1,
          display: 'flex',
          alignItems: 'center',
          typography: 'subtitle2',
          justifyContent: 'flex-end',
        }}>
          {shortAddress}
        </Box>

        <Box sx={{ mt: 3, typography: 'subtitle1', opacity: 0.72 }}>
          Your wallet balance in Move tokens
        </Box>
      </Box>
    </Box>
  );
}
