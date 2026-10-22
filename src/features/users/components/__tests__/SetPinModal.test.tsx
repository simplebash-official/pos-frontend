/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import * as sessionHooks from '@/features/billing/hooks/useRegisterSession';
import { SetPinModal } from '../SetPinModal';
import { validatePin } from '../../lib/pin';
import type { UserAccount } from '../../types';

installDrawerTestEnv();

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

const manager: UserAccount = {
  id: 'u-manager',
  key: 'usr_1',
  name: 'Nimal',
  username: 'nimal',
  role: 'manager',
  isActive: true,
  hasPin: false,
  createdAt: '',
  updatedAt: '',
};

describe('validatePin', () => {
  it('accepts 4 to 8 digits', () => {
    expect(validatePin('1234')).toBeNull();
    expect(validatePin('12345678')).toBeNull();
  });

  it('rejects short, long and non-digit values', () => {
    expect(validatePin('123')).not.toBeNull();
    expect(validatePin('123456789')).not.toBeNull();
    expect(validatePin('12a4')).not.toBeNull();
    expect(validatePin('')).not.toBeNull();
  });
});

describe('SetPinModal', () => {
  let container: HTMLDivElement;
  let root: Root;
  const mutateAsync = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue(true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(sessionHooks, 'useSetPin').mockReturnValue({
      mutateAsync,
      isPending: false,
    } as never);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const render = async (target?: UserAccount) => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={new QueryClient()}>
          <MantineProvider>
            <LayoutTierProvider>
              <SetPinModal opened onClose={onClose} target={target} />
            </LayoutTierProvider>
          </MantineProvider>
        </QueryClientProvider>
      );
    });
  };

  const type = async (input: HTMLInputElement, value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  const submit = async () => {
    await act(async () => {
      document.body
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };

  const fields = () => Array.from(document.body.querySelectorAll<HTMLInputElement>('input'));

  it('sets the signed-in user own PIN with no target', async () => {
    await render();
    expect(document.body.textContent).toContain('Set My PIN');

    const [pin, confirm] = fields();
    await type(pin, '2468');
    await type(confirm, '2468');
    await submit();

    expect(mutateAsync).toHaveBeenCalledWith({ pin: '2468', targetUserId: undefined });
    expect(onClose).toHaveBeenCalled();
  });

  it('sets another account PIN when a target is given', async () => {
    await render(manager);
    expect(document.body.textContent).toContain('Set PIN for Nimal');

    const [pin, confirm] = fields();
    await type(pin, '135790');
    await type(confirm, '135790');
    await submit();

    expect(mutateAsync).toHaveBeenCalledWith({ pin: '135790', targetUserId: 'u-manager' });
  });

  it('does not save when the two PINs differ', async () => {
    await render();
    const [pin, confirm] = fields();
    await type(pin, '2468');
    await type(confirm, '2469');
    await submit();

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('PINs do not match');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not save a PIN that is too short', async () => {
    await render();
    const [pin, confirm] = fields();
    await type(pin, '12');
    await type(confirm, '12');
    await submit();

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('PIN must be 4 to 8 digits');
  });

  it('shows the server reason and stays open when saving fails', async () => {
    mutateAsync.mockRejectedValue(new Error('Only admins can set PIN for other users'));
    await render(manager);
    const [pin, confirm] = fields();
    await type(pin, '2468');
    await type(confirm, '2468');
    await submit();

    expect(document.body.textContent).toContain('Only admins can set PIN for other users');
    expect(onClose).not.toHaveBeenCalled();
  });
});
