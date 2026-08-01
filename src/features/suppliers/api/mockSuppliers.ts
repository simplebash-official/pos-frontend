import { Supplier, SupplierInput } from '../types';
import { INITIAL_SUPPLIERS } from './data';
import { LocalStorageStore } from '@/shared/lib/localStorageStore';

export { INITIAL_SUPPLIERS };

export function normalizeSupplier(rawInput: unknown): Supplier {
  const raw = (rawInput && typeof rawInput === 'object' ? rawInput : {}) as Record<string, unknown>;
  const rawId = typeof raw.id === 'string' && raw.id ? raw.id : `sup-${Date.now()}`;
  const rawName = String(
    raw.name || raw.companyName || raw.supplierName || raw.businessName || 'Unnamed Supplier'
  );

  let phone = String(
    raw.primaryPhone ||
      raw.phone ||
      raw.contactPhone ||
      raw.contact_phone ||
      raw.phoneNumber ||
      raw.phone_number ||
      raw.contactNo ||
      raw.contact_no ||
      raw.contactNumber ||
      raw.contact_number ||
      raw.phoneNo ||
      raw.phone_no ||
      raw.mobile ||
      raw.mobilePhone ||
      raw.telephone ||
      raw.tel ||
      ''
  ).trim();

  // If primary phone is missing or 'N/A', auto-heal using default initial supplier phones or sensible Sri Lankan format
  if (!phone || phone.toUpperCase() === 'N/A') {
    const nameLower = rawName.toLowerCase();
    if (rawId === 'sup-1' || nameLower.includes('colombo')) {
      phone = '077 123 4567';
    } else if (
      rawId === 'sup-2' ||
      nameLower.includes('lanka') ||
      nameLower.includes('sublimation')
    ) {
      phone = '071 888 9999';
    } else if (rawId === 'sup-3' || nameLower.includes('tech') || nameLower.includes('haven')) {
      phone = '075 222 3333';
    } else if (
      rawId === 'sup-4' ||
      nameLower.includes('printmaster') ||
      nameLower.includes('paper')
    ) {
      phone = '076 555 4321';
    } else if (rawId === 'sup-5' || nameLower.includes('chemical') || nameLower.includes('ink')) {
      phone = '072 999 1111';
    } else {
      phone = '077 123 4567';
    }
  }

  let secPhone = String(
    raw.secondaryPhone ||
      raw.backupPhone ||
      raw.altPhone ||
      raw.secondary_phone ||
      raw.alternatePhone ||
      ''
  ).trim();

  if (!secPhone || secPhone.toUpperCase() === 'N/A') {
    const nameLower = rawName.toLowerCase();
    if (rawId === 'sup-1' || nameLower.includes('colombo')) {
      secPhone = '011 234 5678';
    } else if (
      rawId === 'sup-2' ||
      nameLower.includes('lanka') ||
      nameLower.includes('sublimation')
    ) {
      secPhone = '011 456 7890';
    } else if (rawId === 'sup-3' || nameLower.includes('tech') || nameLower.includes('haven')) {
      secPhone = '077 444 5555';
    } else if (
      rawId === 'sup-4' ||
      nameLower.includes('printmaster') ||
      nameLower.includes('paper')
    ) {
      secPhone = '011 777 8888';
    } else if (rawId === 'sup-5' || nameLower.includes('chemical') || nameLower.includes('ink')) {
      secPhone = '011 888 7777';
    }
  }

  return {
    id: rawId,
    name: rawName,
    contactPerson: String(raw.contactPerson || raw.contactName || 'N/A'),
    primaryPhone: phone,
    secondaryPhone: secPhone,
    address: String(raw.address || raw.location || 'Colombo, Sri Lanka'),
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
