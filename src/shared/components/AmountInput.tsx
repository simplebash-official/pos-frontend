import { useState, useRef, useLayoutEffect, forwardRef } from 'react';
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

    // `transform: translateX(N%)` resolves against the badge's own box, not the
    // parent, so the parent's rendered width has to be measured to slide the
    // badge/input by a pixel offset instead of animating the layout-triggering
    // `left` property.
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateWidth = () => {
        const width = el.clientWidth;
        setContainerWidth((prev) => (prev === width ? prev : width));
      };

      updateWidth();

      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(el);
      return () => resizeObserver.disconnect();
    }, []);

    const effectiveMax = max !== undefined ? max : isPercent ? 100 : maxAmount;

    const formatForDisplay = (val: number | ''): string => {
      if (val === '') return '';
      if (typeof val === 'number' && !isPercent) {
        return val % 1 === 0 ? val.toString() : val.toFixed(2);
      }
      return val.toString();
    };

    const [localVal, setLocalVal] = useState<string>(() => formatForDisplay(value));
    const [prevValue, setPrevValue] = useState(value);

    if (value !== prevValue) {
      setPrevValue(value);
      if (!focused) {
        setLocalVal(formatForDisplay(value));
      }
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

      // Allow digits and at most one decimal point with up to 2 decimal places
      let cleanVal = rawVal.replace(/[^0-9.]/g, '');
      const parts = cleanVal.split('.');
      if (parts.length > 2) {
        cleanVal = `${parts[0]}.${parts.slice(1).join('')}`;
      }
      if (parts.length === 2 && parts[1].length > 2) {
        cleanVal = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }

      if (cleanVal === '' || cleanVal === '.') {
        setLocalVal(cleanVal);
        return;
      }

      let num = parseFloat(cleanVal);
      if (isNaN(num)) return;

      if (effectiveMax !== undefined && num > effectiveMax) {
        num = effectiveMax;
        cleanVal = num.toString();
      }

      setLocalVal(cleanVal);
      onChange(num);
    };

    const handleBlur = () => {
      setFocused(false);
      if (localVal === '' || localVal === '.') {
        setLocalVal('');
        onChange('');
      } else {
        const num = parseFloat(localVal);
        if (!isNaN(num)) {
          setLocalVal(formatForDisplay(num));
        }
      }
    };

    const displaySymbol = isPercent ? '%' : unitSymbol;

    return (
      <Box
        ref={containerRef}
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
            left: 0,
            transform: `translateX(${isPercent ? containerWidth - buttonWidth : 0}px)`,
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
              'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s ease, border-color 0.15s ease',
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
            left: 0,
            transform: `translateX(${isPercent ? 0 : buttonWidth}px)`,
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
            onBlur={handleBlur}
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
