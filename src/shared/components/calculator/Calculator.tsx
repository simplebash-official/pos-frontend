import { useState, useEffect, type CSSProperties } from 'react';
import { Stack, Group, Button, Collapse, Badge, Box, Paper } from '@mantine/core';
import { IconHistory, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useCalculator } from './useCalculator';
import { CalculatorDisplay } from './CalculatorDisplay';
import { CalculatorKeypad } from './CalculatorKeypad';
import { CalculatorHistory } from './CalculatorHistory';
import type { CalculatorProps } from './types';

export const Calculator = ({
  onSelectResult,
  initialValue,
  showHistory = true,
  className,
  style,
}: CalculatorProps) => {
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    state,
    activeKey,
    inputDigit,
    inputDecimal,
    setOperator,
    calculate,
    toggleSign,
    inputPercent,
    backspace,
    clear,
    copyResult,
    recallHistory,
    clearHistory,
    handleKeyDown,
  } = useCalculator(initialValue);

  // Global keydown listener when the calculator is active
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleUseResult = () => {
    if (onSelectResult && !state.hasError && state.display !== 'Error') {
      onSelectResult(state.display);
    }
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: 380,
    margin: '0 auto',
    userSelect: 'none',
    ...style,
  };

  return (
    <Box className={className} style={containerStyle}>
      <Stack gap="xs">
        {/* Main calculation display */}
        <CalculatorDisplay
          expression={state.expression}
          display={state.display}
          hasError={state.hasError}
          onCopy={copyResult}
        />

        {/* Action bar: History toggle & optional Select/Insert button */}
        {showHistory && (
          <Group justify="space-between" align="center" gap="xs">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              leftSection={<IconHistory size={14} />}
              rightSection={
                historyOpen ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />
              }
              onClick={() => setHistoryOpen((prev) => !prev)}
              styles={{
                root: { paddingLeft: 6, paddingRight: 8 },
              }}
            >
              {t('History')}
              {state.history.length > 0 && (
                <Badge size="xs" variant="light" color="blue" ml={6}>
                  {state.history.length}
                </Badge>
              )}
            </Button>

            {onSelectResult && (
              <Button
                size="xs"
                variant="light"
                color="blue"
                onClick={handleUseResult}
                disabled={state.hasError || state.display === 'Error'}
              >
                {t('Use Value')}
              </Button>
            )}
          </Group>
        )}

        {/* Collapsible History Panel */}
        {showHistory && (
          <Collapse expanded={historyOpen}>
            <Paper p="xs" radius="md" withBorder bg="var(--bg-app)">
              <CalculatorHistory
                history={state.history}
                onRecall={(item) => {
                  recallHistory(item);
                  setHistoryOpen(false);
                }}
                onClear={clearHistory}
              />
            </Paper>
          </Collapse>
        )}

        {/* Keypad */}
        <CalculatorKeypad
          currentOperator={state.currentOperator}
          waitingForNewOperand={state.waitingForNewOperand}
          activeKey={activeKey}
          display={state.display}
          onDigit={inputDigit}
          onDecimal={inputDecimal}
          onOperator={setOperator}
          onCalculate={calculate}
          onToggleSign={toggleSign}
          onPercent={inputPercent}
          onBackspace={backspace}
          onClear={clear}
        />
      </Stack>
    </Box>
  );
};
