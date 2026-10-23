import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatDate } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import { useSetAccountOpening } from '../hooks/useAccounts';
import { accountLabel } from '../lib/accountView';
import { toOpeningInput, validateOpening, type OpeningFormState } from '../lib/openingForm';
import type { AccountSummary } from '../types';

export interface OpeningBalanceModalProps {
  /** The bank, card or online account to set up or change. */
  account: AccountSummary & { kind: Exclude<AccountSummary['kind'], 'drawer'> };
  onClose: () => void;
}

/**
 * Says what an account held on a day. From that day on the page keeps the balance up to date from
 * sales, income, expenses and cash taken to or from the bank.
 */
export const OpeningBalanceModal: React.FC<OpeningBalanceModalProps> = ({ account, onClose }) => {
  const isMobile = useIsMobile();
  const setOpening = useSetAccountOpening();
  const today = formatDate(new Date(), 'YYYY-MM-DD');
  const [form, setForm] = useState<OpeningFormState>({
    amountCents: account.openingBalanceCents ?? 0,
    asOfDate: account.asOfDate ?? today,
  });
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<OpeningFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
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
      await setOpening.mutateAsync({ kind: account.kind, input: toOpeningInput(form) });
      notifications.show({
        title: t('Opening balance saved'),
        message: accountLabel(account.kind),
        color: 'green',
      });
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
          {`${t('Opening balance')} — ${accountLabel(account.kind)}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            {t(
              'Say what this account held on a day. From that day on the balance is kept up to date from sales, income, expenses and cash moved to or from the bank.'
            )}
          </Text>
          <MoneyInput
            label={t('Balance on that day')}
            description={t('Leave it empty if the account started at zero.')}
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
