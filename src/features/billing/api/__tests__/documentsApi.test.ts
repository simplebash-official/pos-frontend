import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import {
  getCreditNoteDocument,
  getCreditNoteDocumentDesign,
  getInvoiceDocument,
  getInvoiceDocumentDesign,
  getZReportDocument,
  getZReportDocumentDesign,
} from '../documentsApi';

afterEach(() => {
  vi.restoreAllMocks();
});

const spyOnGet = () => vi.spyOn(apiClient, 'get').mockResolvedValue(new Blob());

describe('getInvoiceDocument', () => {
  it('always says which PDF it wants and asks for the shop design with no template', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'a4-invoice', 'current');
    expect(get).toHaveBeenCalledWith('/billing/invoices/inv_1/documents/a4-invoice', {
      responseType: 'blob',
      params: { design: 'current', paperWidthMm: undefined, template: undefined },
    });
  });

  it('can ask for the original, exactly as first printed', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'a4-invoice', 'original');
    expect(get.mock.calls[0][1]).toMatchObject({ params: { design: 'original' } });
  });

  it('sends the chosen design for a single print', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'a4-invoice', 'current', undefined, 'doc_temp_x');
    expect(get.mock.calls[0][1]).toMatchObject({ params: { template: 'doc_temp_x' } });
  });

  it('only sends the paper width for a receipt', async () => {
    const get = spyOnGet();
    await getInvoiceDocument('inv_1', 'thermal-receipt', 'current', 58, 'doc_temp_r');
    expect(get.mock.calls[0][1]).toMatchObject({
      params: { paperWidthMm: 58, template: 'doc_temp_r' },
    });

    await getInvoiceDocument('inv_1', 'a4-invoice', 'current', 58);
    expect(get.mock.calls[1][1]).toMatchObject({ params: { paperWidthMm: undefined } });
  });
});

describe('getInvoiceDocumentDesign', () => {
  it('reads what the stored print was made with, per paper width for a receipt', async () => {
    const status = { stored: null, current: { templateRef: 'a', title: 'A', version: 1 } };
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ success: true, data: { ...status, differs: false } });
    const result = await getInvoiceDocumentDesign('inv_1', 'thermal-receipt', 58);
    expect(get).toHaveBeenCalledWith('/billing/invoices/inv_1/documents/thermal-receipt/design', {
      params: { paperWidthMm: 58 },
    });
    expect(result.differs).toBe(false);

    await getInvoiceDocumentDesign('inv_1', 'a4-invoice', 58);
    expect(get.mock.calls[1][1]).toEqual({ params: { paperWidthMm: undefined } });
  });
});

describe('getCreditNoteDocument', () => {
  it('sends the PDF choice and the chosen design, or none', async () => {
    const get = spyOnGet();
    await getCreditNoteDocument('cn_1', 'credit-note', 'current');
    await getCreditNoteDocument('cn_1', 'credit-note', 'original', 'doc_temp_c');
    expect(get.mock.calls[0][0]).toBe('/billing/credit-notes/cn_1/documents/credit-note');
    expect(get.mock.calls[0][1]).toMatchObject({
      params: { design: 'current', template: undefined },
    });
    expect(get.mock.calls[1][1]).toMatchObject({
      params: { design: 'original', template: 'doc_temp_c' },
    });
  });
});

describe('getCreditNoteDocumentDesign', () => {
  it('reads the design status of a credit note', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: { stored: null, current: { templateRef: 'a', title: 'A', version: 1 }, differs: true },
    });
    const result = await getCreditNoteDocumentDesign('cn_1');
    expect(get).toHaveBeenCalledWith('/billing/credit-notes/cn_1/documents/credit-note/design');
    expect(result.differs).toBe(true);
  });
});

describe('getZReportDocument', () => {
  it('requests the Z-report PDF with design and template', async () => {
    const get = spyOnGet();
    await getZReportDocument('ses_1', 'current');
    await getZReportDocument('ses_1', 'original', 'doc_temp_z');
    expect(get.mock.calls[0][0]).toBe('/sessions/ses_1/document');
    expect(get.mock.calls[0][1]).toMatchObject({
      params: { design: 'current', template: undefined },
    });
    expect(get.mock.calls[1][0]).toBe('/sessions/ses_1/document');
    expect(get.mock.calls[1][1]).toMatchObject({
      params: { design: 'original', template: 'doc_temp_z' },
    });
  });
});

describe('getZReportDocumentDesign', () => {
  it('reads the design status of a session Z-report', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: {
        stored: null,
        current: { templateRef: 'doc_temp_ZRep0rtV1Std000', title: 'Z-Report', version: 1 },
        differs: false,
      },
    });
    const result = await getZReportDocumentDesign('ses_1', 'doc_temp_z');
    expect(get).toHaveBeenCalledWith('/sessions/ses_1/document/design', {
      params: { template: 'doc_temp_z' },
    });
    expect(result.differs).toBe(false);
  });
});
