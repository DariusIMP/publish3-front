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
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { usePrivy } from '@privy-io/react-auth';

import { getPublication, getPublicationPdfUrl } from 'src/actions/publications/action';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';

import { DashboardContent } from 'src/layouts/dashboard';

import { useRouter as useRouterHook } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { SimplePdfView } from 'src/sections/pdf/view/simple-pdf-view';

// ----------------------------------------------------------------------

export function PublicationReadView() {
  const params = useParams();
  const router = useRouterHook();
  const { user: privyUser } = usePrivy();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const publicationId = params?.id;

  useEffect(() => {
    async function loadPublication() {
      if (!publicationId) return;

      try {
        setLoading(true);
        setPdfError(null);
        
        const data = await getPublication(publicationId);
        setPublication(data);

        // Check if current user is the author
        const userIsAuthor = data.user_id === privyUser?.id;
        setIsAuthor(userIsAuthor);

        // Check if user has purchased this publication
        if (privyUser?.id) {
          try {
            const response = await axiosInstance.get(endpoints.purchases.listByUser(privyUser.id));
            const userPurchases = response.data.purchases || [];
            const hasPurchasedPublication = userPurchases.some(
              purchase => purchase.publication_id === publicationId
            );
            setHasPurchased(hasPurchasedPublication);
            
            // If user has purchased or is author, fetch PDF URL
            if (hasPurchasedPublication || userIsAuthor) {
              await fetchPdfUrl();
            }
          } catch (purchaseErr) {
            console.error('Error checking purchase status:', purchaseErr);
            // Continue without purchase check
          }
        }
      } catch (err) {
        console.error('Error loading publication:', err);
        
        // Check if error is 401 (Unauthorized) or 403 (Forbidden)
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          // Redirect to preview view
          router.push(paths.dashboard.publications.details(publicationId));
          return;
        }
        
        setError('Failed to load publication');
      } finally {
        setLoading(false);
      }
    }

    async function fetchPdfUrl() {
      if (!publicationId) return;
      
      try {
        setPdfLoading(true);
        setPdfError(null);
        const pdfUrlResponse = await getPublicationPdfUrl(publicationId);
        setPdfUrl(pdfUrlResponse.pdf_url);
      } catch (pdfErr) {
        console.error('Error fetching PDF URL:', pdfErr);
        
        // Check if error is 401 (Unauthorized) or 403 (Forbidden)
        const status = pdfErr.response?.status;
        if (status === 401 || status === 403) {
          // Redirect to preview view
          router.push(paths.dashboard.publications.details(publicationId));
          return;
        }
        
        setPdfError(pdfErr.response?.data?.message || 'Failed to load PDF');
      } finally {
        setPdfLoading(false);
      }
    }

    loadPublication();
  }, [publicationId, privyUser?.id, router]);

  const handleBack = () => {
    router.push(paths.dashboard.publications.details(publicationId));
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      showSnackbar('PDF is not available for download. Please try again.', 'error');
      return;
    }

    if (!isAuthor && !hasPurchased) {
      showSnackbar('You need to purchase this publication to download the PDF.', 'error');
      router.push(paths.dashboard.publications.details(publicationId));
      return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    
    const fileName = publication?.title 
      ? `${publication.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      : 'publication.pdf';
    
    link.download = fileName;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

          {/* Purchase/Access info */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Access Information
              </Typography>

              {isAuthor ? (
                <>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You are the author of this publication. You have full access to view and manage it.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:user-check-bold" width={20} color="info.main" />
                    <Typography variant="caption" color="info.main">
                      Author access
                    </Typography>
                  </Box>
                </>
              ) : hasPurchased ? (
                <>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You have successfully purchased access to this publication. Your access is valid indefinitely.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} color="success.main" />
                    <Typography variant="caption" color="success.main">
                      Access granted on {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You need to purchase this publication to access the full PDF.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify icon="solar:cart-bold" />}
                    onClick={() => router.push(paths.dashboard.publications.details(publicationId))}
                  >
                    Purchase Publication
                  </Button>
                </>
              )}
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
                {isAuthor ? 'Author access' : hasPurchased ? 'Full access granted' : 'Purchase required'}
              </Typography>
            </Box>
            {(isAuthor || hasPurchased) && (
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
            )}
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: 'grey.100' }}>
            {pdfLoading ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Loading PDF...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fetching publication PDF from storage
                </Typography>
              </Box>
            ) : pdfError ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="solar:file-text-bold" width={64} sx={{ color: 'error.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="error">
                  Error Loading PDF
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pdfError}
                </Typography>
                {(isAuthor || hasPurchased) && (
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                )}
              </Box>
            ) : pdfUrl ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SimplePdfView pdfUrl={pdfUrl} />
              </Box>
            ) : !isAuthor && !hasPurchased ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="solar:lock-bold" width={64} sx={{ color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Purchase Required
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, textAlign: 'center' }}>
                  You need to purchase this publication to access the full PDF content.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:cart-bold" />}
                  onClick={() => router.push(paths.dashboard.publications.details(publicationId))}
                >
                  Purchase Publication
                </Button>
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
