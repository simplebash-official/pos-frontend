import { StockPurchase, StockPurchaseInput } from '../types';
import { STORAGE_KEYS } from '@/constants/storage';

// Initial mock data if empty
const MOCK_PURCHASES: StockPurchase[] = [
  {
    id: 'pur-1',
    supplierId: 'sup-1', // TechSolutions (Samsung/Oppo/Xiaomi)
    productId: 'p-01', // Smartphone Case
    quantity: 50,
    unitCostCents: 150000,
    totalCostCents: 7500000,
    date: '2023-10-01T10:00:00Z',
    referenceNo: 'INV-1001',
  },
  {
    id: 'pur-2',
    supplierId: 'sup-3', // City Distributors (Samsung)
    productId: 'p-01', // Smartphone Case
    quantity: 30,
    unitCostCents: 145000, // Slightly cheaper here
    totalCostCents: 4350000,
    date: '2023-11-15T14:30:00Z',
    referenceNo: 'INV-3050',
  },
  {
    id: 'pur-3',
    supplierId: 'sup-1',
    productId: 'p-02', // Screen Protector
    quantity: 100,
    unitCostCents: 80000,
    totalCostCents: 8000000,
    date: '2023-10-01T10:00:00Z',
    referenceNo: 'INV-1001',
  },
  {
    id: 'pur-4',
    supplierId: 'sup-5', // Lanka Mobile Spares (Displays/Batteries)
    productId: 'p-07', // Generic iPhone Display
    quantity: 10,
    unitCostCents: 850000,
    totalCostCents: 8500000,
    date: '2023-12-05T09:15:00Z',
    referenceNo: 'INV-5501',
  }
];

export const mockPurchasesApi = {
  getPurchases: async (): Promise<StockPurchase[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(MOCK_PURCHASES));
      return MOCK_PURCHASES;
    }
    return JSON.parse(data);
  },

  createPurchase: async (input: StockPurchaseInput): Promise<StockPurchase> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const current = await mockPurchasesApi.getPurchases();
    
    const newPurchase: StockPurchase = {
      ...input,
      id: `pur-${Date.now()}`,
      date: input.date || new Date().toISOString(),
      totalCostCents: input.unitCostCents * input.quantity,
    };
    
    const updated = [...current, newPurchase];
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updated));
    return newPurchase;
  },
  
  getPurchasesBySupplier: async (supplierId: string): Promise<StockPurchase[]> => {
    const all = await mockPurchasesApi.getPurchases();
    // Sort descending by date
    return all.filter(p => p.supplierId === supplierId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  getPurchasesByProduct: async (productId: string): Promise<StockPurchase[]> => {
    const all = await mockPurchasesApi.getPurchases();
    // Sort descending by date
    return all.filter(p => p.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
