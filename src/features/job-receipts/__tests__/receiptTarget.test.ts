import { describe, expect, it } from 'vitest';
import { receiptTarget } from '../lib/receiptTarget';

describe('receiptTarget', () => {
  it('keeps only what the receipt needs', () => {
    expect(
      receiptTarget('print', {
        id: 'prn_1',
        ticketNumber: 'PRN-000045',
        customerName: 'Kasun Silva',
        // @ts-expect-error extra fields on a job are ignored
        status: 'received',
      })
    ).toEqual({
      kind: 'print',
      id: 'prn_1',
      ticketNumber: 'PRN-000045',
      customerName: 'Kasun Silva',
    });
  });
});
