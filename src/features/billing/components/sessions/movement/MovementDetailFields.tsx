import { useMemo, type ReactNode } from 'react';
import { Alert, Button, Checkbox, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { t } from '@/shared/i18n/t';
import { usePayees } from '../../../hooks/useCashLookups';
import { useCashMovementList } from '../../../hooks/useRegisterSession';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import type { CashMovementType, PayeeType, PeriodStatus } from '../../../types';
import type { MovementFormState } from './movementForm';

/** A name typed instead of picked; stands in for a payee in the list until it is saved. */
const TYPED_PAYEE = '__typed__';
const NOTE_MAX = 200;

/** The months a payment can cover: the last twelve and the coming one. */
const monthOptions = (): { value: string; label: string }[] => {
  const now = new Date();
  return Array.from({ length: 13 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { value, label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) };
  });
};

const PAYEE_TYPE_FOR: Partial<Record<CashMovementType, PayeeType>> = {
  rent_and_bills: 'vendor',
  staff_payment: 'staff',
  supplier_payment: 'supplier',
};

export interface MovementDetailFieldsProps {
  form: MovementFormState;
  onChange: (patch: Partial<MovementFormState>) => void;
  /** What is already recorded for this rent's month, when the kind is rent and the month is picked. */
  periodStatus: PeriodStatus | undefined;
}

/**
 * Offers the last rent payment for the category as a one-tap suggestion: same payee, same amount. It
 * only fills the form when tapped, so nothing is entered behind the person's back.
 */
const LastPaymentHint = ({
  form,
  onChange,
}: {
  form: MovementFormState;
  onChange: (patch: Partial<MovementFormState>) => void;
}) => {
  const { data } = useCashMovementList({
    movementType: 'rent_and_bills',
    categoryKey: form.categoryKey ?? undefined,
    limit: 10,
  });
  const last = (data?.movements ?? []).find((m) => !m.reversesKey && !m.reversedByKey);
  if (!last || (form.amountCents > 0 && form.payeeKey !== null)) return null;
  return (
    <Button
      variant="light"
      size="xs"
      onClick={() => onChange({ payeeKey: last.payeeKey ?? null, amountCents: last.amountCents })}
    >
      {t('Same as last time')}: {last.payeeName ? `${last.payeeName} · ` : ''}
      {formatMoney(last.amountCents)}
    </Button>
  );
};

/**
 * The fields that belong to the chosen kind of payment, with the labels that make sense for it
 * ("Paid to", "Supplier", "Staff member"…). Everything else about the form stays the same when the
 * kind changes, so only this block re-renders.
 */
