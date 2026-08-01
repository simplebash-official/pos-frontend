import { useState, forwardRef } from 'react';
import { Box, TextInput, TextInputProps, Text, UnstyledButton } from '@mantine/core';

import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface AmountInputProps extends Omit<TextInputProps, 'value' | 'onChange' | 'max'> {
  value: number | '';
  onChange: (value: number | '') => void;
  mode?: 'percentage' | 'amount';
  onModeChange?: (mode: 'percentage' | 'amount') => void;
  unitSymbol?: string;
  max?: number;
  maxAmount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  placeholder?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

const HEIGHT_MAP: Record<string, number> = {
  xs: 30,
  sm: 36,
  md: 42,
  lg: 48,
};

const BUTTON_WIDTH_MAP: Record<string, number> = {
  xs: 36,
  sm: 42,
  md: 48,
  lg: 54,
};

const FONT_SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
};

const PADDING_MAP: Record<string, number> = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
};

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      value,
      onChange,
      mode = 'amount',
      onModeChange,
      unitSymbol = 'Rs.',
      max,
      maxAmount,
      size = 'sm',
      placeholder = '0',
      autoFocus,
      style,
      styles,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const isMobile = useIsMobile();
    const isPercent = mode === 'percentage';

    const effectiveMax = max !== undefined ? max : isPercent ? 100 : maxAmount;

    const [localVal, setLocalVal] = useState<string>(value === '' ? '' : value.toString());
    const [prevValue, setPrevValue] = useState(value);

    if (value !== prevValue) {
      setPrevValue(value);
      setLocalVal(value === '' ? '' : value.toString());
    }

    const controlHeight = HEIGHT_MAP[size] || 36;
    const buttonWidth = BUTTON_WIDTH_MAP[size] || 42;

    const handleToggleMode = () => {
      if (!onModeChange) return;
      const nextMode = isPercent ? 'amount' : 'percentage';
      onModeChange(nextMode);

      if (typeof value === 'number') {
        const nextMax = nextMode === 'percentage' ? 100 : max !== undefined ? max : maxAmount;
        if (nextMax !== undefined && value > nextMax) {
          onChange(nextMax);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.currentTarget.value;
      if (rawVal === '') {
        setLocalVal('');
        onChange('');
        return;
      }

      const digitsOnly = rawVal.replace(/[^0-9]/g, '');
      if (digitsOnly === '') return;

      let num = Number(digitsOnly);
      if (effectiveMax !== undefined && num > effectiveMax) {
        num = effectiveMax;
      }

      setLocalVal(num.toString());
      onChange(num);
    };

    const displaySymbol = isPercent ? '%' : unitSymbol;

    return (
      <Box
        style={{
          position: 'relative',
          height: controlHeight,
          width: '100%',
          minWidth: 110,
          borderRadius: 'var(--mantine-radius-default)',
          border: focused
            ? '1px solid var(--mantine-color-blue-5)'
            : '1px solid var(--mantine-color-default-border)',
          boxShadow: focused ? '0 0 0 1px var(--mantine-color-blue-5)' : undefined,
          backgroundColor: 'light-dark(#ffffff, var(--bg-card))',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
      >
        {/* Animated / Static Unit Badge (Rs. / %) */}
        <UnstyledButton
          onClick={handleToggleMode}
          tabIndex={-1}
          title={onModeChange ? 'Click to toggle mode' : undefined}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: buttonWidth,
            left: isPercent ? `calc(100% - ${buttonWidth}px)` : '0px',
            backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))',
            borderLeft: isPercent ? '1px solid var(--mantine-color-default-border)' : 'none',
            borderRight: !isPercent ? '1px solid var(--mantine-color-default-border)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onModeChange ? 'pointer' : 'default',
            userSelect: 'none',
            zIndex: 2,
            transition:
              'left 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s ease, border-color 0.15s ease',
          }}
        >
          <Text
            size={size === 'xs' ? 'xs' : 'sm'}
            fw={700}
            c={isPercent ? 'blue.6' : 'teal.6'}
            style={{ transition: 'color 0.2s ease' }}
          >
            {displaySymbol}
          </Text>
        </UnstyledButton>

        {/* Input Field Sliding Container */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: `calc(100% - ${buttonWidth}px)`,
            left: isPercent ? '0px' : `${buttonWidth}px`,
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TextInput
            ref={ref}
            variant="unstyled"
            size={size}
            value={localVal}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            style={{ width: '100%', height: '100%' }}
            styles={{
              input: {
                fontWeight: 600,
                height: '100%',
                paddingLeft: PADDING_MAP[size] || 10,
                paddingRight: PADDING_MAP[size] || 10,
                // Never below 16px on a phone: iOS Safari zooms the page when a smaller input takes
                // focus, and the user is then stranded at the wrong scale mid-tender.
                fontSize: isMobile
                  ? Math.max(16, FONT_SIZE_MAP[size] || 14)
                  : FONT_SIZE_MAP[size] || 14,
                fontFamily: 'var(--mantine-font-family)',
              },
              ...styles,
            }}
            {...props}
          />
        </Box>
      </Box>
    );
  }
);

AmountInput.displayName = 'AmountInput';
