'use client';

import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';

import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function AuthorCard({ author, sx, ...other }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(paths.dashboard.authors.view(author.privy_id));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color based on publications count
  const getPublicationsColor = (count) => {
    if (count >= 10) return 'success';
    if (count >= 5) return 'info';
    if (count >= 1) return 'warning';
    return 'default';
  };

  return (
    <Card sx={[{ height: '100%', display: 'flex', flexDirection: 'column' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      {/* Avatar at the top */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3, pb: 2 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            fontSize: '1.75rem',
            fontWeight: 'bold'
          }}
        >
          {getInitials(author.name)}
        </Avatar>
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {/* Name centered under avatar */}
        <Typography variant="h6" component="div" align="center" gutterBottom>
          {author.name}
        </Typography>

        {/* Affiliation */}
        {author.affiliation && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Iconify icon="solar:building-bold" width={16} sx={{ mr: 0.5 }} />
              {author.affiliation}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {/* Papers published */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Papers Published
            </Typography>
            <Chip
              label={author.publications_count || 0}
              color={getPublicationsColor(author.publications_count || 0)}
              size="medium"
              sx={{ mt: 0.5, fontSize: '1rem', fontWeight: 'bold' }}
            />
          </Box>

          {/* Member since */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Member Since
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {formatDate(author.created_at)}
            </Typography>
          </Box>
        </Box>

        {/* Last updated */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Iconify icon="solar:clock-circle-bold" width={14} sx={{ mr: 0.5 }} />
            Last updated: {formatDate(author.updated_at)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          fullWidth
          variant="contained"
          onClick={handleViewDetails}
          startIcon={<Iconify icon="solar:eye-bold" width={16} />}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}
