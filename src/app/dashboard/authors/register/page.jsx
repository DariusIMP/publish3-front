'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { Form, Field } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const AuthorRegisterSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  affiliation: zod.string().min(1, { message: 'Affiliation is required!' }),
});

// ----------------------------------------------------------------------

export default function AuthorRegisterPage() {
  const router = useRouter();
  const { user, updateAuthor } = useAuthContext();
  const { user: privyUser } = usePrivy();
  const { createWallet, isLoading: isCreatingWallet } = useCreateWallet();

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(AuthorRegisterSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      affiliation: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!privyUser?.id) {
        throw new Error('User not authenticated. Please sign in.');
      }

      // Create Movement embedded wallet for the author
      let walletAddress;
      try {
        const result = await createWallet({ chainType: 'movement' });
        if (!result.wallet) {
          throw new Error('Failed to create wallet: No wallet returned');
        }
        walletAddress = result.wallet.address;
        console.log('Created Movement embedded wallet:', walletAddress);
      } catch (walletError) {
        console.error('Failed to create Movement wallet:', walletError);
        throw new Error(`Failed to create payment wallet: ${walletError.message}`);
      }

      const authorData = {
        privy_id: privyUser.id,
        name: data.name,
        email: data.email,
        affiliation: data.affiliation,
        wallet_address: walletAddress,
      };

      console.log('Creating author with data:', authorData);

      const response = await axiosInstance.post(endpoints.authors.create, authorData);

      console.log('Author created successfully:', response.data);

      // Update AuthContext with the newly created author
      updateAuthor(response.data);

      alert('Author registered successfully! Your Movement embedded wallet has been created for receiving payments.');

      // Redirect to authors list after successful registration
      router.push(paths.dashboard.authors.list);
    } catch (error) {
      console.error('Failed to register author:', error);

      let errorMessage = error.message || 'Failed to register author';

      alert(`Error: ${errorMessage}`);
    }
  });

  return (
    <DashboardContent>
      <Container maxWidth="md">
        <CustomBreadcrumbs
          heading="Register New Author"
          backHref={paths.dashboard.authors.list}
          links={[
            { name: 'Authors', href: paths.dashboard.authors.list },
            { name: 'Register Author' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ p: 3 }}>
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
                onClick={() => router.push(paths.dashboard.authors.list)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                loading={isSubmitting || isCreatingWallet}
                disabled={isSubmitting || isCreatingWallet}
              >
                {isSubmitting || isCreatingWallet ? 'Creating Wallet & Registering...' : 'Register Author'}
              </Button>
            </Box>
          </Form>
        </Card>
      </Container>
    </DashboardContent>
  );
}
