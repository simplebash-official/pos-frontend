import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Popover, Stack, Group, Button, Text } from '@mantine/core';
import { formatMoney, fromCents } from '@/shared/lib/money';
import type { CalcDiscount } from '../types';
import { AmountInput } from '@/shared/components/AmountInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';

export interface DiscountPopoverProps {
  opened: boolean;
  onClose: () => void;
  targetName: string;
  /** What the discount comes off, as the server worked it out; `null` until it has answered. */
  originalCents: number | null;
  /** The discount as typed now; `null` for none. */
  currentDiscount: CalcDiscount | null;
  /** The discount as typed: the server works out what it comes to. `null` removes it. */
  onApplyDiscount: (discount: CalcDiscount | null) => void;
  children: React.ReactNode;
}

export const DiscountPopover = ({
  opened,
  onClose,
  targetName,
  originalCents,
  currentDiscount,
  onApplyDiscount,
  children,
}: DiscountPopoverProps) => {
  const [mode, setMode] = useState<'percentage' | 'amount'>(
    currentDiscount !== null && currentDiscount.type === 'fixed' ? 'amount' : 'percentage'
  );
  const [val, setVal] = useState<number | ''>(
    currentDiscount === null
      ? ''
      : currentDiscount.type === 'fixed'
        ? fromCents(currentDiscount.value)
        : currentDiscount.value
  );

  const handleApply = () => {
    const num = typeof val === 'number' ? val : 0;
    onApplyDiscount(
      num > 0
        ? mode === 'percentage'
          ? { type: 'percentage', value: Math.min(100, num) }
          : { type: 'fixed', value: Math.round(num * 100) }
        : null
    );
    onClose();
  };

  const handleClear = () => {
    setVal('');
    onApplyDiscount(null);
    onClose();
  };

  return (
    <Popover
      opened={opened}
      onChange={(o) => !o && onClose()}
      position="bottom"
      withArrow
      shadow="md"
    >
      <Popover.Target>{children}</Popover.Target>
      {/* 280px is wider than a small phone's viewport once the popover's own offset is counted. */}
      <Popover.Dropdown p="sm" style={{ width: 'min(280px, calc(100vw - 32px))' }}>
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed">
            {t('Discount For:')} {targetName}
          </Text>

          <SegmentedToggle
            fullWidth
            size="xs"
            value={mode}
            onChange={(m) => {
              const nextMode = m as 'percentage' | 'amount';
              setMode(nextMode);
              if (nextMode === 'percentage' && typeof val === 'number' && val > 100) {
                setVal(100);
              }
            }}
            data={[
              { label: 'Percentage (%)', value: 'percentage' },
              { label: 'Amount (Rs.)', value: 'amount' },
            ]}
          />

          <AmountInput
            size="sm"
            mode={mode}
            onModeChange={setMode}
            value={val}
            onChange={setVal}
            maxAmount={originalCents === null ? undefined : fromCents(originalCents)}
            withCalculator
            autoFocus
          />

          <Text size="xs" c="dimmed">
            {t('Original:')} {originalCents === null ? '' : formatMoney(originalCents)}
          </Text>

          <Group justify="space-between" mt="xs">
            <Button size="xs" variant="subtle" color="red" onClick={handleClear}>
              {t('Remove')}
            </Button>
            <Button size="xs" color="blue" onClick={handleApply}>
              {t('Apply Discount')}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
