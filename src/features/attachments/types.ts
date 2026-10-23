export type AttachmentOwner = 'cash_movement' | 'expense' | 'income';

export interface Attachment {
  key: string;
  ownerKind: AttachmentOwner;
  ownerKey: string;
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  uploadedByNameSnapshot: string;
  createdAt: string;
}

export interface UploadAttachmentInput {
  ownerKind: AttachmentOwner;
  ownerKey: string;
  fileName: string;
  contentType: 'image/jpeg';
  /** The image bytes, base64 encoded. */
  dataBase64: string;
}
