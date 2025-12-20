import 'src/global.css';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { CONFIG } from 'src/global-config';
import { primary } from 'src/theme/core/palette';
import { themeConfig, ThemeProvider } from 'src/theme';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/privy';
import { MovementProvider } from 'src/context/movement';

// ----------------------------------------------------------------------

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  icons: [
    {
      rel: 'icon',
      url: `${CONFIG.assetsDir}/logo/publish3-logo-single.png`,
    },
  ],
};

// ----------------------------------------------------------------------

async function getAppConfig() {
  if (CONFIG.isStaticExport) {
    return {
      cookieSettings: undefined,
      dir: defaultSettings.direction,
    };
  } else {
    const [settings] = await Promise.all([detectSettings()]);

    return {
      cookieSettings: settings,
      dir: settings.direction,
    };
  }
}

export default async function RootLayout({ children }) {
  const appConfig = await getAppConfig();

  return (
    <html lang="en" dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.defaultMode}
        />

        <MovementProvider>
          <AuthProvider>
            <SettingsProvider
              cookieSettings={appConfig.cookieSettings}
              defaultSettings={defaultSettings}
            >
              <AppRouterCacheProvider options={{ key: 'css' }}>
                <ThemeProvider
                  modeStorageKey={themeConfig.modeStorageKey}
                  defaultMode={themeConfig.defaultMode}
                >
                  <MotionLazy>
                    <ProgressBar />
                    <SettingsDrawer defaultSettings={defaultSettings} />
                    {children}
                  </MotionLazy>
                </ThemeProvider>
              </AppRouterCacheProvider>
            </SettingsProvider>
          </AuthProvider>
        </MovementProvider>
      </body>
    </html>
  );
}
