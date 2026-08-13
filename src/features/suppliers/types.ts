import type { SyncedEntityFields } from '@/shared/types/common';

export interface Supplier extends SyncedEntityFields {
  id: string;
  key: string; // server-generated e.g. "sup_xxx" — used by supplier-products / purchases linking
  name: string; // Business name (e.g., "Colombo Mobile Parts")
  contactPerson: string; // Human contact person (e.g., "Ranjith Kumara")
  primaryPhone: string; // Primary phone number
  secondaryPhone?: string; // Backup phone number
  address: string; // Physical location or rough address
  suppliedCategories: string[]; // Categories/tags supplied (e.g. "Phone Parts", "Mug Blanks", "Paper & Ink")
  email?: string; // Optional email address
  notes?: string; // Additional notes or reference info
  createdAt: string;
  updatedAt: string;
}

/** Server-owned bookkeeping is excluded — a client never submits any of it. */
export type SupplierInput = Omit<
  Supplier,
  'id' | 'key' | 'createdAt' | 'updatedAt' | keyof SyncedEntityFields
>;
