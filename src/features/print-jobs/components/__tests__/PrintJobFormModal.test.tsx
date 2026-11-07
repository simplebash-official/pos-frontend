/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MotionGlobalConfig } from 'framer-motion';
import { PrintJobFormModal } from '../PrintJobFormModal';
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

vi.mock('@/features/employees/hooks/useEmployees', () => ({
  useAllEmployees: () => ({ data: [] }),
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

describe('PrintJobFormModal validation', () => {
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
          <PrintJobFormModal {...defaultProps} />
        </MantineProvider>
      );
    });

    return defaultProps;
  };

  it('validates customer phone as mandatory', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const existingJob = {
      id: 'prn_1',
      ticketNumber: 'PRN-001',
      customerName: 'Dhanushka Fernando',
      customerPhone: '0712345678',
      jobType: 'mug' as const,
      quantity: 1,
      status: 'received' as const,
      estimatedCostCents: 2500000,
      createdAt: '2026-08-20T10:00:00.000Z',
    };

    renderModal({ onSubmit, jobToEdit: existingJob });

    const phoneInput = document.querySelector(
      'input[placeholder="e.g. 0712345678"]'
    ) as HTMLInputElement;
    const formEl = document.querySelector('form') as HTMLFormElement;

    expect(phoneInput).toBeTruthy();
    expect(phoneInput.required).toBe(true);
    expect(phoneInput.value).toBe('0712345678');

    const setInputValue = (input: HTMLInputElement, value: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )!.set!;
      nativeSetter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // 1. Submit with empty phone
    await act(async () => {
      setInputValue(phoneInput, '');
      formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Enter a valid phone number');

    // 2. Submit with invalid short phone
    await act(async () => {
      setInputValue(phoneInput, '123');
      formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(onSubmit).not.toHaveBeenCalled();

    // 3. Submit with valid phone
    await act(async () => {
      setInputValue(phoneInput, '0779998877');
      formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].customer.customerPhone).toBe('0779998877');
  });
});
