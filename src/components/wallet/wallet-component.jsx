'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { usePrivy, useWallets } from '@privy-io/react-auth';

// ----------------------------------------------------------------------

// Constants for Movement RPC
const MOVEMENT_RPC_URL = 'https://testnet.movementnetwork.xyz';
const APTOS_COIN_TYPE = '0x1::aptos_coin::AptosCoin';
const MOVE_TO_OCTAS_FACTOR = 100_000_000;

// Function to fetch Move balance from Movement testnet
async function fetchMoveBalance(walletAddress) {
  if (!walletAddress) {
    return 0;
  }

  try {
    // Ensure wallet address has 0x prefix
    const formattedAddress = walletAddress.startsWith('0x') ? walletAddress : `0x${walletAddress}`;

    const response = await fetch(
      `${MOVEMENT_RPC_URL}/v1/accounts/${formattedAddress}/balance/${APTOS_COIN_TYPE}`,
      {
        headers: {
          'Accept': 'application/json, application/x-bcs'
        }
      }
    );

    if (!response.ok) {
      // Handle 404 (wallet exists but has 0 balance) vs other errors
      if (response.status === 404) {
        return 0; // Wallet exists but has 0 balance
      }
      throw new Error(`Movement RPC error: ${response.status}`);
    }

    // The endpoint returns octas (10^8 octas = 1 MOVE)
    const octas = await response.json();
    return parseInt(octas);
  } catch (error) {
    console.error('Failed to fetch Move balance:', error);
    return 0; // Fallback to 0 on error
  }
}

// ----------------------------------------------------------------------

export default function WalletComponent({
  walletAddress,
  collectedMoney = 0,
  registrationDate,
  showFundButton = false
}) {
  const [moveBalance, setMoveBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  // Fetch balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadBalance();
    } else {
      setMoveBalance(0);
    }
  }, [walletAddress]);

  const loadBalance = async () => {
    if (!walletAddress) return;

    setBalanceLoading(true);
    setBalanceError(null);

    try {
      const balance = await fetchMoveBalance(walletAddress);
      setMoveBalance(balance / MOVE_TO_OCTAS_FACTOR);
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalanceError('Failed to load balance');
      setMoveBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBalance();
  };

  const formatMoveBalance = (balance) => {
    // Format with up to 8 decimal places, remove trailing zeros
    const formatted = balance.toFixed(8);
    // Remove trailing zeros and the decimal point if all zeros after it
    return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
  };

  const handleFundWallet = async () => {
    if (!walletAddress) return;

    setFunding(true);
    try {
      // Ensure wallet address has 0x prefix
      const formattedAddress = walletAddress.startsWith('0x') ? walletAddress : `0x${walletAddress}`;

      const response = await fetch('https://faucet.testnet.movementnetwork.xyz/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formattedAddress,
          amount: 10 * MOVE_TO_OCTAS_FACTOR,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Faucet error: ${response.status} - ${errorText}`);
      }

      // Wait a moment for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Refresh balance after funding
      await loadBalance();

    } catch (error) {
      console.error('Failed to fund wallet:', error);
      setBalanceError(`Failed to fund wallet: ${error.message}`);
    } finally {
      setFunding(false);
    }
  };

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
              onClick={handleRefresh}
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
          ) : balanceError ? (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {balanceError}
            </Typography>
          ) : (
            <>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {formatMoveBalance(moveBalance)} Move
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
              onClick={handleFundWallet}
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
