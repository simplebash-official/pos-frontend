/**
 * The canonical searchable fields for each entity.
 *
 * These live in one place on purpose: the same entity is searched from more than
 * one screen (a product from the till and from the inventory table, a customer
 * from the list and from the picker), and previously each screen matched a
 * slightly different set of fields — so the same query gave different answers
 * depending on where you typed it.
 *
 * Weights are relative, not absolute. The rule of thumb: 3 for something the
 * user would name the row by (name, SKU, ticket number, phone), 2 for a strong
 * secondary identifier, 1 for supporting detail.
 *
 * Each config is a module-level constant so `useEntitySearch` can memoize on its
 * identity and never rebuild the index just because a component re-rendered.
 */

import type { SearchField } from '@/shared/lib/search';
import type { Product } from '@/features/inventory';
import type { Customer } from '@/features/customers';
import type { Supplier } from '@/features/suppliers';
import type { Employee } from '@/features/employees';
import type { Invoice } from '@/features/billing';
import type { RepairJob } from '@/features/repairs';
import type { PrintJob } from '@/features/print-jobs';

export const PRODUCT_SEARCH_FIELDS: readonly SearchField<Product>[] = [
  { get: (p) => p.name, weight: 3, kind: 'text' },
  { get: (p) => p.sku, weight: 3, kind: 'text' },
  { get: (p) => p.barcode, weight: 3, kind: 'text' },
  { get: (p) => p.subcategory, weight: 1, kind: 'text' },
  { get: (p) => p.category, weight: 1, kind: 'text' },
];

export const CUSTOMER_SEARCH_FIELDS: readonly SearchField<Customer>[] = [
  { get: (c) => c.name, weight: 3, kind: 'text' },
  { get: (c) => c.primaryPhone, weight: 3, kind: 'digits' },
  { get: (c) => c.secondaryPhone, weight: 2, kind: 'digits' },
  { get: (c) => c.email, weight: 2, kind: 'text' },
  { get: (c) => c.contactPerson, weight: 1, kind: 'text' },
  { get: (c) => c.address, weight: 1, kind: 'text' },
];

export const SUPPLIER_SEARCH_FIELDS: readonly SearchField<Supplier>[] = [
  { get: (s) => s.name, weight: 3, kind: 'text' },
  { get: (s) => s.contactPerson, weight: 2, kind: 'text' },
  { get: (s) => s.primaryPhone, weight: 2, kind: 'digits' },
  { get: (s) => s.secondaryPhone, weight: 1, kind: 'digits' },
  { get: (s) => s.email, weight: 1, kind: 'text' },
  { get: (s) => s.suppliedCategories.join(' '), weight: 1, kind: 'text' },
  { get: (s) => s.address, weight: 1, kind: 'text' },
];

export const EMPLOYEE_SEARCH_FIELDS: readonly SearchField<Employee>[] = [
  { get: (e) => e.name, weight: 3, kind: 'text' },
  { get: (e) => e.phone, weight: 3, kind: 'digits' },
  { get: (e) => e.nicOrId, weight: 2, kind: 'text' },
];

export const INVOICE_SEARCH_FIELDS: readonly SearchField<Invoice>[] = [
  { get: (i) => i.invoiceNumber, weight: 3, kind: 'sequence' },
  { get: (i) => i.customerName, weight: 3, kind: 'text' },
  { get: (i) => i.customerPhone, weight: 2, kind: 'digits' },
  // A bill is often looked up by the repair/print ticket that ended up on it.
  {
    get: (i) =>
      i.items
        .map((item) => item.sourceTicketNumber)
        .filter((ticket): ticket is string => Boolean(ticket))
        .join(' '),
    weight: 2,
    kind: 'sequence',
  },
];

export const REPAIR_JOB_SEARCH_FIELDS: readonly SearchField<RepairJob>[] = [
  { get: (r) => r.ticketNumber, weight: 3, kind: 'sequence' },
  { get: (r) => r.customerName, weight: 3, kind: 'text' },
  { get: (r) => r.customerPhone, weight: 2, kind: 'digits' },
  { get: (r) => r.deviceModel, weight: 2, kind: 'text' },
  { get: (r) => r.serialNumber, weight: 2, kind: 'text' },
  { get: (r) => r.issueDescription, weight: 1, kind: 'text' },
];

export const PRINT_JOB_SEARCH_FIELDS: readonly SearchField<PrintJob>[] = [
  { get: (p) => p.ticketNumber, weight: 3, kind: 'sequence' },
  { get: (p) => p.customerName, weight: 3, kind: 'text' },
  { get: (p) => p.customerPhone, weight: 2, kind: 'digits' },
  { get: (p) => p.jobType, weight: 2, kind: 'text' },
];
