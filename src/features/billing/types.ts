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
  returnedQuantity?: number;
  isReturn?: boolean;
}

export type { ReturnRecord, ReturnPayoutMethod, ReturnItem } from '@/offline/db/tables';

export interface SplitPaymentDetail {
  id: string;
  method: string;
  amountCents: number;
  cardLast4?: string;
  reference?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  cashierId?: string;
  cashierName?: string;
  subtotalCents: number;
  discountCents: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  totalCents: number;
  paymentMethod: string;
  splitPayments?: SplitPaymentDetail[];
  isCredit?: boolean;
  amountReceivedCents?: number;
  changeDueCents?: number;
  dueDate?: string;
  cardLast4?: string;
  cardRef?: string;
  onlineRef?: string;
  onlineNote?: string;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: string;
  items: InvoiceItem[];
  notes?: string;
  shopProfileVersion?: number;
  warrantyTermsSnapshot?: string;
  documentSelection?: 'receipt' | 'invoice' | 'both' | 'none';
}
