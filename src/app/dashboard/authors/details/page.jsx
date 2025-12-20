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
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import WalletComponent from 'src/components/wallet/wallet-component';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export default function AuthorDetailsPage() {
  const router = useRouter();
  const { updateAuthor } = useAuthContext();
  const { user: privyUser } = usePrivy();
  
  const [loading, setLoading] = useState(true);
  const [authorData, setAuthorData] = useState(null);
  const [publications, setPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!privyUser?.id) {
        setError('User not authenticated. Please sign in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch author data
        const response = await axiosInstance.get(endpoints.authors.get(privyUser.id));
        setAuthorData(response.data);
        
        // Update auth context with author data
        if (response.data && updateAuthor) {
          updateAuthor(response.data);
        }
        
        // Fetch publications by this author
        await fetchAuthorPublications(privyUser.id);
        
      } catch (err) {
        console.error('Failed to fetch author data:', err);
        setError(err.message || 'Failed to load author data');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [privyUser?.id, updateAuthor]);

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
          {/* Author Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h5">Author Information</Typography>
                <Button variant="outlined" onClick={handleEdit}>
                  Edit
                </Button>
              </Box>

              <CardContent sx={{ p: 0 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {authorData.name || 'Not provided'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {authorData.email || 'Not provided'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Affiliation
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {authorData.affiliation || 'Not provided'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Wallet Information Card */}
          <Grid item xs={12} md={6}>
            <WalletComponent
              walletAddress={authorData.wallet_address}
              collectedMoney={0} // TODO: Integrate with actual earnings data
              registrationDate={authorData.created_at}
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
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
