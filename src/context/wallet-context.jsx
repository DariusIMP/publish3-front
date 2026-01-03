'use client';

import { createContext, use, useState, useEffect, useCallback } from 'react';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

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

const WalletContext = createContext(undefined);

// ----------------------------------------------------------------------

export function WalletProvider({ children }) {
  const { user } = useAuthContext();

  const [walletAddress, setWalletAddress] = useState(null);
  const [moveBalance, setMoveBalance] = useState(0);
  const [collectedMoney, setCollectedMoney] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wallet data when user changes
  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    } else {
      // Reset state when user logs out
      setWalletAddress(null);
      setMoveBalance(0);
      setCollectedMoney(0);
      setError(null);
    }
  }, [user?.id]);

  // Load balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadBalance();
    } else {
      setMoveBalance(0);
    }
  }, [walletAddress]);

  const loadWalletData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch wallet address
      const walletResponse = await axiosInstance.get(endpoints.users.getWallet(user.id));
      if (walletResponse.data?.wallet_address) {
        setWalletAddress(walletResponse.data.wallet_address);
      } else {
        setWalletAddress(null);
      }

      // Fetch user data for collected money
      const userResponse = await axiosInstance.get(endpoints.users.get(user.id));
      setCollectedMoney(userResponse.data?.user?.collected_money || 0);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setError('Failed to load wallet information');
      setWalletAddress(null);
      setCollectedMoney(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadBalance = useCallback(async () => {
    if (!walletAddress) return;

    setBalanceLoading(true);
    try {
      const balance = await fetchMoveBalance(walletAddress);
      setMoveBalance(balance / MOVE_TO_OCTAS_FACTOR);
    } catch (error) {
      console.error('Error loading balance:', error);
      setMoveBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  }, [walletAddress]);

  const handleRefresh = useCallback(async () => {
    await loadWalletData();
  }, [loadWalletData]);

  const handleFundWallet = useCallback(async () => {
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
      setError(`Failed to fund wallet: ${error.message}`);
    } finally {
      setFunding(false);
    }
  }, [walletAddress, loadBalance]);

  const formatMoveBalance = useCallback((balance) => {
    // Format with up to 8 decimal places, remove trailing zeros
    const formatted = balance.toFixed(8);
    // Remove trailing zeros and the decimal point if all zeros after it
    return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
  }, []);

  const formatAddress = useCallback((address) => {
    if (!address) return 'Not set';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }, []);

  const state = {
    // State
    walletAddress,
    moveBalance,
    collectedMoney,
    loading,
    balanceLoading,
    funding,
    error,

    // Actions
    loadWalletData,
    loadBalance,
    handleRefresh,
    handleFundWallet,
    formatMoveBalance,
    formatAddress,
  };

  return <WalletContext.Provider value={state}>{children}</WalletContext.Provider>;
}

// ----------------------------------------------------------------------

export function useWalletContext() {
  const context = use(WalletContext);

  if (!context) {
    throw new Error('useWalletContext: Context must be used inside WalletProvider');
  }

  return context;
}
