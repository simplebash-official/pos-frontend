import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconPlus,
} from '@tabler/icons-react';
import { useCanSelfApprove } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { useCreateWarrantyCondition, useWarrantyConditions } from '../hooks/useClaims';
import {
  unclaimedUnits,
  withConditions,
  withDamage,
  type Damage,
  type IntakeState,
  type Story,
} from '../lib/claimIntake';
import type { Warranty } from '../types';
import { WarrantyStateDot } from './WarrantyStateDot';

const sectionLabel = (text: string, required = false) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
    {required && (
      <span aria-hidden style={{ color: 'var(--mantine-color-error)', marginInlineStart: 4 }}>
        *
      </span>
    )}
  </Text>
);

const DEFAULT_STARTER_CONDITIONS = [
  'Physical damage / cracks',
  'Liquid damage',
  'Seal broken',
  'Opened or tampered with',
];

/** The item's name, serial, customer, invoice and how many units are claimed already. */
export const ClaimItemSummary = ({ warranty }: { warranty: Warranty }) => {
  const isMultiUnit = warranty.quantity > 1;
  return (
    <Paper withBorder p="sm" bg="var(--bg-app)">
      <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
        <Box style={{ minWidth: 0 }}>
          <Text fw={700} lineClamp={2}>
            {warranty.itemName}
          </Text>
          <Text size="xs" c="dimmed" ff="monospace" style={{ overflowWrap: 'anywhere' }}>
            {warranty.serialNumber === undefined
              ? warranty.warrantyNumber
              : `${warranty.serialNumber} · ${warranty.warrantyNumber}`}
          </Text>
          <Text size="xs" c="dimmed">
            {warranty.customerName === undefined ? t('Walk-in customer') : warranty.customerName}
            {' · '}
            {warranty.invoiceNumber}
            {isMultiUnit && (
              <>
                {' · '}
                <Text
                  component="span"
                  fw={600}
                  c={(warranty.claimedQuantity ?? 0) > 0 ? 'orange' : 'dimmed'}
                >
                  {(warranty.claimedQuantity ?? 0) > 0
                    ? `${warranty.claimedQuantity} of ${warranty.quantity} ${t('units claimed')}`
                    : `${warranty.quantity} ${t('units covered')}`}
                </Text>
              </>
            )}
          </Text>
        </Box>
        <WarrantyStateDot state={warranty.state} size="xs" />
      </Group>
    </Paper>
  );
};

/** How many units are claimed, and the unit's own serial when the warranty names none. */
export const UnitsFields = ({
  warranty,
  quantity,
  serialNumber,
  onChange,
}: {
  warranty: Warranty;
  quantity: number;
  serialNumber: string;
  onChange: (next: { quantity: number; serialNumber: string }) => void;
}) => {
  const isMobile = useIsMobile();
  if (warranty.quantity <= 1) return null;
  const available = unclaimedUnits(warranty);
  return (
    <Group grow align="flex-start" gap="sm">
      <NumberInput
        label={t('Units to claim')}
        description={`${available} of ${warranty.quantity} ${t('units available to claim')}`}
        min={1}
        max={available}
        step={1}
        value={quantity}
        onChange={(val) =>
          onChange({
            quantity: typeof val === 'number' && val >= 1 ? Math.min(val, available) : 1,
            serialNumber,
          })
        }
        size={isMobile ? 'md' : 'sm'}
      />
      {warranty.serialNumber === undefined && (
        <TextInput
          label={t('Specific serial / IMEI (optional)')}
          placeholder={t('e.g. SN-098234')}
          description={t('If this unit has its own serial')}
          value={serialNumber}
          onChange={(event) => onChange({ quantity, serialNumber: event.currentTarget.value })}
          size={isMobile ? 'md' : 'sm'}
        />
      )}
    </Group>
  );
};

/** What is wrong, in the customer's words. */
export const IssueField = <T extends Story>({
  label,
  value,
  onChange,
  error,
  autoFocus,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  error: string | null;
  autoFocus: boolean;
}) => {
  const isMobile = useIsMobile();
  return (
    <Textarea
      label={label}
      withAsterisk
      placeholder={t('In the customer’s words, e.g. “Turns off after ten minutes”')}
      autosize
      minRows={3}
      maxLength={1000}
      value={value.issue}
      onChange={(event) => onChange({ ...value, issue: event.currentTarget.value })}
      error={error}
      size={isMobile ? 'md' : 'sm'}
      data-autofocus={autoFocus && !isMobile ? true : undefined}
    />
  );
};

