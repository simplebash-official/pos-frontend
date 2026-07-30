export interface Supplier {
  id: string;
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

export type SupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
