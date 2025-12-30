'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { calculateTransactionCost, fetchTransactionDetails, formatOctasToMove } from 'src/utils/transaction-utils';

// ----------------------------------------------------------------------

export default function TransactionComponent({
  transaction,
  publication,
  type = 'purchase', // 'purchase' or 'publication'
  onViewPublication,
}) {
  const {
    transaction_hash,
    created_at,
    status,
  } = transaction;

  const {
    title,
    price,
  } = publication || {};

  const [transactionDetails, setTransactionDetails] = useState(null);
  const [transactionCost, setTransactionCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTransactionDetails = useCallback(async () => {
    if (!transaction_hash) return;

    setLoading(true);
    setError(null);

    try {
      const details = await fetchTransactionDetails(transaction_hash);
      setTransactionDetails(details);
      
      const cost = calculateTransactionCost(details);
      setTransactionCost(cost);
    } catch (err) {
      console.error('Failed to fetch transaction details:', err);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  }, [transaction_hash]);

  useEffect(() => {
    if (transaction_hash) {
      loadTransactionDetails();
    }
  }, [transaction_hash, loadTransactionDetails]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoveAmount = (amount) => {
    if (!amount) return '0';
    // Convert from octas to MOVE (1 MOVE = 100,000,000 octas)
    const moveAmount = amount / 100000000;
    return moveAmount.toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'PUBLISHED':
      case 'SETTLED':
        return 'success';
      case 'PENDING':
      case 'PENDING_ONCHAIN':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = () => {
    return type === 'purchase' ? 'Purchase' : 'Publication';
  };

  const getTypeIcon = () => {
    return type === 'purchase' ? 'solar:cart-bold' : 'solar:document-text-bold';
  };

  const getExplorerUrl = () => {
    if (!transaction_hash) return null;
    return `https://explorer.movementnetwork.xyz/txn/${transaction_hash}?network=bardock+testnet`;
  };

  const getTotalCost = () => {
    if (transactionCost) {
      return transactionCost.totalMove;
    }
    
    // Fallback to publication price if available
    if (price) {
      return formatOctasToMove(price);
    }
    
    return '0';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Iconify icon={getTypeIcon()} width={20} />
              <Typography variant="subtitle1">
                {getTypeLabel()}
              </Typography>
              <Chip
                label={status || 'Unknown'}
                size="small"
                color={getStatusColor(status)}
                variant="outlined"
              />
            </Stack>
            
            <Typography variant="body2" color="text.secondary">
              {formatDate(created_at)}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary.main">
              {getTotalCost()} MOVE
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Cost
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Cost Breakdown */}
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading transaction details...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : transactionCost && transactionCost.breakdown.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Cost Breakdown
            </Typography>
            <Stack spacing={1}>
              {transactionCost.breakdown.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {item.move} MOVE
                  </Typography>
                </Box>
              ))}
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="medium">
                  Total
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {transactionCost.totalMove} MOVE
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : null}

        {/* Publication Info */}
        {publication && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Publication
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {title || 'Unknown Publication'}
            </Typography>
            {onViewPublication && (
              <Button
                size="small"
                variant="outlined"
                onClick={onViewPublication}
                startIcon={<Iconify icon="solar:eye-bold" />}
              >
                View Publication
              </Button>
            )}
          </Box>
        )}

        {/* Transaction Hash */}
        {transaction_hash && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Transaction Hash
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'background.neutral',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                wordBreak: 'break-all',
                color: 'text.primary',
              }}
            >
              {transaction_hash}
            </Box>
          </Box>
        )}

        {/* Transaction Status */}
        {transactionDetails && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Blockchain Status
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={transactionDetails.success ? 'Success' : 'Failed'}
                size="small"
                color={transactionDetails.success ? 'success' : 'error'}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                {transactionDetails.vm_status}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Explorer Link */}
        {getExplorerUrl() && (
          <Box>
            <Link
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Iconify icon="solar:external-link-bold" width={16} />
              <Typography variant="body2">
                View on Movement Explorer
              </Typography>
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
