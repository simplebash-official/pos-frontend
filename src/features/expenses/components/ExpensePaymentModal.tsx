import React, { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useAddExpensePayment, useExpenseDetail } from '../hooks/useExpenses';
import {
  emptyPaymentForm,
  toPaymentInput,
  validatePayment,
  type PaymentAccount,
  type PaymentFormState,
} from '../lib/expenseForm';
import { paidFromLabel } from '../lib/expenseView';
import type { ExpenseRow } from '../types';

const ACCOUNTS: PaymentAccount[] = ['bank', 'card', 'online'];

export interface ExpensePaymentModalProps {
  /** The bill being paid; the window is closed while this is `null`. */
  expense: ExpenseRow | null;
  onClose: () => void;
}

/** Pays a bill, or part of it, from the bank, a card or online, and shows what was paid before. */
export const ExpensePaymentModal: React.FC<ExpensePaymentModalProps> = ({ expense, onClose }) => {
  const isMobile = useIsMobile();
  const addPayment = useAddExpensePayment();
  const { data: detail } = useExpenseDetail(expense === null ? null : expense.key);
  const [form, setForm] = useState<PaymentFormState>(() =>
    emptyPaymentForm(formatDate(new Date(), 'YYYY-MM-DD'))
  );
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<PaymentFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setError(null);
  };

  const handleClose = () => {
    setForm(emptyPaymentForm(formatDate(new Date(), 'YYYY-MM-DD')));
    setError(null);
    onClose();
  };

  // What is still owed comes from the freshly loaded bill, so a payment made a moment ago counts.
  const current = detail === undefined ? expense : detail.expense;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (expense === null || current === null) return;
    const problem = validatePayment(form, current.balanceCents);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      const saved = await addPayment.mutateAsync({ key: expense.key, input: toPaymentInput(form) });
      notifications.show({
        title: t('Payment saved'),
        message: saved.expense.balanceCents === 0 ? t('This bill is now paid.') : expense.number,
        color: 'green',
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The payment could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened={expense !== null}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {expense === null ? '' : `${t('Pay Bill')} — ${expense.number}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      {expense !== null && current !== null && (
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            <Stack gap={2}>
              <Text fw={600}>
                {expense.categoryName}
                {expense.payeeName ? ` · ${expense.payeeName}` : ''}
              </Text>
              <Group gap="lg">
                <Text size="sm" c="dimmed">
                  {t('Bill')}: {formatMoney(current.amountCents)}
                </Text>
                <Text size="sm" c="dimmed">
                  {t('Paid')}: {formatMoney(current.paidCents)}
                </Text>
                <Text size="sm" fw={700}>
                  {t('Still owed')}: {formatMoney(current.balanceCents)}
                </Text>
              </Group>
            </Stack>

            {detail !== undefined && detail.payments.length > 0 && (
              <Stack gap={4}>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {t('Paid so far')}
                </Text>
                {detail.payments.map((p) => (
                  <Group key={p.key} justify="space-between" gap="sm" wrap="nowrap">
                    <Text size="sm">
                      {formatDate(p.paidOn)} · {paidFromLabel(p.paidFrom)}
                    </Text>
                    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(p.amountCents)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}

            <Stack gap="xs">
              <MoneyInput
                label={t('Amount you are paying')}
                valueCents={form.amountCents}
                onChangeCents={(cents) => patch({ amountCents: cents })}
                required
              />
              <Group>
                <Button
                  size="xs"
                  variant="default"
                  h={isMobile ? 44 : undefined}
                  onClick={() => patch({ amountCents: current.balanceCents })}
                >
                  {t('Pay everything that is owed')}
                </Button>
              </Group>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Select
                label={t('Paid from')}
                placeholder={t('Choose')}
                data={ACCOUNTS.map((a) => ({ value: a, label: paidFromLabel(a) }))}
                value={form.paidFrom}
                onChange={(value) => patch({ paidFrom: value as PaymentAccount | null })}
                allowDeselect={false}
                required
              />
              <TextInput
                type="date"
                label={t('Date paid')}
                value={form.paidOn}
                onChange={(e) => patch({ paidOn: e.currentTarget.value })}
                required
              />
            </SimpleGrid>

            <TextInput
              label={t('Reference (optional)')}
              value={form.referenceNo}
              onChange={(e) => patch({ referenceNo: e.currentTarget.value })}
              maxLength={60}
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
              <Button type="submit" color="blue" loading={addPayment.isPending}>
                {t('Record Payment')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
