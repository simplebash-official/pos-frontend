import type { JobStatus } from '@/constants';
import type { SplitType } from '@/features/employees/types';
import type { ProductWarranty } from '@/features/warranties/types';
import type { CustomerRef, AssignmentInfo } from '@/shared/types/ticketInput';

/** Where an item's part came from, as the server stores it. */
export type RepairPart =
  | {
      source: 'stock';
      productKey: string;
      /** The product's name when the part was chosen. */
      productName: string;
      /** The exact unit, for a product with serial numbers. */
      serialNumber?: string;
      /** The price the unit is taken from, for a product without serial numbers. */
      sellingPriceCents?: number;
    }
  | { source: 'outside'; name: string };

/** One piece of work on a job: labour, at most one part, and its own warranty. */
export interface RepairItem {
  key: string;
  description: string;
  laborCents: number;
  part?: RepairPart;
  /** What the customer pays for the part (always 0 on a warranty rework). */
  partCents: number;
  /** What the part cost the shop; worked out by the server for a stock part. */
  partCostCents: number;
  warranty: ProductWarranty;
}

/** A part as the repair form sends it; the server prices a stock part itself. */
export type RepairPartInput =
  | { source: 'stock'; productKey: string; serialNumber?: string; sellingPriceCents?: number }
  | { source: 'outside'; name: string; priceCents: number; costCents: number };

export interface RepairItemInput {
  /** The key of an item already on the job, so it keeps it. */
  key?: string;
  description: string;
  laborCents: number;
  part?: RepairPartInput;
  warranty: ProductWarranty;
}

/** Ordinary paid work, or free work redoing an earlier job under its warranty. */
export type RepairKind =
  | { kind: 'standard' }
  | {
      kind: 'warranty_rework';
      claimKey: string;
      claimNumber: string;
      originalRepairKey: string;
      originalTicketNumber: string;
    };

export interface RepairJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  promisedReadyAt?: string; // "YYYY-MM-DD" — date promised to the customer
  isOverdue?: boolean; // server-computed: promised date passed and job still open
  status: JobStatus;
  kind: RepairKind;
  items: RepairItem[];
  /** Labour and part prices: what the customer pays. Server-worked. */
  priceCents: number;
  /** What the parts cost the shop. Server-worked. */
  costCents: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number; // % or cents fixed
  employeeEarningsCents?: number; // calculated split
  createdAt: string;
}

export interface RepairJobInput {
  customer: CustomerRef;
  assignment?: AssignmentInfo;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  promisedReadyAt?: string;
  status: JobStatus;
  /** The whole list of items; left out of an update to keep them as they are. */
  items?: RepairItemInput[];
}

/** A shop's ready-made repair service. */
export interface RepairService {
  id: string;
  key: string;
  name: string;
  laborCents: number;
  warranty: ProductWarranty;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveRepairServiceInput {
  name: string;
  laborCents: number;
  warranty: ProductWarranty;
  active: boolean;
}
