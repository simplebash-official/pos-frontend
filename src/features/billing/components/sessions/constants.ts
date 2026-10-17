export interface DenominationItem {
  id: string;
  label: string;
  valueRupees: number;
}

export const SRI_LANKA_DENOMINATIONS: DenominationItem[] = [
  { id: '5000', label: 'Rs. 5,000', valueRupees: 5000 },
  { id: '1000', label: 'Rs. 1,000', valueRupees: 1000 },
  { id: '500', label: 'Rs. 500', valueRupees: 500 },
  { id: '100', label: 'Rs. 100', valueRupees: 100 },
  { id: '50', label: 'Rs. 50', valueRupees: 50 },
  { id: '20', label: 'Rs. 20', valueRupees: 20 },
  { id: '10', label: 'Rs. 10', valueRupees: 10 },
  { id: '5', label: 'Rs. 5', valueRupees: 5 },
  { id: '2', label: 'Rs. 2', valueRupees: 2 },
  { id: '1', label: 'Rs. 1', valueRupees: 1 },
];

export const OWNER_ADMIN_THRESHOLD_CENTS = 50_000; // Rs. 500
export const VARIANCE_TOLERANCE_CENTS = 500; // Rs. 5.00
