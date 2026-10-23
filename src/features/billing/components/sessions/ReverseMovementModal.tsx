import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useReverseCashMovement } from '../../hooks/useRegisterSession';
import type { CashMovement } from '../../types';
import { getTypeLabel } from './movement/movementTypes';

export interface ReverseMovementModalProps {
  /** The movement to reverse; the window is closed while this is `null`. */
  movement: CashMovement | null;
  onClose: () => void;
}

/**
 * Cancels a cash movement by recording its opposite. The original entry stays on the record, marked
 * as reversed, and the drawer goes back to where it was. A reason is always asked for here: this is
 * for a manager correcting an entry after the short undo window has passed.
 */
export const ReverseMovementModal: React.FC<ReverseMovementModalProps> = ({
  movement,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const reverse = useReverseCashMovement();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (movement === null) return;
    if (!reason.trim()) {
      setError(t('Please say why this entry is being reversed.'));
      return;
    }
    try {
      await reverse.mutateAsync({ key: movement.key, input: { reason: reason.trim() } });
      notifications.show({
        title: t('Entry reversed'),
        message: movement.movementNumber,
        color: 'teal',
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The entry could not be reversed. Please try again.')));
    }
  };

  return (
    <Modal
      opened={movement !== null}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {movement === null ? '' : `${t('Reverse Entry')} — ${movement.movementNumber}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      {movement !== null && (
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            <Stack gap={2}>
              <Text fw={600}>
                {getTypeLabel(movement.movementType)} · {formatMoney(movement.amountCents)}
              </Text>
              <Text size="sm" c="dimmed">
                {movement.customLabel
                  ? `${movement.categoryName}: ${movement.customLabel}`
                  : movement.categoryName}
                {movement.payeeName ? ` · ${movement.payeeName}` : ''}
              </Text>
            </Stack>

            <Text size="sm">
              {t(
                'This records the opposite entry and puts the drawer back where it was. The original stays on the record, marked as reversed.'
              )}
            </Text>

            <TextInput
              label={t('Why is this being reversed?')}
              value={reason}
              onChange={(e) => {
                setReason(e.currentTarget.value);
                setError(null);
              }}
              maxLength={200}
              required
              autoFocus={!isMobile}
            />

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

            <Group justify="flex-end" mt="md" gap="sm">
              <Button variant="default" onClick={handleClose} type="button">
                {t('Cancel')}
              </Button>
              <Button type="submit" color="red" loading={reverse.isPending}>
                {t('Reverse Entry')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
