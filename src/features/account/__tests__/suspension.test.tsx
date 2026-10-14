/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { store } from '@/store';
import type { ApiError } from '@/shared/types/common';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { AccountSuspendedPage } from '../components/AccountSuspendedPage';
import {
  clearSuspension,
  notifyIfSuspended,
  parseSuspension,
  readSuspension,
  saveSuspension,
  setSuspensionHandler,
  type Suspension,
} from '../lib/suspension';

// jsdom lacks matchMedia, which Mantine's provider needs. Stubbed only when missing (Jest's own
// setup already provides it).
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

const SUSPENSION: Suspension = {
  shopName: 'Gee Mobile',
  suspendedAt: '2026-10-01T08:30:00Z',
  reason: 'unpaid invoice',
  retained: {
    bills: 1280,
    products: 342,
    customers: 97,
    staff: 4,
    lastBillAt: '2026-09-30T17:05:00Z',
  },
};

const refused = (details: unknown, over: Partial<ApiError> = {}): ApiError => ({
  message: 'suspended',
  code: 'ACCOUNT_SUSPENDED',
  statusCode: 403,
  details: details as ApiError['details'],
  ...over,
});

describe('parseSuspension', () => {
  it('accepts a complete answer, with or without a last bill', () => {
    expect(parseSuspension(SUSPENSION)).toEqual(SUSPENSION);
    const none = { ...SUSPENSION, retained: { ...SUSPENSION.retained, lastBillAt: null } };
    expect(parseSuspension(none)).toEqual(none);
  });

  it('rejects anything incomplete or mistyped instead of filling gaps', () => {
    const bad: unknown[] = [
      undefined,
      null,
      'x',
      {},
      { ...SUSPENSION, reason: '' },
      { ...SUSPENSION, shopName: undefined },
      { ...SUSPENSION, suspendedAt: 'yesterday' },
      { ...SUSPENSION, retained: undefined },
      { ...SUSPENSION, retained: { ...SUSPENSION.retained, bills: '12' } },
      { ...SUSPENSION, retained: { ...SUSPENSION.retained, staff: -1 } },
      { ...SUSPENSION, retained: { ...SUSPENSION.retained, lastBillAt: undefined } },
    ];
    for (const details of bad) expect(parseSuspension(details)).toBeNull();
  });
});

describe('notifyIfSuspended', () => {
  afterEach(() => setSuspensionHandler(null));

  it('opens the page only for a complete 403 ACCOUNT_SUSPENDED', () => {
    const handler = vi.fn();
    setSuspensionHandler(handler);

    notifyIfSuspended(refused(SUSPENSION));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(SUSPENSION);

    handler.mockClear();
    notifyIfSuspended(refused(SUSPENSION, { statusCode: 401 }));
    notifyIfSuspended(refused(SUSPENSION, { code: 'FORBIDDEN' }));
    notifyIfSuspended(refused({ reason: 'only a reason' }));
    notifyIfSuspended(refused(undefined));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('suspension storage', () => {
  beforeEach(() => sessionStorage.clear());

  it('round-trips and clears', () => {
    expect(readSuspension()).toBeNull();
    saveSuspension(SUSPENSION);
    expect(readSuspension()).toEqual(SUSPENSION);
    clearSuspension();
    expect(readSuspension()).toBeNull();
  });

  it('treats a corrupt entry as nothing', () => {
    sessionStorage.setItem('pos_suspension', '{not json');
    expect(readSuspension()).toBeNull();
  });
});

describe('AccountSuspendedPage', () => {
  const html = () =>
    renderToString(
      <Provider store={store}>
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter initialEntries={['/suspended']}>
              <Routes>
                <Route path="/suspended" element={<AccountSuspendedPage />} />
                <Route path="/login" element={<div>login screen</div>} />
              </Routes>
            </MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </Provider>
    ).replace(/<!-- -->/g, '');

  beforeEach(() => {
    sessionStorage.clear();
    vi.stubEnv('VITE_SUPPORT_EMAIL', 'help@example.test');
    vi.stubEnv('VITE_SUPPORT_WHATSAPP', '+94 77 123 4567');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('shows the shop, the reason, the retained data counts and the contact', () => {
    saveSuspension(SUSPENSION);
    const out = html();
    expect(out).toContain('Cloud access is suspended');
    expect(out).toContain('Gee Mobile');
    expect(out).toContain('unpaid invoice');
    expect(out).toContain('Your data is safe');
    for (const count of ['1,280', '342', '97']) expect(out).toContain(count);
    expect(out).toContain('mailto:help@example.test');
    expect(out).toContain('https://wa.me/94771234567');
    expect(out).toContain('The desktop app keeps working offline');
  });

  it('sends a visitor with nothing to show to the sign-in page', async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LayoutTierProvider>
              <MemoryRouter initialEntries={['/suspended']}>
                <Routes>
                  <Route path="/suspended" element={<AccountSuspendedPage />} />
                  <Route path="/login" element={<div>login screen</div>} />
                </Routes>
              </MemoryRouter>
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });
    expect(container.textContent).toContain('login screen');
    await act(async () => root.unmount());
  });

  it('refuses to render without the support contact instead of inventing one', () => {
    saveSuspension(SUSPENSION);
    vi.stubEnv('VITE_SUPPORT_EMAIL', '');
    expect(() => html()).toThrow(/VITE_SUPPORT_EMAIL/);
  });
});
