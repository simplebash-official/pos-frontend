import { Supplier, SupplierInput } from '../types';
import { STORAGE_KEYS } from '@/constants';
import { INITIAL_SUPPLIERS } from './data';

export { INITIAL_SUPPLIERS };


const loadSuppliersFromStorage = (): Supplier[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
      return INITIAL_SUPPLIERS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse suppliers from localStorage:', error);
    return INITIAL_SUPPLIERS;
  }
};

const saveSuppliersToStorage = (suppliers: Supplier[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  } catch (error) {
    console.error('Failed to save suppliers to localStorage:', error);
  }
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loadSuppliersFromStorage());
    }, 200);
  });
};

export const createSupplier = async (input: SupplierInput): Promise<Supplier> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = loadSuppliersFromStorage();
      const now = new Date().toISOString();
      const newSupplier: Supplier = {
        ...input,
        id: `sup-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      const updatedList = [newSupplier, ...current];
      saveSuppliersToStorage(updatedList);
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
      const current = loadSuppliersFromStorage();
      const index = current.findIndex((s) => s.id === id);
      if (index === -1) {
        reject(new Error('Supplier not found'));
        return;
      }
      const updatedSupplier: Supplier = {
        ...current[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      current[index] = updatedSupplier;
      saveSuppliersToStorage(current);
      resolve(updatedSupplier);
    }, 200);
  });
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = loadSuppliersFromStorage();
      const filtered = current.filter((s) => s.id !== id);
      saveSuppliersToStorage(filtered);
      resolve(true);
    }, 200);
  });
};
