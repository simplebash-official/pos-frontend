import { registerSyncResource } from '../registry/registry';
import { categoriesResource } from './categories.resource';
import { customersResource } from './customers.resource';
import { invoicesResource } from './invoices.resource';
import { paymentsResource } from './payments.resource';
import { productsResource } from './products.resource';
import { printJobsResource } from './printJobs.resource';
import { purchasesResource } from './purchases.resource';
import { repairsResource } from './repairs.resource';
import { stockMovementsResource } from './stockMovements.resource';
import { supplierProductsResource } from './supplierProducts.resource';
import { suppliersResource } from './suppliers.resource';
import { creditNotesResource } from './creditNotes.resource';
import { productSerialsResource } from './productSerials.resource';

/**
 * Registers every synced resource. Called once from `SyncProvider`.
 *
 * Descriptors live here rather than inside each feature on purpose: they must
 * be imported eagerly at startup, and importing them through a feature's
 * barrel would drag that feature's lazily-loaded components into the initial
 * bundle. They depend only on each feature's `api/` and `types` modules, which
 * are leaves.
 */
let registered = false;

export const registerSyncResources = (): void => {
  // Idempotent: the registry is process-wide, but StrictMode double-invokes
  // the effect that calls this, and a second registration would throw.
  if (registered) {
    return;
  }
  registered = true;

  // Order here is irrelevant — the registry topologically sorts by `dependsOn`.
  registerSyncResource(categoriesResource);
  registerSyncResource(suppliersResource);
  registerSyncResource(customersResource);
  registerSyncResource(productsResource);
  registerSyncResource(supplierProductsResource);
  registerSyncResource(purchasesResource);
  registerSyncResource(stockMovementsResource);
  registerSyncResource(repairsResource);
  registerSyncResource(printJobsResource);
  registerSyncResource(invoicesResource);
  registerSyncResource(paymentsResource);
  registerSyncResource(creditNotesResource);
  registerSyncResource(productSerialsResource);
};
