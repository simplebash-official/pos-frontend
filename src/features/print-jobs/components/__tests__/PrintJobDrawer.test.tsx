/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MotionGlobalConfig } from 'framer-motion';
import { PrintJobFormHost } from '../../testing/PrintJobFormHost';
import type { PrintJob, PrintJobInput } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
MotionGlobalConfig.skipAnimations = true;

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

// The assignment block has its own tests; this file is about the customer and price rules.
vi.mock('@/features/employees/components/AssigneeSection', () => ({
  AssigneeSection: () => null,
}));

// The real picker has its own tests; here it just hands back one customer.
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

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/shared/hooks/useJobEarnings', () => ({
  useJobEarnings: () => ({ data: undefined }),
  toEarningsRequest: () => ({}),
}));

vi.mock('@/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

describe('the print job panel form: customer', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
    vi.clearAllMocks();
  });

  const renderModal = (
    props: {
      opened?: boolean;
      onClose?: () => void;
      onSubmit?: (val: PrintJobInput) => Promise<void>;
      jobToEdit?: PrintJob | null;
    } = {}
  ) => {
    const defaultProps = {
      opened: true,
      onClose: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue(undefined),
      jobToEdit: null,
      ...props,
    };

    act(() => {
      root!.render(
        <MantineProvider>
          <PrintJobFormHost {...defaultProps} />
        </MantineProvider>
      );
    });

    return defaultProps;
  };

  const buttons = () => [...document.querySelectorAll('button')];
  const button = (label: string) => buttons().find((b) => b.textContent?.trim() === label);
  const submitForm = async () => {
    await act(async () => {
      document
        .querySelector('form')
        ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  };

  it('leaves at once when nothing was typed, and asks first when something was', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await act(async () => button('Cancel')?.click());
    expect(onClose).toHaveBeenCalledTimes(1);

    renderModal({ onClose });
    const price = document.querySelector<HTMLInputElement>('input[placeholder="e.g. 25000"]');
    expect(price).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(price, '1500');
      price?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button('Cancel')?.click());
    await vi.waitFor(() => expect(document.body.textContent).toContain('Discard unsaved changes?'));
    expect(onClose).toHaveBeenCalledTimes(1);
    await act(async () => button('Discard')?.click());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('asks for a registered customer to be chosen, with no name or phone to type', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });

    expect(document.body.textContent).toContain('No customer chosen');
    expect(document.body.textContent).toContain('Customer *');
    expect(document.querySelector('input[placeholder="e.g. 0712345678"]')).toBeNull();

    await submitForm();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Choose the customer for this print order.');

    await act(async () => button('Choose customer')?.click());
    await act(async () => button('pick Sunil')?.click());
    expect(document.body.textContent).toContain('Sunil Silva');
    expect(document.body.textContent).toContain('0777654321');
    expect(document.body.textContent).toContain('Change customer');
  });

  it('sends only the key of the customer when a job is saved', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const existingJob = {
      id: 'prn_1',
      ticketNumber: 'PRN-001',
      customerKey: 'cus_dhanushka',
      customerName: 'Dhanushka Fernando',
      customerPhone: '0712345678',
      jobType: 'mug' as const,
      quantity: 1,
      status: 'received' as const,
      estimatedCostCents: 2500000,
      createdAt: '2026-08-20T10:00:00.000Z',
    };
    renderModal({ onSubmit, jobToEdit: existingJob });
    expect(document.body.textContent).toContain('Dhanushka Fernando');

    await act(async () => button('Change customer')?.click());
    await act(async () => button('pick Sunil')?.click());
    await submitForm();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].customer).toEqual({ customerKey: 'cust_1' });
  });
});
