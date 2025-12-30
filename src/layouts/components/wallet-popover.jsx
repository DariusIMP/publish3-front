'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { varTap, varHover, transitionTap } from 'src/components/animate';

import { useWalletContext } from 'src/context/wallet-context';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function WalletPopover({ sx, ...other }) {
  const router = useRouter();
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const {
    walletAddress,
    moveBalance,
    collectedMoney,
    loading,
    balanceLoading,
    funding,
    error,
    handleRefresh,
    handleFundWallet,
    formatMoveBalance,
    formatAddress,
  } = useWalletContext();

  const handleViewWalletDetails = () => {
    onClose();
    router.push(paths.dashboard.wallet.view);
  };

  const renderPopoverContent = () => (
    <CustomPopover open={open} anchorEl={anchorEl} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Wallet Information
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          </Box>
        ) : (
          <>
            {/* Wallet Address */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Wallet Address
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {formatAddress(walletAddress)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Move Balance */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Move Balance
                </Typography>
                <Button
                  size="small"
                  onClick={handleRefresh}
                  disabled={balanceLoading}
                  sx={{ minWidth: 'auto', padding: '2px 6px' }}
                >
                  Refresh
                </Button>
              </Box>
              {balanceLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Loading...
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h6">
                  {formatMoveBalance(moveBalance)} MOVE
                </Typography>
              )}
            </Box>

            {/* Collected Money */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Collected Money
              </Typography>
              <Typography variant="h6">
                ${collectedMoney.toFixed(2)}
              </Typography>
            </Box>

            {/* View Wallet Details Button */}
            <Button
              variant="contained"
              fullWidth
              size="small"
              onClick={handleViewWalletDetails}
              disabled={loading || balanceLoading}
              startIcon={<Iconify icon="solar:wallet-bold" width={16} />}
            >
              View Wallet Details
            </Button>
          </>
        )}
      </Box>
    </CustomPopover>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Wallet button"
        onClick={onOpen}
        sx={[
          (theme) => ({
            p: 0,
            width: 40,
            height: 40,
            ...(open && { bgcolor: theme.vars.palette.action.selected }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Iconify icon="solar:wallet-bold" width={24} />
      </IconButton>

      {renderPopoverContent()}
    </>
  );
}
