'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { PurchaseCard } from 'src/components/purchase/purchase-card';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export default function PurchasedPapersPage() {
  const router = useRouter();
  const { user, author } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          endpoints.purchases.listByUser(user.id),
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
  }, [user?.id, page, limit]);

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
                  <PurchaseCard
                    purchase={purchase}
                    onViewPublication={handleViewPublication}
                    onReadPublication={handleReadPublication}
                  />
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
