import React, { useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { t } from '@/shared/i18n/t';
import { recordPermission } from '../lib/ownerAccess';
import type { AttachmentOwner } from '../types';
import { ReceiptPhotosModal } from './ReceiptPhotosModal';

export interface ReceiptsActionProps {
  ownerKind: AttachmentOwner;
  ownerKey: string;
  /** The voucher, expense or income number the photos belong to. */
  number: string;
}

/** A row button that opens the receipt photos of one record; hidden for people who may not see photos. */
export const ReceiptsAction: React.FC<ReceiptsActionProps> = ({ ownerKind, ownerKey, number }) => {
  const isMobile = useIsMobile();
  const canView = useHasPermission(PERMISSIONS.ATTACHMENTS_VIEW);
  const canAttach = useHasPermission(PERMISSIONS.ATTACHMENTS_CREATE);
  const canRecord = useHasPermission(recordPermission(ownerKind));
  const [open, setOpen] = useState(false);
  if (!canView) return null;
  return (
    <>
      <ActionIcon
        variant="subtle"
        color="gray"
        size={isMobile ? 44 : 32}
        aria-label={`${t('Receipts')} ${number}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        data-log-id="attachments.open"
      >
        <IconReceipt size={16} />
      </ActionIcon>
      {open && (
        <ReceiptPhotosModal
          ownerKind={ownerKind}
          ownerKey={ownerKey}
          title={number}
          canAdd={canAttach && canRecord}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
