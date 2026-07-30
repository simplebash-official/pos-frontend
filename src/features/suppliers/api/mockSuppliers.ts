import { Supplier, SupplierInput } from '../types';
import { STORAGE_KEYS } from '@/constants';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Colombo Mobile Parts',
    contactPerson: 'Ranjith Kumara',
    primaryPhone: '077 123 4567',
    secondaryPhone: '011 234 5678',
    address: 'No. 45, First Cross Street, Pettah, Colombo 11',
    suppliedCategories: ['Phone Parts', 'Display Assemblies', 'Batteries', 'Repair Tools'],
    email: 'sales@colombomobileparts.lk',
    notes: 'Preferred supplier for iPhone and Samsung original displays. Delivery on Tuesdays & Fridays.',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-07-20T14:30:00.000Z',
  },
  {
    id: 'sup-2',
    name: 'Lanka Sublimation & Mug Centre',
    contactPerson: 'Nimal Siripala',
    primaryPhone: '071 888 9999',
    secondaryPhone: '011 456 7890',
    address: 'No. 120, High Level Road, Maharagama',
    suppliedCategories: ['Mug Blanks', 'Sublimation Inks', 'Heat Transfer Paper', 'T-Shirt Blanks'],
    email: 'info@lankasublimation.com',
    notes: 'Grade-A white ceramic 11oz mugs and Epson sublimation ink. Free delivery on orders over 50 units.',
    createdAt: '2026-02-01T10:15:00.000Z',
    updatedAt: '2026-07-25T11:20:00.000Z',
  },
  {
    id: 'sup-3',
    name: 'City Paper & Print Supplies Depot',
    contactPerson: 'Kamal Perera',
    primaryPhone: '076 555 4321',
    secondaryPhone: '011 777 8888',
    address: 'No. 88, Main Street, Kandy',
    suppliedCategories: ['Paper & Ink', 'General Stationery', 'Receipt Rolls', 'Packaging Boxes'],
    email: 'orders@citypaperdepot.lk',
    notes: '80gsm A4 paper reams, thermal POS receipt rolls (80mm x 80mm), and cardboard packing boxes.',
    createdAt: '2026-03-10T11:00:00.000Z',
    updatedAt: '2026-07-18T16:45:00.000Z',
  },
  {
    id: 'sup-4',
    name: 'Apex Mobile & Tech Wholesale',
    contactPerson: 'Mohomed Rizwan',
    primaryPhone: '075 222 3333',
    secondaryPhone: '077 444 5555',
    address: 'MC Shopping Complex, 2nd Floor, Bambalapitiya, Colombo 04',
    suppliedCategories: ['Phone Parts', 'Charging Cables', 'Screen Protectors', 'Adapters'],
    email: 'rizwan@apexwholesale.lk',
    notes: 'Wholesale tempered glass packs, 20W fast charging adapters, and Type-C braided cables.',
    createdAt: '2026-04-05T08:30:00.000Z',
    updatedAt: '2026-07-28T09:10:00.000Z',
  },
  {
    id: 'sup-5',
    name: 'Islandwide Chemical & Ink Solutions',
    contactPerson: 'Sunil Shantha',
    primaryPhone: '072 999 1111',
    address: 'Industrial Zone, Block B, Ekala, Ja-Ela',
    suppliedCategories: ['Paper & Ink', 'Solvent Inks', 'Cleaning Solvents', 'Printhead Cleaner'],
    email: 'support@islandwideinks.lk',
    notes: 'Eco-solvent printing inks and ultrasonic bath printhead cleaning fluids.',
    createdAt: '2026-05-12T13:40:00.000Z',
    updatedAt: '2026-07-15T15:00:00.000Z',
  },
];

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
