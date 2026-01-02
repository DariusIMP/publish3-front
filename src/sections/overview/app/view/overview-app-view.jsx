'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appInvoices, _appInstalled } from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedUser } from 'src/auth/hooks';

import { AppWidget } from '../app-widget';
import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppTopAuthors } from '../app-top-authors';
import { AppWidgetSummary } from '../app-widget-summary';
import { CONFIG } from 'src/global-config';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { getPublicationsList, getPublicationsCount } from 'src/actions/publications/action';
import { getUsersCount } from 'src/actions/users/action';
import { getPurchasesCount } from 'src/actions/purchases/action';

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { user } = useMockedUser();
  const theme = useTheme();
  const [featuredPublications, setFeaturedPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);
  const [publicationsCount, setPublicationsCount] = useState(0);
  const [purchasesCount, setPurchasesCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [publications, usersCount, purchasesCount, publicationsCount] = await Promise.all([
          getPublicationsList(),
          getUsersCount(),
          getPurchasesCount(),
          getPublicationsCount(),
        ]);
        // Take the first 4 publications (or fewer)
        const featured = publications.slice(0, 4).map((pub) => ({
          id: pub.id,
          title: pub.title,
          description: pub.about || 'No description available',
          coverUrl: `${CONFIG.assetsDir}/assets/background/background-1.png`,
        }));
        setFeaturedPublications(featured);
        setUsersCount(usersCount);
        setPurchasesCount(purchasesCount);
        setPublicationsCount(publicationsCount);
      } catch (error) {
        console.error('Failed to fetch data for dashboard:', error);
      } finally {
        setLoading(false);
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

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopAuthors title="Top authors" list={_appAuthors} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <AppWidget
              title="Conversion"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{ series: 48 }}
            />

            <AppWidget
              title="Applications"
              total={55566}
              icon="solar:letter-bold"
              chart={{
                series: 75,
                colors: [theme.vars.palette.info.light, theme.vars.palette.info.main],
              }}
              sx={{
                bgcolor: 'info.dark',
                [`& .${svgColorClasses.root}`]: { color: 'info.light' },
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
