import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { LabelSample, LabelTemplate, LabelTemplateInput, RenderLabelsRequest } from '../types';

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

/** The PDF of the chosen items: one page per sticker, each page the label's size. */
export const renderLabels = (request: RenderLabelsRequest): Promise<Blob> =>
  apiClient.post<Blob>('/labels/render', request, { responseType: 'blob' });

/** One sticker of an unsaved design, drawn with example values. */
export const previewLabel = (template: LabelTemplateInput, sample: LabelSample): Promise<Blob> =>
  apiClient.post<Blob>('/labels/preview', { template, sample }, { responseType: 'blob' });
