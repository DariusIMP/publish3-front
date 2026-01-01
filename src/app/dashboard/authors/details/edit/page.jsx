'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrivy } from '@privy-io/react-auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const AuthorEditSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  affiliation: zod.string().min(1, { message: 'Affiliation is required!' }),
  wallet_address: zod.string().min(1, { message: 'Wallet address is required!' }),
});

// ----------------------------------------------------------------------

export default function AuthorEditPage() {
  const router = useRouter();
  const { updateAuthor } = useAuthContext();
  const { user: privyUser } = usePrivy();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(AuthorEditSchema),
    defaultValues: {
      name: '',
      email: '',
      affiliation: '',
      wallet_address: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = methods;

  const walletAddress = watch('wallet_address');

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
        
        const response = await axiosInstance.get(endpoints.authors.get(privyUser.id));
        const authorData = response.data;
        
        reset({
          name: authorData.name || '',
          email: authorData.email || '',
          affiliation: authorData.affiliation || '',
          wallet_address: authorData.wallet_address || '',
        });
        
      } catch (err) {
        console.error('Failed to fetch author data:', err);
        setError(err.message || 'Failed to load author data');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [privyUser?.id, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!privyUser?.id) {
      setError('User not authenticated. Please sign in.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const authorData = {
        name: data.name,
        email: data.email,
        affiliation: data.affiliation,
        wallet_address: data.wallet_address,
      };

      console.log('Updating author with data:', authorData);
      
      const response = await axiosInstance.put(endpoints.authors.update(privyUser.id), authorData);
      
      console.log('Author updated successfully:', response.data);
      
      if (updateAuthor) {
        const authorResponse = await axiosInstance.get(endpoints.authors.get(privyUser.id));
        updateAuthor(authorResponse.data);
      }
      
      toast.success('Author information updated successfully!');
      
      // Redirect immediately
      router.push(paths.dashboard.authors.details.view);
    } catch (err) {
      console.error('Failed to update author:', err);      
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  });

  const handleCancel = () => {
    router.push(paths.dashboard.authors.details.view);
  };

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  if (error && !privyUser?.id) {
    return (
      <DashboardContent>
        <Container maxWidth="md">
          <CustomBreadcrumbs
            heading="Edit Author Information"
            backHref={paths.dashboard.authors.details.view}
            links={[
              { name: 'Authors', href: paths.dashboard.authors.list },
              { name: 'Details', href: paths.dashboard.authors.details.view },
              { name: 'Edit' },
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

  return (
    <DashboardContent>
      <Container maxWidth="md">
        <CustomBreadcrumbs
          heading="Edit Author Information"
          backHref={paths.dashboard.authors.details.view}
          links={[
            { name: 'Authors', href: paths.dashboard.authors.list },
            { name: 'Details', href: paths.dashboard.authors.details.view },
            { name: 'Edit' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ p: 3 }}>
          {error && (
            <Typography color="error" variant="body1" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}

          <Form methods={methods} onSubmit={onSubmit}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)' },
              }}
            >
              <Field.Text
                name="name"
                label="Full Name"
                fullWidth
                variant="outlined"
                placeholder="Enter author's full name"
                required
              />

              <Field.Text
                name="email"
                label="Email Address"
                fullWidth
                variant="outlined"
                placeholder="Enter author's email address"
                required
              />

              <Field.Text
                name="affiliation"
                label="Affiliation"
                fullWidth
                variant="outlined"
                placeholder="Enter author's affiliation (e.g., University, Company)"
                required
              />
            </Box>

            <Box
              sx={{
                mt: 4,
                gap: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-end', sm: 'center' },
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                loading={submitting || isSubmitting}
              >
                Update Author
              </Button>
            </Box>
          </Form>
        </Card>
      </Container>
    </DashboardContent>
  );
}
