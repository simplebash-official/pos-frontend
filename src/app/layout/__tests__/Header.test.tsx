import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from '../Header';
import { SERVICE_CENTER_NAME, PRODUCT_NAME } from '@/config/branding';
import type { ShopProfile } from '@/features/settings/types';

const TEST_SHOP_PROFILE: ShopProfile = {
  id: 'main',
  version: 1,
  legalName: 'SimpleBash Retail (Pvt) Ltd',
  tradingName: 'SimpleBash POS',
  addressLines: ['123 Galle Road', 'Colombo 03'],
  primaryPhone: '0112345678',
  secondaryPhone: '',
  email: 'info@simplebash.lk',
  website: '',
  businessRegNo: '',
  bankName: '',
  bankBranch: '',
  accountName: '',
  accountNumber: '',
  logoBase64: '',
  defaultWarrantyText: '',
  defaultFooterText: 'Thank you for your business!',
  receiptFooterText: 'Thank you for shopping with us!',
  allowSharedUserSessions: false,
  allowStaffMultiDeviceSessions: false,
};

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

vi.mock('@/features/billing/components/sessions', () => ({
  RegisterSessionBadge: () => <div data-testid="register-session-badge" />,
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => mockIsMobile,
}));

const createMockStore = (
  shopProfile?: Partial<ShopProfile>,
  user?: { name?: string; username?: string; role?: string }
) =>
  configureStore({
    reducer: {
      settings: () => ({
        shopProfile: {
          ...TEST_SHOP_PROFILE,
          ...shopProfile,
        },
      }),
      auth: () => ({
        user:
          user !== undefined ? user : { name: 'Cashier John', username: 'cashier', role: 'admin' },
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

  it('renders the shop name on the billing page, like every other screen', () => {
    mockPathname = '/billing';
    const store = createMockStore({ tradingName: 'Custom Garage' });
    const html = renderHeader(store);

    expect(html).toContain('title="Custom Garage"');
    expect(html).not.toContain(PRODUCT_NAME);
  });

  it('renders Active User tooltip with capitalized role (e.g. Admin)', () => {
    const store = createMockStore(undefined, {
      name: 'Mayura AI',
      username: 'mayura',
      role: 'admin',
    });
    const html = renderHeader(store);

    expect(html).toContain('Active User: Mayura AI (Admin)');
    expect(html).not.toContain('Active User: Mayura AI (admin)');
  });

  it('renders Cashier tooltip with capitalized role on billing page', () => {
    mockPathname = '/billing';
    const store = createMockStore(undefined, {
      name: 'Mayura AI',
      username: 'mayura',
      role: 'admin',
    });
    const html = renderHeader(store);

    expect(html).toContain('Cashier: Mayura AI (Admin)');
    expect(html).not.toContain('Cashier: Mayura AI (admin)');
  });

  it('renders register session badge in standard header across other screens', () => {
    mockPathname = '/dashboard';
    const store = createMockStore();
    const html = renderHeader(store);
    expect(html).toContain('data-testid="register-session-badge"');
  });

  it('renders register session badge in billing header', () => {
    mockPathname = '/billing';
    const store = createMockStore();
    const html = renderHeader(store);
    expect(html).toContain('data-testid="register-session-badge"');
  });
});

describe('Header theme button', () => {
  beforeEach(() => {
    mockPathname = '/billing';
    mockIsMobile = false;
  });

  // Same icon and label as the sidebar's theme button: the mode in force, not the next one.
  it.each([
    ['light', 'Light Mode', 'tabler-icon-sun'],
    ['dark', 'Dark Mode', 'tabler-icon-moon'],
    ['auto', 'System', 'tabler-icon-device-desktop'],
  ] as const)('shows the %s mode as the sidebar does', (scheme, label, iconClass) => {
    const html = renderToString(
      <Provider store={createMockStore()}>
        <MantineProvider defaultColorScheme={scheme}>
          <Header opened={false} toggle={vi.fn()} />
        </MantineProvider>
      </Provider>
    );
    const button = html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>.*?</button>`));
    expect(button?.[0]).toContain(iconClass);
  });
});
