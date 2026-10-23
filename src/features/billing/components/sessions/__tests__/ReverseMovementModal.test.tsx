/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ReverseMovementModal } from '../ReverseMovementModal';
import type { CashMovement } from '../../../types';

installDrawerTestEnv();

const reverse = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useReverseCashMovement: () => reverse,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const movement = {
  key: 'cshm_1',
  movementNumber: 'CSH-000001',
  movementType: 'petty_expense',
  amountCents: 150_000,
  categoryName: 'Fuel',
  payeeName: 'Corner shop',
} as CashMovement;

const Harness = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider env="test">
        <LayoutTierProvider>{children}</LayoutTierProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};

describe('ReverseMovementModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    reverse.mutateAsync.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (onClose: () => void, entry: CashMovement | null = movement) => {
    await act(async () => {
      root.render(
        <Harness>
          <ReverseMovementModal movement={entry} onClose={onClose} />
        </Harness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const submit = async () => {
    await act(async () => {
      document.body
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };
  const typeReason = async (value: string) => {
    const input = document.querySelector('input') as HTMLInputElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('is closed until there is an entry', async () => {
    await render(vi.fn(), null);
    expect(text()).not.toContain('Reverse Entry');
  });

  it('describes the entry and always asks why', async () => {
    await render(vi.fn());
    expect(text()).toContain('Reverse Entry — CSH-000001');
    expect(text()).toContain('Small expense · Rs. 1,500.00');
    await submit();
    expect(reverse.mutateAsync).not.toHaveBeenCalled();
    expect(text()).toContain('Please say why this entry is being reversed.');
  });

  it('reverses with the reason and closes', async () => {
    reverse.mutateAsync.mockResolvedValue({});
    const onClose = vi.fn();
    await render(onClose);
    await typeReason('  Wrong amount  ');
    await submit();
    expect(reverse.mutateAsync).toHaveBeenCalledWith({
      key: 'cshm_1',
      input: { reason: 'Wrong amount' },
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the server answer when it is refused', async () => {
    reverse.mutateAsync.mockRejectedValue({ message: 'This movement was already reversed.' });
    await render(vi.fn());
    await typeReason('Duplicate');
    await submit();
    expect(text()).toContain('This movement was already reversed.');
  });
});
