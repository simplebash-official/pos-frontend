import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { DocumentTemplatesSettings, UpdateDocumentTemplatesRequest } from '../types';

/**
 * The shop's document designs: for each kind of document the designs available and the one in use.
 * Any signed-in user may read it (the print preview needs it too).
 */
export async function getDocumentTemplatesApi(): Promise<DocumentTemplatesSettings> {
  const response = await apiClient.get<ApiResponse<DocumentTemplatesSettings>>(
    '/settings/document-templates'
  );
  return response.data;
}

/**
 * Changes the shop's designs and their settings (admin only). Only what is present changes; a
 * `null` selection returns a kind to the standard design.
 */
export async function updateDocumentTemplatesApi(
  request: UpdateDocumentTemplatesRequest
): Promise<DocumentTemplatesSettings> {
  const response = await apiClient.put<ApiResponse<DocumentTemplatesSettings>>(
    '/settings/document-templates',
    request
  );
  return response.data;
}

/** A PDF of one design (by its family id) rendered with its own sample data (never a real invoice). */
export const getDocumentTemplatePreviewApi = (family: string): Promise<Blob> =>
  apiClient.get<Blob>(`/settings/document-templates/${encodeURIComponent(family)}/preview`, {
    responseType: 'blob',
  });
