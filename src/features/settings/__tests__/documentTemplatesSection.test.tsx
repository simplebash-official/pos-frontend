/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import settingsReducer from '@/store/slices/settingsSlice';
import { DocumentTemplatesSection } from '../components/sections/DocumentTemplatesSection';
import * as settingsApi from '../api/settingsApi';
import type { ShopProfile } from '../types';

vi.mock('../api/settingsApi', () => ({
  getShopProfileApi: vi.fn(),
  updateShopProfileApi: vi.fn(),
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

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
if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
}
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

const PROFILE: ShopProfile = {
  id: 'shop',
  version: 1,
  legalName: '',
  tradingName: 'Tweek PC',
  addressLines: [],
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  website: '',
  businessRegNo: '',
  logoBase64: '',
  bankName: '',
  bankBranch: '',
  accountName: '',
  accountNumber: '',
  defaultWarrantyText: 'Policy',
  defaultFooterText: '',
  receiptFooterText: '',
  jobReceiptTermsText: 'Keep this slip.',
  uncollectedAfterDays: 30,
  allowSharedUserSessions: false,
  allowStaffMultiDeviceSessions: false,
};

const getProfile = vi.mocked(settingsApi.getShopProfileApi);
const updateProfile = vi.mocked(settingsApi.updateShopProfileApi);

const Harness = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => configureStore({ reducer: { settings: settingsReducer } }));
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MantineProvider>{children}</MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

/** Types into a controlled input the way a person does. */
const type = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('job receipt settings', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    getProfile.mockReset();
    updateProfile.mockReset();
    getProfile.mockResolvedValue(PROFILE);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async () => {
    await act(async () => {
      root.render(
        <Harness>
          <DocumentTemplatesSection onDirtyChange={vi.fn()} />
        </Harness>
      );
    });
    await vi.waitFor(() =>
      expect(textarea('Terms on the job receipt').value).toBe('Keep this slip.')
    );
  };

  const textarea = (label: string) =>
    [...document.querySelectorAll('label')]
      .find((l) => l.textContent?.includes(label))
      ?.closest('div')
      ?.querySelector('textarea') as HTMLTextAreaElement;
  const days = () =>
    [...document.querySelectorAll('label')]
      .find((l) => l.textContent?.includes('Warn about uncollected items after'))
      ?.closest('div')
      ?.querySelector('input') as HTMLInputElement;
  const save = () =>
    [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Save Changes');

  it('shows the saved terms, their length and the saved days', async () => {
    await render();
    expect(days().value).toBe('30');
    expect(document.body.textContent).toContain('15 / 600');
  });

  it('saves trimmed terms and the days', async () => {
    updateProfile.mockResolvedValue({
      ...PROFILE,
      jobReceiptTermsText: 'New terms.',
      uncollectedAfterDays: 14,
    });
    await render();

    await act(async () => type(textarea('Terms on the job receipt'), '  New terms.  '));
    await act(async () => type(days(), '14'));
    await act(async () => save()?.click());

    await vi.waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ jobReceiptTermsText: 'New terms.', uncollectedAfterDays: 14 })
    );
  });

  it('sends 0 to remove the pickup warning when the days are emptied', async () => {
    updateProfile.mockResolvedValue({ ...PROFILE, uncollectedAfterDays: null });
    await render();

    await act(async () => type(days(), ''));
    await act(async () => save()?.click());

    await vi.waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ uncollectedAfterDays: 0 })
    );
  });
});
