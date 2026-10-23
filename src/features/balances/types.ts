/** What the shop owes one supplier. A supplier has no balance until an opening balance is set. */
export interface SupplierBalance {
  supplierKey: string;
  name: string;
  openingBalanceCents?: number;
  /** `YYYY-MM-DD`: purchases and payments from this day on count. */
  asOfDate?: string;
  purchasedCents?: number;
  paidCents?: number;
  /** What is owed; negative when the shop has paid ahead. */
  balanceCents?: number;
}

export interface SupplierBalancesResponse {
  suppliers: SupplierBalance[];
}

export interface StaffAdvance {
  employeeKey: string;
  name: string;
  openingBalanceCents?: number;
  asOfDate?: string;
  givenCents: number;
  recoveredCents: number;
  outstandingCents: number;
  lastGivenOn?: string;
}

export interface StaffAdvancesResponse {
  staff: StaffAdvance[];
}

export interface AdvanceGiven {
  number: string;
  date: string;
  amountCents: number;
  categoryName: string;
}

export interface AdvanceRecovery {
  key: string;
  employeeKey: string;
  amountCents: number;
  recoveredOn: string;
  note?: string;
  recordedByNameSnapshot: string;
  createdAt: string;
}

export interface StaffAdvanceDetail {
  summary: StaffAdvance;
  given: AdvanceGiven[];
  recoveries: AdvanceRecovery[];
}

export type BalanceSubject = 'supplier' | 'staff';

export interface SetBalanceOpeningInput {
  openingBalanceCents: number;
  asOfDate: string;
}

export interface CreateAdvanceRecoveryInput {
  amountCents: number;
  recoveredOn: string;
  note?: string;
}
