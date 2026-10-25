import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatMoney } from '@/shared/lib/money';
import { getErrorMessage } from '@/shared/lib/error';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import {
  ChoiceCard,
  ChoiceGroup,
} from '@/features/billing/components/sessions/movement/ChoiceCard';
import { useCreateSupplierCredit, useOpenReceipts } from '../hooks/usePurchases';
import { receiptLabel } from '../lib/settlement';
import type { CreditReason } from '../types';

export interface RecordCreditModalProps {
  opened: boolean;
  onClose: () => void;
  supplierKey: string;
  supplierName: string;
  /** Pre-selects a bill when the credit is recorded from it. */
  receiptKey?: string;
}

const REASONS: Array<{ reason: CreditReason; label: () => string; hint: () => string }> = [
  {
    reason: 'short_delivery',
    label: () => t('Fewer arrived'),
    hint: () => t('Less came than the bill says.'),
  },
  {
    reason: 'damaged',
    label: () => t('Damaged'),
    hint: () => t('Goods arrived broken or faulty.'),
  },
  {
    reason: 'price_difference',
    label: () => t('Wrong price'),
    hint: () => t('The bill was too high.'),
  },
  { reason: 'other', label: () => t('Something else'), hint: () => t('Any other reason.') },
];

const ACCOUNT = '__account__';

/** The supplier takes an amount off what you owe: short or damaged goods, or a wrong price. */
export const RecordCreditModal = ({
  opened,
  onClose,
  supplierKey,
  supplierName,
  receiptKey,
}: RecordCreditModalProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const { data: open } = useOpenReceipts(opened ? supplierKey : undefined);
  const create = useCreateSupplierCredit();

  const [target, setTarget] = useState<string>(receiptKey === undefined ? ACCOUNT : receiptKey);
  const [amountCents, setAmountCents] = useState(0);
  const [reason, setReason] = useState<CreditReason | null>(null);
  const [note, setNote] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [wasOpened, setWasOpened] = useState(opened);

  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) {
      setTarget(receiptKey === undefined ? ACCOUNT : receiptKey);
      setAmountCents(0);
      setReason(null);
      setNote('');
      setProblem(null);
    }
  }

  const chosen = open.find((receipt) => receipt.key === target);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (amountCents <= 0) return setProblem(t('Please enter the amount the supplier took off.'));
    if (reason === null) return setProblem(t('Please pick why the supplier gave this credit.'));
    if (chosen !== undefined && amountCents > chosen.dueCents) {
      return setProblem(
        `${t('That bill only has')} ${formatMoney(chosen.dueCents)} ${t('left to pay.')}`
      );
    }
    try {
      await create.mutateAsync({
        supplierKey,
        receiptKey: chosen === undefined ? undefined : chosen.key,
        amountCents,
        reason,
        note: note.trim() || undefined,
      });
      notifications.show({
        title: t('Credit recorded'),
        message: `${supplierName}: ${formatMoney(amountCents)}`,
        color: 'teal',
      });
      onClose();
    } catch (error) {
      setProblem(getErrorMessage(error, t('The credit could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Credit from')} ${supplierName}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('Use this when a supplier takes money off what you owe. No stock is changed.')}
          </Text>
          <Select
            label={t('Which bill is it for?')}
            data={[
              { value: ACCOUNT, label: t("No particular bill (the supplier's account)") },
              ...open.map((receipt) => ({
                value: receipt.key,
                label: `${receiptLabel(receipt)} · ${t('owed')} ${formatMoney(receipt.dueCents)}`,
              })),
            ]}
            value={target}
            onChange={(value) => {
              if (value !== null) setTarget(value);
              setProblem(null);
            }}
            allowDeselect={false}
            size={fieldSize}
          />
          <MoneyInput
            label={t('How much did the supplier take off?')}
            valueCents={amountCents}
            onChangeCents={(cents) => {
              setAmountCents(cents);
              setProblem(null);
            }}
            size={fieldSize}
          />
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('Why?')}
            </Text>
            <ChoiceGroup
              label={t('Why the supplier gave credit')}
              style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              {REASONS.map((option) => (
                <ChoiceCard
                  key={option.reason}
                  label={option.label()}
                  hint={option.hint()}
                  selected={reason === option.reason}
                  allowed
                  tall={isMobile}
                  onSelect={() => {
                    setReason(option.reason);
                    setProblem(null);
                  }}
                />
              ))}
            </ChoiceGroup>
          </Stack>
          <TextInput
            label={t('Notes')}
            description={t('Optional. For example "2 cases missing".')}
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
            size={fieldSize}
          />
          {problem !== null ? (
            <Alert color="red" role="alert">
              {problem}
            </Alert>
          ) : null}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={create.isPending}>
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={create.isPending}>
              {t('Record credit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
