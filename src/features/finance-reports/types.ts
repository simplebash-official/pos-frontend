// Mirrors the backend's money report types (`domain/finance_reports.rs`). Every field is required
// unless the server leaves it out.
import type { AccountKind } from '@/features/money-accounts/types';

export type ReportGroup =
  | 'operating_expense'
  | 'purchases'
  | 'payroll'
  | 'owner_equity'
  | 'transfer'
  | 'liabilities'
  | 'other_income';

export interface CategoryTotal {
  categoryKey: string;
  categoryName: string;
  totalCents: number;
}

export interface ExpenseGroupTotal {
  group: ReportGroup;
  totalCents: number;
  categories: CategoryTotal[];
}

export interface ProfitLoss {
  from: string;
  to: string;
  salesCents: number;
  refundsCents: number;
  netSalesCents: number;
  costOfGoodsCents: number;
  grossProfitCents: number;
  otherIncome: CategoryTotal[];
  otherIncomeCents: number;
  expenses: ExpenseGroupTotal[];
  expensesCents: number;
  netProfitCents: number;
}

export interface MonthTotal {
  month: string;
  totalCents: number;
}

export interface CategoryBreakdown {
  categoryKey: string;
  categoryName: string;
  reportGroup: ReportGroup;
  totalCents: number;
  /** Share of the period's total cost, whole percent. */
  sharePercent: number;
  months: MonthTotal[];
}

/** One band of the monthly bar chart; the band for everything outside the biggest few has no name. */
export interface ChartSeries {
  name: string;
  isOther: boolean;
  months: MonthTotal[];
}

export interface ExpenseBreakdown {
  from: string;
  to: string;
  totalCents: number;
  categories: CategoryBreakdown[];
  chart: ChartSeries[];
  months: MonthTotal[];
}

export type CashFlowCode =
  | 'sales'
  | 'refunds'
  | 'other_income'
  | 'cash_added'
  | 'paid_out'
  | 'owner_withdrawals'
  | 'cash_to_bank_or_safe'
  | 'bank_deposits'
  | 'bank_withdrawals'
  | 'expense_payments';

export interface CashFlowLine {
  code: CashFlowCode;
  inCents: number;
  outCents: number;
}

export interface AccountCashFlow {
  kind: AccountKind;
  inCents: number;
  outCents: number;
  netCents: number;
  lines: CashFlowLine[];
}

export interface CashFlow {
  from: string;
  to: string;
  accounts: AccountCashFlow[];
}

export interface PayableBill {
  key: string;
  number: string;
  categoryName: string;
  payeeName?: string;
  amountCents: number;
  balanceCents: number;
  dueDate?: string;
  isOverdue: boolean;
}

export interface PayableSupplier {
  supplierKey: string;
  name: string;
  balanceCents: number;
}

export interface Payables {
  asOf: string;
  bills: PayableBill[];
  billsCents: number;
  overdueCents: number;
  suppliers: PayableSupplier[];
  suppliersCents: number;
  totalCents: number;
}

/** The days a report covers, `YYYY-MM-DD`, both included. */
export interface ReportPeriod {
  from: string;
  to: string;
}