/** The condition checklist: what staff can see on the item, plus any new condition to remember. */
export const ConditionsField = <T extends Story>({
  value,
  onChange,
  error,
}: {
  value: T;
  onChange: (next: T) => void;
  error: string | null;
}) => {
  const isMobile = useIsMobile();
  // Whoever can approve reviews the claim themselves, so these notes are for staff only.
  const selfApproves = useCanSelfApprove();
  const conditionsQuery = useWarrantyConditions();
  const createConditionMutation = useCreateWarrantyCondition();
  const [newConditionInput, setNewConditionInput] = useState('');
  const damageChoices: { damage: Damage; label: string; color: string }[] = [
    { damage: 'undamaged', label: t('Undamaged'), color: 'teal' },
    { damage: 'damaged', label: t('Has damage'), color: 'orange' },
  ];

  const availableOptions = useMemo(() => {
    const list: string[] = [];
    if (conditionsQuery.data && conditionsQuery.data.length > 0) {
      for (const item of conditionsQuery.data) {
        if (!list.includes(item.name)) list.push(item.name);
      }
    } else {
      for (const item of DEFAULT_STARTER_CONDITIONS) {
        if (!list.includes(item)) list.push(item);
      }
    }
    for (const item of value.conditions) {
      if (!list.includes(item)) list.push(item);
    }
    return list;
  }, [conditionsQuery.data, value.conditions]);

  const toggleCondition = (name: string) =>
    onChange(
      withConditions(
        value,
        value.conditions.includes(name)
          ? value.conditions.filter((c) => c !== name)
          : [...value.conditions, name]
      )
    );

  const handleAddCondition = () => {
    const trimmed = newConditionInput.trim();
    if (!trimmed) return;
    if (!value.conditions.includes(trimmed)) {
      onChange(withConditions(value, [...value.conditions, trimmed]));
      createConditionMutation.mutate(trimmed);
    }
    setNewConditionInput('');
  };

  return (
    <Stack gap="xs">
      {sectionLabel(t('Condition checklist'), true)}

      <Group gap="xs" grow data-invalid={error !== null ? 'true' : undefined}>
        {damageChoices.map(({ damage, label, color }) => {
          const isChosen = value.damage === damage;
          return (
            <Button
              key={damage}
              type="button"
              variant={isChosen ? 'light' : 'default'}
              color={isChosen ? color : 'gray'}
              leftSection={
                damage === 'undamaged' ? (
                  <IconCircleCheck size={18} />
                ) : (
                  <IconAlertTriangle size={18} />
                )
              }
              radius="md"
              aria-pressed={isChosen}
              onClick={() => onChange(withDamage(value, damage))}
              style={{
                minHeight: isMobile ? 44 : 40,
                borderColor: isChosen ? `var(--mantine-color-${color}-filled)` : undefined,
                fontWeight: isChosen ? 600 : 500,
              }}
            >
              {label}
            </Button>
          );
        })}
      </Group>
      {error !== null && (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      )}

      {value.damage === 'damaged' && (
        <>
          <Group gap="xs" wrap="wrap">
            {availableOptions.map((name) => {
              const isSelected = value.conditions.includes(name);
              return (
                <Button
                  key={name}
                  type="button"
                  size="xs"
                  variant={isSelected ? 'light' : 'default'}
                  color={isSelected ? 'orange' : 'gray'}
                  leftSection={isSelected ? <IconCheck size={14} /> : undefined}
                  onClick={() => toggleCondition(name)}
                  style={{
                    minHeight: 36,
                    borderColor: isSelected ? 'var(--mantine-color-orange-filled)' : undefined,
                    fontWeight: isSelected ? 600 : 500,
                  }}
                >
                  {t(name)}
                </Button>
              );
            })}
          </Group>

          <TextInput
            placeholder={t('+ Add new condition (e.g. Scratched lens) and press Enter')}
            value={newConditionInput}
            onChange={(event) => setNewConditionInput(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddCondition();
              }
            }}
            rightSection={
              newConditionInput.trim() ? (
                <ActionIcon
                  size="sm"
                  variant="light"
                  color="blue"
                  onClick={handleAddCondition}
                  aria-label={t('Add condition')}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              ) : null
            }
            size={isMobile ? 'md' : 'sm'}
          />

          {!selfApproves &&
            (value.conditions.length > 0 ? (
              <Alert color="orange" icon={<IconAlertTriangle size={16} />} p="xs">
                {t(
                  'This may mean the warranty does not cover the fault. Selecting an item flags the claim for manager review during inspection, rather than auto-rejecting it.'
                )}
              </Alert>
            ) : (
              <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />} p="xs">
                {t(
                  'Ticking any item flags the claim for manager review during inspection; it does not automatically reject the claim.'
                )}
              </Alert>
            ))}
        </>
      )}
    </Stack>
  );
};

/** The item, what is wrong with it, and what staff can see on it. */
export const ClaimIntakeFields = ({
  warranty,
  value,
  onChange,
  issueError,
  damageError,
}: {
  warranty: Warranty;
  value: IntakeState;
  onChange: (next: IntakeState) => void;
  issueError: string | null;
  damageError: string | null;
}) => (
  <Stack gap="md">
    <ClaimItemSummary warranty={warranty} />
    <UnitsFields
      warranty={warranty}
      quantity={value.quantity}
      serialNumber={value.serialNumber}
      onChange={(units) => onChange({ ...value, ...units })}
    />
    <IssueField
      label={t('What is wrong with it?')}
      value={value}
      onChange={onChange}
      error={issueError}
      autoFocus
    />
    <ConditionsField value={value} onChange={onChange} error={damageError} />
  </Stack>
);
