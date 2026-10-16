import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LabelTemplateInput } from '../types';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();
const mockPostWithHeaders = vi.fn();
vi.mock('@/api/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    postWithHeaders: (...args: unknown[]) => mockPostWithHeaders(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

import {
  createLabelJob,
  createLabelTemplate,
  deleteLabelTemplate,
  fetchLabelCoverage,
  fetchLabelJobs,
  fetchLabelTemplates,
  reportLabelJob,
  previewLabel,
  renderLabels,
  updateLabelTemplate,
} from '../api/labelsApi';

const input: LabelTemplateInput = { name: 'Shelf', widthMm: 50, heightMm: 30, elements: [] };

describe('labelsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists designs from the unwrapped response', async () => {
    mockGet.mockResolvedValue({ success: true, data: { templates: [{ key: 'starter_a' }] } });
    expect(await fetchLabelTemplates()).toEqual([{ key: 'starter_a' }]);
    expect(mockGet).toHaveBeenCalledWith('/labels/templates');
  });

  it('creates, updates and deletes designs', async () => {
    mockPost.mockResolvedValue({ data: { key: 'ltpl_1' } });
    mockPut.mockResolvedValue({ data: { key: 'ltpl_1' } });
    mockDelete.mockResolvedValue({});
    expect(await createLabelTemplate(input)).toEqual({ key: 'ltpl_1' });
    expect(mockPost).toHaveBeenCalledWith('/labels/templates', input);
    expect(await updateLabelTemplate('ltpl_1', input)).toEqual({ key: 'ltpl_1' });
    expect(mockPut).toHaveBeenCalledWith('/labels/templates/ltpl_1', input);
    await deleteLabelTemplate('ltpl_1');
    expect(mockDelete).toHaveBeenCalledWith('/labels/templates/ltpl_1');
  });

  it('asks for the PDF as a blob', async () => {
    const pdf = new Blob(['%PDF']);
    mockPost.mockResolvedValue(pdf);
    const request = {
      templateKey: 'starter_a',
      items: [{ kind: 'product' as const, productKey: 'prod_1', copies: 2, priceCents: null }],
    };
    expect(await renderLabels(request)).toBe(pdf);
    expect(mockPost).toHaveBeenCalledWith('/labels/render', request, { responseType: 'blob' });

    const sample = { name: 'n', sku: 's', category: 'c', priceCents: 1, code: '2000000000015' };
    expect(await previewLabel(input, sample)).toBe(pdf);
    expect(mockPost).toHaveBeenLastCalledWith(
      '/labels/preview',
      { template: input, sample },
      { responseType: 'blob' }
    );
  });

  it('records a print and hands back the PDF with the job key', async () => {
    const pdf = new Blob(['%PDF']);
    mockPostWithHeaders.mockResolvedValue({ data: pdf, headers: { 'x-label-job-key': 'lpj_1' } });
    const request = {
      templateKey: 'k',
      items: [],
      action: 'download' as const,
      method: null,
      printerName: null,
      dpi: null,
    };
    expect(await createLabelJob(request)).toEqual({ jobKey: 'lpj_1', pdf });
    expect(mockPostWithHeaders).toHaveBeenCalledWith('/labels/jobs', request, {
      responseType: 'blob',
    });
  });

  it('refuses to print when the server did not say it recorded the job', async () => {
    mockPostWithHeaders.mockResolvedValue({ data: new Blob(['%PDF']), headers: {} });
    await expect(
      createLabelJob({
        templateKey: 'k',
        items: [],
        action: 'download',
        method: null,
        printerName: null,
        dpi: null,
      })
    ).rejects.toThrow('The print was not recorded');
  });

  it('reports what the printer did, and reads the history and label states', async () => {
    mockPatch.mockResolvedValue({});
    await reportLabelJob('lpj_1', 'failed', 'Jammed');
    expect(mockPatch).toHaveBeenCalledWith('/labels/jobs/lpj_1', {
      outcome: 'failed',
      error: 'Jammed',
    });

    mockGet.mockResolvedValue({ data: { items: [], pagination: {} } });
    await fetchLabelJobs({ page: 2, limit: 20, action: 'print' });
    expect(mockGet).toHaveBeenLastCalledWith('/labels/jobs', {
      params: { page: 2, limit: 20, action: 'print' },
    });
    await fetchLabelCoverage({ page: 1, limit: 2, productKeys: ['a', 'b'] });
    expect(mockGet).toHaveBeenLastCalledWith('/labels/coverage', {
      params: { page: 1, limit: 2, productKeys: 'a,b' },
    });
    await fetchLabelCoverage({ page: 1, limit: 20, status: 'never', search: 'cab' });
    expect(mockGet).toHaveBeenLastCalledWith('/labels/coverage', {
      params: { page: 1, limit: 20, status: 'never', search: 'cab' },
    });
  });
});
