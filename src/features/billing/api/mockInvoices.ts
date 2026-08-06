import { LocalStorageStore } from '@/shared/lib/localStorageStore';
import { STORAGE_KEYS } from '@/constants/storage';
import { adjustStock } from '@/features/inventory/api/productsApi';
import { customersStore } from '@/features/customers/api/mockCustomers';
import type { Invoice } from '../types';

export const invoicesStore = new LocalStorageStore<Invoice>(STORAGE_KEYS.INVOICES, []);

function getNextInvoiceNumber(): string {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // Read year-keyed counter: { year: number, counter: number }
  let storedYear = currentYear;
  let storedCounter = 1;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICE_COUNTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.year === 'number') {
        storedYear = parsed.year;
        storedCounter = parsed.counter || 1;
      } else if (typeof parsed === 'number') {
        // Migrate from bare integer format
        storedCounter = parsed || 1;
      }
    }
  } catch {
    // Ignore storage read error
  }

  // Reset counter on year rollover
  if (storedYear !== currentYear) {
    storedCounter = 1;
  }

  // Reconcile counter with existing invoices for the current year
  const allInvoices = invoicesStore.getAll();
  for (const inv of allInvoices) {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)) {
      const seqStr = inv.invoiceNumber.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq >= storedCounter) {
        storedCounter = seq + 1;
      }
    }
  }

  // Atomically increment and save counter with year key
  const nextCounter = storedCounter + 1;
  try {
    localStorage.setItem(
      STORAGE_KEYS.INVOICE_COUNTER,
      JSON.stringify({ year: currentYear, counter: nextCounter })
    );
  } catch {
    // Ignore storage write error
  }

  const paddedSeq = storedCounter.toString().padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}

export async function createInvoice(
  data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>
): Promise<Invoice> {
  const invoiceNumber = getNextInvoiceNumber();
  const now = new Date().toISOString();

  const newInvoice: Invoice = {
    ...data,
    id: `inv-${Date.now()}`,
    invoiceNumber,
    status: data.isCredit ? 'pending' : 'paid',
    createdAt: now,
  };

  invoicesStore.add(newInvoice);

  // Decrement inventory stock for retail items — the backend records its own stock movement.
  for (const item of newInvoice.items) {
    if (!item.sourceType || item.sourceType === 'retail') {
      await adjustStock(
        item.productId,
        -item.quantity,
        `Sale on invoice ${newInvoice.invoiceNumber}`
      );
    }
  }

  // Update customer outstanding balance if credit sale
  if (data.customerId) {
    const customer = customersStore.getById(data.customerId);
    if (customer) {
      const addedBalance = data.isCredit ? data.totalCents : 0;
      const addedPurchases = data.totalCents;
      customersStore.update(data.customerId, {
        outstandingBalanceCents: (customer.outstandingBalanceCents || 0) + addedBalance,
        totalPurchasesCents: (customer.totalPurchasesCents || 0) + addedPurchases,
        updatedAt: now,
      });
    }
  }

  return newInvoice;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  return new Promise((resolve) => setTimeout(() => resolve(invoicesStore.getAll()), 100));
}

export async function fetchInvoiceById(idOrNumber: string): Promise<Invoice | null> {
  const all = invoicesStore.getAll();
  const found = all.find((inv) => inv.id === idOrNumber || inv.invoiceNumber === idOrNumber);
  return Promise.resolve(found || null);
}
