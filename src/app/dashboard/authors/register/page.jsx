'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { Form, Field } from 'src/components/hook-form';

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

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(AuthorRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      affiliation: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Author registration data:', data);
      // TODO: Implement API call to register author
      alert('Author registration submitted! (API integration pending)');
      // Redirect to authors list after successful registration
      router.push(paths.dashboard.authors.list);
    } catch (error) {
      console.error('Failed to register author:', error);
      alert(`Failed to register author: ${error.message}`);
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
                loading={isSubmitting}
              >
                Register Author
              </Button>
            </Box>
          </Form>
        </Card>
      </Container>
    </DashboardContent>
  );
}
