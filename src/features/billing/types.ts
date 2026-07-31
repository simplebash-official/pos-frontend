export type LineSourceType = 'retail' | 'repair' | 'print';

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  productName?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  totalCents: number;
  sourceType?: LineSourceType;
  sourceTicketNumber?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
}

export interface SplitPaymentDetail {
  id: string;
  method: string;
  amountCents: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  paymentMethod: string;
  splitPayments?: SplitPaymentDetail[];
  isCredit?: boolean;
  tenderedAmountCents?: number;
  changeDueCents?: number;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: string;
  items: InvoiceItem[];
  notes?: string;
}
