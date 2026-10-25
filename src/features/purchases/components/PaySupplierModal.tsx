import { t } from '@/shared/i18n/t';
import { useState } from 'react';
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
import { IconBuildingBank, IconCash, IconCreditCard, IconDeviceMobile } from '@tabler/icons-react';
import { getDeviceId } from '@/api/deviceId';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { getErrorMessage } from '@/shared/lib/error';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import {
  ChoiceCard,
  ChoiceGroup,
} from '@/features/billing/components/sessions/movement/ChoiceCard';
import { useCashCategories } from '@/features/billing/hooks/useCashLookups';
import {
  useCreateCashMovement,
  useCurrentSession,
} from '@/features/billing/hooks/useRegisterSession';
import { useCreateExpense } from '@/features/expenses/hooks/useExpenses';
import type { CashCategory } from '@/features/billing/types';
import { useOpenReceipts } from '../hooks/usePurchases';
import {
  emptyPayForm,
  toCashMovementInput,
  toExpenseInput,
  validatePay,
  type PayFormState,
  type PaySource,
} from '../lib/payForm';
import { autoAllocate, totalDueCents } from '../lib/settlement';
import { SettlementPicker } from './SettlementPicker';

export interface PaySupplierModalProps {
  opened: boolean;
  onClose: () => void;
  supplierKey: string;
  supplierName: string;
}

const SETTLE_CATEGORY_NAME = 'Settle credit balance';
const APPROVAL_CODES = new Set(['DRAWER_CASH_EXCEEDED', 'PIN_NOT_SET', 'INVALID_PIN']);
const NO_CATEGORIES: CashCategory[] = [];

const SOURCES: Array<{
  source: PaySource;
  label: () => string;
  hint: () => string;
  icon: React.ReactNode;
}> = [
  {
    source: 'drawer',
    label: () => t('Cash drawer'),
    hint: () => t('Cash from this register.'),
    icon: <IconCash size={18} />,
  },
  {
    source: 'bank',
    label: () => t('Bank'),
    hint: () => t('Paid from the bank.'),
    icon: <IconBuildingBank size={18} />,
  },
  {
    source: 'card',
    label: () => t('Card'),
    hint: () => t('Paid by card.'),
    icon: <IconCreditCard size={18} />,
  },
  {
    source: 'online',
    label: () => t('Online'),
    hint: () => t('Paid by an online transfer.'),
    icon: <IconDeviceMobile size={18} />,
  },
];

const today = () => formatDate(new Date(), 'YYYY-MM-DD');

