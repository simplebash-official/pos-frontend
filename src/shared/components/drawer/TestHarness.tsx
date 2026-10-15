// Wraps a drawer under test in the providers it needs (not a test file).
import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';

export const TestHarness = ({ role, children }: { role: string; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u1', name: 'T', username: 't', role, permissions: [] } }),
      },
    })
  );
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <LayoutTierProvider>{children}</LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};
