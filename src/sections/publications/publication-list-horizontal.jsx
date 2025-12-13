import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/routes/paths';

import { PublicationItemSkeleton } from './publication-skeleton';
import { PublicationItemHorizontal } from './publication-item-horizontal';

// ----------------------------------------------------------------------

export function PublicationListHorizontal({ publications, loading }) {
  const renderLoading = () => <PublicationItemSkeleton variant="horizontal" />;

  const renderList = () =>
    publications.map((publication) => (
      <PublicationItemHorizontal
        key={publication.id}
        publication={publication}
        detailsHref={paths.dashboard.publications.details(publication.id)}
      />
    ));

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
        }}
      >
        {loading ? renderLoading() : renderList()}
      </Box>

      {publications.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: { xs: 5, md: 8 },
            [`& .${paginationClasses.ul}`]: { justifyContent: 'center' },
          }}
        />
      )}
    </>
  );
}
