'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AnalyticsWidgetSummary } from 'src/components/analytics-widget-summary/analytics-widget-summary';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export default function AuthorDetailsPage() {
  const router = useRouter();
  const { user, updateAuthor } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [authorData, setAuthorData] = useState(null);
  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [stats, setStats] = useState({ publication_count: 0, purchase_count: 0, revenue: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!user?.id) {
        setError('User not authenticated. Please sign in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch author data
        const response = await axiosInstance.get(endpoints.authors.get(user.id));
        setAuthorData(response.data);

        // Update auth context with author data
        if (response.data && updateAuthor) {
          updateAuthor(response.data);
        }

        // Fetch publications by this author
        await fetchAuthorPublications(user.id);

        // Fetch author statistics
        await fetchAuthorStats(user.id);

      } catch (err) {
        console.error('Failed to fetch author data:', err);
        setError(err.message || 'Failed to load author data');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [user?.id, user]);

  const fetchAuthorStats = async (authorId) => {
    try {
      setStatsLoading(true);
      const response = await axiosInstance.get(endpoints.authors.getStats(authorId));
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch author stats:', err);
      // Don't set error for stats - just log it
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAuthorPublications = async (authorId) => {
    try {
      setPublicationsLoading(true);
      // Using the existing endpoint for publications by user (creator)
      // Note: This only shows publications where user is creator, not co-author
      const response = await axiosInstance.get(endpoints.publications.listByUser(authorId));
      setPublications(response.data.publications || []);
    } catch (err) {
      console.error('Failed to fetch publications:', err);
      // Don't set error for publications - just log it
    } finally {
      setPublicationsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(paths.dashboard.authors.details.edit);
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

  if (error) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <CustomBreadcrumbs
            heading="Author Details"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Authors', href: paths.dashboard.authors.list },
              { name: 'Details' },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
          <Card sx={{ p: 3 }}>
            <Typography color="error" variant="body1">
              {error}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => router.push(paths.dashboard.authors.register)}>
                Register as Author
              </Button>
            </Box>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  if (!authorData) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <CustomBreadcrumbs
            heading="Author Details"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Authors', href: paths.dashboard.authors.list },
              { name: 'Details' },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
          <Card sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are not registered as an author yet.
            </Typography>
            <Button variant="contained" onClick={() => router.push(paths.dashboard.authors.register)}>
              Register as Author
            </Button>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="Author Details"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Authors', href: paths.dashboard.authors.list },
            { name: 'Details' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Grid container spacing={3}>
          {/* Statistics Widgets */}
          <Grid item xs={12} md={4}>
            <AnalyticsWidgetSummary
              title="Publications"
              total={stats.publication_count}
              percent={stats.publication_count > 0 ? 15 : 0}
              chart={{
                series: [stats.publication_count, Math.max(0, stats.publication_count - 2), Math.max(0, stats.publication_count - 1), Math.max(0, stats.publication_count - 3), Math.max(0, stats.publication_count - 1)],
              }}
              sx={{ height: '100%' }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <AnalyticsWidgetSummary
              title="Purchases"
              total={stats.purchase_count}
              percent={stats.purchase_count > 0 ? 8 : 0}
              chart={{
                series: [stats.purchase_count, Math.max(0, stats.purchase_count - 1), Math.max(0, stats.purchase_count - 3), Math.max(0, stats.purchase_count - 2), Math.max(0, stats.purchase_count - 1)],
              }}
              sx={{ height: '100%' }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <AnalyticsWidgetSummary
              title="Revenue [Move]"
              total={stats.revenue / 1_000_000_00}
              percent={stats.revenue > 0 ? 12 : 0}
              chart={{
                series: [stats.revenue, Math.max(0, stats.revenue - 100), Math.max(0, stats.revenue - 50), Math.max(0, stats.revenue - 150), Math.max(0, stats.revenue - 75)],
              }}
              sx={{ height: '100%' }}
            />
          </Grid>

          {/* Publications Card */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Papers Published
              </Typography>

              {publicationsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : publications.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                  No publications found. {authorData.name} has not published any papers yet.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Showing {publications.length} publication{publications.length !== 1 ? 's' : ''}
                  </Typography>

                  <Stack spacing={2}>
                    {publications.map((publication) => (
                      <Card variant="outlined" sx={{ p: 2, width: '100%' }} key={publication.id}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {publication.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {publication.about?.substring(0, 150)}...
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Published: {new Date(publication.created_at).toLocaleDateString()}
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => router.push(paths.dashboard.publications.details(publication.id))}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
