import { useState, useCallback } from 'react';

import { notifications } from '@mantine/notifications';
import type { CalculatorOperator, CalculatorHistoryItem, CalculatorState } from './types';

const STORAGE_KEY = 'myrologic_calculator_history';
const MAX_HISTORY_ITEMS = 25;

/**
 * Strips floating point arithmetic inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004 -> 0.3).
 * Limits output to max 10 decimal digits without unnecessary trailing zeros.
 */
export const formatNumberSafe = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) {
    return 'Error';
  }
  // Convert with high precision, then parse back to eliminate artifacts
  const rounded = Number(num.toPrecision(12));
  // Round to 10 decimal places to eliminate tiny binary fractions
  const fixed = Number(rounded.toFixed(10));
  return fixed.toString();
};

const performOperation = (
  a: number,
  b: number,
  operator: CalculatorOperator
): { result: number | null; error?: string } => {
  switch (operator) {
    case '+':
      return { result: a + b };
    case '-':
      return { result: a - b };
    case '×':
      return { result: a * b };
    case '÷':
      if (b === 0) {
        return { result: null, error: 'Cannot divide by 0' };
      }
      return { result: a / b };
    default:
      return { result: b };
  }
};

export const useCalculator = (initialValue?: string) => {
  const [state, setState] = useState<CalculatorState>(() => {
    let savedHistory: CalculatorHistoryItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedHistory = JSON.parse(stored);
      }
    } catch {
      // Ignore JSON parse errors
    }

    const startDisplay = initialValue && !isNaN(Number(initialValue)) ? initialValue : '0';

    return {
      display: startDisplay,
      expression: '',
      previousValue: null,
      currentOperator: null,
      waitingForNewOperand: false,
      hasError: false,
      history: savedHistory,
      isCalculated: false,
      displayVersion: 0,
      errorVersion: 0,
    };
  });

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Sync initialValue when dynamically provided or changed externally
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    if (initialValue !== undefined && initialValue !== '' && !isNaN(Number(initialValue))) {
      setState((prev) => ({
        ...prev,
        display: initialValue,
        expression: '',
        previousValue: null,
        currentOperator: null,
        waitingForNewOperand: false,
        hasError: false,
        isCalculated: false,
        displayVersion: (prev.displayVersion || 0) + 1,
      }));
    }
  }

  // Synchronize history to local storage
  const saveHistory = useCallback((item: CalculatorHistoryItem) => {
    setState((prev) => {
      const nextHistory = [item, ...prev.history.filter((h) => h.id !== item.id)].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      } catch {
        // Storage might be unavailable
      }
      return { ...prev, history: nextHistory };
    });
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  const inputDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.hasError) {
        return {
          ...prev,
          display: digit,
          hasError: false,
          expression: '',
          previousValue: null,
          currentOperator: null,
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      if (prev.waitingForNewOperand) {
        return {
          ...prev,
          display: digit === '00' ? '0' : digit,
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      if (prev.display === '0') {
        if (digit === '00' || digit === '0') {
          return prev;
        }
        return {
          ...prev,
          display: digit,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      // Max 16 characters on display
      if (prev.display.replace('-', '').length >= 16) {
        return prev;
      }

      return {
        ...prev,
        display: prev.display + digit,
        isCalculated: false,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) {
        return {
          ...prev,
          display: '0.',
          hasError: false,
          expression: '',
          previousValue: null,
          currentOperator: null,
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      if (prev.waitingForNewOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      if (!prev.display.includes('.')) {
        return {
          ...prev,
          display: prev.display + '.',
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      return prev;
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState((prev) => {
      if (prev.hasError || prev.display === '0') return prev;

      const nextDisplay = prev.display.startsWith('-') ? prev.display.slice(1) : '-' + prev.display;

      return {
        ...prev,
        display: nextDisplay,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, []);

  const inputPercent = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;

      const current = parseFloat(prev.display);
      if (isNaN(current)) return prev;

      let resultValue: number;
      // Contextual percentage: if we already have an active operator (+ or -)
      if (
        prev.previousValue !== null &&
        (prev.currentOperator === '+' || prev.currentOperator === '-')
      ) {
        // e.g. 200 + 10% -> 200 + (200 * 0.10)
        const percentPortion = prev.previousValue * (current / 100);
        resultValue = percentPortion;
      } else {
        // Standalone or multiplicative percent: e.g. 50% -> 0.5
        resultValue = current / 100;
      }

      const formatted = formatNumberSafe(resultValue);
      return {
        ...prev,
        display: formatted,
        waitingForNewOperand: false,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, []);

  const backspace = useCallback(() => {
    setState((prev) => {
      if (prev.hasError || prev.waitingForNewOperand) {
        return {
          ...prev,
          display: '0',
          hasError: false,
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      if (prev.display.length <= 1 || (prev.display.length === 2 && prev.display.startsWith('-'))) {
        return {
          ...prev,
          display: '0',
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      return {
        ...prev,
        display: prev.display.slice(0, -1),
        isCalculated: false,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((prev) => {
      // If display is not 0, clear display first (like 'C')
      if (prev.display !== '0' && !prev.hasError && !prev.waitingForNewOperand) {
        return {
          ...prev,
          display: '0',
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
        };
      }

      // Full reset (like 'AC')
      return {
        ...prev,
        display: '0',
        expression: '',
        previousValue: null,
        currentOperator: null,
        waitingForNewOperand: false,
        hasError: false,
        isCalculated: false,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, []);

  const setOperator = useCallback((operator: CalculatorOperator) => {
    setState((prev) => {
      if (prev.hasError) return prev;

      const inputValue = parseFloat(prev.display);

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: inputValue,
          currentOperator: operator,
          expression: `${prev.display} ${operator}`,
          waitingForNewOperand: true,
          isCalculated: false,
        };
      }

      // If user clicks another operator right after one without entering new digits, just switch operator
      if (prev.waitingForNewOperand && prev.currentOperator) {
        return {
          ...prev,
          currentOperator: operator,
          expression: `${formatNumberSafe(prev.previousValue)} ${operator}`,
        };
      }

      // Chain calculation: calculate previous result and chain next operator
      const { result, error } = performOperation(
        prev.previousValue,
        inputValue,
        prev.currentOperator!
      );

      if (error || result === null) {
        return {
          ...prev,
          hasError: true,
          display: error || 'Error',
          expression: '',
          previousValue: null,
          currentOperator: null,
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
          errorVersion: (prev.errorVersion || 0) + 1,
        };
      }

      const formatted = formatNumberSafe(result);
      return {
        ...prev,
        display: formatted,
        previousValue: result,
        currentOperator: operator,
        expression: `${formatted} ${operator}`,
        waitingForNewOperand: true,
        isCalculated: false,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, []);

  const calculate = useCallback(() => {
    setState((prev) => {
      if (prev.hasError || prev.currentOperator === null || prev.previousValue === null) {
        return prev;
      }

      const currentValue = parseFloat(prev.display);
      const { result, error } = performOperation(
        prev.previousValue,
        currentValue,
        prev.currentOperator
      );

      if (error || result === null) {
        return {
          ...prev,
          hasError: true,
          display: error || 'Error',
          expression: `${formatNumberSafe(prev.previousValue)} ${prev.currentOperator} ${prev.display} =`,
          previousValue: null,
          currentOperator: null,
          waitingForNewOperand: false,
          isCalculated: false,
          displayVersion: (prev.displayVersion || 0) + 1,
          errorVersion: (prev.errorVersion || 0) + 1,
        };
      }

      const formattedResult = formatNumberSafe(result);
      const completedExpression = `${formatNumberSafe(prev.previousValue)} ${prev.currentOperator} ${prev.display} =`;

      // Save to history
      saveHistory({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        expression: completedExpression,
        result: formattedResult,
        timestamp: Date.now(),
      });

      return {
        ...prev,
        display: formattedResult,
        expression: completedExpression,
        previousValue: null,
        currentOperator: null,
        waitingForNewOperand: true,
        hasError: false,
        isCalculated: true,
        displayVersion: (prev.displayVersion || 0) + 1,
      };
    });
  }, [saveHistory]);

  const recallHistory = useCallback((item: CalculatorHistoryItem) => {
    setState((prev) => ({
      ...prev,
      display: item.result,
      expression: `Ans (${item.expression})`,
      previousValue: null,
      currentOperator: null,
      waitingForNewOperand: true,
      hasError: false,
      isCalculated: true,
      displayVersion: (prev.displayVersion || 0) + 1,
    }));
  }, []);

  const copyResult = useCallback(() => {
    if (state.hasError || state.display === 'Error') return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(state.display);
      notifications.show({
        title: 'Copied to clipboard',
        message: `${state.display} is ready to paste`,
        color: 'teal',
        autoClose: 2000,
      });
    }
  }, [state.display, state.hasError]);

  // Visual active key flash for physical keyboard events
  const triggerKeyVisual = useCallback((key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 120);
  }, []);

  // Keyboard handler for when the calculator is active/focused
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        triggerKeyVisual(key);
        inputDigit(key);
      } else if (key === '.' || key === ',') {
        e.preventDefault();
        triggerKeyVisual('.');
        inputDecimal();
      } else if (key === '+') {
        e.preventDefault();
        triggerKeyVisual('+');
        setOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        triggerKeyVisual('-');
        setOperator('-');
      } else if (key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        triggerKeyVisual('×');
        setOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        triggerKeyVisual('÷');
        setOperator('÷');
      } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        triggerKeyVisual('=');
        calculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        triggerKeyVisual('⌫');
        backspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        triggerKeyVisual('AC');
        clear();
      } else if (key === '%') {
        e.preventDefault();
        triggerKeyVisual('%');
        inputPercent();
      }
    },
    [
      triggerKeyVisual,
      inputDigit,
      inputDecimal,
      setOperator,
      calculate,
      backspace,
      clear,
      inputPercent,
    ]
  );

  return {
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
  };
};
