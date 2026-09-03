import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { CalculatorModal } from './CalculatorModal';
import type { OpenCalculatorOptions, CalculatorContextType } from './types';

export interface ExtendedCalculatorContextType extends CalculatorContextType {
  toggleCalculator: (options?: OpenCalculatorOptions) => void;
}

const CalculatorContext = createContext<ExtendedCalculatorContextType | null>(null);

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

export const useGlobalCalculator = (): ExtendedCalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (!context) {
    // Graceful fallback if called outside CalculatorProvider (e.g. in isolated component tests)
    return {
      isOpen: false,
      options: null,
      openCalculator: () => {},
      closeCalculator: () => {},
      toggleCalculator: () => {},
    };
  }
  return context;
};
