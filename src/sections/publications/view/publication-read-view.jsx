'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { getPublication, getPublicationPdfUrl } from 'src/actions/publications/action';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';

import { DashboardContent } from 'src/layouts/dashboard';

import { useRouter as useRouterHook } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { SimplePdfView } from 'src/sections/pdf/view/simple-pdf-view';

// ----------------------------------------------------------------------

export function PublicationReadView() {
  const params = useParams();
  const router = useRouterHook();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const publicationId = params?.id;

  useEffect(() => {
    async function loadPublication() {
      if (!publicationId) return;

      try {
        setLoading(true);
        const data = await getPublication(publicationId);
        setPublication(data);

        // Fetch the actual PDF URL from the backend if publication has PDF
        if (data.has_pdf) {
          try {
            const pdfUrlResponse = await getPublicationPdfUrl(publicationId);
            setPdfUrl(pdfUrlResponse.pdf_url);
          } catch (pdfErr) {
            console.error('Error fetching PDF URL:', pdfErr);
            // Continue without PDF URL - user will see placeholder
          }
        }
      } catch (err) {
        console.error('Error loading publication:', err);
        setError('Failed to load publication');
      } finally {
        setLoading(false);
      }
    }

    loadPublication();
  }, [publicationId]);

  const handleBack = () => {
    router.push(paths.dashboard.publications.details(publicationId));
  };

  const handleDownload = () => {
    // In a real implementation, this would trigger PDF download
    alert('Download functionality will be implemented with actual purchase logic');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Typography>Loading publication...</Typography>
        </Container>
      </DashboardContent>
    );
  }

  if (error || !publication) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Typography color="error">{error || 'Publication not found'}</Typography>
          <Button onClick={handleBack} sx={{ mt: 2 }}>
            Back to Publication
          </Button>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Read Publication"
        backHref={paths.dashboard.publications.details(publicationId)}
        links={[
          { name: 'Publications', href: paths.dashboard.publications.list },
          { name: publication.title, href: paths.dashboard.publications.details(publicationId) },
          { name: 'Read' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2 }}>
        {/* Left side: Publication metadata */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            padding: 3,
          }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {publication.title}
              </Typography>

              {publication.about && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  {publication.about}
                </Typography>
              )}

              {/* Authors */}
              {publication.authors && publication.authors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Authors
                  </Typography>
                  <Stack spacing={2}>
                    {publication.authors.map((author, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {author.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {author.name}
                          </Typography>
                          {author.affiliation && (
                            <Typography variant="caption" color="text.secondary">
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

              {/* Tags */}
              {publication.tags && publication.tags.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {publication.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Citation count */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:document-bold" width={20} />
                <Typography variant="body2" color="text.secondary">
                  Cited by {publication.citation_count || 0} publications
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Action buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:arrow-left-outline" />}
                  onClick={handleBack}
                >
                  Back to Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:download-outline" />}
                  onClick={handleDownload}
                >
                  Download PDF
                </Button>
                <Tooltip title="Print">
                  <IconButton onClick={handlePrint}>
                    <Iconify icon="solar:printer-bold" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>

          {/* Purchase info */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Purchase Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                You have successfully purchased access to this publication. Your access is valid indefinitely.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" width={20} color="success.main" />
                <Typography variant="caption" color="success.main">
                  Access granted on {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right side: PDF viewer */}
        <Box sx={{ flex: 2, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <Box>
              <Typography variant="h6">Publication PDF</Typography>
              <Typography variant="body2" color="text.secondary">
                Full access granted
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Zoom in">
                <IconButton size="small">
                  <Iconify icon="solar:zoom-in-bold" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out">
                <IconButton size="small">
                  <Iconify icon="solar:zoom-out-bold" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Full screen">
                <IconButton size="small">
                  <Iconify icon="solar:fullscreen-bold" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: 'grey.100' }}>
            {pdfUrl ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SimplePdfView pdfUrl={pdfUrl} />
              </Box>
            ) : publication.has_pdf ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="solar:file-text-bold" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Loading PDF...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fetching publication PDF from storage
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="solar:file-text-bold" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  PDF Not Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This publication does not have an associated PDF file.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardContent>
  );
}
