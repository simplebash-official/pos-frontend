import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { getCreditNoteDocument, getInvoiceDocument } from '../documentsApi';

afterEach(() => {
  vi.restoreAllMocks();
});

const spyOnGet = () => vi.spyOn(apiClient, 'get').mockResolvedValue(new Blob());

describe('getInvoiceDocument', () => {
  it('asks for the shop design by sending no template at all', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'a4-invoice');
    expect(get).toHaveBeenCalledWith('/billing/invoices/inv_1/documents/a4-invoice', {
      responseType: 'blob',
      params: { paperWidthMm: undefined, template: undefined },
    });
  });

  it('sends the chosen design for a single print', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'a4-invoice', undefined, 'doc_temp_x');
    expect(get.mock.calls[0][1]).toMatchObject({ params: { template: 'doc_temp_x' } });
  });

  it('only sends the paper width for a receipt', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'thermal-receipt', 58, 'doc_temp_r');
    expect(get.mock.calls[0][1]).toMatchObject({
      params: { paperWidthMm: 58, template: 'doc_temp_r' },
    });

    await getInvoiceDocument('inv_1', 'a4-invoice', 58);
    expect(get.mock.calls[1][1]).toMatchObject({ params: { paperWidthMm: undefined } });
  });
});

describe('getCreditNoteDocument', () => {
  it('sends the chosen design, or none', async () => {
    const get = spyOnGet();
    await getCreditNoteDocument('cn_1');
    await getCreditNoteDocument('cn_1', 'credit-note', 'doc_temp_c');
    expect(get.mock.calls[0][0]).toBe('/billing/credit-notes/cn_1/documents/credit-note');
    expect(get.mock.calls[0][1]).toMatchObject({ params: { template: undefined } });
    expect(get.mock.calls[1][1]).toMatchObject({ params: { template: 'doc_temp_c' } });
  });
});
