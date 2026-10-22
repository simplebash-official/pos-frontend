import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, Textarea, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useReopenSession } from '../../hooks/useRegisterSession';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import type { RegisterSession } from '../../types';

export interface ReopenSessionModalProps {
  opened: boolean;
  onClose: () => void;
  session: RegisterSession | null;
  onSuccess?: (reopenedSession: RegisterSession) => void;
}

export const ReopenSessionModal: React.FC<ReopenSessionModalProps> = ({
  opened,
  onClose,
  session,
  onSuccess,
}) => {
  const isMobile = useIsMobile();
  const reopenMutation = useReopenSession();
  const [reason, setReason] = useState('');

  if (!session) return null;

  const handleReopen = async () => {
    if (!reason.trim()) {
      notifications.show({
        title: t('Reason Required'),
        message: t('Please provide a reason for reopening this shift.'),
        color: 'red',
      });
      return;
    }

    try {
      const updated = await reopenMutation.mutateAsync({
        key: session.key,
        input: {
          reason: reason.trim(),
        },
      });

      notifications.show({
        title: t('Shift Reopened'),
        message: `${t('Register shift')} ${session.sessionNumber} ${t('was successfully reopened.')}`,
        color: 'teal',
      });

      setReason('');
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      notifications.show({
        title: t('Reopen Failed'),
        message: getErrorMessage(
          err,
          t('Could not reopen shift. Please verify manager permissions.')
        ),
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon color="orange" variant="light" size="md">
            <IconRefresh size={18} />
          </ThemeIcon>
          <Text fw={700}>
            {t('Reopen Shift')} — {session.sessionNumber}
          </Text>
        </Group>
      }
      fullScreen={isMobile}
      centered
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={18} />}
          color="orange"
          title={t('Manager Authorization Required')}
        >
          {t(
            'Reopening this shift allows additional sales, cash adjustments, or corrections to be logged under this session. All actions will be logged in the audit trail.'
          )}
        </Alert>

        <Textarea
          label={t('Reason for Reopening')}
          placeholder={t('e.g. Audit reconciliation recount, cashier correction')}
          required
          minRows={3}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={reopenMutation.isPending}>
            {t('Cancel')}
          </Button>
          <Button
            color="orange"
            leftSection={<IconRefresh size={16} />}
            onClick={handleReopen}
            loading={reopenMutation.isPending}
            disabled={!reason.trim()}
          >
            {t('Reopen Shift')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
