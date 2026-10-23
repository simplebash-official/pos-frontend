import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type { Attachment, AttachmentOwner, UploadAttachmentInput } from '../types';

export const listAttachments = async (
  ownerKind: AttachmentOwner,
  ownerKey: string
): Promise<Attachment[]> => {
  const response = await apiClient.get<ApiResponse<Attachment[]>>('/attachments', {
    params: { ownerKind, ownerKey },
  });
  return response.data;
};

/** The image itself; the route needs the sign-in token, so it cannot be an `<img src>` on its own. */
export const fetchAttachmentImage = (key: string): Promise<Blob> =>
  apiClient.get<Blob>(`/attachments/${encodeURIComponent(key)}/content`, { responseType: 'blob' });

export const uploadAttachment = async (input: UploadAttachmentInput): Promise<Attachment> => {
  const response = await apiClient.post<ApiResponse<Attachment>>('/attachments', input);
  return response.data;
};
