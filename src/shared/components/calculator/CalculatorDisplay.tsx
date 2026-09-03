import React, { useState } from 'react';
import { Box, Group, Text, Tooltip, ActionIcon, Paper } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';

export interface CalculatorDisplayProps {
  expression: string;
  display: string;
  hasError: boolean;
  isCalculated?: boolean;
  displayVersion?: number;
  errorVersion?: number;
  onCopy: () => void;
}

/**
 * Formats a display string with commas for readable digit grouping
 * without corrupting active user typing (like intermediate decimal points or negative sign).
 */
const formatDisplayNumber = (value: string): string => {
  if (value === 'Error' || isNaN(Number(value))) {
    return value;
  }

  // Split integer and decimal parts
  const isNegative = value.startsWith('-');
  const rawValue = isNegative ? value.slice(1) : value;
  const parts = rawValue.split('.');

  // Format integer part with commas
  const intPart = parts[0];
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const formatted = parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
  return isNegative ? `-${formatted}` : formatted;
};

export const CalculatorDisplay = ({
  expression,
  display,
  hasError,
  isCalculated = false,
  displayVersion = 0,
  errorVersion = 0,
  onCopy,
}: CalculatorDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formattedDisplay = formatDisplayNumber(display);

  // Dynamic font size depending on length
  const getFontSize = () => {
    const len = formattedDisplay.length;
    if (len > 14) return '1.25rem';
    if (len > 11) return '1.5rem';
    if (len > 8) return '1.85rem';
    return '2.15rem';
  };

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      key={errorVersion ? `error-${errorVersion}` : 'normal'}
      className={hasError ? 'calc-display-shake' : undefined}
      style={{
        backgroundColor: 'var(--bg-app)',
        borderColor: hasError ? 'var(--mantine-color-red-5)' : 'var(--border)',
        boxShadow: hasError
          ? '0 0 0 1px var(--mantine-color-red-5)'
          : 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        userSelect: 'none',
      }}
    >
      {/* Expression breadcrumbs */}
      <Group justify="space-between" align="center" gap="xs" h={20} wrap="nowrap">
        <Text
          size="xs"
          c="dimmed"
          key={`expr-${expression}`}
          className={expression ? 'calc-expression-animated' : undefined}
          style={{
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {expression || ' '}
        </Text>

        <Tooltip label={copied ? t('Copied!') : t('Copy Result')} position="top" withArrow>
          <ActionIcon
            size="xs"
            variant="subtle"
            color={copied ? 'teal' : 'gray'}
            onClick={handleCopyClick}
            disabled={hasError || display === 'Error'}
            aria-label={t('Copy Result')}
            style={{
              transition: 'color 150ms ease, background-color 150ms ease, transform 150ms ease',
            }}
          >
            {copied ? (
              <span className="calc-check-animated" style={{ display: 'inline-flex' }}>
                <IconCheck size={14} />
              </span>
            ) : (
              <IconCopy size={14} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Main Result / Number Display */}
      <Box mt={4} style={{ textAlign: 'right', overflow: 'hidden' }}>
        <Text
          fw={700}
          c={hasError ? 'red.6' : 'var(--text-primary)'}
          key={`disp-${displayVersion}-${display}`}
          className={
            isCalculated
              ? 'calc-result-animated'
              : displayVersion > 0
                ? 'calc-display-animated'
                : undefined
          }
          style={{
            fontSize: getFontSize(),
            lineHeight: 1.15,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.5px',
            wordBreak: 'break-all',
            transition: 'font-size 100ms ease, color 150ms ease',
          }}
        >
          {formattedDisplay}
        </Text>
      </Box>
    </Paper>
  );
};
