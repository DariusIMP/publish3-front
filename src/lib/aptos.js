// Constants for Movement RPC
const MOVEMENT_RPC_URL = 'https://testnet.movementnetwork.xyz';
const APTOS_COIN_TYPE = '0x1::aptos_coin::AptosCoin';
const MOVE_TO_OCTAS_FACTOR = 100_000_000;

/**
 * Fetch Move balance from Movement testnet in octas
 * @param {string} walletAddress - The wallet address (with or without 0x prefix)
 * @returns {Promise<number>} Balance in octas (10^8 octas = 1 MOVE)
 */
export async function fetchMoveBalance(walletAddress) {
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

/**
 * Convert octas to Move
 * @param {number} octas
 * @returns {number}
 */
export function octasToMove(octas) {
  return octas / MOVE_TO_OCTAS_FACTOR;
}

/**
 * Format Move balance with up to 8 decimal places, removing trailing zeros
 * @param {number} moveBalance
 * @returns {string}
 */
export function formatMoveBalance(moveBalance) {
  const formatted = moveBalance.toFixed(8);
  // Remove trailing zeros and the decimal point if all zeros after it
  return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
}
