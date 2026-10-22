import React, { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconScale } from '@tabler/icons-react';
import { useConvertVariance } from '../../hooks/useRegisterSession';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import type { RegisterSession } from '../../types';

export interface ConvertVarianceModalProps {
  opened: boolean;
  onClose: () => void;
  session: RegisterSession | null;
  onSuccess?: () => void;
}

export const ConvertVarianceModal: React.FC<ConvertVarianceModalProps> = ({
  opened,
  onClose,
  session,
  onSuccess,
}) => {
  const isMobile = useIsMobile();
  const convertMutation = useConvertVariance();
  const variance = session?.cashVarianceCents ?? 0;
  const isShortage = variance < 0;

  const [recipient, setRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [managerPin, setManagerPin] = useState('');

  if (!session) return null;

  const handleConvert = async () => {
    if (!recipient.trim()) {
      notifications.show({
        title: t('Recipient Required'),
        message: t('Please specify recipient or owner name.'),
        color: 'red',
      });
      return;
    }

    if (!reason.trim()) {
      notifications.show({
        title: t('Reason Required'),
        message: t('Please provide an accounting reason.'),
        color: 'red',
      });
      return;
    }

    if (!managerPin.trim()) {
      notifications.show({
        title: t('Manager PIN Required'),
        message: t('Manager PIN is required to authorize variance conversion.'),
        color: 'red',
      });
      return;
    }

    try {
      await convertMutation.mutateAsync({
        key: session.key,
        input: {
          recipient: recipient.trim(),
          reason: reason.trim(),
          managerPin: managerPin.trim(),
        },
      });

      notifications.show({
        title: t('Variance Converted'),
        message: t('Shift cash discrepancy converted successfully.'),
        color: 'teal',
      });

      setRecipient('');
      setReason('');
      setManagerPin('');
      onSuccess?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: t('Conversion Failed'),
        message: getErrorMessage(err, t('Could not convert variance.')),
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
          <ThemeIcon color="blue" variant="light" size="md">
            <IconScale size={18} />
          </ThemeIcon>
          <Text fw={700}>
            {t('Convert Cash Discrepancy')} — {session.sessionNumber}
          </Text>
        </Group>
      }
      fullScreen={isMobile}
      centered
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconAlertCircle size={18} />}
          color={isShortage ? 'red' : 'blue'}
          title={isShortage ? t('Cash Shortage') : t('Cash Overage')}
        >
          {isShortage
            ? `${t('This shift has an unresolved cash shortage of')} ${formatMoney(Math.abs(variance))}.`
            : `${t('This shift has an unresolved cash surplus of')} ${formatMoney(Math.abs(variance))}.`}
        </Alert>

        <TextInput
          label={t('Recipient / Owner Name')}
          placeholder={t('e.g. Mr. Silva (Owner drawings)')}
          value={recipient}
          onChange={(e) => setRecipient(e.currentTarget.value)}
          required
        />

        <Textarea
          label={t('Accounting Note')}
          placeholder={t('Explain the discrepancy resolution reason')}
          minRows={3}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          required
        />

        <PasswordInput
          label={t('Manager PIN')}
          placeholder={t('Enter PIN to authorize')}
          value={managerPin}
          onChange={(e) => setManagerPin(e.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={convertMutation.isPending}>
            {t('Cancel')}
          </Button>
          <Button
            color="blue"
            leftSection={<IconCheck size={16} />}
            onClick={handleConvert}
            loading={convertMutation.isPending}
            disabled={!recipient.trim() || !reason.trim() || !managerPin.trim()}
          >
            {t('Apply Conversion')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
