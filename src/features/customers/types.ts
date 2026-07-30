export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address: string;
  tags: string[];
  notes?: string;
  outstandingBalanceCents: number;
  totalPurchasesCents: number;
  createdAt: string;
  updatedAt: string;
}

export type CustomerInput = Omit<
  Customer,
  'id' | 'outstandingBalanceCents' | 'totalPurchasesCents' | 'createdAt' | 'updatedAt'
>;
