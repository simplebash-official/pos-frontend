import { PERMISSIONS, type Permission } from '@/constants/permissions';
import type { AttachmentOwner } from '../types';

/** The permission needed to add a photo to this kind of record (on top of `attachments:create`). */
export const recordPermission = (kind: AttachmentOwner): Permission => {
  switch (kind) {
    case 'cash_movement':
      return PERMISSIONS.CASH_MOVEMENTS_CREATE;
    case 'expense':
      return PERMISSIONS.EXPENSES_MANAGE;
    case 'income':
      return PERMISSIONS.INCOME_MANAGE;
  }
};
