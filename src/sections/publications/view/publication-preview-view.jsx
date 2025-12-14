'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getPublication } from 'src/actions/publications/action';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function PublicationPreviewView({ id }) {
  const router = useRouter();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);

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
              </Stack>
            </Box>

            <Divider />

            {/* Purchase Section */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom>
                Access Full Publication
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                Purchase this publication to get full access to the complete paper, including all figures, data, and references.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:cart-bold" />}
                  sx={{ minWidth: 200 }}
                  onClick={() => {
                    // TODO: Implement actual purchase functionality
                    router.push(paths.dashboard.publications.read(id));
                  }}
                >
                  Purchase Paper
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
            </Box>
          </Stack>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team for assistance.
          </Typography>
        </Box>
      </Container>
    </DashboardContent>
  );
}
