'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { calculateTransactionCost, fetchTransactionDetails, formatOctasToMove } from 'src/utils/transaction-utils';

// ----------------------------------------------------------------------

export function PurchaseCard({ purchase, onViewPublication, onReadPublication }) {
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [transactionCost, setTransactionCost] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    async function fetchPublication() {
      if (!purchase?.publication_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(endpoints.publications.get(purchase.publication_id));
        setPublication(response.data);
      } catch (err) {
        console.error('Failed to fetch publication:', err);
        setError('Failed to load publication details');
      } finally {
        setLoading(false);
      }
    }

    fetchPublication();
  }, [purchase?.publication_id]);

  const loadTransactionDetails = useCallback(async () => {
    if (!purchase?.transaction_hash) {
      setTransactionError('No transaction hash available');
      return;
    }

    setTransactionLoading(true);
    setTransactionError(null);

    try {
      const details = await fetchTransactionDetails(purchase.transaction_hash);
      setTransactionDetails(details);

      const cost = calculateTransactionCost(details);
      setTransactionCost(cost);
    } catch (err) {
      console.error('Failed to fetch transaction details:', err);
      setTransactionError('Failed to load transaction details');
    } finally {
      setTransactionLoading(false);
    }
  }, [purchase?.transaction_hash]);

  const handleOpenDetails = () => {
    setDetailsOpen(true);
    if (!transactionDetails && !transactionLoading && !transactionError) {
      loadTransactionDetails();
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatAuthors = (authors) => {
    if (!authors || !Array.isArray(authors)) return 'Unknown authors';
    if (authors.length === 0) return 'No authors';
    if (authors.length === 1) return authors[0].name || 'Unknown author';
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  const getTotalCost = () => {
    if (transactionCost) {
      return transactionCost.totalMove;
    }

    // Fallback to publication price if available
    if (publication?.price) {
      return formatOctasToMove(publication.price);
    }

    return '0';
  };

  const getExplorerUrl = () => {
    if (!purchase?.transaction_hash) return null;
    return `https://explorer.movementnetwork.xyz/txn/${purchase.transaction_hash}?network=bardock+testnet`;
  };

  return (
    <Card>
      <CardContent>
        {/* Purchase Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {loading ? (
                <Skeleton width={200} />
              ) : publication ? (
                publication.title || 'Untitled Publication'
              ) : (
                `Purchase #${purchase.id.slice(0, 8)}...`
              )}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label={purchase.status || 'UNKNOWN'}
                size="small"
                color={getStatusColor(purchase.status)}
                variant="soft"
              />
              <Typography variant="caption" color="text.secondary">
                Purchased on {formatDate(purchase.created_at)}
              </Typography>
            </Stack>
          </Box>

          <Label color="info">
            {loading ? (
              <Skeleton width={100} />
            ) : (
              `ID: ${purchase.publication_id?.slice(0, 8)}...`
            )}
          </Label>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Publication Details */}
        {loading ? (
          <Box sx={{ mb: 3 }}>
            <Skeleton height={20} width="80%" sx={{ mb: 1 }} />
            <Skeleton height={20} width="60%" />
          </Box>
        ) : error ? (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </Box>
        ) : publication ? (
          <Box sx={{ mb: 3 }}>
            {/* Authors */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Iconify icon="solar:users-group-rounded-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatAuthors(publication.authors)}
              </Typography>
            </Stack>

            {/* Abstract Preview */}
            {publication.about && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {truncateText(publication.about, 150)}
              </Typography>
            )}

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                {publication.tags.slice(0, 3).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ height: 24, fontSize: '0.75rem' }}
                  />
                ))}
                {publication.tags.length > 3 && (
                  <Chip
                    label={`+${publication.tags.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 24, fontSize: '0.75rem' }}
                  />
                )}
              </Stack>
            )}

            {/* Citation Count */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:quote-bold" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {publication.citation_count || 0} citations
              </Typography>
            </Stack>
          </Box>
        ) : null}

        <Divider sx={{ my: 2 }} />

        {/* Purchase Details and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Transaction: {purchase.transaction_hash ? `${purchase.transaction_hash.slice(0, 16)}...` : 'Not available'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatDate(purchase.updated_at)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenDetails}
              startIcon={<Iconify icon="solar:eye-bold-duotone" />}
              disabled={loading || error}
            >
              View Details
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => onReadPublication(purchase.publication_id)}
              startIcon={<Iconify icon="solar:document-text-bold-duotone" />}
              disabled={loading || error}
            >
              Read Paper
            </Button>
          </Stack>
        </Box>
      </CardContent>

      {/* Transaction Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Transaction Details</Typography>
            <IconButton onClick={handleCloseDetails} size="small">
              <Iconify icon="solar:close-circle-bold" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Purchase Summary */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Iconify icon="solar:cart-bold" width={20} />
              <Typography variant="subtitle1">Purchase</Typography>
              <Chip
                label={purchase.status || 'Unknown'}
                size="small"
                color={getStatusColor(purchase.status)}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {formatDateTime(purchase.created_at)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Cost Breakdown */}
          {transactionLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Loading transaction details...
              </Typography>
            </Box>
          ) : transactionError ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="error">
                {transactionError}
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
                {publication.title || 'Unknown Publication'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {truncateText(publication.about, 200)}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  handleCloseDetails();
                  onViewPublication(purchase.publication_id);
                }}
                startIcon={<Iconify icon="solar:eye-bold" />}
              >
                View Publication Details
              </Button>
            </Box>
          )}

          {/* Transaction Hash */}
          {purchase.transaction_hash && (
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
                {purchase.transaction_hash}
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
            <Box sx={{ mb: 2 }}>
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
        </DialogContent>
      </Dialog>
    </Card>
  );
}
