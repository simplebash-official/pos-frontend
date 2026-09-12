import { t } from '@/shared/i18n/t';
import { Group, ActionIcon, NumberInput, NumberInputProps, Box, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

export interface QuantityInputProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

const HEIGHT_MAP: Record<string, number> = {
  xs: 30,
  sm: 36,
  md: 42,
  lg: 50,
  xl: 60,
};

export const QuantityInput = ({
  value,
  onChange,
  min,
  max,
  placeholder = '0',
  label,
  style,
  className,
  size = 'sm',
  radius,
  inputRef,
  ...props
}: QuantityInputProps & { label?: string; style?: React.CSSProperties; className?: string }) => {
  const numericVal = typeof value === 'number' ? value : 0;

  const handleDecrement = () => {
    if (min === undefined || numericVal > min) {
      const next = numericVal - 1;
      onChange(min !== undefined ? Math.max(min, next) : next);
    }
  };

  const handleIncrement = () => {
    if (max === undefined || numericVal < max) {
      const next = typeof value === 'number' ? value + 1 : 1;
      onChange(max !== undefined ? Math.min(max, next) : next);
    }
  };

  const controlHeight = typeof size === 'string' && HEIGHT_MAP[size] ? HEIGHT_MAP[size] : 36;
  const iconSize = size === 'xs' ? 12 : 14;

  const borderRadiusStyle = radius
    ? typeof radius === 'number'
      ? `${radius}px`
      : `var(--mantine-radius-${radius}, var(--mantine-radius-default))`
    : 'var(--mantine-radius-default)';

  const handleChange = (val: string | number) => {
    if (val === '' || val === null || val === undefined) {
      onChange('');
      return;
    }
    let num = typeof val === 'number' ? val : Number(val);
    if (isNaN(num)) {
      onChange('');
      return;
    }
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    onChange(num);
  };

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
          backgroundColor: 'light-dark(#ffffff, var(--bg-card))',
          height: controlHeight,
          width: 'fit-content',
        }}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleDecrement}
          disabled={min !== undefined && numericVal <= min}
          aria-label={t('Decrease quantity')}
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
          ref={inputRef}
          variant="unstyled"
          hideControls
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          clampBehavior="strict"
          allowNegative={min !== undefined ? min < 0 : false}
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
          disabled={max !== undefined && numericVal >= max}
          aria-label={t('Increase quantity')}
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
};
