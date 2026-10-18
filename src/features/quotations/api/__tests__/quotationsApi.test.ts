import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import {
  cancelQuotationRaw,
  createQuotationRaw,
  fetchQuotations,
  getQuotationDocument,
  getQuotationDocumentDesign,
} from '../quotationsApi';
import type { CreateQuotationInput, Quotation, QuotationListResult } from '../../types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchQuotations', () => {
  it('sends paging, search and status to the backend and unwraps the page', async () => {
    const page = { quotations: [], total: 0, page: 2, limit: 10, totalPages: 0 };
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ success: true, data: page } as unknown as QuotationListResult);

    const result = await fetchQuotations({ page: 2, limit: 10, search: 'nimal', status: 'active' });

    expect(get).toHaveBeenCalledWith('/quotations', {
      params: { page: 2, limit: 10, search: 'nimal', status: 'active' },
    });
    expect(result).toEqual(page);
  });

  it('leaves search and status out when they are not set', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ success: true, data: {} } as unknown as QuotationListResult);
    await fetchQuotations({ page: 1, limit: 20 });
    expect(get.mock.calls[0][1]).toEqual({
      params: { page: 1, limit: 20, search: undefined, status: undefined },
    });
  });
});

describe('createQuotationRaw', () => {
  it('posts the input as is and returns the saved quotation', async () => {
    const saved = { key: 'quo_1', quotationNumber: 'QUO-0001' } as Quotation;
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ success: true, data: saved } as unknown as Quotation);
    const input: CreateQuotationInput = {
      customer: { customerName: 'Rita' },
      items: [{ name: 'Labour', unitPriceCents: 1500, quantity: 1, discountCents: 0 }],
      validUntil: '2026-12-31',
    };

    expect(await createQuotationRaw(input)).toBe(saved);
    expect(post).toHaveBeenCalledWith('/quotations', input);
  });
});

describe('cancelQuotationRaw', () => {
  it('posts to the cancel route of that quotation', async () => {
    const saved = { key: 'quo_1', status: 'cancelled' } as Quotation;
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ success: true, data: saved } as unknown as Quotation);
    expect(await cancelQuotationRaw('quo_1')).toBe(saved);
    expect(post).toHaveBeenCalledWith('/quotations/quo_1/cancel');
  });
});

describe('getQuotationDocument', () => {
  it('always says which PDF it wants and asks for the shop design with no template', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue(new Blob());
    await getQuotationDocument('quo_1', 'current');
    expect(get).toHaveBeenCalledWith('/quotations/quo_1/document', {
      responseType: 'blob',
      params: { design: 'current', template: undefined },
    });
  });

  it('can ask for the original and sends the chosen design for a single print', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue(new Blob());
    await getQuotationDocument('quo_1', 'original');
    await getQuotationDocument('quo_1', 'current', 'doc_temp_x');
    expect(get.mock.calls[0][1]).toMatchObject({ params: { design: 'original' } });
    expect(get.mock.calls[1][1]).toMatchObject({ params: { template: 'doc_temp_x' } });
  });
});

describe('getQuotationDocumentDesign', () => {
  it('reads the design status of a quotation', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: { stored: null, current: { templateRef: 'a', title: 'A', version: 1 }, differs: false },
    });
    const result = await getQuotationDocumentDesign('quo_1');
    expect(get).toHaveBeenCalledWith('/quotations/quo_1/document/design');
    expect(result.differs).toBe(false);
  });
});
