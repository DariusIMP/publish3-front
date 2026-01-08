'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import { getUsersCount } from 'src/actions/users/action';
import { useWalletContext } from 'src/context/wallet-context';
import { getPurchasesCount } from 'src/actions/purchases/action';
import { getTopAuthorsByPurchases } from 'src/actions/authors/action';
import { getPublicationsList, getPublicationsCount } from 'src/actions/publications/action';

import { ContractExplorerCard } from 'src/components/contract-explorer-card';
import { WalletCurrentBalance } from 'src/components/wallet/wallet-current-balance';

import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppTopAuthors } from '../app-top-authors';
import { AppWidgetSummary } from '../app-widget-summary';

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const theme = useTheme();
  const [featuredPublications, setFeaturedPublications] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [publicationsCount, setPublicationsCount] = useState(0);
  const [purchasesCount, setPurchasesCount] = useState(0);
  const [topAuthors, setTopAuthors] = useState([]);
  const { moveBalance } = useWalletContext();

  useEffect(() => {
    async function fetchData() {
      try {
        const [publications, usersCountRes, purchasesCountRes, publicationsCountRes, topAuthorsData] = await Promise.all([
          getPublicationsList(),
          getUsersCount(),
          getPurchasesCount(),
          getPublicationsCount(),
          getTopAuthorsByPurchases(3),
        ]);
        // Take the first 4 publications (or fewer)
        const featured = publications.slice(0, 4).map((pub) => ({
          id: pub.id,
          title: pub.title,
          description: pub.about || 'No description available',
          coverUrl: `${CONFIG.assetsDir}/assets/background/background-1.png`,
        }));
        setFeaturedPublications(featured);
        setUsersCount(usersCountRes);
        setPurchasesCount(purchasesCountRes);
        setPublicationsCount(publicationsCountRes);
        // Map top authors to expected format
        const mappedAuthors = topAuthorsData.map((author, index) => ({
          id: author.id || `author-${index}`,
          name: author.name,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`,
          totalFavorites: author.purchase_count || 0,
        }));
        setTopAuthors(mappedAuthors);
      } catch (error) {
        console.error('Failed to fetch data for dashboard:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <AppWelcome
            title={
              <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
                Welcome to <Box component="span" sx={{ color: 'primary.main' }}>Publish3</Box>
              </Typography>
            }
            description="The Movement powered platform for sharing knowledge and getting rewarded."
            img={
              <img
                src={`${CONFIG.assetsDir}/assets/illustrations/movement_logo.png`}
                alt="Movement"
                style={{ width: '100%', height: 'auto' }}
              />
            }
            action={
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                href={paths.dashboard.publications.list}
              >
                Start browsing documents
              </Button>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppFeatured list={featuredPublications} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total active users"
            percent={5}
            total={usersCount}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total Publications"
            percent={0.2}
            total={publicationsCount}
            chart={{
              colors: [theme.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Total purchases"
            percent={-0.1}
            total={purchasesCount}
            chart={{
              colors: [theme.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4, lg: 4 }}>
          <AppTopAuthors title="Top authors" list={topAuthors} />
        </Grid>


        <Grid size={{ xs: 12, md: 4 }}>
          <WalletCurrentBalance balance={moveBalance ?? 0} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ContractExplorerCard />
        </Grid>


      </Grid>
    </DashboardContent>
  );
}
