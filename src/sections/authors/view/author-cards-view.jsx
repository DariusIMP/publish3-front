'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { AuthorCardList } from '../author-card-list';

// ----------------------------------------------------------------------

export function AuthorCardsView({ authors, loading, error }) {
  const { author } = useAuthContext();
  const [sortBy, setSortBy] = useState('papers'); // 'papers', 'name', 'affiliation'

  // Sort authors based on selected criteria
  const sortedAuthors = useMemo(() => {
    if (!authors || authors.length === 0) return [];

    const sorted = [...authors];
    
    switch (sortBy) {
      case 'papers':
        // Sort by publications count (descending)
        return sorted.sort((a, b) => (b.publications_count || 0) - (a.publications_count || 0));
      case 'name':
        // Sort by name (ascending)
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'affiliation':
        // Sort by affiliation (ascending), with nulls last
        return sorted.sort((a, b) => {
          if (!a.affiliation && !b.affiliation) return 0;
          if (!a.affiliation) return 1;
          if (!b.affiliation) return -1;
          return a.affiliation.localeCompare(b.affiliation);
        });
      default:
        return sorted;
    }
  }, [authors, sortBy]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Authors"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Authors', href: paths.dashboard.authors.list },
        ]}
        action={
          !author && (
            <Button
              component={RouterLink}
              href={paths.dashboard.authors.register}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Register Author
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Sorting controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="sort-authors-label">Sort by</InputLabel>
          <Select
            labelId="sort-authors-label"
            value={sortBy}
            label="Sort by"
            onChange={handleSortChange}
          >
            <MenuItem value="papers">Papers Published (Most First)</MenuItem>
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="affiliation">Affiliation (A-Z)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && sortedAuthors.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No authors found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register an author to get started
          </Typography>
        </Box>
      )}

      {/* Authors list */}
      {!loading && !error && sortedAuthors.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {sortedAuthors.length} authors
          </Typography>
          <AuthorCardList authors={sortedAuthors} />
        </>
      )}
    </DashboardContent>
  );
}
