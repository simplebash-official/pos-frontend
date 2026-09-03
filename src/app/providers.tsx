import { ReactNode, useState, useEffect, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { selectAppLanguage } from '@/store/slices/settingsSlice';
import { AppUpdatePrompt } from '@/app/components/AppUpdatePrompt';
import { HeldCartCatchupNotifier } from '@/app/components/HeldCartCatchupNotifier';
import { LowStockNotifier } from '@/features/inventory/components/LowStockNotifier';
import { reduxColorSchemeManager } from '@/store/colorSchemeManager';
import { mantineTheme } from '@/styles/theme';
import { mantineCssVariableResolver } from '@/styles/cssVariablesResolver';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { CalculatorProvider } from '@/shared/components/calculator';
import '@/offline/connectivity/onlineManagerBridge';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@/styles/global.css';

export interface AppProvidersProps {
  children: ReactNode;
}

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

const LanguageRemounter = ({ children }: { children: ReactNode }) => {
  const language = useAppSelector(selectAppLanguage);
  // Changing the key forces a full unmount and remount of the app when language changes.
  // This allows us to use a simple pure function t() without React hooks.
  return (
    <div key={language} style={{ display: 'contents' }}>
      {children}
    </div>
  );
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <LanguageRemounter>
        <AuthInitializer>
          <QueryClientProvider client={queryClient}>
            <MantineProvider
              theme={mantineTheme}
              cssVariablesResolver={mantineCssVariableResolver}
              colorSchemeManager={reduxColorSchemeManager}
              defaultColorScheme="light"
            >
              <Notifications position="top-right" zIndex={1000} />
              <LayoutTierProvider>
                <AppUpdatePrompt />
                <HeldCartCatchupNotifier />
                <LowStockNotifier />
                <ModalsProvider>
                  <CalculatorProvider>{children}</CalculatorProvider>
                </ModalsProvider>
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </AuthInitializer>
      </LanguageRemounter>
    </ReduxProvider>
  );
};
