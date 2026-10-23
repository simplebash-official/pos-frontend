import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatDate } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import {
  toOpeningInput,
  validateOpening,
  type OpeningFormState,
} from '@/features/money-accounts/lib/openingForm';
import { useSetBalanceOpening } from '../hooks/useBalances';
import type { BalanceSubject } from '../types';

export interface BalanceOpeningModalProps {
  subject: BalanceSubject;
  subjectKey: string;
  name: string;
  /** What is set already, when changing it. */
  current?: { amountCents: number; asOfDate: string };
  onClose: () => void;
}

/**
 * Says what was owed on a day. For a supplier that is what the shop owed them; for staff it is
 * what they already owed on advances before the records began. From that day on the page keeps
 * the balance up to date.
 */
export const BalanceOpeningModal: React.FC<BalanceOpeningModalProps> = ({
  subject,
  subjectKey,
  name,
  current,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const setOpening = useSetBalanceOpening();
  const today = formatDate(new Date(), 'YYYY-MM-DD');
  const [form, setForm] = useState<OpeningFormState>({
    amountCents: current?.amountCents ?? 0,
    asOfDate: current?.asOfDate ?? today,
  });
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<OpeningFormState>) => {
    setForm((c) => ({ ...c, ...changes }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateOpening(form, today);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      await setOpening.mutateAsync({ subject, key: subjectKey, input: toOpeningInput(form) });
      notifications.show({ title: t('Opening balance saved'), message: name, color: 'green' });
      onClose();
    } catch (err) {
      setError(
        getErrorMessage(err, t('The opening balance could not be saved. Please try again.'))
      );
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Opening balance')} — ${name}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            {subject === 'supplier'
              ? t(
                  'Say how much the shop owed this supplier on a day. From that day on the balance is kept up to date from purchases and payments.'
                )
              : t(
                  'Say how much this person already owed on advances on a day. From that day on the balance is kept up to date from advances and recoveries.'
                )}
          </Text>
          <MoneyInput
            label={t('Amount owed on that day')}
            description={t('Leave it empty if nothing was owed.')}
            valueCents={form.amountCents}
            onChangeCents={(cents) => patch({ amountCents: cents })}
          />
          <TextInput
            type="date"
            label={t('Balance as of')}
            value={form.asOfDate}
            max={today}
            onChange={(e) => patch({ asOfDate: e.currentTarget.value })}
            required
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
            <Button type="submit" color="blue" loading={setOpening.isPending}>
              {t('Save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
