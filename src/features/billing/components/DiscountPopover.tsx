import { useState } from 'react';
import { Popover, Stack, SegmentedControl, NumberInput, Group, Button, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';

export interface DiscountPopoverProps {
  opened: boolean;
  onClose: () => void;
  targetName: string;
  originalCents: number;
  currentDiscountCents: number;
  onApplyDiscount: (discountCents: number) => void;
  children: React.ReactNode;
}

export function DiscountPopover({
  opened,
  onClose,
  targetName,
  originalCents,
  currentDiscountCents,
  onApplyDiscount,
  children,
}: DiscountPopoverProps) {
  const [mode, setMode] = useState<'percentage' | 'amount'>('percentage');
  const [val, setVal] = useState<number | ''>(
    currentDiscountCents > 0 ? Math.round(currentDiscountCents / 100) : ''
  );

  const handleApply = () => {
    const num = typeof val === 'number' ? val : 0;
    const computedCents =
      mode === 'percentage'
        ? Math.round((originalCents * Math.min(100, Math.max(0, num))) / 100)
        : Math.min(originalCents, Math.max(0, Math.round(num * 100)));

    onApplyDiscount(computedCents);
    onClose();
  };

  const handleClear = () => {
    setVal('');
    onApplyDiscount(0);
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
      <Popover.Dropdown p="sm" style={{ width: 280 }}>
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed">
            DISCOUNT FOR: {targetName.toUpperCase()}
          </Text>

          <SegmentedControl
            fullWidth
            size="xs"
            value={mode}
            onChange={(m) => setMode(m as 'percentage' | 'amount')}
            data={[
              { label: 'Percentage (%)', value: 'percentage' },
              { label: 'Amount (Rs.)', value: 'amount' },
            ]}
          />

          <NumberInput
            size="sm"
            placeholder={mode === 'percentage' ? 'e.g. 10%' : 'e.g. 500'}
            suffix={mode === 'percentage' ? '%' : undefined}
            prefix={mode === 'amount' ? 'Rs. ' : undefined}
            min={0}
            max={mode === 'percentage' ? 100 : Math.round(originalCents / 100)}
            value={val}
            onChange={(v) => setVal(typeof v === 'number' ? v : '')}
            autoFocus
          />

          <Text size="xs" c="dimmed">
            Original: {formatMoney(originalCents)}
          </Text>

          <Group justify="space-between" mt="xs">
            <Button size="xs" variant="subtle" color="red" onClick={handleClear}>
              Remove
            </Button>
            <Button size="xs" color="blue" onClick={handleApply}>
              Apply Discount
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
