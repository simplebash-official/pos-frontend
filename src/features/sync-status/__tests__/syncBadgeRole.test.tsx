import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { SyncBadge } from '../components/SyncBadge';
import { DISABLED_SYNC_STATUS, type SyncStatus } from '../types';
import { USER_ROLES, type UserRole } from '@/constants/roles';

vi.mock('@/shared/lib/runtime', () => ({
  isTauri: () => true,
}));

const mockStatus: SyncStatus = {
  ...DISABLED_SYNC_STATUS,
  linked: true,
  state: 'idle',
};

vi.mock('../hooks/useSyncStatus', () => ({
  useSyncStatus: () => mockStatus,
}));

const EMPTY_PERMISSIONS: string[] = [];

const createMockStore = (role: UserRole) => {
  const authState = {
    user: { id: 'u1', name: 'Test User', email: 'test@example.com', role, permissions: EMPTY_PERMISSIONS },
    permissions: EMPTY_PERMISSIONS,
  };
  return configureStore({
    reducer: {
      auth: () => authState,
    },
  });
};

const renderSyncBadge = (role: UserRole) => {
  const store = createMockStore(role);
  return renderToString(
    <Provider store={store}>
      <MantineProvider>
        <MemoryRouter>
          <SyncBadge />
        </MemoryRouter>
      </MantineProvider>
    </Provider>
  );
};

describe('SyncBadge interaction mode by user role', () => {
  it('renders interactive button with pointer cursor for admin role', () => {
    const html = renderSyncBadge(USER_ROLES.ADMIN);
    expect(html).toContain('type="button"');
    expect(html).toContain('cursor:pointer');
  });

  it('renders non-interactive div without button type and with default cursor for manager role', () => {
    const html = renderSyncBadge(USER_ROLES.MANAGER);
    expect(html).not.toContain('type="button"');
    expect(html).toContain('cursor:default');
  });

  it('renders non-interactive div without button type and with default cursor for staff role', () => {
    const html = renderSyncBadge(USER_ROLES.STAFF);
    expect(html).not.toContain('type="button"');
    expect(html).toContain('cursor:default');
  });
});
