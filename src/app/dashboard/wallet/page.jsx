'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import WalletComponent from 'src/components/wallet/wallet-component';

import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export default function WalletPage() {
  const router = useRouter();
  const { user: authUser, author } = useAuthContext();
  const { user: privyUser } = usePrivy();

  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [userData, setUserData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!privyUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        try {
          const walletResponse = await axiosInstance.get(endpoints.users.getWallet(privyUser.id));
          if (walletResponse.data && walletResponse.data.wallet_address) {
            setWalletAddress(walletResponse.data.wallet_address);
          }
        } catch (err) {
          console.log('Failed to fetch wallet from wallet endpoint:', err.message);
        }

        try {
          const userResponse = await axiosInstance.get(endpoints.users.get(privyUser.id));
          setUserData(userResponse.data?.user || userResponse.data);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }

      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        showSnackbar('Failed to load wallet data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [privyUser?.id]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

        {/* Wallet Component with fund button enabled */}
        <WalletComponent
          walletAddress={walletAddress}
          collectedMoney={userData?.collected_money || 0}
          registrationDate={userData?.created_at || author?.created_at}
          showFundButton={true}
        />
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
