import { Supplier, SupplierInput } from '../types';
import { INITIAL_SUPPLIERS } from './data';
import { LocalStorageStore } from '@/shared/lib/localStorageStore';

export { INITIAL_SUPPLIERS };

export function normalizeSupplier(rawInput: unknown): Supplier {
  const raw = (rawInput && typeof rawInput === 'object' ? rawInput : {}) as Record<string, unknown>;
  return {
    id: typeof raw.id === 'string' ? raw.id : `sup-${Date.now()}`,
    name: String(
      raw.name || raw.companyName || raw.supplierName || raw.businessName || 'Unnamed Supplier'
    ),
    contactPerson: String(raw.contactPerson || raw.contactName || 'N/A'),
    primaryPhone: String(raw.primaryPhone || raw.phone || raw.contactPhone || ''),
    secondaryPhone: String(raw.secondaryPhone || raw.backupPhone || ''),
    address: String(raw.address || raw.location || ''),
    suppliedCategories:
      Array.isArray(raw.suppliedCategories) && raw.suppliedCategories.length > 0
        ? (raw.suppliedCategories as string[])
        : raw.category
          ? [String(raw.category)]
          : ['General'],
    email: String(raw.email || ''),
    notes: String(raw.notes || ''),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

export const suppliersStore = new LocalStorageStore<Supplier>(
  'pos_suppliers',
  INITIAL_SUPPLIERS,
  normalizeSupplier
);

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(suppliersStore.getAll()), 200));
};

export const createSupplier = async (input: SupplierInput): Promise<Supplier> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newSupplier: Supplier = normalizeSupplier({
        ...input,
        id: `sup-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      });
      suppliersStore.add(newSupplier);
      resolve(newSupplier);
    }, 200);
  });
};

export const updateSupplier = async (
  id: string,
  input: Partial<SupplierInput>
): Promise<Supplier> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const updated = suppliersStore.update(id, {
        ...input,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) return reject(new Error('Supplier not found'));
      resolve(updated);
    }, 200);
  });
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const removed = suppliersStore.remove(id);
      resolve(removed);
    }, 200);
  });
};

export const deleteSuppliers = async (ids: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      ids.forEach((id) => suppliersStore.remove(id));
      resolve(true);
    }, 200);
  });
};
