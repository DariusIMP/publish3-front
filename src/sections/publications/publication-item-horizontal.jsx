import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PublicationItemHorizontal({ sx, publication, detailsHref, ...other }) {
  // Format authors list
  const authorsText = publication.authors && publication.authors.length > 0
    ? publication.authors.map(author => author.name).join(', ')
    : 'No authors';

  // Get first few tags
  const displayTags = publication.tags ? publication.tags.slice(0, 3) : [];

  return (
    <Card
      component={RouterLink}
      href={detailsHref}
      sx={[
        {
          display: 'flex',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...other}
    >
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
          <Label variant="soft" color="info">
            Publication
          </Label>

          <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
            {fDate(publication.created_at)}
          </Box>
        </Box>

        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Typography
            color="inherit"
            variant="subtitle2"
            sx={[
              (theme) => ({
                ...theme.mixins.maxLine({ line: 2 }),
              }),
            ]}
          >
            {publication.title}
          </Typography>

          <Typography
            variant="body2"
            sx={[
              (theme) => ({
                ...theme.mixins.maxLine({ line: 2 }),
                color: 'text.secondary',
              }),
            ]}
          >
            {publication.about || 'No description available'}
          </Typography>

          <Box sx={{ mt: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.5,
              }}
            >
              <Iconify icon="solar:user-bold" width={14} sx={{ mt: 0.25, flexShrink: 0 }} />
              <Box>
                {authorsText}
                {publication.authors && publication.authors.some(a => a.affiliation) && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                    {publication.authors
                      .filter(a => a.affiliation)
                      .map(a => a.affiliation)
                      .filter((affil, index, arr) => arr.indexOf(affil) === index)
                      .slice(0, 2)
                      .join(', ')}
                    {publication.authors.filter(a => a.affiliation).length > 2 && '...'}
                  </Typography>
                )}
              </Box>
            </Typography>
          </Box>

          {/* Tags */}
          {displayTags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {displayTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              ))}
              {publication.tags && publication.tags.length > 3 && (
                <Chip
                  label={`+${publication.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          )}
        </Stack>

        <Box
          sx={{
            gap: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            typography: 'caption',
            color: 'text.disabled',
            justifyContent: 'flex-end',
            mt: 1,
          }}
        >
          {/* Citation count */}
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:quote-bold" width={16} />
            {publication.citation_count || 0}
          </Box>

          {/* Author count */}
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:users-group-rounded-bold" width={16} />
            {publication.authors ? publication.authors.length : 0}
          </Box>

          {/* Tag count */}
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:tag-horizontal-bold" width={16} />
            {publication.tags ? publication.tags.length : 0}
          </Box>
        </Box>
      </Stack>

      <Box
        sx={{
          p: 1,
          width: 180,
          height: 240,
          flexShrink: 0,
          position: 'relative',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {/* PDF icon or placeholder */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'action.hover',
            borderRadius: 1.5,
          }}
        >
          <Iconify icon="solar:document-bold" width={64} sx={{ color: 'text.disabled' }} />
        </Box>

        {/* First author avatar if available */}
        {publication.authors && publication.authors.length > 0 && publication.authors[0].name && (
          <Avatar
            alt={publication.authors[0].name}
            sx={{
              top: 16,
              right: 16,
              zIndex: 9,
              position: 'absolute',
              bgcolor: 'primary.main',
            }}
          >
            {publication.authors[0].name.charAt(0).toUpperCase()}
          </Avatar>
        )}
      </Box>
    </Card>
  );
}
