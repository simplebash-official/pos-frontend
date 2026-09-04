import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { CalculatorModal } from './CalculatorModal';
import { CalculatorContext } from './CalculatorContext';
import type { OpenCalculatorOptions } from './types';

export interface CalculatorProviderProps {
  children: ReactNode;
}

export const CalculatorProvider = ({ children }: CalculatorProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenCalculatorOptions | null>(null);

  const openCalculator = useCallback((newOptions?: OpenCalculatorOptions) => {
    if (newOptions) {
      setOptions(newOptions);
    } else {
      setOptions(null);
    }
    setIsOpen(true);
  }, []);

  const closeCalculator = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCalculator = useCallback((newOptions?: OpenCalculatorOptions) => {
    setIsOpen((prev) => {
      if (!prev && newOptions) {
        setOptions(newOptions);
      }
      return !prev;
    });
  }, []);

  const handleSelectResult = useCallback(
    (value: string) => {
      if (options?.onSelectResult) {
        options.onSelectResult(value);
      }
      closeCalculator();
    },
    [options, closeCalculator]
  );

  const value = useMemo(
    () => ({
      isOpen,
      options,
      openCalculator,
      closeCalculator,
      toggleCalculator,
    }),
    [isOpen, options, openCalculator, closeCalculator, toggleCalculator]
  );

  return (
    <CalculatorContext.Provider value={value}>
      {children}
      <CalculatorModal
        opened={isOpen}
        onClose={closeCalculator}
        initialValue={options?.initialValue?.toString()}
        onSelectResult={options?.onSelectResult ? handleSelectResult : undefined}
        title={options?.title}
      />
    </CalculatorContext.Provider>
  );
};
