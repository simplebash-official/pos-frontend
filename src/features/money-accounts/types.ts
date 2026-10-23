/** One of the shop's money accounts. */
export type AccountKind = 'drawer' | 'bank' | 'card' | 'online';

/** What moved through an account since its opening day; a line that cannot happen to a kind is 0. */
export interface AccountActivity {
  salesCents: number;
  refundsCents: number;
  incomeCents: number;
  expensesCents: number;
  depositsCents: number;
  withdrawalsCents: number;
}

export interface AccountSummary {
  kind: AccountKind;
  /** Absent for the drawer and for an account not set up yet. */
  openingBalanceCents?: number;
  /** `YYYY-MM-DD`: activity from this day on counts. */
  asOfDate?: string;
  /** Absent until an opening balance is set (the drawer always has one). */
  balanceCents?: number;
  activity?: AccountActivity;
}

export interface AccountsResponse {
  accounts: AccountSummary[];
}

export interface SetAccountOpeningInput {
  openingBalanceCents: number;
  asOfDate: string;
}
