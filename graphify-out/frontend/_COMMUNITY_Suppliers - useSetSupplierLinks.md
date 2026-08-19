---
type: community
cohesion: 0.19
members: 21
---

# Suppliers - useSetSupplierLinks

**Cohesion:** 0.19 - loosely connected
**Members:** 21 nodes

## Members

- [[ConfirmDialog()]] - code - src/shared/components/ConfirmDialog.tsx
- [[ConfirmDialog.tsx]] - code - src/shared/components/ConfirmDialog.tsx
- [[ConfirmDialogProps]] - code - src/shared/components/ConfirmDialog.tsx
- [[DeleteSupplierPayload]] - code - src/offline/resources/suppliers.resource.ts
- [[DeleteSuppliersPayload]] - code - src/offline/resources/suppliers.resource.ts
- [[NO_SUPPLIERS]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[SUPPLIER_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[SupplierList()]] - code - src/features/suppliers/components/SupplierList.tsx
- [[SupplierList.tsx]] - code - src/features/suppliers/components/SupplierList.tsx
- [[SupplierPickerModal()]] - code - src/features/suppliers/components/SupplierPickerModal.tsx
- [[SupplierPickerModal.tsx]] - code - src/features/suppliers/components/SupplierPickerModal.tsx
- [[SupplierPickerModalProps]] - code - src/features/suppliers/components/SupplierPickerModal.tsx
- [[suppliersindex.ts]] - code - src/features/suppliers/index.ts
- [[useAllSuppliers()]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[useCreateSupplier()]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[useDeleteSupplier()]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[useDeleteSuppliers()]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[useSetSupplierLinks()]] - code - src/features/supplier-products/hooks/useSupplierProducts.ts
- [[useSupplierCategories()]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[useSuppliers.ts]] - code - src/features/suppliers/hooks/useSuppliers.ts
- [[useUpdateSupplier()]] - code - src/features/suppliers/hooks/useSuppliers.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Suppliers_-_useSetSupplierLinks
SORT file.name ASC
```

## Connections to other communities

- 15 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 14 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 11 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 8 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 7 edges to [[_COMMUNITY_Employees - createEmployee]]
- 5 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 4 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 4 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 3 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 3 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 2 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 2 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 2 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 2 edges to [[_COMMUNITY_Shared UI - EntityListPage]]
- 2 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 1 edge to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 1 edge to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 1 edge to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Offline Sync - OutboxError]]

## Top bridge nodes

- [[SupplierList.tsx]] - degree 33, connects to 9 communities
- [[useSuppliers.ts]] - degree 27, connects to 8 communities
- [[ConfirmDialog.tsx]] - degree 10, connects to 7 communities
- [[ConfirmDialog()]] - degree 9, connects to 7 communities
- [[useAllSuppliers()]] - degree 13, connects to 4 communities
