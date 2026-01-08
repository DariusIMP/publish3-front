'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useWalletContext } from 'src/context/wallet-context';

// ----------------------------------------------------------------------

export default function WalletComponent({
  walletAddress: propWalletAddress,
  collectedMoney: propCollectedMoney = 0,
  registrationDate,
  showFundButton = false
}) {
  // Use wallet context for wallet data and operations
  const {
    walletAddress: contextWalletAddress,
    moveBalance,
    collectedMoney: contextCollectedMoney,
    balanceLoading,
    funding,
    error: balanceError,
    handleRefresh,
    handleFundWallet,
    formatMoveBalance,
  } = useWalletContext();

  // Use props if provided, otherwise use context values
  const walletAddress = propWalletAddress || contextWalletAddress;
  const collectedMoney = propCollectedMoney || contextCollectedMoney;

  // Local error state for component-specific errors
  const [localError, setLocalError] = useState(null);

  // Clear local error when wallet address changes
  useEffect(() => {
    setLocalError(null);
  }, [walletAddress]);

  const handleComponentRefresh = () => {
    setLocalError(null);
    handleRefresh();
  };

  const handleComponentFundWallet = async () => {
    try {
      await handleFundWallet();
    } catch (error) {
      console.error('Failed to fund wallet:', error);
      setLocalError(`Failed to fund wallet: ${error.message}`);
    }
  };

  const formatMoveBalanceLocal = (balance) => {
    // Format with up to 8 decimal places, remove trailing zeros
    const formatted = balance.toFixed(8);
    // Remove trailing zeros and the decimal point if all zeros after it
    return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
  };

  // Use context's formatMoveBalance if available, otherwise use local
  const displayFormatMoveBalance = formatMoveBalance || formatMoveBalanceLocal;

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Wallet Information
      </Typography>

      <CardContent sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Payout Wallet Address
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {walletAddress || 'Not set'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Move Balance
            </Typography>
            <Button
              size="small"
              onClick={handleComponentRefresh}
              disabled={balanceLoading || !walletAddress}
              sx={{ ml: 1, minWidth: 'auto', padding: '4px 8px' }}
            >
              Refresh
            </Button>
          </Box>

          {balanceLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Loading balance...
              </Typography>
            </Box>
          ) : localError || balanceError ? (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {localError || balanceError}
            </Typography>
          ) : (
            <>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {displayFormatMoveBalance(moveBalance)} Move
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live balance from Movement testnet (1 Move = 100,000,000 octas)
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Collected Money
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            ${collectedMoney.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total earnings from publications
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Registration Date
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.5 }}>
            {registrationDate ? new Date(registrationDate).toLocaleDateString() : 'Unknown'}
          </Typography>
        </Box>

        {showFundButton && walletAddress && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Button
              variant="contained"
              fullWidth
              size="medium"
              onClick={handleComponentFundWallet}
              disabled={funding || balanceLoading}
              startIcon={funding ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {funding ? 'Funding...' : 'Fund Wallet with Faucet (10 Move)'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Use the Movement testnet faucet to get 10 Move tokens for testing
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
