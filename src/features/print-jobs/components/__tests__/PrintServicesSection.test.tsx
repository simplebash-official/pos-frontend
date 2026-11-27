/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { formatMoney } from '@/shared/lib/money';
import * as servicesApi from '../../api/printServicesApi';
import type { PrintService } from '../../types';
import { PrintServicesSection } from '../PrintServicesSection';

installDrawerTestEnv();

vi.mock('../../api/printServicesApi', () => ({
  fetchPrintServices: vi.fn(),
  createPrintService: vi.fn(),
  updatePrintService: vi.fn(),
}));

const api = {
  services: vi.mocked(servicesApi.fetchPrintServices),
  update: vi.mocked(servicesApi.updatePrintService),
};

const DESIGN: PrintService = {
  id: '1',
  key: 'pst_design',
  name: 'Design',
  unitPriceCents: 50_000,
  unitCostCents: 20_000,
  warranty: { coverage: { kind: 'none' } },
  active: true,
  version: 1,
  createdAt: '2026-11-03T00:00:00Z',
  updatedAt: '2026-11-03T00:00:00Z',
};

describe('print services in settings', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    api.services.mockReset();
    api.update.mockReset();
    api.services.mockResolvedValue([DESIGN]);
    api.update.mockResolvedValue({ ...DESIGN, version: 2 });
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
        <TestHarness role="admin">
          <PrintServicesSection />
        </TestHarness>
      );
    });
    await vi.waitFor(() => expect(document.body.textContent).toContain('Design'));
  };
  const click = async (selector: string) => {
    const found = document.querySelector<HTMLButtonElement>(selector);
    expect(found).not.toBeNull();
    await act(async () => found?.click());
  };
  const button = (label: string) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === label);
  const costBox = () => {
    const label = [...document.querySelectorAll('label')].find(
      (candidate) => candidate.textContent?.trim() === 'Usual cost to shop for one'
    );
    return document.getElementById(label?.htmlFor ?? '') as HTMLInputElement | null;
  };

  it('shows the saved cost and keeps it when the service is hidden', async () => {
    await render();
    expect(document.body.textContent).toContain(`Cost to shop, each ${formatMoney(20_000)}`);
    await click('button[aria-label="Hide Design"]');
    await vi.waitFor(() =>
      expect(api.update).toHaveBeenCalledWith(
        'pst_design',
        expect.objectContaining({ unitPriceCents: 50_000, unitCostCents: 20_000, active: false })
      )
    );
  });

  it('forgets the cost when its box is emptied', async () => {
    await render();
    await click('button[aria-label="Edit Design"]');
    await vi.waitFor(() => expect(costBox()?.value).toBe('Rs. 200'));

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(costBox(), '');
      costBox()?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button('Save Changes')?.click());
    await vi.waitFor(() => expect(api.update).toHaveBeenCalledTimes(1));
    expect(api.update.mock.calls[0][1].unitCostCents).toBeUndefined();
  });
});
