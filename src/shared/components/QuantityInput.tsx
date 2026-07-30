import { Group, ActionIcon, NumberInput, NumberInputProps, Box, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

export interface QuantityInputProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const HEIGHT_MAP: Record<string, number> = {
  xs: 30,
  sm: 36,
  md: 42,
  lg: 50,
  xl: 60,
};

export function QuantityInput({
  value,
  onChange,
  min,
  max,
  label,
  style,
  className,
  size = 'sm',
  radius,
  ...props
}: QuantityInputProps & { label?: string; style?: React.CSSProperties; className?: string }) {
  const handleDecrement = () => {
    if (min === undefined || value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  const controlHeight = typeof size === 'string' && HEIGHT_MAP[size] ? HEIGHT_MAP[size] : 36;
  const iconSize = size === 'xs' ? 12 : 14;

  const borderRadiusStyle = radius
    ? typeof radius === 'number'
      ? `${radius}px`
      : `var(--mantine-radius-${radius}, var(--mantine-radius-default))`
    : 'var(--mantine-radius-default)';

  return (
    <Box style={{ width: 'fit-content', ...style }} className={className}>
      {label && (
        <Text size="xs" fw={500} mb={4} c="dimmed">
          {label}
        </Text>
      )}
      <Group
        gap={0}
        wrap="nowrap"
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: borderRadiusStyle,
          overflow: 'hidden',
          backgroundColor: 'var(--mantine-color-body)',
          height: controlHeight,
          width: 'fit-content',
        }}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleDecrement}
          disabled={min !== undefined && value <= min}
          aria-label="Decrease quantity"
          tabIndex={-1}
          style={{
            borderRadius: 0,
            height: '100%',
            width: controlHeight,
            border: 'none',
          }}
        >
          <IconMinus size={iconSize} />
        </ActionIcon>

        <NumberInput
          variant="unstyled"
          hideControls
          value={value}
          onChange={(val) => onChange(Number(val))}
          min={min}
          max={max}
          size={size}
          styles={{
            input: {
              textAlign: 'center',
              width: 44,
              height: '100%',
              fontWeight: 600,
              padding: 0,
            },
          }}
          {...props}
        />

        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          aria-label="Increase quantity"
          tabIndex={-1}
          style={{
            borderRadius: 0,
            height: '100%',
            width: controlHeight,
            border: 'none',
          }}
        >
          <IconPlus size={iconSize} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