/** Pay a supplier what is owed: all of it or part, and which of their bills it pays. */
export const PaySupplierModal = ({
  opened,
  onClose,
  supplierKey,
  supplierName,
}: PaySupplierModalProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const [form, setForm] = useState<PayFormState>(() => emptyPayForm(today()));
  const [wasOpened, setWasOpened] = useState(opened);
  const [problem, setProblem] = useState<string | null>(null);
  const [approvalRequired, setApprovalRequired] = useState(false);

  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) {
      setForm(emptyPayForm(today()));
      setProblem(null);
      setApprovalRequired(false);
    }
  }

  const terminalId = getDeviceId();
  const { session } = useCurrentSession(terminalId);
  const { data: open } = useOpenReceipts(opened ? supplierKey : undefined);
  const categoriesQuery = useCashCategories({ movementType: 'supplier_payment' }, opened);
  const categories = categoriesQuery.data === undefined ? NO_CATEGORIES : categoriesQuery.data;
  const createMovement = useCreateCashMovement();
  const createExpense = useCreateExpense();
  const saving = createMovement.isPending || createExpense.isPending;
  const owed = totalDueCents(open);

  const patch = (changes: Partial<PayFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setProblem(null);
  };

  const chooseSource = (source: PaySource) => {
    const settle = categories.find((c) => c.name === SETTLE_CATEGORY_NAME);
    patch({
      source,
      categoryKey:
        form.categoryKey === null && settle !== undefined ? settle.key : form.categoryKey,
    });
  };

  const payEverything = () => patch({ amountCents: owed, settlements: autoAllocate(open, owed) });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const wrong = validatePay(form, open);
    if (wrong !== null) {
      setProblem(wrong);
      return;
    }
    try {
      if (form.source === 'drawer') {
        await createMovement.mutateAsync(
          toCashMovementInput(form, supplierKey, terminalId, session === null ? null : session.key)
        );
      } else {
        await createExpense.mutateAsync(toExpenseInput(form, supplierKey));
      }
      notifications.show({
        title: t('Payment recorded'),
        message: `${supplierName}: ${formatMoney(form.amountCents)}`,
        color: 'teal',
      });
      onClose();
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== undefined && APPROVAL_CODES.has(code)) setApprovalRequired(true);
      setProblem(getErrorMessage(error, t('The payment could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Pay')} ${supplierName}`}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Text size="sm">
            {owed > 0
              ? `${t('You owe on unpaid bills:')} ${formatMoney(owed)}`
              : t('This supplier has no unpaid bills. A payment is kept on their account.')}
          </Text>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('Where is the money coming from?')}
            </Text>
            <ChoiceGroup
              label={t('Where the money comes from')}
              style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              {SOURCES.map((option) => (
                <ChoiceCard
                  key={option.source}
                  label={option.label()}
                  hint={option.hint()}
                  icon={option.icon}
                  selected={form.source === option.source}
                  allowed
                  tall={isMobile}
                  onSelect={() => chooseSource(option.source)}
                />
              ))}
            </ChoiceGroup>
            {form.source === 'drawer' ? (
              <Text size="xs" c="dimmed">
                {session === null
                  ? t('No shift is open, so the cash is taken out of the drawer between shifts.')
                  : t('The cash is taken out of the open shift now.')}
              </Text>
            ) : null}
          </Stack>

          <MoneyInput
            label={t('How much are you paying?')}
            valueCents={form.amountCents}
            onChangeCents={(amountCents) => patch({ amountCents })}
            size={fieldSize}
          />
          {owed > 0 ? (
            <Group>
              <Button
                variant="light"
                size={isMobile ? 'sm' : 'xs'}
                style={{ minHeight: isMobile ? 44 : undefined }}
                onClick={payEverything}
              >
                {`${t('Pay everything owed')} (${formatMoney(owed)})`}
              </Button>
            </Group>
          ) : null}

          <SettlementPicker
            supplierKey={supplierKey}
            paymentCents={form.amountCents}
            value={form.settlements}
            onChange={(settlements) => patch({ settlements })}
            isMobile={isMobile}
          />

          <Select
            label={t('Filed under')}
            placeholder={t('Pick a category')}
            data={categories.map((category) => ({ value: category.key, label: category.name }))}
            value={form.categoryKey}
            onChange={(categoryKey) => patch({ categoryKey })}
            allowDeselect={false}
            size={fieldSize}
          />

          {form.source !== null && form.source !== 'drawer' ? (
            <TextInput
              type="date"
              label={t('Day the money left the account')}
              value={form.paidOn}
              onChange={(event) => patch({ paidOn: event.currentTarget.value })}
              size={fieldSize}
            />
          ) : null}

          {approvalRequired && form.source === 'drawer' ? (
            <Alert color="orange" title={t('A manager or owner must approve this')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <TextInput
                  label={t('Manager or owner PIN')}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.managerPin}
                  onChange={(event) => patch({ managerPin: event.currentTarget.value })}
                  size={fieldSize}
                />
                <TextInput
                  label={t('Why is more being paid than the drawer holds?')}
                  description={t(
                    'Only needed when the payment is bigger than the cash in the drawer.'
                  )}
                  value={form.overrideReason}
                  onChange={(event) => patch({ overrideReason: event.currentTarget.value })}
                  size={fieldSize}
                />
              </SimpleGrid>
            </Alert>
          ) : null}

          {problem !== null ? (
            <Alert color="red" role="alert">
              {problem}
            </Alert>
          ) : null}

          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={saving}>
              {t('Cancel')}
            </Button>
            <Button
              type="submit"
              color="blue"
              loading={saving}
              data-log-id="purchases.pay-supplier"
            >
              {t('Record payment')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
