export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  outstandingBalanceCents: number;
  totalPurchasesCents: number;
}
