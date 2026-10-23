import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchAttachmentImage, listAttachments, uploadAttachment } from '../api/attachmentsApi';
import type { AttachmentOwner, UploadAttachmentInput } from '../types';

export const useAttachments = (ownerKind: AttachmentOwner, ownerKey: string) =>
  useQuery({
    queryKey: queryKeys.attachments.list(ownerKind, ownerKey),
    queryFn: () => listAttachments(ownerKind, ownerKey),
  });

/** A browser address for one photo. A photo never changes, so it is kept for the whole session. */
export const useAttachmentImage = (key: string) =>
  useQuery({
    queryKey: queryKeys.attachments.image(key),
    queryFn: async () => URL.createObjectURL(await fetchAttachmentImage(key)),
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadAttachmentInput) => uploadAttachment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all });
    },
  });
};
