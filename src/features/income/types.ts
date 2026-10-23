import type { CashReportGroup } from '@/features/billing/types';

/** Where money was received. `drawer` is never entered here; those rows come from cash movements. */
export type ReceivedInto = 'drawer' | 'bank' | 'card' | 'online';

/** `ledger` rows are entered on the Income page; `drawer` rows are cash movements read from the drawer. */
export type IncomeSource = 'ledger' | 'drawer';

export interface IncomeRow {
  key: string;
  source: IncomeSource;
  number: string;
  date: string;
  categoryKey: string;
  categoryName: string;
  reportGroup: CashReportGroup;
  payeeKey?: string;
  payeeName?: string;
  amountCents: number;
  receivedInto: ReceivedInto;
  referenceNo?: string;
  note?: string;
  recordedByNameSnapshot: string;
  createdAt: string;
}

export interface IncomeStats {
  thisMonthCents: number;
  thisMonthDrawerCents: number;
  lastMonthCents: number;
}

export interface IncomeListQuery {
  search?: string;
  categoryKey?: string;
  payeeKey?: string;
  source?: IncomeSource;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface IncomeListResponse {
  incomes: IncomeRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateIncomeInput {
  incomeDate: string;
  categoryKey: string;
  payeeKey?: string;
  payeeName?: string;
  amountCents: number;
  receivedInto: Exclude<ReceivedInto, 'drawer'>;
  referenceNo?: string;
  note?: string;
}
