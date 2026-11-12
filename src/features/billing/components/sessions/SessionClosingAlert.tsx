import { Alert, type AlertProps } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { t } from '@/shared/i18n/t';
import { formatSessionClosingMessage } from '../../lib/sessionClosing';

export interface SessionClosingAlertProps {
  /** Cashier performing the active close count, when known. */
  closingCashierName?: string | null;
  /** Pre-translated pause message explaining what is blocked until close finishes or cancels. */
  message: string;
  icon?: ReactNode;
  mb?: AlertProps['mb'];
}

/** Consistent orange pause banner displayed across POS forms when a drawer count locks cash. */
export const SessionClosingAlert = ({
  closingCashierName,
  message,
  icon,
  mb,
}: SessionClosingAlertProps) => (
  <Alert
    icon={icon ?? <IconLock size={16} />}
    color="orange"
    variant="light"
    mb={mb}
    title={t('Cash Count In Progress')}
  >
    {formatSessionClosingMessage(closingCashierName, message)}
  </Alert>
);
