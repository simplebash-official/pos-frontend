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
import { SRI_LANKA_DENOMINATIONS } from '../constants';

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
    it('renders all standard Sri Lanka denominations', async () => {
      const onChange = vi.fn();
      await renderComponent(<DenominationCounter value={{}} onChange={onChange} />);

      for (const denom of SRI_LANKA_DENOMINATIONS) {
        expect(text()).toContain(denom.label);
      }
    });

    it('calculates total cents correctly when denomination counts are supplied', async () => {
      const onChange = vi.fn();
      // 2 x Rs. 5000 (Rs. 10,000 = 1,000,000 cents) + 3 x Rs. 500 (Rs. 1,500 = 150,000 cents) = 1,150,000 cents
      const value = {
        '5000': 2,
        '500': 3,
      };
      await renderComponent(<DenominationCounter value={value} onChange={onChange} />);

      expect(text()).toContain('Rs. 11,500.00');
    });

    it('resets all counts when clear button is clicked', async () => {
      const onChange = vi.fn();
      await renderComponent(
        <DenominationCounter value={{ '5000': 2, '1000': 1 }} onChange={onChange} />
      );

      const clearBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
        b.getAttribute('aria-label')?.toLowerCase().includes('clear')
      );
      expect(clearBtn).toBeDefined();

      await act(async () => {
        clearBtn!.click();
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ '5000': 0, '1000': 0, '500': 0 }),
        0
      );
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
