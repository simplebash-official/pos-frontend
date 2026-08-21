import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/schema';
import { toServerRow } from '../db/mirror';
import { invoicesResource } from '../resources/invoices.resource';
import { pullResource } from '../engine/pull';
import { seedSyncMeta } from '../db/syncMeta';
import * as syncApi from '../resources/syncApi';
import type { BackendInvoice } from '@/features/billing/api/invoicesApi';

describe('invoices resource sync delta mapping', () => {
  beforeEach(async () => {
    await db.invoices.clear();
    await db.syncMeta.clear();
    await seedSyncMeta(['invoices']);
    vi.restoreAllMocks();
  });

  it('maps delta items so that primary keys match domain keys rather than Mongo ObjectId', async () => {
    // 1. Simulates an invoice already stored locally with domain key (e.g. from checkout commitSuccess)
    const existingInvoice = {
      id: 'inv_000049',
      invoiceNumber: 'INV-000049',
      customerId: 'cust_1',
      customerName: 'Walk-in Customer',
      subtotalCents: 500,
      discountCents: 0,
      totalCents: 500,
      paymentMethod: 'cash',
      status: 'paid' as const,
      createdAt: '2026-08-21T10:00:00.000Z',
      items: [],
    };
    await db.invoices.put(toServerRow(existingInvoice));

    // 2. Server delta returns raw BackendInvoice where id is Mongo ObjectId and key is inv_000049
    const rawBackendInvoice: BackendInvoice = {
      id: '66c5fa1b84e1837b2d90a412', // Mongo ObjectId
      key: 'inv_000049', // Domain key
      invoiceNumber: 'INV-000049',
      customerKey: 'cust_1',
      customerNameSnapshot: 'Walk-in Customer',
      customerPhoneSnapshot: undefined,
      customerAddressSnapshot: undefined,
      cashierId: 'user_1',
      cashierNameSnapshot: 'Cashier John',
      items: [],
      subtotalCents: 500,
      discountCents: 0,
      discountType: 'fixed',
      discountValue: 0,
      totalCents: 500,
      paymentMethod: 'cash',
      isCredit: false,
      status: 'paid',
      createdAt: '2026-08-21T10:00:00.000Z',
    };

    vi.spyOn(syncApi, 'fetchResourceDelta').mockResolvedValue({
      items: [rawBackendInvoice as never],
      deletedKeys: [],
      nextCursor: 'cursor-2',
      hasMore: false,
    });

    await db.syncMeta.update('invoices', { cursor: 'cursor-1' });

    // 3. Pull delta
    const summary = await pullResource(invoicesResource, new AbortController().signal);

    expect(summary.applied).toBe(1);

    // 4. Verify only ONE row exists in db.invoices and its id is 'inv_000049', NOT '66c5fa1b84e1837b2d90a412'
    const allRows = await db.invoices.toArray();
    expect(allRows).toHaveLength(1);
    expect(allRows[0].id).toBe('inv_000049');
    expect(allRows[0].customerName).toBe('Walk-in Customer');
    expect(await db.invoices.get('66c5fa1b84e1837b2d90a412')).toBeUndefined();
  });
});
