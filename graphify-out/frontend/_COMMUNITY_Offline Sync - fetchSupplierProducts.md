---
type: community
cohesion: 0.20
members: 21
---

# Offline Sync - fetchSupplierProducts

**Cohesion:** 0.20 - loosely connected
**Members:** 21 nodes

## Members

- [[EnrichedLinkedProduct]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[EnrichedLinkedSupplier]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[NO_LINKED_PRODUCTS]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[NO_LINKED_SUPPLIERS]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[SetLinksPayload]] - code - src/offline/resources/supplierProducts.resource.ts
- [[SupplierProduct]] - code - src/features/supplier-products/types.ts
- [[SupplierProductInput]] - code - src/features/supplier-products/types.ts
- [[SupplierProductListParams]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[UnlinkPayload]] - code - src/offline/resources/supplierProducts.resource.ts
- [[fetchSupplierProducts()]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[getLinksForProduct()]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[getLinksForSupplier()]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[linkSupplierProduct()]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[markDeleted()]] - code - src/offline/db/mirror.ts
- [[setLinksForSupplier()]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[supplier-productstypes.ts]] - code - src/features/supplier-products/types.ts
- [[supplierProducts.resource.ts]] - code - src/offline/resources/supplierProducts.resource.ts
- [[supplierProductsApi.ts]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[supplierProductsResource]] - code - src/offline/resources/supplierProducts.resource.ts
- [[unlinkSupplierProduct()]] - code - src/features/supplier-products/api/supplierProductsApi.ts
- [[useSupplierProducts.ts]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_fetchSupplierProducts
SORT file.name ASC
```

## Connections to other communities

- 11 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 9 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 7 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 5 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 5 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 5 edges to [[_COMMUNITY_Customers - createCustomer]]
- 4 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 4 edges to [[_COMMUNITY_Offline Sync - signal]]
- 3 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 2 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 2 edges to [[_COMMUNITY_Inventory - createCategory]]
- 2 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 1 edge to [[_COMMUNITY_Settings - SyncDrawer]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]
- 1 edge to [[_COMMUNITY_Offline Sync - OutboxError]]

## Top bridge nodes

- [[useSupplierProducts.ts]] - degree 28, connects to 9 communities
- [[supplierProducts.resource.ts]] - degree 27, connects to 6 communities
- [[markDeleted()]] - degree 12, connects to 6 communities
- [[supplier-productstypes.ts]] - degree 9, connects to 4 communities
- [[supplierProductsApi.ts]] - degree 16, connects to 3 communities
