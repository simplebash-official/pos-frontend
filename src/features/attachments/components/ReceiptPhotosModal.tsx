import React, { useRef, useState } from 'react';
import { Alert, Button, Group, Modal, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconCamera } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useAttachmentImage, useAttachments, useUploadAttachment } from '../hooks/useAttachments';
import { blobToBase64, shrinkImage } from '../lib/shrinkImage';
import type { Attachment, AttachmentOwner } from '../types';

const MAX_PHOTOS = 5;

const Photo: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
  const { data: url, isLoading } = useAttachmentImage(attachment.key);
  if (isLoading || url === undefined) return <Skeleton h={160} />;
  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label={attachment.fileName}>
      <img
        src={url}
        alt={attachment.fileName}
        style={{
          width: '100%',
          height: 160,
          objectFit: 'cover',
          borderRadius: 4,
          display: 'block',
        }}
      />
    </a>
  );
};

export interface ReceiptPhotosModalProps {
  ownerKind: AttachmentOwner;
  ownerKey: string;
  /** What the photos are for, shown in the title (a voucher or expense number). */
  title: string;
  /** Whether this person may add a photo to this kind of record. */
  canAdd: boolean;
  onClose: () => void;
}

/** The receipt photos of one record, with a button to take or pick another. */
export const ReceiptPhotosModal: React.FC<ReceiptPhotosModalProps> = ({
  ownerKind,
  ownerKey,
  title,
  canAdd,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const { data: photos, isLoading } = useAttachments(ownerKind, ownerKey);
  const upload = useUploadAttachment();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file === undefined) return;
    setError(null);
    const shrunk = await shrinkImage(file);
    if (shrunk === null) {
      setError(t('That photo could not be used. Please try another one.'));
      return;
    }
    try {
      await upload.mutateAsync({
        ownerKind,
        ownerKey,
        fileName: file.name,
        contentType: 'image/jpeg',
        dataBase64: await blobToBase64(shrunk),
      });
    } catch (err) {
      setError(getErrorMessage(err, t('The photo could not be saved. Please try again.')));
    }
  };

  const full = photos !== undefined && photos.length >= MAX_PHOTOS;

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Receipts')} — ${title}`}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        {isLoading || photos === undefined ? (
          <Skeleton h={160} />
        ) : photos.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('No receipt photos yet.')}
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
            {photos.map((p) => (
              <Photo key={p.key} attachment={p} />
            ))}
          </SimpleGrid>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={t('Please check')}
          >
            {error}
          </Alert>
        )}

        {canAdd && (
          <Group justify="space-between" wrap="wrap" gap="xs">
            <Text size="xs" c="dimmed">
              {full ? t('This record holds the most photos it can.') : t('Up to 5 photos.')}
            </Text>
            <Button
              leftSection={<IconCamera size={16} />}
              h={isMobile ? 44 : undefined}
              disabled={full}
              loading={upload.isPending}
              onClick={() => input.current?.click()}
              data-log-id="attachments.add-photo"
            >
              {t('Add photo')}
            </Button>
            <input
              ref={input}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              aria-label={t('Add photo')}
              onChange={handleFile}
            />
          </Group>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('Close')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
