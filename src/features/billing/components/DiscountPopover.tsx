import { useState } from 'react';
import { Popover, Stack, SegmentedControl, Group, Button, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';
import { AmountInput } from '@/shared/components/AmountInput';

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
      {/* 280px is wider than a small phone's viewport once the popover's own offset is counted. */}
      <Popover.Dropdown p="sm" style={{ width: 'min(280px, calc(100vw - 32px))' }}>
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed">
            Discount For: {targetName}
          </Text>

          <SegmentedControl
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
            maxAmount={Math.round(originalCents / 100)}
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
