---
type: community
cohesion: 0.22
members: 19
---

# Suppliers - createSupplier

**Cohesion:** 0.22 - loosely connected
**Members:** 19 nodes

## Members

- [[FormContentProps_1]] - code - src/features/suppliers/components/SupplierFormModal.tsx
- [[Supplier]] - code - src/features/suppliers/types.ts
- [[SupplierDetailDrawerProps]] - code - src/features/suppliers/components/SupplierDetailDrawer.tsx
- [[SupplierFormModalProps]] - code - src/features/suppliers/components/SupplierFormModal.tsx
- [[SupplierInput]] - code - src/features/suppliers/types.ts
- [[SupplierListParams]] - code - src/features/suppliers/api/suppliersApi.ts
- [[SyncedEntityFields]] - code - src/shared/types/common.ts
- [[UpdateSupplierPayload]] - code - src/offline/resources/suppliers.resource.ts
- [[createSupplier()]] - code - src/features/suppliers/api/suppliersApi.ts
- [[deleteSupplier()]] - code - src/features/suppliers/api/suppliersApi.ts
- [[deleteSuppliers()]] - code - src/features/suppliers/api/suppliersApi.ts
- [[fetchSupplierById()]] - code - src/features/suppliers/api/suppliersApi.ts
- [[fetchSupplierCategories()]] - code - src/features/suppliers/api/suppliersApi.ts
- [[fetchSuppliers()]] - code - src/features/suppliers/api/suppliersApi.ts
- [[suppliers.resource.ts]] - code - src/offline/resources/suppliers.resource.ts
- [[supplierstypes.ts]] - code - src/features/suppliers/types.ts
- [[suppliersApi.ts]] - code - src/features/suppliers/api/suppliersApi.ts
- [[suppliersResource]] - code - src/offline/resources/suppliers.resource.ts
- [[updateSupplier()]] - code - src/features/suppliers/api/suppliersApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Suppliers_-_createSupplier
SORT file.name ASC
```

## Connections to other communities

- 11 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 9 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 8 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 7 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 7 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 5 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 5 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 3 edges to [[_COMMUNITY_Customers - createCustomer]]
- 2 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 2 edges to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 1 edge to [[_COMMUNITY_Inventory - createCategory]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]
- 1 edge to [[_COMMUNITY_Offline Sync - readServerVersion]]

## Top bridge nodes

- [[suppliers.resource.ts]] - degree 30, connects to 9 communities
- [[Supplier]] - degree 16, connects to 5 communities
- [[supplierstypes.ts]] - degree 13, connects to 5 communities
- [[SyncedEntityFields]] - degree 12, connects to 5 communities
- [[suppliersResource]] - degree 12, connects to 4 communities
