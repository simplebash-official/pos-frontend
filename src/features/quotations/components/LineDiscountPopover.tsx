import { t } from '@/shared/i18n/t';
import { useState, useId } from 'react';
import { Popover, Stack, Group, Button, Text, NumberInput, Box, Divider } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useCalc } from '@/shared/hooks/useCalc';
import { calcQuotation } from '../api/quotationsApi';
import type { LineDiscountScope, LineDiscountType } from '../lib/quotationForm';
import type { CalcQuotationRequest } from '../types';

export interface LineDiscountPopoverProps {
  opened: boolean;
  onClose: () => void;
  targetName: string;
  unitPriceCents: number;
  quantity: number;
  currentDiscountType?: LineDiscountType;
  currentDiscountScope?: LineDiscountScope;
  currentDiscountValue?: number;
  /** The discount as typed: the server works out what it comes to. */
  onApplyDiscount: (
    discountType: LineDiscountType,
    discountScope: LineDiscountScope,
    discountValue: number
  ) => void;
  onRemoveDiscount: () => void;
  children: React.ReactNode;
}

const PERCENT_PRESETS = [5, 10, 15, 20, 25];

/**
 * What the typed discount would come to, as the server works it out. Lives inside the open popover
 * so it only asks while someone is looking at it.
 */
const DiscountPreview = ({
  name,
  unitPriceCents,
  quantity,
  discount,
}: {
  name: string;
  unitPriceCents: number;
  quantity: number;
  discount: { type: LineDiscountType; scope: LineDiscountScope; value: number };
}) => {
  const request: CalcQuotationRequest = {
    customerKey: null,
    customerName: '',
    lines: [
      {
        key: 'preview',
        name,
        unitPriceCents,
        quantity,
        discount: discount.value > 0 ? discount : null,
      },
    ],
    orderDiscount: null,
    validUntil: '',
  };
  const { data } = useCalc('quotation', request, calcQuotation);
  const line = data === undefined ? null : data.lines[0];
  return (
    <Box p={6} style={{ backgroundColor: 'var(--bg-hover)', borderRadius: 4 }}>
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {t('Discount amount')}:
        </Text>
        <Text size="xs" fw={700} c={line !== null && line.discountCents > 0 ? 'red' : 'dimmed'}>
          {line === null
            ? ''
            : line.discountCents > 0
              ? `-${formatMoney(line.discountCents)}`
              : formatMoney(0)}
        </Text>
      </Group>
      <Group justify="space-between" mt={2}>
        <Text size="xs" fw={600}>
          {t('New line total')}:
        </Text>
        <Text size="xs" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {line === null ? '' : formatMoney(line.totalCents)}
        </Text>
      </Group>
    </Box>
  );
};

export const LineDiscountPopover = ({
  opened,
  onClose,
  targetName,
  unitPriceCents,
  quantity,
  currentDiscountType = 'percentage',
  currentDiscountScope = 'per_unit',
  currentDiscountValue,
  onApplyDiscount,
  onRemoveDiscount,
  children,
}: LineDiscountPopoverProps) => {
  const percentInputId = useId();
  const fixedInputId = useId();
  const [mode, setMode] = useState<LineDiscountType>(currentDiscountType);
  const [scope, setScope] = useState<LineDiscountScope>(
    quantity > 1 ? currentDiscountScope : 'total'
  );
  const [pct, setPct] = useState<number | ''>(
    currentDiscountType === 'percentage' && typeof currentDiscountValue === 'number'
      ? currentDiscountValue
      : ''
  );
  const [fixedCents, setFixedCents] = useState<number>(
    currentDiscountType === 'fixed' && typeof currentDiscountValue === 'number'
      ? currentDiscountValue
      : 0
  );

  // The discount as it stands in the box right now.
  const typed: { type: LineDiscountType; scope: LineDiscountScope; value: number } =
    mode === 'percentage'
      ? { type: 'percentage', scope: 'total', value: typeof pct === 'number' ? pct : 0 }
      : { type: 'fixed', scope: quantity > 1 ? scope : 'total', value: fixedCents };

  const handleApply = () => {
    onApplyDiscount(
      typed.type,
      typed.scope,
      typed.type === 'percentage' ? Math.min(100, Math.max(0, typed.value)) : typed.value
    );
    onClose();
  };

  const handleRemove = () => {
    onRemoveDiscount();
    onClose();
  };

  return (
    <Popover
      opened={opened}
      onChange={(open) => !open && onClose()}
      position="bottom"
      withArrow
      shadow="md"
    >
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown p="sm" style={{ width: 'min(320px, calc(100vw - 32px))' }}>
        <Stack gap="xs">
          <Box>
            <Text size="xs" fw={700} c="dimmed" lineClamp={1}>
              {t('Discount for')} {targetName}
            </Text>
            <Text size="xs" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {quantity} × {formatMoney(unitPriceCents)}
            </Text>
          </Box>

          <SegmentedToggle
            fullWidth
            size="xs"
            value={mode}
            onChange={(val) => setMode(val as LineDiscountType)}
            data={[
              { label: t('Percentage (%)'), value: 'percentage' },
              { label: t('Fixed (Rs.)'), value: 'fixed' },
            ]}
          />

          {mode === 'percentage' ? (
            <Stack gap={6}>
              <Group gap={4}>
                {PERCENT_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    size="compact-xs"
                    variant={pct === preset ? 'filled' : 'light'}
                    color="blue"
                    onClick={() => setPct(preset)}
                  >
                    {preset}%
                  </Button>
                ))}
              </Group>

              <NumberInput
                id={percentInputId}
                aria-label={t('Discount percentage')}
                placeholder="0%"
                size="sm"
                min={0}
                max={100}
                suffix="%"
                value={pct === 0 ? '' : pct}
                onChange={(val) => setPct(typeof val === 'number' ? val : '')}
                autoFocus
              />
            </Stack>
          ) : (
            <Stack gap={6}>
              {quantity > 1 && (
                <SegmentedToggle
                  fullWidth
                  size="xs"
                  value={scope}
                  onChange={(val) => setScope(val as LineDiscountScope)}
                  data={[
                    { label: t('Per item (each)'), value: 'per_unit' },
                    { label: t('Bulk total (line)'), value: 'total' },
                  ]}
                />
              )}

              <MoneyInput
                id={fixedInputId}
                aria-label={
                  scope === 'per_unit' && quantity > 1
                    ? t('Discount per item')
                    : t('Total line discount')
                }
                size="sm"
                placeholder="Rs. 0.00"
                valueCents={fixedCents}
                onChangeCents={setFixedCents}
                max={scope === 'per_unit' && quantity > 1 ? unitPriceCents / 100 : undefined}
                autoFocus
              />
            </Stack>
          )}

          <Divider my={2} />

          <DiscountPreview
            name={targetName}
            unitPriceCents={unitPriceCents}
            quantity={quantity}
            discount={typed}
          />

          <Group justify="space-between" mt="xs">
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={handleRemove}
              disabled={currentDiscountValue === undefined || currentDiscountValue <= 0}
            >
              {t('Remove')}
            </Button>
            <Button
              size="xs"
              color="blue"
              leftSection={<IconCheck size={14} />}
              onClick={handleApply}
            >
              {t('Apply Discount')}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
