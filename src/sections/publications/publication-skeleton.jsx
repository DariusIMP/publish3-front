import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

export function PublicationItemSkeleton({ variant = 'horizontal', ...other }) {
  if (variant === 'horizontal') {
    return (
      <Card {...other}>
        <Stack
          spacing={1}
          sx={[
            (theme) => ({
              flexGrow: 1,
              p: theme.spacing(3, 3, 2, 3),
            }),
          ]}
        >
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="text" width={60} />
          </Box>

          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" height={28} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="80%" />
            <Skeleton variant="text" height={16} width="60%" />
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box
              sx={{
                gap: 1.5,
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Skeleton variant="text" width={40} height={20} />
              <Skeleton variant="text" width={40} height={20} />
              <Skeleton variant="text" width={40} height={20} />
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            p: 1,
            width: 180,
            height: 240,
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Skeleton variant="rounded" width="100%" height="100%" />
        </Box>
      </Card>
    );
  }

  // Default vertical skeleton
  return (
    <Card {...other}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="text" width={60} />
        </Box>
        <Skeleton variant="text" height={28} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} width="80%" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width={100} height={20} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="text" width={40} height={20} />
            <Skeleton variant="text" width={40} height={20} />
            <Skeleton variant="text" width={40} height={20} />
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
