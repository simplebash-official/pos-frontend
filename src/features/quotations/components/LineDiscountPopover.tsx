import { t } from '@/shared/i18n/t';
import { useState, useId } from 'react';
import {
  Popover,
  Stack,
  Group,
  Button,
  Text,
  NumberInput,
  Box,
  Divider,
} from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import {
  calculateLineDiscountCents,
  type LineDiscountScope,
  type LineDiscountType,
} from '../lib/quotationForm';

export interface LineDiscountPopoverProps {
  opened: boolean;
  onClose: () => void;
  targetName: string;
  unitPriceCents: number;
  quantity: number;
  currentDiscountType?: LineDiscountType;
  currentDiscountScope?: LineDiscountScope;
  currentDiscountValue?: number;
  currentDiscountCents: number;
  onApplyDiscount: (
    discountCents: number,
    discountType: LineDiscountType,
    discountScope: LineDiscountScope,
    discountValue: number
  ) => void;
  onRemoveDiscount: () => void;
  children: React.ReactNode;
}

const PERCENT_PRESETS = [5, 10, 15, 20, 25];

export const LineDiscountPopover = ({
  opened,
  onClose,
  targetName,
  unitPriceCents,
  quantity,
  currentDiscountType = 'percentage',
  currentDiscountScope = 'per_unit',
  currentDiscountValue,
  currentDiscountCents,
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
      : currentDiscountCents > 0
        ? currentDiscountCents
        : 0
  );

  const grossCents = Math.max(0, unitPriceCents * quantity);

  const previewDiscountCents =
    mode === 'percentage'
      ? calculateLineDiscountCents(
          unitPriceCents,
          quantity,
          'percentage',
          'total',
          typeof pct === 'number' ? pct : 0
        )
      : calculateLineDiscountCents(
          unitPriceCents,
          quantity,
          'fixed',
          quantity > 1 ? scope : 'total',
          fixedCents
        );

  const previewNetCents = Math.max(0, grossCents - previewDiscountCents);

  const handleApply = () => {
    if (mode === 'percentage') {
      const value = typeof pct === 'number' ? Math.min(100, Math.max(0, pct)) : 0;
      const computed = calculateLineDiscountCents(
        unitPriceCents,
        quantity,
        'percentage',
        'total',
        value
      );
      onApplyDiscount(computed, 'percentage', 'total', value);
    } else {
      const activeScope: LineDiscountScope = quantity > 1 ? scope : 'total';
      const computed = calculateLineDiscountCents(
        unitPriceCents,
        quantity,
        'fixed',
        activeScope,
        fixedCents
      );
      onApplyDiscount(computed, 'fixed', activeScope, fixedCents);
    }
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
              {quantity} × {formatMoney(unitPriceCents)} = {formatMoney(grossCents)} gross
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
                allowEmpty
                placeholder="Rs. 0.00"
                valueCents={fixedCents}
                onChangeCents={setFixedCents}
                max={
                  scope === 'per_unit' && quantity > 1
                    ? unitPriceCents / 100
                    : grossCents / 100
                }
                autoFocus
              />

              {scope === 'per_unit' && quantity > 1 && fixedCents > 0 && (
                <Text size="xs" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(fixedCents)} × {quantity} = {formatMoney(previewDiscountCents)}{' '}
                  {t('total discount')}
                </Text>
              )}
            </Stack>
          )}

          <Divider my={2} />

          {/* Live Calculation Preview */}
          <Box p={6} style={{ backgroundColor: 'var(--bg-hover)', borderRadius: 4 }}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {t('Discount amount')}:
              </Text>
              <Text size="xs" fw={700} c={previewDiscountCents > 0 ? 'red' : 'dimmed'}>
                {previewDiscountCents > 0 ? `-${formatMoney(previewDiscountCents)}` : 'Rs. 0.00'}
              </Text>
            </Group>
            <Group justify="space-between" mt={2}>
              <Text size="xs" fw={600}>
                {t('New line total')}:
              </Text>
              <Text size="xs" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(previewNetCents)}
              </Text>
            </Group>
          </Box>

          <Group justify="space-between" mt="xs">
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={handleRemove}
              disabled={currentDiscountCents === 0 && previewDiscountCents === 0}
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
