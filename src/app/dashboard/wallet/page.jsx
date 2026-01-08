'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance, { endpoints } from 'src/lib/axios';

import WalletComponent from 'src/components/wallet/wallet-component';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import TransactionComponent from 'src/components/transaction/transaction-component';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function WalletPage() {
  const router = useRouter();
  const { user: authUser, author } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [userData, setUserData] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [publications, setPublications] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!authUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        try {
          const walletResponse = await axiosInstance.get(endpoints.users.getWallet(authUser.id));
          if (walletResponse.data && walletResponse.data.wallet_address) {
            setWalletAddress(walletResponse.data.wallet_address);
          }
        } catch (err) {
          console.log('Failed to fetch wallet from wallet endpoint:', err.message);
        }

        try {
          const userResponse = await axiosInstance.get(endpoints.users.get(authUser.id));
          setUserData(userResponse.data?.user || userResponse.data);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }

        // Fetch user purchases
        try {
          const purchasesResponse = await axiosInstance.get(endpoints.purchases.listByUser(authUser.id));
          setPurchases(purchasesResponse.data?.purchases || []);
        } catch (err) {
          console.error('Failed to fetch purchases:', err);
        }

        // Fetch user publications
        try {
          const publicationsResponse = await axiosInstance.get(endpoints.publications.listByUser(authUser.id));
          setPublications(publicationsResponse.data?.publications || []);
        } catch (err) {
          console.error('Failed to fetch publications:', err);
        }

      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        showSnackbar('Failed to load wallet data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [authUser?.id]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewPublication = (publicationId) => {
    router.push(paths.dashboard.publications.details(publicationId));
  };

  // Filter publications that have transaction hashes
  const publicationsWithTransactions = publications.filter(
    pub => pub.transaction_hash && pub.status === 'PUBLISHED'
  );

  // Combine purchases and publications for all transactions view
  const allTransactions = [
    ...purchases.map(purchase => ({
      ...purchase,
      type: 'purchase',
      publication: publications.find(pub => pub.id === purchase.publication_id)
    })),
    ...publicationsWithTransactions.map(publication => ({
      ...publication,
      type: 'publication',
      transaction_hash: publication.transaction_hash,
      status: publication.status
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="My Wallet"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Wallet' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Grid container spacing={3}>
          {/* Wallet Component */}
          <Grid item xs={12} md={4}>
            <WalletComponent
              walletAddress={walletAddress}
              collectedMoney={userData?.collected_money || 0}
              registrationDate={userData?.created_at || author?.created_at}
              showFundButton
            />
          </Grid>

          {/* Transactions Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Transaction History
              </Typography>

              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label={`All (${allTransactions.length})`} />
                <Tab label={`Purchases (${purchases.length})`} />
                <Tab label={`Publications (${publicationsWithTransactions.length})`} />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={2}>
                  {allTransactions.length > 0 ? (
                    allTransactions.map((transaction, index) => (
                      <Grid item xs={12} key={index}>
                        <TransactionComponent
                          transaction={transaction}
                          publication={transaction.publication}
                          type={transaction.type}
                          onViewPublication={
                            transaction.publication_id || transaction.id
                              ? () => handleViewPublication(transaction.publication_id || transaction.id)
                              : undefined
                          }
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No transactions found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Your transaction history will appear here
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={2}>
                  {purchases.length > 0 ? (
                    purchases.map((purchase, index) => {
                      const publication = publications.find(pub => pub.id === purchase.publication_id);
                      return (
                        <Grid item xs={12} key={index}>
                          <TransactionComponent
                            transaction={purchase}
                            publication={publication}
                            type="purchase"
                            onViewPublication={
                              publication
                                ? () => handleViewPublication(publication.id)
                                : undefined
                            }
                          />
                        </Grid>
                      );
                    })
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No purchases found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Purchase publications to see them here
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}

              {activeTab === 2 && (
                <Grid container spacing={2}>
                  {publicationsWithTransactions.length > 0 ? (
                    publicationsWithTransactions.map((publication, index) => (
                      <Grid item xs={12} key={index}>
                        <TransactionComponent
                          transaction={{
                            transaction_hash: publication.transaction_hash,
                            created_at: publication.created_at,
                            status: publication.status,
                          }}
                          publication={publication}
                          type="publication"
                          onViewPublication={() => handleViewPublication(publication.id)}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No published publications found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Publish papers to see them here
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
