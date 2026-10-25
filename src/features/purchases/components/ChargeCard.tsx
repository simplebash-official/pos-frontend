import { t } from '@/shared/i18n/t';
import {
  ActionIcon,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import {
  ChoiceCard,
  ChoiceGroup,
} from '@/features/billing/components/sessions/movement/ChoiceCard';
import type { ChargeState } from '../lib/receiptForm';
import type { BilledBy, ChargeAllocation, ChargeKind } from '../types';
import { CHOICE_GRID } from './choiceGrid';
import { ChargePayeeField } from './ChargePayeeField';
import { CHARGE_DESCRIPTION_MAX, CHARGE_KINDS } from '../lib/chargeKinds';

export interface ChargeCardProps {
  /** 1-based position, so people can say "Extra charge 2". */
  position: number;
  charge: ChargeState;
  /** How many products are on the receipt; a spread is only asked for with two or more. */
  lineCount: number;
  onChange: (charge: ChargeState) => void;
  onRemove: () => void;
  isMobile: boolean;
}

const WHO: Array<{ billedBy: BilledBy; label: () => string; hint: () => string }> = [
  {
    billedBy: 'supplier',
    label: () => t("On the supplier's bill"),
    hint: () => t('Added to what you owe the supplier.'),
  },
  {
    billedBy: 'third_party',
    label: () => t('I pay someone else'),
    hint: () => t('A courier or agent, paid now.'),
  },
];

const SPREAD: Array<{ allocation: ChargeAllocation; label: () => string; hint: () => string }> = [
  {
    allocation: 'value',
    label: () => t('By value'),
    hint: () => t('The dearer products take more of it.'),
  },
  {
    allocation: 'quantity',
    label: () => t('By quantity'),
    hint: () => t('Every unit takes the same.'),
  },
];

/** One extra charge on the bill: what it is, how much, who asks for it, and how it is spread. */
export const ChargeCard = ({
  position,
  charge,
  lineCount,
  onChange,
  onRemove,
  isMobile,
}: ChargeCardProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const label = `${t('Extra charge')} ${position}`;

  const changeKind = (kind: ChargeKind | null) => {
    if (kind === null) return;
    // A discount can only come off the supplier's bill, so there is nothing to choose for it.
    onChange({
      ...charge,
      kind,
      billedBy: kind === 'discount' ? 'supplier' : charge.billedBy,
      payeeKey: kind === 'discount' ? null : charge.payeeKey,
      // A description only belongs to an "Other charge"; leaving that kind drops it.
      description: kind === 'other' ? charge.description : '',
    });
  };

  return (
    <Paper p="md" withBorder aria-label={label}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            {label}
          </Text>
          <ActionIcon
            variant="light"
            color="red"
            onClick={onRemove}
            size={isMobile ? 44 : 32}
            aria-label={`${t('Remove')} ${label}`}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Select
            label={t('What is it for?')}
            placeholder={t('Pick one')}
            data={CHARGE_KINDS.map((option) => ({ value: option.kind, label: option.label() }))}
            value={charge.kind}
            onChange={(value) => changeKind(value as ChargeKind | null)}
            allowDeselect={false}
            size={fieldSize}
          />
          <MoneyInput
            label={t('Amount')}
            valueCents={charge.amountCents}
            onChangeCents={(amountCents) => onChange({ ...charge, amountCents })}
            size={fieldSize}
          />
        </SimpleGrid>

        {charge.kind === 'other' ? (
          <TextInput
            label={t('What is it? (optional)')}
            placeholder={t('e.g. Packing tape, loading tip')}
            value={charge.description}
            onChange={(event) => onChange({ ...charge, description: event.currentTarget.value })}
            maxLength={CHARGE_DESCRIPTION_MAX}
            autoComplete="off"
            size={fieldSize}
          />
        ) : null}

        {charge.kind === 'discount' ? (
          <Text size="xs" c="dimmed">
            {t("A discount comes off the supplier's bill and lowers the cost of the stock.")}
          </Text>
        ) : (
          <ChoiceGroup label={t('Who asks for this money')} style={CHOICE_GRID}>
            {WHO.map((option) => (
              <ChoiceCard
                key={option.billedBy}
                label={option.label()}
                hint={option.hint()}
                selected={charge.billedBy === option.billedBy}
                allowed
                tall={isMobile}
                onSelect={() =>
                  onChange({
                    ...charge,
                    billedBy: option.billedBy,
                    payeeKey: option.billedBy === 'supplier' ? null : charge.payeeKey,
                  })
                }
              />
            ))}
          </ChoiceGroup>
        )}

        {charge.billedBy === 'third_party' ? (
          <ChargePayeeField
            value={charge.payeeKey}
            onChange={(payeeKey) => onChange({ ...charge, payeeKey })}
          />
        ) : null}

        {lineCount > 1 ? (
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              {t('How is it spread over the products?')}
            </Text>
            <ChoiceGroup label={t('Spread over the products')} style={CHOICE_GRID}>
              {SPREAD.map((option) => (
                <ChoiceCard
                  key={option.allocation}
                  label={option.label()}
                  hint={option.hint()}
                  selected={charge.allocation === option.allocation}
                  allowed
                  tall={isMobile}
                  onSelect={() => onChange({ ...charge, allocation: option.allocation })}
                />
              ))}
            </ChoiceGroup>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};
