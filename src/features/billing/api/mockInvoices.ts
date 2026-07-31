import { LocalStorageStore } from '@/shared/lib/localStorageStore';
import { PaymentMethod } from '@/constants';
import { recordStockMovement } from '@/features/inventory/api/stockMovementsStore';
import { adjustStock } from '@/features/inventory/api/mockProducts';

export interface InvoiceLineItem {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  customerName?: string | null;
  items: InvoiceLineItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  tenderedAmountCents?: number;
  changeDueCents?: number;
  notes?: string;
  createdAt: string;
}

export const invoicesStore = new LocalStorageStore<Invoice>('pos_invoices', []);

export async function createInvoice(data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<Invoice> {
  const all = invoicesStore.getAll();
  const nextSeq = 1001 + all.length;
  const invoiceNumber = `INV-${nextSeq}`;
  const now = new Date().toISOString();

  const newInvoice: Invoice = {
    ...data,
    id: `inv-${Date.now()}`,
    invoiceNumber,
    createdAt: now,
  };

  invoicesStore.add(newInvoice);

  // Decrement inventory stock and append stock movement entries
  for (const item of newInvoice.items) {
    await adjustStock(item.productId, -item.quantity, 'sale');
    recordStockMovement(
      item.productId,
      -item.quantity,
      'sale',
      newInvoice.invoiceNumber,
      `Sale on invoice ${newInvoice.invoiceNumber}`
    );
  }

  return newInvoice;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  return new Promise((resolve) => setTimeout(() => resolve(invoicesStore.getAll()), 200));
}
