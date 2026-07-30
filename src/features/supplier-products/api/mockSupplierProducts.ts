import { SupplierProduct, SupplierProductInput } from '../types';
import { STORAGE_KEYS } from '@/constants';

/**
 * Seed links tying existing suppliers (sup-1 … sup-5) to existing products (p-01 … p-42).
 *
 * Mapping rationale:
 *  • sup-1 "Colombo Mobile Parts"       → phone covers, screens, batteries, charging ports, repair parts
 *  • sup-2 "Lanka Sublimation & Mug Centre" → mugs, t-shirts, sublimation sheets, sublimation inks
 *  • sup-3 "City Paper & Print Supplies" → paper, printer inks, receipt rolls
 *  • sup-4 "Apex Mobile & Tech Wholesale" → phone covers, screen protectors, charging cables, adapters
 *  • sup-5 "Islandwide Chemical & Ink"   → sublimation inks, eco-solvent inks, printer inks
 */
const INITIAL_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  // sup-1 → Phone Repairs
  { supplierId: 'sup-1', productId: 'p-01', addedAt: '2026-01-20T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-02', addedAt: '2026-01-20T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-03', addedAt: '2026-01-20T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-05', costPriceCents: 350000, addedAt: '2026-01-20T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-06', costPriceCents: 680000, addedAt: '2026-01-20T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-07', addedAt: '2026-01-20T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-09', addedAt: '2026-02-05T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-10', addedAt: '2026-02-05T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-13', addedAt: '2026-02-05T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-14', addedAt: '2026-02-05T10:00:00Z' },
  { supplierId: 'sup-1', productId: 'p-17', addedAt: '2026-03-01T10:00:00Z' },

  // sup-2 → Mug, T-Shirt & Print Customization
  { supplierId: 'sup-2', productId: 'p-21', addedAt: '2026-02-10T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-22', addedAt: '2026-02-10T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-23', addedAt: '2026-02-10T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-24', addedAt: '2026-02-10T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-25', addedAt: '2026-02-10T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-26', addedAt: '2026-02-10T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-27', addedAt: '2026-03-01T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-28', addedAt: '2026-03-01T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-29', addedAt: '2026-03-01T10:00:00Z' },
  { supplierId: 'sup-2', productId: 'p-30', addedAt: '2026-03-01T10:00:00Z' },

  // sup-3 → General Printing
  { supplierId: 'sup-3', productId: 'p-33', addedAt: '2026-03-15T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-34', addedAt: '2026-03-15T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-35', addedAt: '2026-03-15T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-36', addedAt: '2026-03-15T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-37', addedAt: '2026-03-15T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-38', addedAt: '2026-03-15T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-39', addedAt: '2026-04-01T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-40', addedAt: '2026-04-01T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-41', addedAt: '2026-04-01T10:00:00Z' },
  { supplierId: 'sup-3', productId: 'p-42', addedAt: '2026-04-01T10:00:00Z' },

  // sup-4 → Phone accessories (overlaps with sup-1 for some items)
  { supplierId: 'sup-4', productId: 'p-01', costPriceCents: 75000, notes: 'Bulk discount on 100+ units', addedAt: '2026-04-10T10:00:00Z' },
  { supplierId: 'sup-4', productId: 'p-02', costPriceCents: 115000, addedAt: '2026-04-10T10:00:00Z' },
  { supplierId: 'sup-4', productId: 'p-04', addedAt: '2026-04-10T10:00:00Z' },
  { supplierId: 'sup-4', productId: 'p-15', addedAt: '2026-04-10T10:00:00Z' },
  { supplierId: 'sup-4', productId: 'p-16', addedAt: '2026-04-10T10:00:00Z' },
  { supplierId: 'sup-4', productId: 'p-19', addedAt: '2026-04-10T10:00:00Z' },
  { supplierId: 'sup-4', productId: 'p-20', addedAt: '2026-04-10T10:00:00Z' },

  // sup-5 → Inks (overlaps with sup-2 and sup-3 for ink items)
  { supplierId: 'sup-5', productId: 'p-29', costPriceCents: 70000, notes: 'Premium eco-solvent grade', addedAt: '2026-05-15T10:00:00Z' },
  { supplierId: 'sup-5', productId: 'p-30', costPriceCents: 70000, addedAt: '2026-05-15T10:00:00Z' },
  { supplierId: 'sup-5', productId: 'p-39', addedAt: '2026-05-15T10:00:00Z' },
  { supplierId: 'sup-5', productId: 'p-40', addedAt: '2026-05-15T10:00:00Z' },
  { supplierId: 'sup-5', productId: 'p-41', addedAt: '2026-05-15T10:00:00Z' },
  { supplierId: 'sup-5', productId: 'p-42', addedAt: '2026-05-15T10:00:00Z' },
];

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const loadFromStorage = (): SupplierProduct[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(INITIAL_SUPPLIER_PRODUCTS));
      return INITIAL_SUPPLIER_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse supplier-products from localStorage:', error);
    return INITIAL_SUPPLIER_PRODUCTS;
  }
};

