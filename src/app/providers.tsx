import { ReactNode, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { reduxColorSchemeManager } from '@/store/colorSchemeManager';
import { mantineTheme } from '@/styles/theme';
import { mantineCssVariableResolver } from '@/styles/cssVariablesResolver';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
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
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={mantineTheme}
          cssVariablesResolver={mantineCssVariableResolver}
          colorSchemeManager={reduxColorSchemeManager}
          defaultColorScheme="dark"
        >
          <Notifications position="top-right" zIndex={1000} />
          <ModalsProvider>{children}</ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
