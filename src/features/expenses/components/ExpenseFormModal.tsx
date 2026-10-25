import React, { useMemo, useState } from 'react';
import { Alert, Button, Group, Modal, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatDate } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import { useCashCategories, usePayees } from '@/features/billing/hooks/useCashLookups';
import { getTypeLabel } from '@/features/billing/components/sessions/movement/movementTypes';
import { useCreateExpense } from '../hooks/useExpenses';
import {
  emptyExpenseForm,
  toExpenseInput,
  validateExpense,
  type ExpenseFormState,
  type ExpensePaidFrom,
} from '../lib/expenseForm';
import { paidFromLabel } from '../lib/expenseView';

/** A name typed instead of picked; stands in for a payee in the list until it is saved. */
const TYPED_PAYEE = '__typed__';
const PAID_FROM_CHOICES: ExpensePaidFrom[] = ['bank', 'card', 'online', 'unpaid'];

/** Starting values for a bill that is about to be paid; all can still be changed. */
export interface ExpensePrefill {
  categoryKey: string;
  payeeKey?: string;
  amountCents: number;
  paidFrom: ExpensePaidFrom;
  /** `YYYY-MM-DD`. */
  date: string;
}

export interface ExpenseFormModalProps {
  opened: boolean;
  onClose: () => void;
  prefill?: ExpensePrefill;
}

/**
 * Enters a cost that did not come out of the cash drawer: paid from the bank, a card or online,
 * or a bill still to pay. Cash from the drawer is recorded as a cash movement and shows up on the
 * Expenses page by itself, so it is never entered twice.
 */
export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ opened, onClose, prefill }) => {
  const isMobile = useIsMobile();
  const createExpense = useCreateExpense();
  const { data: categories = [], isLoading: categoriesLoading } = useCashCategories(
    { forExpenses: true },
    opened
  );
  const { data: payees = [], isLoading: payeesLoading } = usePayees({}, opened);

  const [form, setForm] = useState<ExpenseFormState>(() => {
    const blank = emptyExpenseForm(formatDate(new Date(), 'YYYY-MM-DD'));
    return prefill === undefined
      ? blank
      : {
          ...blank,
          date: prefill.date,
          categoryKey: prefill.categoryKey,
          payeeKey: prefill.payeeKey ?? null,
          amountCents: prefill.amountCents,
          paidFrom: prefill.paidFrom,
        };
  });
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<ExpenseFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setError(null);
  };

  const categoryItems: SearchComboboxItem[] = useMemo(
    () =>
      categories.map((c) => ({
        value: c.key,
        label: c.name,
        // Several kinds have an "Other"; the kind tells them apart.
        description: getTypeLabel(c.movementType),
        searchText: c.nameSi,
      })),
    [categories]
  );

  const payeeItems: SearchComboboxItem[] = useMemo(() => {
    const items: SearchComboboxItem[] = payees.map((p) => ({
      value: p.key,
      label: p.name,
      description: p.phone,
    }));
    if (form.payeeName && !form.payeeKey) {
      items.unshift({ value: TYPED_PAYEE, label: form.payeeName });
    }
    return items;
  }, [payees, form.payeeName, form.payeeKey]);

  const handleClose = () => {
    setForm(emptyExpenseForm(formatDate(new Date(), 'YYYY-MM-DD')));
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateExpense(form);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      const saved = await createExpense.mutateAsync(toExpenseInput(form));
      notifications.show({
        title: t('Expense saved'),
        message: saved.expense.number,
        color: 'green',
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The expense could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {t('Add Expense')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            {t(
              'For costs paid from the bank, a card or online, or a bill you will pay later. Cash taken from the drawer is recorded as a cash movement and appears here by itself.'
            )}
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              type="date"
              label={t('Date of the bill')}
              value={form.date}
              onChange={(e) => patch({ date: e.currentTarget.value })}
              required
            />
            <MoneyInput
              label={t('Amount')}
              valueCents={form.amountCents}
              onChangeCents={(cents) => patch({ amountCents: cents })}
              required
            />
          </SimpleGrid>

          <SearchCombobox
            label={t('What is it for?')}
            placeholder={t('Type to search')}
            loading={categoriesLoading}
            items={categoryItems}
            value={form.categoryKey}
            onChange={(key) => patch({ categoryKey: key })}
            required
            emptyText={t('No category matches.')}
          />

          <SearchCombobox
            label={t('Paid to (optional)')}
            description={t('Type a name, or pick someone you paid before.')}
            placeholder={t('Name of the person or company')}
            loading={payeesLoading}
            items={payeeItems}
            value={form.payeeKey ?? (form.payeeName ? TYPED_PAYEE : null)}
            onChange={(key) =>
              patch(
                key === null || key === TYPED_PAYEE
                  ? { payeeKey: null, payeeName: key === null ? '' : form.payeeName }
                  : { payeeKey: key, payeeName: '' }
              )
            }
            clearable
            onTypedCommit={(typed) => patch({ payeeKey: null, payeeName: typed })}
            emptyText={t('No one saved yet. Type a name to use it.')}
            create={{
              labelFor: (typed) => `${t('Use')} "${typed}"`,
              emptyLabel: t('Type a name to use it'),
              requiresName: true,
              onCreate: (typed) => typed && patch({ payeeKey: null, payeeName: typed }),
            }}
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('How was it paid?')}{' '}
              <Text span c="red">
                *
              </Text>
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {PAID_FROM_CHOICES.map((choice) => (
                <Button
                  key={choice}
                  variant={form.paidFrom === choice ? 'filled' : 'default'}
                  h={isMobile ? 44 : undefined}
                  onClick={() => patch({ paidFrom: choice })}
                  aria-pressed={form.paidFrom === choice}
                >
                  {paidFromLabel(choice)}
                </Button>
              ))}
            </SimpleGrid>
          </Stack>

          {form.paidFrom === 'unpaid' && (
            <TextInput
              type="date"
              label={t('Pay by (optional)')}
              description={t('It shows as overdue on the Expenses page after this date.')}
              value={form.dueDate}
              onChange={(e) => patch({ dueDate: e.currentTarget.value })}
            />
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t('Bill or receipt number (optional)')}
              value={form.referenceNo}
              onChange={(e) => patch({ referenceNo: e.currentTarget.value })}
              maxLength={60}
            />
            <TextInput
              label={t('Note (optional)')}
              value={form.note}
              onChange={(e) => patch({ note: e.currentTarget.value })}
              maxLength={200}
            />
          </SimpleGrid>

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
            <Button type="submit" color="blue" loading={createExpense.isPending}>
              {t('Save Expense')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
