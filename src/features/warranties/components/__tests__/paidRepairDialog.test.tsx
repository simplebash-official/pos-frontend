/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { WarrantyClaim } from '../../types';
import { ClaimStepDialog } from '../ClaimStepDialog';
import * as claimsApi from '../../api/claimsApi';

vi.mock('../../api/claimsApi', () => ({
  convertClaimToPaidRepair: vi.fn(),
}));

// The real picker is covered by its own tests; here it just hands back one customer.
vi.mock('@/features/customers/components/CustomerPickerModal', () => ({
  CustomerPickerModal: ({
    opened,
    onSelectCustomer,
  }: {
    opened: boolean;
    onSelectCustomer: (customer: unknown) => void;
  }) =>
    opened ? (
      <button
        type="button"
        onClick={() =>
          onSelectCustomer({ key: 'cust_1', name: 'Sunil Silva', primaryPhone: '0777654321' })
        }
      >
        pick Sunil
      </button>
    ) : null,
}));

const paidRepair = vi.mocked(claimsApi.convertClaimToPaidRepair);

const CLAIM: WarrantyClaim = {
  id: '65f1a1a1a1a1a1a1a1a1a1a2',
  key: 'wcl_1',
  claimNumber: 'WCL-000014',
  warrantyKey: 'wty_1',
  warrantyNumber: 'WTY-000019',
  itemName: 'iPhone 15 Pro Max Tempered Glass',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000050',
  issueDescription: 'broke',
  voidChecks: { liquidDamage: false, sealBroken: false, tampered: false },
  status: 'resolved',
  decision: 'reject',
  receivedOn: '2026-11-15',
  ageDays: 0,
  supplierOverdue: false,
  version: 1,
  createdAt: '2026-11-15T05:00:00Z',
  updatedAt: '2026-11-15T05:00:00Z',
};

const Harness = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MantineProvider>
      <LayoutTierProvider>{children}</LayoutTierProvider>
    </MantineProvider>
  </QueryClientProvider>
);

describe('ClaimStepDialog: paid repair', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    paidRepair.mockReset();
    paidRepair.mockResolvedValue(CLAIM);
    onClose.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (claim: WarrantyClaim) => {
    await act(async () => {
      root.render(
        <Harness>
          <ClaimStepDialog
            claim={claim}
            action="paidRepair"
            source="product_sale"
            warrantyEndsOn={undefined}
            onClose={onClose}
          />
        </Harness>
      );
    });
  };
  const click = (label: string) =>
    act(async () => {
      (
        Array.from(document.body.querySelectorAll('button')).find((b) =>
          b.textContent?.includes(label)
        ) as HTMLButtonElement
      ).click();
    });
  const submit = () =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Make the repair job')
    ) as HTMLButtonElement;

  it('asks a walk-in claim for a customer, and sends the one chosen', async () => {
    await open(CLAIM);
    expect(document.body.textContent).toContain('choose who the repair job is for');
    expect(submit().disabled).toBe(true);

    await click('Choose customer');
    await click('pick Sunil');
    expect(document.body.textContent).toContain('Sunil Silva');
    expect(document.body.textContent).toContain('0777654321');
    expect(submit().disabled).toBe(false);
    await act(async () => submit().click());
    await vi.waitFor(() =>
      expect(paidRepair).toHaveBeenCalledWith('wcl_1', { customerKey: 'cust_1' })
    );
  });

  it('keeps the one-click confirmation when the claim already has a customer', async () => {
    await open({
      ...CLAIM,
      customerKey: 'cus_1',
      customerName: 'Nimal Perera',
      customerPhone: '0771234567',
    });
    expect(document.body.textContent).not.toContain('Choose customer');
    await act(async () => submit().click());
    await vi.waitFor(() =>
      expect(paidRepair).toHaveBeenCalledWith('wcl_1', {
        customerKey: undefined,
      })
    );
  });
});
