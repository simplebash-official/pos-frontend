import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  CreateLabelJobRequest,
  LabelCoverage,
  LabelCoverageParams,
  LabelJobList,
  LabelJobListParams,
  LabelJobOutcome,
  LabelSample,
  LabelTemplate,
  LabelTemplateInput,
  RenderLabelsRequest,
} from '../types';

export const fetchLabelTemplates = async (): Promise<LabelTemplate[]> => {
  const response =
    await apiClient.get<ApiResponse<{ templates: LabelTemplate[] }>>('/labels/templates');
  return response.data.templates;
};

export const createLabelTemplate = async (input: LabelTemplateInput): Promise<LabelTemplate> => {
  const response = await apiClient.post<ApiResponse<LabelTemplate>>('/labels/templates', input);
  return response.data;
};

export const updateLabelTemplate = async (
  key: string,
  input: LabelTemplateInput
): Promise<LabelTemplate> => {
  const response = await apiClient.put<ApiResponse<LabelTemplate>>(
    `/labels/templates/${key}`,
    input
  );
  return response.data;
};

export const deleteLabelTemplate = async (key: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/labels/templates/${key}`);
};

/** The preview PDF of the chosen items (not recorded): one page per sticker. */
export const renderLabels = (request: RenderLabelsRequest): Promise<Blob> =>
  apiClient.post<Blob>('/labels/render', request, { responseType: 'blob' });

/** One sticker of an unsaved design, drawn with example values. */
export const previewLabel = (template: LabelTemplateInput, sample: LabelSample): Promise<Blob> =>
  apiClient.post<Blob>('/labels/preview', { template, sample }, { responseType: 'blob' });

/**
 * Prints or downloads the chosen items and records it in the print history.
 * The PDF comes back as the body, the recorded job's key in a header.
 */
export const createLabelJob = async (
  request: CreateLabelJobRequest
): Promise<{ jobKey: string; pdf: Blob }> => {
  const { data, headers } = await apiClient.postWithHeaders<Blob>('/labels/jobs', request, {
    responseType: 'blob',
  });
  const jobKey = headers['x-label-job-key'];
  if (jobKey === undefined) throw new Error('The print was not recorded. Please try again.');
  return { jobKey, pdf: data };
};

/** What the printer step did with a recorded print. `error` only with `failed`. */
export const reportLabelJob = async (
  key: string,
  outcome: Exclude<LabelJobOutcome, 'rendered'>,
  error: string | null
): Promise<void> => {
  await apiClient.patch<ApiResponse<unknown>>(`/labels/jobs/${key}`, { outcome, error });
};

/** A page of the print history, newest first. */
export const fetchLabelJobs = async (params: LabelJobListParams): Promise<LabelJobList> => {
  const response = await apiClient.get<ApiResponse<LabelJobList>>('/labels/jobs', {
    params: { ...params },
  });
  return response.data;
};

/** Products with their label state (or only the given products). */
export const fetchLabelCoverage = async (params: LabelCoverageParams): Promise<LabelCoverage> => {
  const { productKeys, ...rest } = params;
  const response = await apiClient.get<ApiResponse<LabelCoverage>>('/labels/coverage', {
    params:
      productKeys === undefined ? { ...rest } : { ...rest, productKeys: productKeys.join(',') },
  });
  return response.data;
};
