import { useState } from 'react';
import { useUploadAttachment } from '@/features/attachments/hooks/useAttachments';
import { blobToBase64, shrinkImage } from '@/features/attachments/lib/shrinkImage';

/** Attaches the photos taken at the counter to a claim that was just opened. */
export const useUploadClaimPhotos = () => {
  const uploadAttachment = useUploadAttachment();
  const [uploading, setUploading] = useState(false);

  const upload = async (claimKey: string, photos: File[]): Promise<void> => {
    if (photos.length === 0) return;
    setUploading(true);
    try {
      for (const file of photos) {
        const shrunk = await shrinkImage(file);
        if (shrunk) {
          await uploadAttachment.mutateAsync({
            ownerKind: 'warranty_claim',
            ownerKey: claimKey,
            fileName: file.name,
            contentType: 'image/jpeg',
            dataBase64: await blobToBase64(shrunk),
          });
        }
      }
    } catch {
      // Non-fatal if photo attachment fails
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
};
