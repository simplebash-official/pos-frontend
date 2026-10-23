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
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { CashCategory, CashSettings } from '@/features/billing/types';
import { CashCategoriesSection } from '../components/sections/CashCategoriesSection';
import { CashRulesSection } from '../components/sections/CashRulesSection';

installDrawerTestEnv();

const category = (key: string, name: string, over: Partial<CashCategory> = {}): CashCategory => ({
  id: key,
  key,
  movementType: 'petty_expense',
  name,
  reportGroup: 'operating_expense',
  isSystem: false,
  reviewStatus: 'approved',
  pinned: false,
  sortOrder: 1,
  active: true,
  requiresReceipt: false,
  usageCount: 3,
  version: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...over,
});

const CATEGORIES: CashCategory[] = [
  category('ccat_fuel', 'Fuel', { isSystem: true, sortOrder: 1 }),
  category('ccat_tea', 'Chai', { sortOrder: 2, reviewStatus: 'needs_review' }),
  category('ccat_old', 'Old thing', { sortOrder: 3, active: false }),
];
const SETTINGS: CashSettings = {
  undoWindowSeconds: 120,
  quickAmountsCents: [10_000, 50_000],
  version: 1,
  updatedAt: '2026-01-01T00:00:00Z',
};

const updateCategory = { mutateAsync: vi.fn(), isPending: false };
const mergeCategory = { mutateAsync: vi.fn(), isPending: false };
const updateSettings = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/features/billing/hooks/useCashLookups', () => ({
  useCashCategories: () => ({ data: CATEGORIES, isLoading: false }),
  useUpdateCashCategory: () => updateCategory,
  useMergeCashCategory: () => mergeCategory,
  useCashSettings: () => ({ data: SETTINGS, isLoading: false }),
  useUpdateCashSettings: () => updateSettings,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const Harness = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'A', username: 'a', role: 'admin', permissions: [] },
        }),
      },
    })
  );
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider env="test">
          <LayoutTierProvider>{children}</LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('Cash settings sections', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    updateCategory.mutateAsync.mockReset().mockResolvedValue({});
    mergeCategory.mutateAsync.mockReset();
    updateSettings.mutateAsync.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (ui: ReactNode) => {
    await act(async () => {
      root.render(<Harness>{ui}</Harness>);
    });
  };
  const text = () => document.body.textContent ?? '';
  const byLabel = (label: string) =>
    document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      (b.textContent ?? '').trim().startsWith(label)
    );

  describe('categories', () => {
    it('lists visible categories by kind, marks new ones, and hides retired ones until asked', async () => {
      await render(<CashCategoriesSection />);
      expect(text()).toContain('Fuel');
      expect(text()).toContain('Chai');
      expect(text()).toContain('New');
      expect(text()).toContain('Built in');
      expect(text()).not.toContain('Old thing');
      expect(text()).toContain('Needs review (1)');
    });

    it('approves a category a cashier made', async () => {
      await render(<CashCategoriesSection />);
      await act(async () => button('Approve')!.click());
      expect(updateCategory.mutateAsync).toHaveBeenCalledWith({
        key: 'ccat_tea',
        input: { approve: true },
      });
    });

    it('hides a category and pins one, saving at once', async () => {
      await render(<CashCategoriesSection />);
      await act(async () => byLabel('Hide Chai')!.click());
      expect(updateCategory.mutateAsync).toHaveBeenCalledWith({
        key: 'ccat_tea',
        input: { active: false },
      });
      await act(async () => byLabel('Pin to the top Fuel')!.click());
      expect(updateCategory.mutateAsync).toHaveBeenLastCalledWith({
        key: 'ccat_fuel',
        input: { pinned: true },
      });
    });

    it('moves a category by swapping places with its neighbour', async () => {
      await render(<CashCategoriesSection />);
      await act(async () => byLabel('Move up Chai')!.click());
      expect(updateCategory.mutateAsync).toHaveBeenCalledWith({
        key: 'ccat_tea',
        input: { sortOrder: 1 },
      });
      expect(updateCategory.mutateAsync).toHaveBeenCalledWith({
        key: 'ccat_fuel',
        input: { sortOrder: 2 },
      });
    });

    it('offers merging only for categories the shop made', async () => {
      await render(<CashCategoriesSection />);
      expect(byLabel('Merge Fuel')).toBeNull();
      expect(byLabel('Merge Chai')).not.toBeNull();
    });

    it('opens the edit window with the category filled in', async () => {
      await render(<CashCategoriesSection />);
      await act(async () => byLabel('Edit Chai')!.click());
      expect(text()).toContain('Edit Category');
      expect(
        document.querySelector('input[value="Chai"]') as HTMLInputElement | null
      ).not.toBeNull();
    });
  });

  describe('drawer rules', () => {
    it('shows what is saved and starts with nothing to save', async () => {
      await render(<CashRulesSection onDirtyChange={vi.fn()} />);
      expect(text()).toContain('Undo time (seconds)');
      const undo = Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
        .find((l) => (l.textContent ?? '').startsWith('Undo time'))
        ?.closest('div')
        ?.querySelector('input') as HTMLInputElement;
      expect(undo.value).toBe('120');
      expect(button('Save Changes')!.disabled).toBe(true);
    });

    it('saves a changed amount and clears a limit left empty', async () => {
      updateSettings.mutateAsync.mockResolvedValue({
        ...SETTINGS,
        version: 2,
        floatTargetCents: 300_000,
      });
      const dirty = vi.fn();
      await render(<CashRulesSection onDirtyChange={dirty} />);
      const float = Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
        .find((l) => (l.textContent ?? '').startsWith('Float target'))
        ?.closest('div')
        ?.querySelector('input') as HTMLInputElement;
      await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(float, '3000');
        float.dispatchEvent(new Event('input', { bubbles: true }));
      });
      expect(dirty).toHaveBeenLastCalledWith(true);
      await act(async () => button('Save Changes')!.click());
      expect(updateSettings.mutateAsync).toHaveBeenCalledWith({
        undoWindowSeconds: 120,
        approvalThresholdCents: undefined,
        quickAmountsCents: [10_000, 50_000],
        floatTargetCents: 300_000,
      });
    });
  });
});
