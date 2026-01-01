'use client';

import { orderBy } from 'es-toolkit';
import { useSetState } from 'minimal-shared/hooks';
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { getPublicationsList } from 'src/actions/publications/action';
import { useAuthContext } from 'src/auth/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { PublicationSearch } from '../publication-search';
import { PublicationSort } from '../publication-sort';
import { PublicationListHorizontal } from '../publication-list-horizontal';

// ----------------------------------------------------------------------

const PUBLICATION_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-asc', label: 'Title: A-Z' },
  { value: 'title-desc', label: 'Title: Z-A' },
];

// ----------------------------------------------------------------------

export function PublicationListView() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const router = useRouter();
  const { author } = useAuthContext();

  const { state, setState } = useSetState({ filter: 'all' });

  useEffect(() => {
    async function loadPublications() {
      try {
        setLoading(true);
        const data = await getPublicationsList();
        setPublications(data);
      } catch (error) {
        console.error('Error loading publications:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPublications();
  }, []);

  const dataFiltered = applyFilter({ inputData: publications, filters: state, sortBy });

  const handleFilter = useCallback(
    (event, newValue) => {
      setState({ filter: newValue });
    },
    [setState]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Publications"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Publications', href: paths.dashboard.publications.list },
          { name: 'List' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => {
              if (!author) {
                router.push(`${paths.dashboard.authors.register}?returnTo=${encodeURIComponent(paths.dashboard.publications.create)}`);
              } else {
                router.push(paths.dashboard.publications.create);
              }
            }}
          >
            New Publication
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          gap: 3,
          display: 'flex',
          mb: { xs: 3, md: 5 },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-end', sm: 'center' },
        }}
      >
        <PublicationSearch />

        <PublicationSort
          sort={sortBy}
          onSort={(newValue) => setSortBy(newValue)}
          sortOptions={PUBLICATION_SORT_OPTIONS}
        />
      </Box>

      <Tabs value={state.filter} onChange={handleFilter} sx={{ mb: { xs: 3, md: 5 } }}>
        {['all', 'recent', 'popular'].map((tab) => (
          <Tab
            key={tab}
            iconPosition="end"
            value={tab}
            label={tab}
            icon={
              <Label
                variant={((tab === 'all' || tab === state.filter) && 'filled') || 'soft'}
                color={(tab === 'recent' && 'info') || (tab === 'popular' && 'warning') || 'default'}
              >
                {tab === 'all' && publications.length}
                {tab === 'recent' && publications.filter((pub) => {
                  const pubDate = new Date(pub.created_at);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return pubDate > thirtyDaysAgo;
                }).length}
                {tab === 'popular' && publications.filter((pub) => pub.authors && pub.authors.length > 3).length}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <PublicationListHorizontal publications={dataFiltered} loading={loading} />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters, sortBy }) {
  const { filter } = filters;

  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['created_at'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['created_at'], ['asc']);
  }

  if (sortBy === 'title-asc') {
    inputData = orderBy(inputData, ['title'], ['asc']);
  }

  if (sortBy === 'title-desc') {
    inputData = orderBy(inputData, ['title'], ['desc']);
  }

  if (filter === 'recent') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    inputData = inputData.filter((pub) => {
      const pubDate = new Date(pub.created_at);
      return pubDate > thirtyDaysAgo;
    });
  }

  if (filter === 'popular') {
    // For now, consider publications with many authors as "popular"
    inputData = inputData.filter((pub) => pub.authors && pub.authors.length > 3);
  }

  return inputData;
}
