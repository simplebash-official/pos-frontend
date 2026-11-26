import type { PrintJobStatus } from '@/constants';
import type { SplitType } from '@/features/employees/types';
import type { ProductWarranty } from '@/features/warranties/types';
import type { AppliedDiscount } from '@/shared/components/ticket-items/itemDiscount';
import type { CustomerRef, AssignmentInfo } from '@/shared/types/ticketInput';
import type { ItemDiscount } from '@/wasm';

export type PrintJobType = 'mug' | 't-shirt' | 'handbill' | 'banner' | 'custom';

/** What a line sells, as the server stores it. */
export type PrintItemSource =
  | { type: 'service' }
  | {
      type: 'stock';
      productKey: string;
      /** The product's name when the part was chosen. */
      productName: string;
      /** The exact unit, for a product with serial numbers. */
      serialNumber?: string;
      /** The price the units are taken from, for a product without serial numbers. */
      sellingPriceCents?: number;
    }
  | { type: 'outside'; name: string; unitCostCents: number };

/** One line of a print job: a service fee or a part, with a quantity and its own warranty. */
export interface PrintJobItem {
  key: string;
  description: string;
  quantity: number;
  source: PrintItemSource;
  /** What the customer pays for one (always 0 on a warranty rework). */
  unitPriceCents: number;
  /** What the whole line costs the shop; worked out by the server. */
  costCents: number;
  /** The discount off the line; absent for none. Never on a warranty rework. */
  discount?: AppliedDiscount;
  warranty: ProductWarranty;
}

/** A line's source as the form sends it; the server prices a stock part itself. */
export type PrintItemSourceInput =
  | { type: 'service'; unitPriceCents: number }
  | { type: 'stock'; productKey: string; serialNumber?: string; sellingPriceCents?: number }
  | { type: 'outside'; name: string; unitPriceCents: number; unitCostCents: number };

export interface PrintJobItemInput {
  /** The key of a line already on the job, so it keeps it. */
  key?: string;
  description: string;
  quantity: number;
  source: PrintItemSourceInput;
  /** The discount typed on this line; the server works out what it comes to. */
  discount?: ItemDiscount;
  warranty: ProductWarranty;
}

/** Ordinary paid work, or free work redoing an earlier job under its warranty. */
export type PrintJobKind =
  | { kind: 'standard' }
  | {
      kind: 'warranty_rework';
      claimKey: string;
      claimNumber: string;
      originalPrintJobKey: string;
      originalTicketNumber: string;
    };

export interface PrintJob {
  id: string;
  ticketNumber: string;
  customerKey: string;
  customerName: string;
  customerPhone: string;
  jobType: PrintJobType;
  /** How many were ordered; it describes the order and prices nothing. */
  quantity: number;
  promisedReadyAt?: string; // "YYYY-MM-DD" — date promised to the customer
  isOverdue?: boolean; // server-computed: promised date passed and job still open
  status: PrintJobStatus;
  /** A staff note; never printed for the customer. */
  note?: string;
  kind: PrintJobKind;
  items: PrintJobItem[];
  /** Every line's price less the line discounts: what the customer pays. Server-worked. */
  priceCents: number;
  /** What the parts cost the shop. Server-worked. */
  costCents: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number; // % or cents fixed
  employeeEarningsCents?: number;
  /** The invoice that billed this job; absent until it is billed. Set together with the number. */
  billedInvoiceKey?: string;
  billedInvoiceNumber?: string;
  createdAt: string;
}

export interface PrintJobInput {
  customer: CustomerRef;
  assignment?: AssignmentInfo;
  jobType: PrintJobType;
  quantity: number;
  promisedReadyAt?: string;
  status: PrintJobStatus;
  /** Left out of an update to keep the note; blank removes it. */
  note?: string;
  /** The whole list of lines; left out of an update to keep them as they are. */
  items?: PrintJobItemInput[];
}

/** A shop's ready-made print service. */
export interface PrintService {
  id: string;
  key: string;
  name: string;
  /** The usual price of one. */
  unitPriceCents: number;
  warranty: ProductWarranty;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavePrintServiceInput {
  name: string;
  unitPriceCents: number;
  warranty: ProductWarranty;
  active: boolean;
}
