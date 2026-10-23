import type { CashMovementType, CashReportGroup, PeriodPayment } from '@/features/billing/types';

/** Where the money for a cost comes from. `drawer` is never entered here; those rows come from cash movements. */
export type PaidFrom = 'drawer' | 'bank' | 'card' | 'online' | 'unpaid';

export type ExpenseStatus = 'unpaid' | 'part_paid' | 'paid';

/** `ledger` rows are entered on the Expenses page; `drawer` rows are cash movements read from the drawer. */
export type ExpenseSource = 'ledger' | 'drawer';

export interface ExpenseRow {
  key: string;
  source: ExpenseSource;
  number: string;
  date: string;
  categoryKey: string;
  categoryName: string;
  reportGroup: CashReportGroup;
  payeeKey?: string;
  payeeName?: string;
  amountCents: number;
  paidCents: number;
  balanceCents: number;
  status: ExpenseStatus;
  paidFrom: PaidFrom;
  dueDate?: string;
  /** First day of the period a drawer payment covers, when it names one. */
  periodStart?: string;
  isOverdue: boolean;
  referenceNo?: string;
  note?: string;
  movementType?: CashMovementType;
  recordedByNameSnapshot: string;
  createdAt: string;
}

export interface ExpensePayment {
  id: string;
  key: string;
  expenseKey: string;
  amountCents: number;
  paidFrom: PaidFrom;
  paidOn: string;
  referenceNo?: string;
  note?: string;
  recordedByNameSnapshot: string;
  createdAt: string;
}

export interface ExpenseDetail {
  expense: ExpenseRow;
  payments: ExpensePayment[];
}

export interface ExpenseStats {
  thisMonthCents: number;
  thisMonthDrawerCents: number;
  unpaidCents: number;
  unpaidCount: number;
  overdueCents: number;
  overdueCount: number;
}

export interface ExpenseListQuery {
  search?: string;
  categoryKey?: string;
  payeeKey?: string;
  status?: 'unpaid' | 'overdue' | 'paid';
  source?: ExpenseSource;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseListResponse {
  expenses: ExpenseRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateExpenseInput {
  expenseDate: string;
  categoryKey: string;
  payeeKey?: string;
  payeeName?: string;
  amountCents: number;
  paidFrom: Exclude<PaidFrom, 'drawer'>;
  dueDate?: string;
  referenceNo?: string;
  note?: string;
}

export interface CreateExpensePaymentInput {
  amountCents: number;
  paidFrom: Extract<PaidFrom, 'bank' | 'card' | 'online'>;
  paidOn: string;
  referenceNo?: string;
  note?: string;
}

/** A regular bill: what the shop usually pays every month. */
export interface RecurringExpense {
  id: string;
  key: string;
  categoryKey: string;
  categoryName: string;
  payeeKey?: string;
  payeeName?: string;
  amountCents: number;
  /** Day of the month it falls due, 1 to 31. */
  dueDay: number;
  remindDaysBefore: number;
  /** Where it is usually paid from. */
  paidFrom: Extract<PaidFrom, 'drawer' | 'bank' | 'card' | 'online'>;
  note?: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type BillStatus = 'upcoming' | 'due' | 'overdue' | 'paid';

/** A regular bill with where it stands for the month that needs attention. */
export interface RecurringBill {
  template: RecurringExpense;
  /** `YYYY-MM`. */
  period: string;
  dueDate: string;
  /** Negative once overdue. */
  daysUntilDue: number;
  paidCents: number;
  balanceCents: number;
  status: BillStatus;
  payments: PeriodPayment[];
}

export interface CreateRecurringExpenseInput {
  categoryKey: string;
  payeeKey?: string;
  amountCents: number;
  dueDay: number;
  remindDaysBefore: number;
  paidFrom: RecurringExpense['paidFrom'];
  note?: string;
}

export interface UpdateRecurringExpenseInput {
  amountCents?: number;
  dueDay?: number;
  remindDaysBefore?: number;
  paidFrom?: RecurringExpense['paidFrom'];
  note?: string;
  active?: boolean;
}
