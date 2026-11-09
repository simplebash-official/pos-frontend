import { useState } from 'react';
import { Badge, Group, Paper, Select, Stack, Text } from '@mantine/core';
import type {
  CreditNote,
  CreditNoteItemCondition,
  CreditNoteItemDisposition,
} from '@/features/billing/types';
import { useResolveCreditNote } from '@/features/billing/hooks/useCreditNotes';
import { ManagerApprovalModal } from '@/features/warranties/components/ManagerApprovalModal';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { outcomeText, pendingLines } from '../lib/creditNoteView';
import { ITEM_CONDITION_OPTIONS, ITEM_DISPOSITION_OPTIONS } from '../lib/invoiceStatus';

export interface ResolveCreditNoteModalProps {
  /** A credit note that is waiting for inspection; the window is mounted only while it is open. */
  creditNote: CreditNote;
  onClose: () => void;
}

interface Decision {
  condition: CreditNoteItemCondition | null;
  disposition: CreditNoteItemDisposition | null;
}

const NOT_DECIDED: Decision = { condition: null, disposition: null };

// The unit has been looked at, so "still pending" is not an answer.
const DECIDED_CONDITIONS = ITEM_CONDITION_OPTIONS.filter(
  (option) => option.value !== 'pending_inspection'
);

/**
 * Records what the inspection found for every unit a credit note holds back: the server restocks,
 * writes off, returns to the supplier or parks each one and closes the note. Nothing is
 * pre-selected, because the answer is a fact about the unit, not a default.
 */
export const ResolveCreditNoteModal = ({ creditNote, onClose }: ResolveCreditNoteModalProps) => {
  const resolve = useResolveCreditNote();
  const waiting = pendingLines(creditNote);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});

  const decisionOf = (index: number): Decision => decisions[index] ?? NOT_DECIDED;
  const update = (index: number, patch: Partial<Decision>) =>
    setDecisions((prev) => ({ ...prev, [index]: { ...(prev[index] ?? NOT_DECIDED), ...patch } }));

  const blocker = (): string | null => {
    for (const { index } of waiting) {
      const { condition, disposition } = decisionOf(index);
      if (condition === null) return t('Say what you found for every unit.');
      if (condition === 'damaged' && disposition === null)
        return t('Choose what happens to each damaged unit.');
    }
    return null;
  };

  const submit = (approval: { managerPin: string; reason: string } | undefined) => {
    const lines = waiting.map(({ index }) => {
      const { condition, disposition } = decisionOf(index);
      if (condition === null) throw new Error('every line is decided before submit');
      return {
        lineIndex: index,
        condition,
        disposition: condition === 'damaged' && disposition !== null ? disposition : undefined,
      };
    });
    resolve.mutate(
      { creditNoteKey: creditNote.id, input: { lines, approval } },
      { onSuccess: onClose }
    );
  };

  return (
    <ManagerApprovalModal
      opened
      onClose={onClose}
      title={`${t('Inspect returned items')} — ${creditNote.creditNoteNumber}`}
      description={t(
        'The refund is already paid. This decides what happens to the returned units and moves stock accordingly.'
      )}
      reasonLabel={t('What did the inspection find?')}
      confirmLabel={t('Save inspection')}
      confirmColor="blue"
      blocker={blocker()}
      loading={resolve.isPending}
      error={resolve.isError ? getErrorMessage(resolve.error) : null}
      onConfirm={submit}
    >
      <Stack gap="sm">
        {waiting.map(({ item, index }) => {
          const { condition, disposition } = decisionOf(index);
          return (
            <Paper key={index} p="sm" withBorder bg="var(--bg-app)">
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap" gap="xs">
                  <Text size="sm" fw={700}>
                    {item.name}
                  </Text>
                  <Badge variant="light" color="gray" size="sm">
                    × {item.quantity}
                    {item.serialNumber === undefined ? '' : ` · ${item.serialNumber}`}
                  </Badge>
                </Group>
                <Select
                  label={t('Condition')}
                  placeholder={t('Choose one')}
                  data={DECIDED_CONDITIONS.map((o) => ({ value: o.value, label: t(o.label) }))}
                  value={condition}
                  onChange={(value) =>
                    update(index, {
                      condition: value as CreditNoteItemCondition | null,
                      disposition: null,
                    })
                  }
                />
                {condition === 'damaged' && (
                  <Select
                    label={t('What happens to it?')}
                    placeholder={t('Choose one')}
                    data={ITEM_DISPOSITION_OPTIONS.map((o) => ({
                      value: o.value,
                      label: t(o.label),
                    }))}
                    value={disposition}
                    onChange={(value) =>
                      update(index, { disposition: value as CreditNoteItemDisposition | null })
                    }
                  />
                )}
                {condition !== null && (
                  <Text size="xs" c="dimmed">
                    {outcomeText(condition, disposition === null ? undefined : disposition)}
                  </Text>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </ManagerApprovalModal>
  );
};
