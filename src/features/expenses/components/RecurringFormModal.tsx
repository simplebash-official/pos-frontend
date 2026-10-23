import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useCashCategories, usePayees } from '@/features/billing/hooks/useCashLookups';
import { getTypeLabel } from '@/features/billing/components/sessions/movement/movementTypes';
import { useCreateRecurringExpense, useUpdateRecurringExpense } from '../hooks/useRecurring';
import { paidFromLabel } from '../lib/expenseView';
import { fromTemplate, validateRecurring, type RecurringFormState } from '../lib/recurringForm';
import type { RecurringExpense } from '../types';

const ACCOUNTS: RecurringExpense['paidFrom'][] = ['drawer', 'bank', 'card', 'online'];

export interface RecurringFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** The bill being changed; leave out to add a new one. */
  editing?: RecurringExpense;
}

/** Adds a regular bill (rent, electricity...) or changes one. The what and who of a bill cannot change. */
export const RecurringFormModal: React.FC<RecurringFormModalProps> = ({
  opened,
  onClose,
  editing,
}) => {
  const isMobile = useIsMobile();
  const create = useCreateRecurringExpense();
  const update = useUpdateRecurringExpense();
  const { data: categories = [], isLoading: categoriesLoading } = useCashCategories(
    { forExpenses: true },
    opened
  );
  const { data: payees = [], isLoading: payeesLoading } = usePayees({}, opened);
  const [form, setForm] = useState<RecurringFormState>(() => fromTemplate(editing));
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<RecurringFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setError(null);
  };

  const categoryItems: SearchComboboxItem[] = useMemo(
    () =>
      categories.map((c) => ({
        value: c.key,
        label: c.name,
        description: getTypeLabel(c.movementType),
        searchText: c.nameSi,
      })),
    [categories]
  );
  const payeeItems: SearchComboboxItem[] = useMemo(
    () => payees.map((p) => ({ value: p.key, label: p.name, description: p.phone })),
    [payees]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateRecurring(
      form,
      categories.find((c) => c.key === form.categoryKey)?.movementType
    );
    if (problem) {
      setError(problem);
      return;
    }
    const schedule = {
      amountCents: form.amountCents,
      dueDay: form.dueDay as number,
      remindDaysBefore: form.remindDaysBefore as number,
      paidFrom: form.paidFrom as RecurringExpense['paidFrom'],
      note: form.note.trim() || undefined,
    };
    try {
      if (editing) {
        await update.mutateAsync({ key: editing.key, input: schedule });
      } else {
        await create.mutateAsync({
          ...schedule,
          categoryKey: form.categoryKey as string,
          payeeKey: form.payeeKey ?? undefined,
        });
      }
      notifications.show({ title: t('Regular bill saved'), message: '', color: 'green' });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The regular bill could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {editing ? t('Change Regular Bill') : t('Add Regular Bill')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            {t(
              'A bill you pay every month, like shop rent or electricity. You will get a reminder before it falls due.'
            )}
          </Text>
          <SearchCombobox
            label={t('What is it for?')}
            placeholder={t('Type to search')}
            loading={categoriesLoading}
            items={categoryItems}
            value={form.categoryKey}
            onChange={(key) => patch({ categoryKey: key })}
            disabled={editing !== undefined}
            required
            emptyText={t('No category matches.')}
          />
          <SearchCombobox
            label={t('Paid to (optional)')}
            placeholder={t('Type to search')}
            loading={payeesLoading}
            items={payeeItems}
            value={form.payeeKey}
            onChange={(key) => patch({ payeeKey: key })}
            disabled={editing !== undefined}
            clearable
            emptyText={t('No one saved yet.')}
          />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <MoneyInput
              label={t('Usual amount')}
              valueCents={form.amountCents}
              onChangeCents={(cents) => patch({ amountCents: cents })}
              required
            />
            <NumberInput
              label={t('Due on day of month')}
              value={form.dueDay}
              onChange={(v) => patch({ dueDay: typeof v === 'number' ? v : '' })}
              min={1}
              max={31}
              allowDecimal={false}
              required
              styles={isMobile ? { input: { minHeight: 44 } } : undefined}
            />
            <NumberInput
              label={t('Remind me days before')}
              value={form.remindDaysBefore}
              onChange={(v) => patch({ remindDaysBefore: typeof v === 'number' ? v : '' })}
              min={0}
              max={30}
              allowDecimal={false}
              required
              styles={isMobile ? { input: { minHeight: 44 } } : undefined}
            />
          </SimpleGrid>
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('Usually paid from')}{' '}
              <Text span c="red">
                *
              </Text>
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {ACCOUNTS.map((choice) => (
                <Button
                  key={choice}
                  type="button"
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
            <Button type="submit" color="blue" loading={create.isPending || update.isPending}>
              {t('Save Regular Bill')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
