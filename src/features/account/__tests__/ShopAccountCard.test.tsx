import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as runtime from '@/shared/lib/runtime';
import { queryKeys } from '@/api/queryKeys';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ShopAccountCard } from '../components/ShopAccountCard';
import { SwitchingNotice } from '../components/SwitchingNotice';
import { DISABLED_CLOUD_STATE, type CloudState } from '../types';

const cloud = (over: Partial<CloudState>): CloudState => ({
  ...DISABLED_CLOUD_STATE,
  enabled: true,
  ...over,
});

const html = (state: CloudState) => {
  const client = new QueryClient();
  client.setQueryData(queryKeys.cloud.state(), state);
  return renderToString(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <LayoutTierProvider>
          <ShopAccountCard />
        </LayoutTierProvider>
      </MantineProvider>
    </QueryClientProvider>
  ).replace(/<!-- -->/g, '');
};

describe('ShopAccountCard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows nothing on the web build', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(false);
    expect(html(cloud({ linked: true, shopName: 'Gee Mobile' }))).not.toContain(
      'shop-account-card'
    );
  });

  it('shows nothing when this build has no cloud', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    expect(html(DISABLED_CLOUD_STATE)).not.toContain('shop-account-card');
  });

  it('shows the linked shop, its code and the account, with a way to switch', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    const out = html(
      cloud({
        linked: true,
        shopName: 'Gee Mobile',
        shopCode: 'gee-mobile',
        accountEmail: 'owner@gee.lk',
        profileId: 'shop_1',
      })
    );
    expect(out).toContain('Gee Mobile');
    expect(out).toContain('gee-mobile');
    expect(out).toContain('owner@gee.lk');
    expect(out).toContain('Switch shop or account');
    expect(out).toContain('data-log-id="login.switch-shop"');
    // The shop's letter stands in the avatar.
    expect(out).toContain('>G<');
  });

  it('offers to connect when nothing is linked', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    const out = html(cloud({ linked: false }));
    expect(out).toContain('This computer');
    expect(out).toContain('Not connected to SimpleBash');
    expect(out).toContain('Connect to SimpleBash');
    expect(out).not.toContain('Switch shop or account');
  });

  it('keeps naming the open shop after it is unlinked', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    const out = html(cloud({ linked: false, shopName: 'Gee Mobile', shopCode: 'gee-mobile' }));
    expect(out).toContain('Gee Mobile');
    expect(out).toContain('Not connected to SimpleBash');
  });

  it('never renders a token or secret', () => {
    vi.spyOn(runtime, 'isTauri').mockReturnValue(true);
    expect(html(cloud({ linked: true, shopCode: 'x' })).toLowerCase()).not.toContain('token');
  });
});

describe('SwitchingNotice', () => {
  it('names the shop being opened and says the app restarts', () => {
    const out = renderToString(
      <MantineProvider>
        <SwitchingNotice shop="Gee Mobile" />
      </MantineProvider>
    ).replace(/<!-- -->/g, '');
    expect(out).toContain('Switching to Gee Mobile…');
    expect(out).toContain('restarts by itself');
    expect(out).toContain('role="status"');
  });

  it('still reads well when the shop has no name yet', () => {
    const out = renderToString(
      <MantineProvider>
        <SwitchingNotice shop={null} />
      </MantineProvider>
    );
    expect(out).toContain('Switching shop…');
  });
});
