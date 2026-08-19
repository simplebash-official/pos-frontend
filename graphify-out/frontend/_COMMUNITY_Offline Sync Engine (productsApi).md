---
type: community
members: 23
---

# Offline Sync Engine (productsApi)

**Members:** 23 nodes

## Members
- [[dot-constructor()_7]] - code - src/offline/errors.ts
- [[AdjustStockPayload]] - code - src/offline/resources/products.resource.ts
- [[BarcodeConflictError]] - code - src/offline/errors.ts
- [[DeleteProductsPayload]] - code - src/offline/resources/products.resource.ts
- [[adjustStock()]] - code - src/features/inventory/api/productsApi.ts
- [[appendStockDelta()]] - code - src/offline/engine/stockLedger.ts
- [[createProduct()]] - code - src/features/inventory/api/productsApi.ts
- [[createPurchase()]] - code - src/features/purchases/api/purchasesApi.ts
- [[defineSyncResource()]] - code - src/offline/registry/registry.ts
- [[deleteProducts()]] - code - src/features/inventory/api/productsApi.ts
- [[fetchProducts()]] - code - src/features/inventory/api/productsApi.ts
- [[fetchResourceSnapshot()]] - code - src/offline/resources/syncApi.ts
- [[products.resource.ts]] - code - src/offline/resources/products.resource.ts
- [[productsResource]] - code - src/offline/resources/products.resource.ts
- [[purchases.resource.ts]] - code - src/offline/resources/purchases.resource.ts
- [[purchasesResource]] - code - src/offline/resources/purchases.resource.ts
- [[pushOptions()]] - code - src/offline/resources/pushOptions.ts
- [[pushOptions.ts]] - code - src/offline/resources/pushOptions.ts
- [[resourcesindex.ts]] - code - src/offline/resources/index.ts
- [[stockMovements.resource.ts]] - code - src/offline/resources/stockMovements.resource.ts
- [[stockMovementsResource]] - code - src/offline/resources/stockMovements.resource.ts
- [[toLocalRow()]] - code - src/offline/db/mirror.ts
- [[updateProduct()]] - code - src/features/inventory/api/productsApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_Engine_productsApi
SORT file.name ASC
```

## Connections to other communities
- 14 edges to [[_COMMUNITY_Outbox Queue & Status]]
- 12 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_1]]
- 10 edges to [[_COMMUNITY_Inventory & Products API]]
- 10 edges to [[_COMMUNITY_Customer Management & Drawers]]
- 10 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_2]]
- 10 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_4]]
- 10 edges to [[_COMMUNITY_Offline Sync Engine (syncApi)]]
- 9 edges to [[_COMMUNITY_Sync Metadata & Cursors]]
- 6 edges to [[_COMMUNITY_MutationRequestOptions Module]]
- 6 edges to [[_COMMUNITY_Employee Accounts & Earnings_5]]
- 3 edges to [[_COMMUNITY_Offline Sync Engine (useProducts)]]
- 3 edges to [[_COMMUNITY_Outbox Queue & Status_2]]
- 2 edges to [[_COMMUNITY_Offline Connectivity Monitoring_4]]
- 1 edge to [[_COMMUNITY_Offline Connectivity Monitoring]]

## Top bridge nodes
- [[products.resource.ts]] - degree 35, connects to 10 communities
- [[toLocalRow()]] - degree 15, connects to 7 communities
- [[pushOptions.ts]] - degree 11, connects to 7 communities
- [[purchases.resource.ts]] - degree 23, connects to 6 communities
- [[resourcesindex.ts]] - degree 18, connects to 6 communities