export const MovementDetailFields = ({
  form,
  onChange,
  periodStatus,
}: MovementDetailFieldsProps) => {
  const type = form.type;
  const savedType = PAYEE_TYPE_FOR[type];
  const needsSavedPayee = savedType !== undefined;
  const { data: payees, isLoading } = usePayees(
    { payeeType: savedType },
    needsSavedPayee || type === 'petty_expense'
  );
  const months = useMemo(() => monthOptions(), []);

  const payeeItems: SearchComboboxItem[] = useMemo(() => {
    const items: SearchComboboxItem[] = (payees ?? []).map((p) => ({
      value: p.key,
      label: p.name,
      description: p.phone,
    }));
    if (type === 'petty_expense' && form.payeeName && !form.payeeKey) {
      items.unshift({ value: TYPED_PAYEE, label: form.payeeName });
    }
    return items;
  }, [payees, type, form.payeeName, form.payeeKey]);

  const note = (
    <TextInput
      label={t('Note (optional)')}
      value={form.note}
      onChange={(e) => onChange({ note: e.currentTarget.value })}
      maxLength={NOTE_MAX}
      autoComplete="off"
      name="cash-movement-note"
    />
  );

  const reference = (label: string) => (
    <TextInput
      label={label}
      value={form.referenceNo}
      onChange={(e) => onChange({ referenceNo: e.currentTarget.value })}
      maxLength={60}
      autoComplete="off"
      name="cash-movement-reference"
    />
  );

  // Two short text fields share a row on a computer. Bottom-aligned so the boxes line up
  // when one label wraps onto two lines.
  const pair = (first: ReactNode, second: ReactNode) => (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ alignItems: 'end' }}>
      {first}
      {second}
    </SimpleGrid>
  );

  switch (type) {
    case 'petty_expense':
      return (
        <Stack gap="md">
          <SearchCombobox
            label={t('Paid to (optional)')}
            description={t('Type a name, or pick someone you paid before.')}
            placeholder={t('Name of the person or shop')}
            loading={isLoading}
            items={payeeItems}
            value={form.payeeKey ?? (form.payeeName ? TYPED_PAYEE : null)}
            onChange={(key) =>
              onChange(
                key === null || key === TYPED_PAYEE
                  ? { payeeKey: null, payeeName: key === null ? '' : form.payeeName }
                  : { payeeKey: key, payeeName: '' }
              )
            }
            clearable
            onTypedCommit={(typed) => onChange({ payeeKey: null, payeeName: typed })}
            emptyText={t('No one saved yet. Type a name to use it.')}
            create={{
              labelFor: (typed) => `${t('Use')} "${typed}"`,
              emptyLabel: t('Type a name to use it'),
              onCreate: (typed) => typed && onChange({ payeeKey: null, payeeName: typed }),
            }}
          />
          {pair(reference(t('Receipt or bill number (optional)')), note)}
        </Stack>
      );
    case 'rent_and_bills':
      return (
        <Stack gap="md">
          <SearchCombobox
            label={t('Who is being paid?')}
            placeholder={t('Landlord or company')}
            loading={isLoading}
            items={payeeItems}
            value={form.payeeKey}
            onChange={(key) => onChange({ payeeKey: key })}
            required
            noCreateHint={t('To add someone new, ask a manager.')}
            emptyText={t('Nobody added yet.')}
          />
          <Select
            label={t('Month this payment covers')}
            placeholder={t('Choose a month')}
            data={months}
            value={form.period}
            onChange={(value) => onChange({ period: value })}
            required
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
          />
          {form.categoryKey !== null && <LastPaymentHint form={form} onChange={onChange} />}
          {periodStatus !== undefined && periodStatus.paidCents > 0 && (
            <Alert
              color={periodStatus.alreadyPaid ? 'orange' : 'blue'}
              variant="light"
              title={
                periodStatus.alreadyPaid
                  ? t('This month is already paid')
                  : t('Part of this month is paid')
              }
            >
              <Stack gap="xs">
                <Text size="sm">
                  {periodStatus.expectedCents !== undefined
                    ? `${formatMoney(periodStatus.paidCents)} ${t('of')} ${formatMoney(periodStatus.expectedCents)} ${t('paid')}`
                    : `${formatMoney(periodStatus.paidCents)} ${t('already recorded')}`}
                  {periodStatus.payments.length > 0 &&
                    ` · ${t('last')} ${periodStatus.payments[periodStatus.payments.length - 1].number}, ${formatDate(periodStatus.payments[periodStatus.payments.length - 1].date)}`}
                </Text>
                {periodStatus.alreadyPaid && (
                  <Checkbox
                    label={t('This is another payment')}
                    checked={form.confirmDuplicate}
                    onChange={(e) => onChange({ confirmDuplicate: e.currentTarget.checked })}
                  />
                )}
              </Stack>
            </Alert>
          )}
          {pair(reference(t('Agreement, meter or bill number (optional)')), note)}
          <Text size="xs" c="dimmed">
            {t(
              'This records cash paid from the drawer. A bank transfer for rent is not recorded here.'
            )}
          </Text>
        </Stack>
      );
    case 'staff_payment':
      return (
        <Stack gap="md">
          <SearchCombobox
            label={t('Staff member')}
            placeholder={t('Who is being paid?')}
            loading={isLoading}
            items={payeeItems}
            value={form.payeeKey}
            onChange={(key) => onChange({ payeeKey: key })}
            required
            noCreateHint={t('To add a staff member, ask a manager.')}
            emptyText={t('No staff found.')}
          />
          <Select
            label={t('Pay month (optional)')}
            placeholder={t('Choose a month')}
            data={months}
            value={form.period}
            onChange={(value) => onChange({ period: value })}
            clearable
            comboboxProps={{ withinPortal: true }}
          />
          {note}
        </Stack>
      );
    case 'supplier_payment':
      return (
        <Stack gap="md">
          <SearchCombobox
            label={t('Supplier')}
            placeholder={t('Who is being paid?')}
            loading={isLoading}
            items={payeeItems}
            value={form.payeeKey}
            onChange={(key) => onChange({ payeeKey: key })}
            required
            noCreateHint={t('To add a supplier, ask a manager.')}
            emptyText={t('No supplier found.')}
          />
          {pair(reference(t('Bill or order number (optional)')), note)}
        </Stack>
      );
    case 'owner_withdrawal':
      return (
        <Stack gap="md">
          <TextInput
            label={t('Who took the cash?')}
            value={form.payeeName}
            onChange={(e) => onChange({ payeeName: e.currentTarget.value })}
            required
            maxLength={60}
            autoComplete="off"
          />
          {note}
        </Stack>
      );
    case 'add_cash':
      return (
        <Stack gap="md">
          <TextInput
            label={t('Received from (optional)')}
            value={form.payeeName}
            onChange={(e) => onChange({ payeeName: e.currentTarget.value })}
            maxLength={60}
            autoComplete="off"
          />
          {pair(reference(t('Reference (optional)')), note)}
        </Stack>
      );
    case 'cash_drop':
    case 'no_sale':
      return <Stack gap="md">{note}</Stack>;
  }
};
