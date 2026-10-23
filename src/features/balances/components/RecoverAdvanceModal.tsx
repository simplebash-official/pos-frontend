import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useRecoverAdvance } from '../hooks/useBalances';
import { toRecoveryInput, validateRecovery, type RecoveryFormState } from '../lib/recoveryForm';
import type { StaffAdvance } from '../types';

export interface RecoverAdvanceModalProps {
  advance: StaffAdvance;
  onClose: () => void;
}

/** Records part of an advance taken back from a staff member's pay. */
export const RecoverAdvanceModal: React.FC<RecoverAdvanceModalProps> = ({ advance, onClose }) => {
  const isMobile = useIsMobile();
  const recover = useRecoverAdvance();
  const [form, setForm] = useState<RecoveryFormState>({
    amountCents: 0,
    recoveredOn: formatDate(new Date(), 'YYYY-MM-DD'),
    note: '',
  });
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<RecoveryFormState>) => {
    setForm((c) => ({ ...c, ...changes }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateRecovery(form, advance.outstandingCents);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      await recover.mutateAsync({ employeeKey: advance.employeeKey, input: toRecoveryInput(form) });
      notifications.show({ title: t('Recovery saved'), message: advance.name, color: 'green' });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The recovery could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Recover from pay')} — ${advance.name}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <Text size="sm">
            {t('Still owes')} <b>{formatMoney(advance.outstandingCents)}</b>
          </Text>
          <MoneyInput
            label={t('Amount taken from pay')}
            valueCents={form.amountCents}
            onChangeCents={(cents) => patch({ amountCents: cents })}
            required
          />
          <TextInput
            type="date"
            label={t('Date')}
            value={form.recoveredOn}
            onChange={(e) => patch({ recoveredOn: e.currentTarget.value })}
            required
          />
          <TextInput
            label={t('Note (optional)')}
            value={form.note}
            onChange={(e) => patch({ note: e.currentTarget.value })}
            maxLength={200}
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
            <Button variant="default" onClick={onClose} type="button">
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={recover.isPending}>
              {t('Save Recovery')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
