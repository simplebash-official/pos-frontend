export type CalculatorOperator = '+' | '-' | '×' | '÷';

export interface CalculatorHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  display: string;
  expression: string;
  previousValue: number | null;
  currentOperator: CalculatorOperator | null;
  waitingForNewOperand: boolean;
  hasError: boolean;
  history: CalculatorHistoryItem[];
}

export interface CalculatorProps {
  /** Optional callback fired when a calculation completes or when result is copied/used */
  onSelectResult?: (value: string) => void;
  /** Optional initial value to pre-fill in calculator */
  initialValue?: string;
  /** Show/hide calculation history panel (default true) */
  showHistory?: boolean;
  /** Custom class name or style */
  className?: string;
  style?: React.CSSProperties;
}
