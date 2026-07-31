import { LocalStorageStore } from '@/shared/lib/localStorageStore';
import { recordStockMovement } from '@/features/inventory/api/stockMovementsStore';
import { adjustStock } from '@/features/inventory/api/mockProducts';
import type { Invoice } from '../types';

export const invoicesStore = new LocalStorageStore<Invoice>('pos_invoices', []);

export async function createInvoice(
  data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>
): Promise<Invoice> {
  const all = invoicesStore.getAll();
  const nextSeq = 1001 + all.length;
  const invoiceNumber = `INV-${nextSeq}`;
  const now = new Date().toISOString();

  const newInvoice: Invoice = {
    ...data,
    id: `inv-${Date.now()}`,
    invoiceNumber,
    status: data.isCredit ? 'pending' : 'paid',
    createdAt: now,
  };

  invoicesStore.add(newInvoice);

  // Decrement inventory stock for retail items and append stock movement entries
  for (const item of newInvoice.items) {
    if (!item.sourceType || item.sourceType === 'retail') {
      await adjustStock(item.productId, -item.quantity, 'sale');
      recordStockMovement(
        item.productId,
        -item.quantity,
        'sale',
        newInvoice.invoiceNumber,
        `Sale on invoice ${newInvoice.invoiceNumber}`
      );
    }
  }

  return newInvoice;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  return new Promise((resolve) => setTimeout(() => resolve(invoicesStore.getAll()), 200));
}
