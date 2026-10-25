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
import { useCreateIncome } from '../hooks/useIncome';
import {
  emptyIncomeForm,
  toIncomeInput,
  validateIncome,
  type IncomeAccount,
  type IncomeFormState,
} from '../lib/incomeForm';
import { receivedIntoLabel } from '../lib/incomeView';

/** A name typed instead of picked; stands in for a payer in the list until it is saved. */
const TYPED_PAYEE = '__typed__';
const ACCOUNT_CHOICES: IncomeAccount[] = ['bank', 'card', 'online'];

export interface IncomeFormModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Enters money received that is not a sale and did not go into the cash drawer: paid into the
 * bank, onto a card or online. Cash put into the drawer is recorded there as "Add cash" and shows
 * up on the Income page by itself, so it is never entered twice.
 */
export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({ opened, onClose }) => {
  const isMobile = useIsMobile();
  const createIncome = useCreateIncome();
  const { data: categories = [], isLoading: categoriesLoading } = useCashCategories(
    { forIncome: true },
    opened
  );
  const { data: payees = [], isLoading: payeesLoading } = usePayees({}, opened);

  const [form, setForm] = useState<IncomeFormState>(() =>
    emptyIncomeForm(formatDate(new Date(), 'YYYY-MM-DD'))
  );
  const [error, setError] = useState<string | null>(null);

  const patch = (changes: Partial<IncomeFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setError(null);
  };

  const categoryItems: SearchComboboxItem[] = useMemo(
    () =>
      categories.map((c) => ({
        value: c.key,
        label: c.name,
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
    setForm(emptyIncomeForm(formatDate(new Date(), 'YYYY-MM-DD')));
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateIncome(form);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      const saved = await createIncome.mutateAsync(toIncomeInput(form));
      notifications.show({ title: t('Income saved'), message: saved.number, color: 'green' });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The income could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {t('Record Income')}
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
              'For money that is not a sale and went to the bank, a card or online. Cash put into the drawer is recorded there as "Add cash" and appears here by itself.'
            )}
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              type="date"
              label={t('Date received')}
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
            label={t('Received from (optional)')}
            description={t('Type a name, or pick someone you received from before.')}
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
              {t('Where did the money go?')}{' '}
              <Text span c="red">
                *
              </Text>
            </Text>
            <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="xs">
              {ACCOUNT_CHOICES.map((choice) => (
                <Button
                  key={choice}
                  variant={form.receivedInto === choice ? 'filled' : 'default'}
                  h={isMobile ? 44 : undefined}
                  onClick={() => patch({ receivedInto: choice })}
                  aria-pressed={form.receivedInto === choice}
                >
                  {receivedIntoLabel(choice)}
                </Button>
              ))}
            </SimpleGrid>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t('Reference number (optional)')}
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
            <Button type="submit" color="blue" loading={createIncome.isPending}>
              {t('Save Income')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
