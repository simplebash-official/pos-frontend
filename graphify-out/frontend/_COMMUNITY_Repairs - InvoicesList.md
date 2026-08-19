---
type: community
cohesion: 0.15
members: 26
---

# Repairs - InvoicesList

**Cohesion:** 0.15 - loosely connected
**Members:** 26 nodes

## Members

- [[Column]] - code - src/shared/components/DataTable.tsx
- [[DataTable()]] - code - src/shared/components/DataTable.tsx
- [[DataTable.tsx]] - code - src/shared/components/DataTable.tsx
- [[DataTableProps]] - code - src/shared/components/DataTable.tsx
- [[INVOICE_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[InvoicesList]] - code - src/app/router.tsx
- [[InvoicesList()]] - code - src/features/invoices/components/InvoicesList.tsx
- [[InvoicesList.tsx]] - code - src/features/invoices/components/InvoicesList.tsx
- [[PageHeader()]] - code - src/shared/components/PageHeader.tsx
- [[PageHeader.tsx]] - code - src/shared/components/PageHeader.tsx
- [[PageHeaderProps]] - code - src/shared/components/PageHeader.tsx
- [[PrintJobList]] - code - src/app/router.tsx
- [[PrintJobList()]] - code - src/features/print-jobs/components/PrintJobList.tsx
- [[PrintJobList.tsx]] - code - src/features/print-jobs/components/PrintJobList.tsx
- [[QueryConnectivityStatus]] - code - src/shared/lib/queryStatusText.ts
- [[RepairJobList]] - code - src/app/router.tsx
- [[RepairJobList()]] - code - src/features/repairs/components/RepairJobList.tsx
- [[RepairJobList.tsx]] - code - src/features/repairs/components/RepairJobList.tsx
- [[getListEmptyText()]] - code - src/shared/lib/queryStatusText.ts
- [[getSkeletonWidthPercent()]] - code - src/shared/lib/utils.ts
- [[invoicesindex.ts]] - code - src/features/invoices/index.ts
- [[print-jobsindex.ts]] - code - src/features/print-jobs/index.ts
- [[queryKeys]] - code - src/api/queryKeys.ts
- [[queryKeys.ts]] - code - src/api/queryKeys.ts
- [[queryStatusText.ts]] - code - src/shared/lib/queryStatusText.ts
- [[repairsindex.ts]] - code - src/features/repairs/index.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Repairs_-_InvoicesList
SORT file.name ASC
```

## Connections to other communities

- 14 edges to [[_COMMUNITY_Employees - JOB STATUS]]
- 13 edges to [[_COMMUNITY_Employees - createEmployee]]
- 10 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 10 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 8 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 7 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 6 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 6 edges to [[_COMMUNITY_Billing - fetchPaymentsForInvoice]]
- 6 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 5 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 5 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 4 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 4 edges to [[_COMMUNITY_Shared UI - EntityListPage]]
- 4 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 2 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 2 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 2 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 2 edges to [[_COMMUNITY_Inventory - createCategory]]
- 2 edges to [[_COMMUNITY_Customers - createCustomer]]
- 2 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 2 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 2 edges to [[_COMMUNITY_Notifications - initialState]]
- 2 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]

## Top bridge nodes

- [[queryKeys.ts]] - degree 22, connects to 13 communities
- [[queryKeys]] - degree 22, connects to 13 communities
- [[InvoicesList.tsx]] - degree 22, connects to 8 communities
- [[PrintJobList.tsx]] - degree 28, connects to 7 communities
- [[RepairJobList.tsx]] - degree 28, connects to 7 communities
