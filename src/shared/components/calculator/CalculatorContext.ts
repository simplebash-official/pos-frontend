import { createContext, useContext } from 'react';
import type { OpenCalculatorOptions, CalculatorContextType } from './types';

export interface ExtendedCalculatorContextType extends CalculatorContextType {
  toggleCalculator: (options?: OpenCalculatorOptions) => void;
}

export const CalculatorContext = createContext<ExtendedCalculatorContextType | null>(null);

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
