import type { ProductWarranty } from '@/features/warranties';

/** One of the shop's ready-made services, as the shared settings screen shows it. */
export interface CatalogService {
  key: string;
  name: string;
  /** The usual charge: a repair's fee, or the price of one unit of print work. */
  priceCents: number;
  warranty: ProductWarranty;
  /** A hidden service stays on old jobs but is not offered on new ones. */
  active: boolean;
}

export type CatalogServiceInput = Omit<CatalogService, 'key'>;

/** The words that differ between the shop's service lists. */
export interface ServiceCatalogCopy {
  title: string;
  description: string;
  /** Shown before any service exists. */
  empty: string;
  /** The word before the price on a service's card ("Fee"). */
  priceLabel: string;
  priceFieldLabel: string;
  priceBelowZero: string;
  addTitle: string;
  namePlaceholder: string;
  offerLabel: string;
  logId: string;
}

/** Saving to one of the shop's service lists. */
export interface ServiceCatalogActions {
  create: (input: CatalogServiceInput) => Promise<unknown>;
  update: (key: string, input: CatalogServiceInput) => Promise<unknown>;
  saving: boolean;
  /** Why the last save failed; `null` when it did not. */
  failure: Error | null;
}
