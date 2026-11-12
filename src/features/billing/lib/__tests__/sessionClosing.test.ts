import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys } from '@/api/queryKeys';
import { creditNoteUsesCashDrawer } from '@/features/invoices/lib/invoiceStatus';
import {
  formatSessionClosingMessage,
  handleSessionClosingError,
  isSessionClosingError,
} from '../sessionClosing';

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

describe('sessionClosing helpers', () => {
  beforeEach(() => {
    vi.mocked(notifications.show).mockReset();
  });

  it('detects SESSION_CLOSING API errors cleanly', () => {
    expect(isSessionClosingError({ statusCode: 409, code: 'SESSION_CLOSING' })).toBe(true);
    expect(isSessionClosingError({ statusCode: 409, code: 'VERSION_CONFLICT' })).toBe(false);
    expect(isSessionClosingError(new Error('boom'))).toBe(false);
    expect(isSessionClosingError(null)).toBe(false);
    expect(isSessionClosingError('SESSION_CLOSING')).toBe(false);
  });

  it('formats closing messages with or without a cashier name', () => {
    expect(formatSessionClosingMessage('Kasun Perera', 'Sales are paused.')).toBe(
      'Kasun Perera is counting the drawer. Sales are paused.'
    );
    expect(formatSessionClosingMessage('   ', 'Sales are paused.')).toBe('Sales are paused.');
    expect(formatSessionClosingMessage(null, 'Sales are paused.')).toBe('Sales are paused.');
  });

  it('invalidates sessions and shows orange notification on SESSION_CLOSING', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    const msg = handleSessionClosingError(
      {
        statusCode: 409,
        code: 'SESSION_CLOSING',
        message: 'Cash count is in progress for this register session',
      },
      queryClient,
      { fallbackMessage: 'Fallback closing message' }
    );

    expect(msg).toBe('Cash count is in progress for this register session');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billing.sessions.all });
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Cash Count In Progress',
      message: 'Cash count is in progress for this register session',
      color: 'orange',
    });
  });

  it('uses fallback message on empty error text and respects notify: false', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    const msg = handleSessionClosingError(
      { statusCode: 409, code: 'SESSION_CLOSING' },
      queryClient,
      { fallbackMessage: 'Fallback closing message', notify: false }
    );

    expect(msg).toBe('Fallback closing message');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billing.sessions.all });
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it('returns null without invalidating or notifying for other errors', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    const msg = handleSessionClosingError(
      { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Bad amount' },
      queryClient,
      { fallbackMessage: 'Fallback closing message' }
    );

    expect(msg).toBeNull();
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(notifications.show).not.toHaveBeenCalled();
  });
});

describe('creditNoteUsesCashDrawer', () => {
  it('treats customer-owing exchanges as using the cash drawer', () => {
    expect(
      creditNoteUsesCashDrawer({
        netRefundCents: -500,
        refundCashCents: 0,
        isCustomerOwing: true,
        refundLegs: [],
        refundBreakdown: {},
        noReceipt: false,
        invoicePaymentMethod: 'card',
      })
    ).toBe(true);
  });

  it('ignores even exchanges', () => {
    expect(
      creditNoteUsesCashDrawer({
        netRefundCents: 0,
        refundCashCents: 0,
        isCustomerOwing: false,
        refundLegs: [],
        refundBreakdown: {},
        noReceipt: false,
        invoicePaymentMethod: 'cash',
      })
    ).toBe(false);
  });

  it('checks edited split breakdown legs accurately', () => {
    const base = {
      netRefundCents: 500,
      refundCashCents: 500,
      isCustomerOwing: false,
      refundLegs: [
        { method: 'cash', amountCents: 300 },
        { method: 'card', amountCents: 200 },
      ],
      noReceipt: false,
      invoicePaymentMethod: 'split',
    };
    expect(creditNoteUsesCashDrawer({ ...base, refundBreakdown: {} })).toBe(true);
    expect(creditNoteUsesCashDrawer({ ...base, refundBreakdown: { cash: 0, card: 500 } })).toBe(
      false
    );
  });

  it('handles single-leg and fallback payment methods accurately', () => {
    expect(
      creditNoteUsesCashDrawer({
        netRefundCents: 500,
        refundCashCents: 500,
        isCustomerOwing: false,
        refundLegs: [{ method: 'card', amountCents: 500 }],
        refundBreakdown: {},
        noReceipt: false,
        invoicePaymentMethod: 'card',
      })
    ).toBe(false);
    expect(
      creditNoteUsesCashDrawer({
        netRefundCents: 500,
        refundCashCents: 500,
        isCustomerOwing: false,
        refundLegs: [{ method: 'cash', amountCents: 500 }],
        refundBreakdown: {},
        noReceipt: false,
        invoicePaymentMethod: 'cash',
      })
    ).toBe(true);
    expect(
      creditNoteUsesCashDrawer({
        netRefundCents: 500,
        refundCashCents: 500,
        isCustomerOwing: false,
        refundLegs: [],
        refundBreakdown: {},
        noReceipt: false,
        invoicePaymentMethod: 'cash',
      })
    ).toBe(true);
    expect(
      creditNoteUsesCashDrawer({
        netRefundCents: 500,
        refundCashCents: 500,
        isCustomerOwing: false,
        refundLegs: [],
        refundBreakdown: {},
        noReceipt: true,
        invoicePaymentMethod: 'card',
      })
    ).toBe(true);
  });
});
