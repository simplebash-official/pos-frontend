import type { CSSProperties, ReactNode } from 'react';
import { SimpleGrid, UnstyledButton } from '@mantine/core';
import { IconBackspace } from '@tabler/icons-react';
import type { CalculatorOperator } from './types';

export interface CalculatorKeypadProps {
  currentOperator: CalculatorOperator | null;
  waitingForNewOperand: boolean;
  activeKey: string | null;
  display: string;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: CalculatorOperator) => void;
  onCalculate: () => void;
  onToggleSign: () => void;
  onPercent: () => void;
  onBackspace: () => void;
  onClear: () => void;
}

export const CalculatorKeypad = ({
  currentOperator,
  waitingForNewOperand,
  activeKey,
  display,
  onDigit,
  onDecimal,
  onOperator,
  onCalculate,
  onToggleSign,
  onPercent,
  onBackspace,
  onClear,
}: CalculatorKeypadProps) => {
  const isClearAll = display === '0';

  const isOpActive = (op: CalculatorOperator) => currentOperator === op && waitingForNewOperand;

  const btnBaseStyle: CSSProperties = {
    height: 50,
    fontSize: '1.05rem',
    border: '1px solid var(--border)',
  };

  const renderKey = (
    label: ReactNode,
    keyIdentifier: string,
    onClick: () => void,
    variantType: 'number' | 'operator' | 'function' | 'equals',
    highlightActive = false
  ) => {
    const isPressed = activeKey === keyIdentifier;

    let bg = 'var(--bg-card)';
    let color = 'var(--text-primary)';
    let border = '1px solid var(--border)';
    let extraClass = '';

    if (variantType === 'number') {
      bg = isPressed ? 'var(--bg-active)' : 'var(--bg-card)';
      color = 'var(--text-primary)';
    } else if (variantType === 'function') {
      bg = isPressed ? 'var(--border-strong)' : 'var(--bg-active)';
      color = 'var(--text-primary)';
      border = '1px solid var(--border)';
    } else if (variantType === 'operator') {
      const isSelected = highlightActive || isPressed;
      bg = isSelected
        ? 'var(--mantine-color-blue-filled)'
        : 'light-dark(var(--mantine-color-blue-0), rgba(34, 139, 230, 0.15))';
      color = isSelected ? '#FFFFFF' : 'var(--mantine-color-blue-6)';
      border = isSelected ? '1px solid var(--mantine-color-blue-6)' : '1px solid var(--border)';
      if (highlightActive) {
        extraClass = 'calc-key-op-active';
      }
    } else if (variantType === 'equals') {
      extraClass = 'calc-key-equals';
    }

    const classNames = ['calc-key', isPressed ? 'calc-key-pressed' : '', extraClass]
      .filter(Boolean)
      .join(' ');

    return (
      <UnstyledButton
        key={keyIdentifier}
        onClick={onClick}
        className={classNames}
        aria-label={typeof label === 'string' ? label : keyIdentifier}
        style={{
          ...btnBaseStyle,
          ...(variantType !== 'equals' ? { backgroundColor: bg, color, border } : {}),
          boxShadow:
            variantType === 'equals'
              ? undefined
              : isPressed
                ? 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                : '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {label}
      </UnstyledButton>
    );
  };

  return (
    <SimpleGrid cols={4} spacing="xs">
      {/* Row 1 */}
      {renderKey(isClearAll ? 'AC' : 'C', 'AC', onClear, 'function')}
      {renderKey('±', '±', onToggleSign, 'function')}
      {renderKey('%', '%', onPercent, 'function')}
      {renderKey('÷', '÷', () => onOperator('÷'), 'operator', isOpActive('÷'))}

      {/* Row 2 */}
      {renderKey('7', '7', () => onDigit('7'), 'number')}
      {renderKey('8', '8', () => onDigit('8'), 'number')}
      {renderKey('9', '9', () => onDigit('9'), 'number')}
      {renderKey('×', '×', () => onOperator('×'), 'operator', isOpActive('×'))}

      {/* Row 3 */}
      {renderKey('4', '4', () => onDigit('4'), 'number')}
      {renderKey('5', '5', () => onDigit('5'), 'number')}
      {renderKey('6', '6', () => onDigit('6'), 'number')}
      {renderKey('-', '-', () => onOperator('-'), 'operator', isOpActive('-'))}

      {/* Row 4 */}
      {renderKey('1', '1', () => onDigit('1'), 'number')}
      {renderKey('2', '2', () => onDigit('2'), 'number')}
      {renderKey('3', '3', () => onDigit('3'), 'number')}
      {renderKey('+', '+', () => onOperator('+'), 'operator', isOpActive('+'))}

      {/* Row 5 */}
      {renderKey('0', '0', () => onDigit('0'), 'number')}
      {renderKey('.', '.', onDecimal, 'number')}
      {renderKey(<IconBackspace size={18} />, '⌫', onBackspace, 'function')}
      {renderKey('=', '=', onCalculate, 'equals')}
    </SimpleGrid>
  );
};
