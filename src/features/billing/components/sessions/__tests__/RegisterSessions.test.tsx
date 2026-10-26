/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { DenominationCounter } from '../DenominationCounter';
import { PinVerificationModal } from '../PinVerificationModal';

installDrawerTestEnv();

const mockVerifyPinMutate = vi.fn();
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useVerifyPin: () => ({
    mutateAsync: mockVerifyPinMutate,
    isPending: false,
  }),
}));

describe('RegisterSessions Components', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockVerifyPinMutate.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderComponent = async (ui: React.ReactNode) => {
    await act(async () => {
      root.render(<TestHarness role="admin">{ui}</TestHarness>);
    });
  };

  const text = () => document.body.textContent ?? '';
  const button = (label: string | RegExp) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      typeof label === 'string' ? b.textContent?.includes(label) : label.test(b.textContent ?? '')
    );

  describe('DenominationCounter', () => {
    // The server's answer for the counts, as literals.
    const line = (rupees: number, count: number, subtotalCents: number) => ({
      id: String(rupees),
      valueCents: rupees * 100,
      count,
      subtotalCents,
    });
    const answered = (totalCents: number, counted: Record<number, [number, number]> = {}) => ({
      data: {
        lines: [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1].map((rupees) =>
          line(rupees, counted[rupees]?.[0] ?? 0, counted[rupees]?.[1] ?? 0)
        ),
        totalCents,
      },
      isCurrent: true,
      error: null,
    });

    it('lists every note and coin the server knows', async () => {
      await renderComponent(
        <DenominationCounter counts={{}} onChange={vi.fn()} count={answered(0)} />
      );
      expect(text()).toContain('Rs. 5,000.00');
      expect(text()).toContain('Rs. 1.00');
    });

    it('shows the total and subtotals the server worked out', async () => {
      await renderComponent(
        <DenominationCounter
          counts={{ '5000': 2, '500': 3 }}
          onChange={vi.fn()}
          count={answered(1_150_000, { 5000: [2, 1_000_000], 500: [3, 150_000] })}
        />
      );
      await act(async () => {
        await vi.waitFor(() => expect(text()).toContain('Rs. 11,500.00'));
      });
      expect(text()).toContain('Rs. 10,000.00');
    });

    it('waits for the server before listing anything', async () => {
      await renderComponent(
        <DenominationCounter
          counts={{}}
          onChange={vi.fn()}
          count={{ data: undefined, isCurrent: false, error: null }}
        />
      );
      expect(text()).toContain('Working out the figures...');
    });

    it('clears all counts when the clear button is clicked', async () => {
      const onChange = vi.fn();
      await renderComponent(
        <DenominationCounter
          counts={{ '5000': 2, '1000': 1 }}
          onChange={onChange}
          count={answered(1_100_000)}
        />
      );
      const clearBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
        b.getAttribute('aria-label')?.toLowerCase().includes('clear')
      );
      expect(clearBtn).toBeDefined();
      await act(async () => {
        clearBtn!.click();
      });
      expect(onChange).toHaveBeenCalledWith({});
    });
  });

  describe('PinVerificationModal', () => {
    it('enters PIN using keypad buttons and authorizes when valid', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      mockVerifyPinMutate.mockResolvedValueOnce({
        valid: true,
        userId: 'u_mgr',
        userName: 'Manager Bob',
        role: 'manager',
      });

      await renderComponent(
        <PinVerificationModal
          opened={true}
          onClose={onClose}
          onSuccess={onSuccess}
          title="Manager Approval"
          requiredRole="manager"
        />
      );

      expect(text()).toContain('Manager Approval');

      // Click keypad digits: 1, 2, 3, 4
      const btn1 = button('1');
      const btn2 = button('2');
      const btn3 = button('3');
      const btn4 = button('4');

      expect(btn1).toBeDefined();
      expect(btn2).toBeDefined();
      expect(btn3).toBeDefined();
      expect(btn4).toBeDefined();

      await act(async () => {
        btn1!.click();
        btn2!.click();
        btn3!.click();
        btn4!.click();
      });

      const authButton = button(/authorize/i);
      expect(authButton).toBeDefined();
      expect(authButton!.hasAttribute('disabled')).toBe(false);

      await act(async () => {
        authButton!.click();
      });

      expect(mockVerifyPinMutate).toHaveBeenCalledWith({
        pin: '1234',
        requiredRole: 'manager',
      });
      expect(onSuccess).toHaveBeenCalledWith({
        userId: 'u_mgr',
        userName: 'Manager Bob',
        role: 'manager',
        pin: '1234',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
