import { ReactNode, useState, useEffect, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { SyncProvider } from '@/offline/react/SyncProvider';
import { AppUpdatePrompt } from '@/app/components/AppUpdatePrompt';
import { HeldCartCatchupNotifier } from '@/app/components/HeldCartCatchupNotifier';
import { LowStockNotifier } from '@/features/inventory/components/LowStockNotifier';
import { reduxColorSchemeManager } from '@/store/colorSchemeManager';
import { mantineTheme } from '@/styles/theme';
import { mantineCssVariableResolver } from '@/styles/cssVariablesResolver';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
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
      <AuthInitializer>
        <SyncProvider>
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
                <ModalsProvider>{children}</ModalsProvider>
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </SyncProvider>
      </AuthInitializer>
    </ReduxProvider>
  );
};
