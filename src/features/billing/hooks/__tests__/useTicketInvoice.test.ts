/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { fetchInvoices } from '../../api/invoicesApi';
import type { Invoice } from '../../types';
import { pickBillingInvoice } from '../useTicketInvoice';

afterEach(() => {
  vi.restoreAllMocks();
});

const invoice = (id: string, status: Invoice['status'], createdAt: string) =>
  ({ id, status, createdAt }) as Invoice;

describe('pickBillingInvoice', () => {
  it('is null while nothing billed the ticket', () => {
    expect(pickBillingInvoice([])).toBeNull();
  });

  it('is null when every invoice was voided, since none bills the job any more', () => {
    expect(pickBillingInvoice([invoice('a', 'voided', '2026-11-20T10:00:00Z')])).toBeNull();
  });

  it('takes the newest invoice that is not voided', () => {
    const picked = pickBillingInvoice([
      invoice('old', 'paid', '2026-11-20T10:00:00Z'),
      invoice('void', 'voided', '2026-11-22T10:00:00Z'),
      invoice('new', 'paid', '2026-11-21T10:00:00Z'),
    ]);
    expect(picked?.id).toBe('new');
  });
});

describe('fetchInvoices by ticket', () => {
  it('sends the ticket key to the server', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { invoices: [], total: 0, page: 1, limit: 200, totalPages: 0 },
    });
    await fetchInvoices({ ticketKey: 'rep_1' });
    expect(get.mock.calls[0][1]).toMatchObject({ params: { ticketKey: 'rep_1' } });
  });
});
