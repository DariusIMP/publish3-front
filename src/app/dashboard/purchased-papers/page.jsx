'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export default function PurchasedPapersPage() {
  const router = useRouter();
  const { user: authUser, author } = useAuthContext();
  const { user: privyUser } = usePrivy();

  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!privyUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          endpoints.purchases.listByUser(privyUser.id),
          { params: { page, limit } }
        );

        setPurchases(response.data.purchases || []);
        setTotalCount(response.data.total || 0);
      } catch (err) {
        console.error('Failed to fetch purchases:', err);
        showSnackbar('Failed to load purchased papers', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [privyUser?.id, page, limit]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewPublication = (publicationId) => {
    router.push(paths.dashboard.publications.details(publicationId));
  };

  const handleReadPublication = (publicationId) => {
    router.push(paths.dashboard.publications.read(publicationId));
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

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="My Purchased Papers"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Purchased Papers' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {purchases.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <CardContent>
              <Iconify icon="solar:file-text-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Purchased Papers Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't purchased any papers yet. Browse the publications to find papers to purchase.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push(paths.dashboard.publications.list)}
                startIcon={<Iconify icon="solar:document-bold-duotone" />}
              >
                Browse Papers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Showing {purchases.length} of {totalCount} purchased papers
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {purchases.map((purchase) => (
                <Grid item xs={12} key={purchase.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Purchase #{purchase.id.slice(0, 8)}...
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Chip
                              label={purchase.status}
                              size="small"
                              color={getStatusColor(purchase.status)}
                              variant="soft"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Purchased on {formatDate(purchase.created_at)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Label color="info">Publication ID: {purchase.publication_id?.slice(0, 8)}...</Label>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
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
                            onClick={() => handleViewPublication(purchase.publication_id)}
                            startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleReadPublication(purchase.publication_id)}
                            startIcon={<Iconify icon="solar:document-text-bold-duotone" />}
                          >
                            Read Paper
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalCount > limit && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    Page {page} of {Math.ceil(totalCount / limit)}
                  </Typography>
                  <Button
                    variant="outlined"
                    disabled={page >= Math.ceil(totalCount / limit)}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            )}
          </>
        )}
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
    </DashboardContent>
  );
}
