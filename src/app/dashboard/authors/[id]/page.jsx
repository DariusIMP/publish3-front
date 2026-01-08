'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function AuthorViewPage() {
  const router = useRouter();
  const params = useParams();
  const authorId = params?.id;

  const [loading, setLoading] = useState(true);
  const [authorData, setAuthorData] = useState(null);
  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!authorId) {
        setError('Author ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch author data
        const response = await axiosInstance.get(endpoints.authors.get(authorId));
        setAuthorData(response.data);

        // Fetch publications by this author
        await fetchAuthorPublications(authorId);

      } catch (err) {
        console.error('Failed to fetch author data:', err);
        setError(err.message || 'Failed to load author data');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorId]);

  const fetchAuthorPublications = async (id) => {
    try {
      setPublicationsLoading(true);
      const response = await axiosInstance.get(endpoints.publications.listByUser(id));
      setPublications(response.data.publications || []);
    } catch (err) {
      console.error('Failed to fetch publications:', err);
      // Don't set error for publications - just log it
    } finally {
      setPublicationsLoading(false);
    }
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
              Author not found.
            </Typography>
            <Button variant="contained" onClick={() => router.push(paths.dashboard.authors.list)}>
              Back to Authors
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
          heading={authorData.name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Authors', href: paths.dashboard.authors.list },
            { name: authorData.name },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Author Info Card */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {authorData.name}
              </Typography>
              {authorData.affiliation && (
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Iconify icon="solar:building-bold" width={20} sx={{ mr: 1 }} />
                  {authorData.affiliation}
                </Typography>
              )}
              {authorData.email && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Iconify icon="solar:letter-bold" width={18} sx={{ mr: 1 }} />
                  {authorData.email}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:calendar-bold" width={18} sx={{ mr: 1 }} />
                Member since {new Date(authorData.created_at).toLocaleDateString()}
              </Typography>
            </Grid>

          </Grid>
        </Card>

        {/* Publications Card */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Published Papers
          </Typography>

          {publicationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : publications.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
              {authorData.name} has not published any papers yet.
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {publications.length} publication{publications.length !== 1 ? 's' : ''}
              </Typography>

              <Grid container spacing={2}>
                {publications.map((publication) => (
                  <Grid item xs={12} key={publication.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
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
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Card>
      </Container>
    </DashboardContent>
  );
}