const saveToStorage = (links: SupplierProduct[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(links));
  } catch (error) {
    console.error('Failed to save supplier-products to localStorage:', error);
  }
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch all supplier↔product links. */
export const fetchSupplierProducts = async (): Promise<SupplierProduct[]> =>
  new Promise((resolve) => setTimeout(() => resolve(loadFromStorage()), 100));

/** Get links for a single supplier. */
export const getLinksForSupplier = async (supplierId: string): Promise<SupplierProduct[]> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const all = loadFromStorage();
      resolve(all.filter((l) => l.supplierId === supplierId));
    }, 100),
  );

/** Get links for a single product. */
export const getLinksForProduct = async (productId: string): Promise<SupplierProduct[]> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const all = loadFromStorage();
      resolve(all.filter((l) => l.productId === productId));
    }, 100),
  );

/** Create a new link. Duplicate composite keys are silently ignored. */
export const linkSupplierProduct = async (input: SupplierProductInput): Promise<SupplierProduct> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const current = loadFromStorage();
      const exists = current.some(
        (l) => l.supplierId === input.supplierId && l.productId === input.productId,
      );
      if (exists) {
        // Update existing link
        const idx = current.findIndex(
          (l) => l.supplierId === input.supplierId && l.productId === input.productId,
        );
        const updated: SupplierProduct = {
          ...current[idx],
          ...input,
        };
        current[idx] = updated;
        saveToStorage(current);
        resolve(updated);
        return;
      }
      const link: SupplierProduct = {
        ...input,
        addedAt: new Date().toISOString(),
      };
      const updatedList = [...current, link];
      saveToStorage(updatedList);
      resolve(link);
    }, 100),
  );

/** Remove a link by composite key. */
export const unlinkSupplierProduct = async (
  supplierId: string,
  productId: string,
): Promise<boolean> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const current = loadFromStorage();
      const filtered = current.filter(
        (l) => !(l.supplierId === supplierId && l.productId === productId),
      );
      saveToStorage(filtered);
      resolve(true);
    }, 100),
  );

/** Bulk-set links for a supplier (used by the form modal). Replaces ALL links for this supplier. */
export const setLinksForSupplier = async (
  supplierId: string,
  productIds: string[],
): Promise<SupplierProduct[]> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const current = loadFromStorage();
      // Keep links from other suppliers
      const otherLinks = current.filter((l) => l.supplierId !== supplierId);
      // Preserve existing link metadata where possible
      const existingMap = new Map(
        current.filter((l) => l.supplierId === supplierId).map((l) => [l.productId, l]),
      );
      const newLinks: SupplierProduct[] = productIds.map((productId) => {
        const existing = existingMap.get(productId);
        if (existing) return existing;
        return {
          supplierId,
          productId,
          addedAt: new Date().toISOString(),
        };
      });
      saveToStorage([...otherLinks, ...newLinks]);
      resolve(newLinks);
    }, 100),
  );
