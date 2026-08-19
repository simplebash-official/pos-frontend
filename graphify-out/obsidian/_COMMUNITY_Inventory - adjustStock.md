---
type: community
cohesion: 0.10
members: 36
---

# Inventory - adjustStock

**Cohesion:** 0.10 - loosely connected
**Members:** 36 nodes

## Members

- [[AdjustStockPayload]] - code - src/offline/resources/products.resource.ts
- [[BarcodeSource]] - code - src/features/inventory/types.ts
- [[CreateProductInput]] - code - src/features/inventory/types.ts
- [[DeleteProductsPayload]] - code - src/offline/resources/products.resource.ts
- [[FormContentProps_2]] - code - src/features/inventory/components/ProductFormModal.tsx
- [[Product]] - code - src/features/inventory/types.ts
- [[ProductFormModal.tsx]] - code - src/features/inventory/components/ProductFormModal.tsx
- [[ProductFormModalProps]] - code - src/features/inventory/components/ProductFormModal.tsx
- [[ProductInput]] - code - src/features/inventory/types.ts
- [[ProductListParams]] - code - src/features/inventory/api/productsApi.ts
- [[ProductListResponse]] - code - src/features/inventory/types.ts
- [[ProductSupplierIntake]] - code - src/features/inventory/types.ts
- [[ProductsPageData]] - code - src/features/inventory/api/productsApi.ts
- [[StockAdjustmentResult]] - code - src/features/inventory/types.ts
- [[StockMovementType]] - code - src/features/inventory/types.ts
- [[Subcategory]] - code - src/features/inventory/types.ts
- [[SupplierIntakeRow]] - code - src/features/inventory/components/ProductFormModal.tsx
- [[UpdateProductInput]] - code - src/features/inventory/types.ts
- [[UpdateProductPayload]] - code - src/offline/resources/products.resource.ts
- [[ValidCategoryOption]] - code - src/features/inventory/types.ts
- [[ValidSubcategoryOption]] - code - src/features/inventory/types.ts
- [[adjustStock()]] - code - src/features/inventory/api/productsApi.ts
- [[createProduct()]] - code - src/features/inventory/api/productsApi.ts
- [[deleteProduct()]] - code - src/features/inventory/api/productsApi.ts
- [[deleteProducts()]] - code - src/features/inventory/api/productsApi.ts
- [[fetchLowStockProducts()]] - code - src/features/inventory/api/productsApi.ts
- [[fetchProductById()]] - code - src/features/inventory/api/productsApi.ts
- [[fetchProductMovements()]] - code - src/features/inventory/api/productsApi.ts
- [[fetchProducts()]] - code - src/features/inventory/api/productsApi.ts
- [[getProductKey()]] - code - src/features/inventory/api/productsApi.ts
- [[inventorytypes.ts]] - code - src/features/inventory/types.ts
- [[markPending()]] - code - src/offline/db/mirror.ts
- [[products.resource.ts]] - code - src/offline/resources/products.resource.ts
- [[productsApi.ts]] - code - src/features/inventory/api/productsApi.ts
- [[productsResource]] - code - src/offline/resources/products.resource.ts
- [[updateProduct()]] - code - src/features/inventory/api/productsApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Inventory_-_adjustStock
SORT file.name ASC
```

## Connections to other communities

- 12 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 12 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 12 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 8 edges to [[_COMMUNITY_Inventory - createCategory]]
- 6 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 6 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 5 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 5 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 5 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 5 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 5 edges to [[_COMMUNITY_Customers - createCustomer]]
- 4 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 2 edges to [[_COMMUNITY_Offline Sync - start]]
- 2 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 2 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 2 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 2 edges to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 1 edge to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]

## Top bridge nodes

- [[inventorytypes.ts]] - degree 34, connects to 10 communities
- [[products.resource.ts]] - degree 35, connects to 9 communities
- [[ProductFormModal.tsx]] - degree 26, connects to 8 communities
- [[Product]] - degree 19, connects to 8 communities
- [[productsApi.ts]] - degree 25, connects to 4 communities
