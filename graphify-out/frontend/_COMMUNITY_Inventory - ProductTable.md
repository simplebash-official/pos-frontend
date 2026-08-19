---
type: community
cohesion: 0.18
members: 26
---

# Inventory - ProductTable

**Cohesion:** 0.18 - loosely connected
**Members:** 26 nodes

## Members

- [[HEIGHT_MAP]] - code - src/shared/components/QuantityInput.tsx
- [[NO_MOVEMENTS]] - code - src/features/inventory/hooks/useProducts.ts
- [[NO_PRODUCTS]] - code - src/features/inventory/hooks/useProducts.ts
- [[NO_PURCHASES]] - code - src/features/purchases/hooks/usePurchases.ts
- [[ProductTable()]] - code - src/features/inventory/components/ProductTable.tsx
- [[ProductTable.tsx]] - code - src/features/inventory/components/ProductTable.tsx
- [[QuantityInput()]] - code - src/shared/components/QuantityInput.tsx
- [[QuantityInput.tsx]] - code - src/shared/components/QuantityInput.tsx
- [[QuantityInputProps]] - code - src/shared/components/QuantityInput.tsx
- [[enrich()]] - code - src/features/purchases/hooks/usePurchases.ts
- [[purchasesindex.ts]] - code - src/features/purchases/index.ts
- [[supplier-productsindex.ts]] - code - src/features/supplier-products/index.ts
- [[useAdjustStock()]] - code - src/features/inventory/hooks/useProducts.ts
- [[useCreateProduct()]] - code - src/features/inventory/hooks/useProducts.ts
- [[useDeleteProducts()]] - code - src/features/inventory/hooks/useProducts.ts
- [[useLinkProduct()]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[useProductMovements()]] - code - src/features/inventory/hooks/useProducts.ts
- [[useProducts.ts]] - code - src/features/inventory/hooks/useProducts.ts
- [[usePurchases.ts]] - code - src/features/purchases/hooks/usePurchases.ts
- [[usePurchasesByProduct()]] - code - src/features/purchases/hooks/usePurchases.ts
- [[usePurchasesBySupplier()]] - code - src/features/purchases/hooks/usePurchases.ts
- [[useSuppliersForProduct()]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[useSyncedMutation()]] - code - src/offline/react/useSyncedMutation.ts
- [[useSyncedQuery()]] - code - src/offline/react/useSyncedQuery.ts
- [[useUnlinkProduct()]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[useUpdateProduct()]] - code - src/features/inventory/hooks/useProducts.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Inventory_-_ProductTable
SORT file.name ASC
```

## Connections to other communities

- 31 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 20 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 15 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 12 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 9 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 9 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 8 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 6 edges to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 5 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 5 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 5 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 5 edges to [[_COMMUNITY_Auth - RequireAdmin]]
- 5 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 4 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 4 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 2 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 2 edges to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Offline Sync - depsChanged]]
- 1 edge to [[_COMMUNITY_Employees - CURRENCY]]
- 1 edge to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 1 edge to [[_COMMUNITY_Billing - ROUTE TITLES]]

## Top bridge nodes

- [[ProductTable.tsx]] - degree 56, connects to 13 communities
- [[useProducts.ts]] - degree 36, connects to 11 communities
- [[useSyncedQuery()]] - degree 22, connects to 9 communities
- [[useSyncedMutation()]] - degree 31, connects to 8 communities
- [[ProductTable()]] - degree 22, connects to 7 communities
