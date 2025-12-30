/**
 * Utility functions for working with blockchain transactions
 */

const MOVEMENT_RPC_URL = 'https://testnet.movementnetwork.xyz';

/**
 * Fetch transaction details from Movement blockchain
 * @param {string} transactionHash - The transaction hash
 * @returns {Promise<Object>} Transaction details
 */
export async function fetchTransactionDetails(transactionHash) {
  if (!transactionHash) {
    throw new Error('Transaction hash is required');
  }

  try {
    const response = await fetch(
      `${MOVEMENT_RPC_URL}/v1/transactions/by_hash/${transactionHash}`,
      {
        headers: {
          'Accept': 'application/json, application/x-bcs'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
}

/**
 * Calculate total cost of a transaction
 * @param {Object} transaction - Transaction object from Movement API
 * @returns {Object} Cost breakdown
 */
export function calculateTransactionCost(transaction) {
  if (!transaction) {
    return {
      totalOctas: 0,
      totalMove: '0',
      gasOctas: 0,
      gasMove: '0',
      purchaseOctas: 0,
      purchaseMove: '0',
      breakdown: []
    };
  }

  // Calculate gas cost
  const gasUsed = parseInt(transaction.gas_used || '0');
  const gasUnitPrice = parseInt(transaction.gas_unit_price || '0');
  const gasOctas = gasUsed * gasUnitPrice;
  const gasMove = (gasOctas / 100000000).toFixed(8);

  // Try to extract purchase amount from events
  let purchaseOctas = 0;
  const events = transaction.events || [];

  // Look for PaperPurchased event
  const paperPurchasedEvent = events.find(event => 
    event.type?.includes('PaperPurchased')
  );

  if (paperPurchasedEvent?.data?.amount) {
    purchaseOctas = parseInt(paperPurchasedEvent.data.amount);
  }

  // If no PaperPurchased event, check for WithdrawEvents that might be purchases
  if (purchaseOctas === 0) {
    const withdrawEvents = events.filter(event => 
      event.type?.includes('WithdrawEvent')
    );
    
    // Sum all withdraw events that aren't gas fees
    // Gas fee withdraw events have sequence_number matching FeeStatement
    const feeStatementEvent = events.find(event => 
      event.type?.includes('FeeStatement')
    );
    
    for (const event of withdrawEvents) {
      // Skip if this is the gas fee withdrawal
      if (feeStatementEvent && event.guid?.creation_number === feeStatementEvent.guid?.creation_number) {
        continue;
      }
      
      if (event.data?.amount) {
        purchaseOctas += parseInt(event.data.amount);
      }
    }
  }

  const purchaseMove = (purchaseOctas / 100000000).toFixed(8);
  const totalOctas = gasOctas + purchaseOctas;
  const totalMove = (totalOctas / 100000000).toFixed(8);

  // Create breakdown
  const breakdown = [];

  if (purchaseOctas > 0) {
    breakdown.push({
      label: 'Purchase Amount',
      octas: purchaseOctas,
      move: purchaseMove,
      type: 'purchase'
    });
  }

  if (gasOctas > 0) {
    breakdown.push({
      label: 'Network Fee',
      octas: gasOctas,
      move: gasMove,
      type: 'gas'
    });
  }

  return {
    totalOctas,
    totalMove,
    gasOctas,
    gasMove,
    purchaseOctas,
    purchaseMove,
    breakdown,
    rawTransaction: transaction
  };
}

/**
 * Extract publication information from transaction events
 * @param {Object} transaction - Transaction object from Movement API
 * @returns {Object} Publication information
 */
export function extractPublicationInfo(transaction) {
  if (!transaction) {
    return null;
  }

  const events = transaction.events || [];
  const paperPurchasedEvent = events.find(event => 
    event.type?.includes('PaperPurchased')
  );

  if (!paperPurchasedEvent) {
    return null;
  }

  return {
    paperUidHash: paperPurchasedEvent.data?.paper_uid_hash,
    buyer: paperPurchasedEvent.data?.buyer,
    amount: paperPurchasedEvent.data?.amount ? parseInt(paperPurchasedEvent.data.amount) : 0
  };
}

/**
 * Format octas to MOVE with appropriate decimal places
 * @param {number|string} octas - Amount in octas
 * @param {number} decimals - Number of decimal places (default: 8)
 * @returns {string} Formatted MOVE amount
 */
export function formatOctasToMove(octas, decimals = 8) {
  const octasNum = typeof octas === 'string' ? parseInt(octas) : octas;
  if (isNaN(octasNum)) return '0';
  
  const moveAmount = octasNum / 100000000;
  return moveAmount.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Get transaction type from payload
 * @param {Object} transaction - Transaction object from Movement API
 * @returns {string} Transaction type
 */
export function getTransactionType(transaction) {
  if (!transaction?.payload) {
    return 'unknown';
  }

  const functionName = transaction.payload.function || '';
  
  if (functionName.includes('purchase')) {
    return 'purchase';
  } else if (functionName.includes('publish') || functionName.includes('register')) {
    return 'publication';
  } else if (functionName.includes('transfer')) {
    return 'transfer';
  }
  
  return 'other';
}
