import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from '../Header';
import { SERVICE_CENTER_NAME, PRODUCT_NAME } from '@/config/branding';
import { DEFAULT_SHOP_PROFILE } from '@/features/settings/constants';
import type { ShopProfile } from '@/features/settings/types';

let mockPathname = '/dashboard';
let mockIsMobile = false;
let mockCloudState = { linked: false, shopName: null as string | null };

vi.mock('@/features/account', () => ({
  useCloudState: () => ({ state: mockCloudState }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock('@/features/billing/hooks/useCart', () => ({
  useCartItems: () => ({ itemCount: 0 }),
  useHeldCarts: () => ({ heldCarts: [] }),
  useCartSound: () => ({ soundEnabled: false, toggleSoundFeedback: vi.fn() }),
}));

vi.mock('@/features/notifications/components/NotificationPopover', () => ({
  NotificationPopover: () => <div data-testid="notification-popover" />,
}));

vi.mock('@/shared/components/ModernClock', () => ({
  ModernClock: () => <div data-testid="modern-clock" />,
}));

vi.mock('@/features/sync-status', () => ({
  SyncBadge: () => <div data-testid="sync-badge" />,
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => mockIsMobile,
}));

const createMockStore = (shopProfile?: Partial<ShopProfile>) =>
  configureStore({
    reducer: {
      settings: () => ({
        shopProfile: {
          ...DEFAULT_SHOP_PROFILE,
          ...shopProfile,
        },
      }),
      auth: () => ({
        user: { name: 'Cashier John', username: 'cashier', role: 'admin' },
      }),
    },
  });

const renderHeader = (store: ReturnType<typeof createMockStore>) =>
  renderToString(
    <Provider store={store}>
      <MantineProvider>
        <Header opened={false} toggle={vi.fn()} />
      </MantineProvider>
    </Provider>
  );

describe('Header component shop name rendering', () => {
  beforeEach(() => {
    mockPathname = '/dashboard';
    mockIsMobile = false;
    mockCloudState = { linked: false, shopName: null };
  });

  it('renders SERVICE_CENTER_NAME when shop profile tradingName and legalName are empty and cloud not linked', () => {
    const store = createMockStore({ tradingName: '', legalName: '' });
    const html = renderHeader(store);

    expect(html).toContain(SERVICE_CENTER_NAME);
    expect(html).not.toContain('SimpleBash Service Center');
  });

  it('renders custom tradingName when provided', () => {
    const store = createMockStore({ tradingName: 'Colombo Auto Hub' });
    const html = renderHeader(store);

    expect(html).toContain('Colombo Auto Hub');
    expect(html).toContain('title="Colombo Auto Hub"');
    expect(html).not.toContain('SimpleBash Service Center');
  });

  it('falls back to legalName when tradingName is empty or whitespace', () => {
    const store = createMockStore({ tradingName: '   ', legalName: 'Lanka Motors Pvt Ltd' });
    const html = renderHeader(store);

    expect(html).toContain('Lanka Motors Pvt Ltd');
    expect(html).toContain('title="Lanka Motors Pvt Ltd"');
  });

  it('falls back to cloudState.shopName when tradingName and legalName are empty and cloud is linked', () => {
    mockCloudState = { linked: true, shopName: 'Jana 2U Shop' };
    const store = createMockStore({ tradingName: '', legalName: '' });
    const html = renderHeader(store);

    expect(html).toContain('Jana 2U Shop');
    expect(html).toContain('title="Jana 2U Shop"');
    expect(html).not.toContain(SERVICE_CENTER_NAME);
  });

  it('prefers custom tradingName over cloudState.shopName', () => {
    mockCloudState = { linked: true, shopName: 'Cloud Shop Name' };
    const store = createMockStore({ tradingName: 'Colombo Auto Hub' });
    const html = renderHeader(store);

    expect(html).toContain('Colombo Auto Hub');
    expect(html).toContain('title="Colombo Auto Hub"');
    expect(html).not.toContain('Cloud Shop Name');
  });

  it('renders SERVICE_CENTER_NAME when linked but cloudState.shopName is empty or whitespace', () => {
    mockCloudState = { linked: true, shopName: '   ' };
    const store = createMockStore({ tradingName: '', legalName: '' });
    const html = renderHeader(store);

    expect(html).toContain(SERVICE_CENTER_NAME);
  });

  it('applies truncation and responsive constraints to title', () => {
    const store = createMockStore({
      tradingName: 'A Very Long Workshop Name That Needs Ellipsis Truncation',
    });
    const desktopHtml = renderHeader(store);

    expect(desktopHtml).toContain('text-overflow:ellipsis');
    expect(desktopHtml).toContain('overflow:hidden');
    expect(desktopHtml).toContain('white-space:nowrap');
    expect(desktopHtml).toContain('max-width:360px');

    mockIsMobile = true;
    const mobileHtml = renderHeader(store);
    expect(mobileHtml).toContain('max-width:180px');
  });

  it('renders PRODUCT_NAME on billing page instead of shop name', () => {
    mockPathname = '/billing';
    const store = createMockStore({ tradingName: 'Custom Garage' });
    const html = renderHeader(store);

    expect(html).toContain(PRODUCT_NAME);
    expect(html).not.toContain('title="Custom Garage"');
  });
});
