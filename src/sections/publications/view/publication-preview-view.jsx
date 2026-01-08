'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useWalletContext } from 'src/context/wallet-context';
import { octasToMove, formatMoveBalance } from 'src/lib/aptos';
import { getPublication } from 'src/actions/publications/action';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PurchaseTransactionCostDialog } from 'src/components/transaction/purchase-transaction-cost-dialog';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function PublicationPreviewView({ id }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const { moveBalance } = useWalletContext();
  const publicationPriceMove = publication ? octasToMove(publication.price) : 0;
  const insufficientFunds = moveBalance !== null && moveBalance < publicationPriceMove;

  useEffect(() => {
    async function loadPublication() {
      try {
        setLoading(true);
        const data = await getPublication(id);
        setPublication(data);
      } catch (error) {
        console.error('Error loading publication:', error);
        // Redirect to list if publication not found
        router.push(paths.dashboard.publications.list);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPublication();
    }
  }, [id, router]);

  // Check if user has access to the publication using backend endpoint
  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await axiosInstance.get(endpoints.publications.checkAccess(id));
        const accessData = response.data;

        setHasAccess(accessData.has_access);
      } catch (error) {
        console.error('Error checking access:', error);
        // If there's an error (e.g., user not authenticated), assume no access
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    }

    checkAccess();
  }, [publication, user?.id, id]);


  const handlePurchaseClick = async () => {
    if (!user?.id) {
      setSnackbar({
        open: true,
        message: 'Please sign in to purchase publications',
        severity: 'error',
      });
      return;
    }

    setSimulating(true);
    try {
      const response = await axiosInstance.post(endpoints.purchases.simulate, {
        publication_id: id,
      });
      setSimulationResult(response.data);
      setCostDialogOpen(true);
    } catch (error) {
      console.error('Failed to simulate purchase:', error);
      let errorMessage = 'Failed to estimate transaction cost';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleConfirmPurchase = async () => {
    setCostDialogOpen(false);
    setPurchasing(true);

    try {
      await axiosInstance.post(endpoints.publications.purchase(id));

      setSnackbar({
        open: true,
        message: 'Publication purchased successfully! You can now access the full paper.',
        severity: 'success',
      });

      setTimeout(() => {
        router.push(paths.dashboard.publications.read(id));
      }, 2000);

    } catch (error) {
      console.error('Failed to purchase publication:', error);

      let errorMessage = 'Failed to purchase publication';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleCostDialogClose = () => {
    setCostDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <DashboardContent>
        <Container>
          <Typography>Loading publication...</Typography>
        </Container>
      </DashboardContent>
    );
  }

  if (!publication) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="Publication Preview"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Publications', href: paths.dashboard.publications.list },
            { name: publication.title },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ p: { xs: 3, md: 5 }, mb: 4 }}>
          <Stack spacing={4}>
            {/* Header */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Label variant="filled" color="info">
                  Publication
                </Label>
                <Typography variant="caption" color="text.secondary">
                  Published {fDate(publication.created_at)}
                </Typography>
              </Box>

              <Typography variant="h4" gutterBottom>
                {publication.title}
              </Typography>

              {/* Authors with affiliations */}
              {publication.authors && publication.authors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Authors
                  </Typography>
                  <Stack spacing={2}>
                    {publication.authors.map((author, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            flexShrink: 0,
                          }}
                        >
                          {author.name.charAt(0).toUpperCase()}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {author.name}
                          </Typography>
                          {author.affiliation && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {author.affiliation}
                            </Typography>
                          )}
                          {author.email && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {author.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Abstract */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Abstract
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {publication.about || 'No abstract available for this publication.'}
              </Typography>
            </Box>

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {publication.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Metadata */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Publication Details
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <Iconify icon="solar:quote-bold" width={20} />
                    <Typography variant="body2">Citations:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {publication.citation_count || 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <Iconify icon="solar:users-group-rounded-bold" width={20} />
                    <Typography variant="body2">Authors:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {publication.authors ? publication.authors.length : 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <Iconify icon="solar:tag-horizontal-bold" width={20} />
                    <Typography variant="body2">Tags:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {publication.tags ? publication.tags.length : 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <Iconify icon="solar:wallet-bold" width={20} />
                    <Typography variant="body2">Price:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatMoveBalance(octasToMove(publication.price), 2)} Move
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Access Section */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {checkingAccess ? (
                <Typography variant="body1" color="text.secondary">
                  Checking access...
                </Typography>
              ) : hasAccess ? (
                <>
                  <Typography variant="h5" gutterBottom>
                    Access Granted
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    You have access to this publication. You can read the full paper now.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="solar:document-bold" />}
                      sx={{ minWidth: 200 }}
                      component={RouterLink}
                      href={paths.dashboard.publications.read(id)}
                    >
                      Read Paper
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      component={RouterLink}
                      href={paths.dashboard.publications.list}
                    >
                      Back to Publications
                    </Button>
                  </Stack>
                </>
              ) : (
                <>
                  <Typography variant="h5" gutterBottom>
                    Access Full Publication
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Purchase this publication to get full access to the complete paper, including all figures, data, and references.
                  </Typography>

                  {moveBalance === null ? (
                    <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                      Loading wallet balance...
                    </Alert>
                  ) : insufficientFunds ? (
                    <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                      Insufficient funds. You need {formatMoveBalance(publicationPriceMove - moveBalance, 2)} more Move to purchase this publication.
                    </Alert>
                  ) : null}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="solar:cart-bold" />}
                      sx={{ minWidth: 200 }}
                      onClick={handlePurchaseClick}
                      disabled={simulating || purchasing || insufficientFunds || moveBalance === null}
                    >
                      {simulating ? 'Estimating Cost...' : purchasing ? 'Processing Purchase...' : 'Purchase Paper'}
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      component={RouterLink}
                      href={paths.dashboard.publications.list}
                    >
                      Back to Publications
                    </Button>
                  </Stack>

                  <Typography variant="caption" color="text.disabled" sx={{ mt: 3, display: 'block' }}>
                    By purchasing, you agree to our terms of service and privacy policy.
                  </Typography>
                </>
              )}
            </Box>
          </Stack>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team for assistance.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {simulationResult && (
        <PurchaseTransactionCostDialog
          open={costDialogOpen}
          onClose={handleCostDialogClose}
          onConfirm={handleConfirmPurchase}
          simulationResult={simulationResult}
          publicationPriceOctas={publication.price}
          loading={purchasing}
        />
      )}
    </DashboardContent>
  );
}
