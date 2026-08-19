---
type: community
cohesion: 0.13
members: 21
---

# Billing - MutationRequestOptions

**Cohesion:** 0.13 - loosely connected
**Members:** 21 nodes

## Members

- [[ApiResponse]] - code - src/shared/types/common.ts
- [[BackendPaymentRecord]] - code - src/features/billing/api/paymentsApi.ts
- [[EnrichedStockPurchase]] - code - src/features/purchases/types.ts
- [[MutationRequestOptions]] - code - src/api/client.ts
- [[PaginatedResponse]] - code - src/shared/types/common.ts
- [[PaymentListResponseData]] - code - src/features/billing/api/paymentsApi.ts
- [[PaymentRecord]] - code - src/features/billing/api/paymentsApi.ts
- [[PurchaseListParams]] - code - src/features/purchases/api/purchasesApi.ts
- [[PurchaseProductSummary]] - code - src/features/purchases/types.ts
- [[PurchaseSupplierSummary]] - code - src/features/purchases/types.ts
- [[RecordPaymentInput]] - code - src/features/billing/api/paymentsApi.ts
- [[SelectOption]] - code - src/shared/types/common.ts
- [[StockPurchase]] - code - src/features/purchases/types.ts
- [[StockPurchaseInput]] - code - src/features/purchases/types.ts
- [[common.ts]] - code - src/shared/types/common.ts
- [[fetchPurchases()]] - code - src/features/purchases/api/purchasesApi.ts
- [[fetchPurchasesByProduct()]] - code - src/features/purchases/api/purchasesApi.ts
- [[fetchPurchasesBySupplier()]] - code - src/features/purchases/api/purchasesApi.ts
- [[paymentsApi.ts]] - code - src/features/billing/api/paymentsApi.ts
- [[purchasestypes.ts]] - code - src/features/purchases/types.ts
- [[purchasesApi.ts]] - code - src/features/purchases/api/purchasesApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_MutationRequestOptions
SORT file.name ASC
```

## Connections to other communities

- 7 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 6 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 5 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 5 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 4 edges to [[_COMMUNITY_Customers - createCustomer]]
- 4 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 4 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 4 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 4 edges to [[_COMMUNITY_Billing - fetchPaymentsForInvoice]]
- 3 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 3 edges to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 3 edges to [[_COMMUNITY_Inventory - createCategory]]
- 2 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 2 edges to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Billing - fetchInvoices]]
- 1 edge to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 1 edge to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 1 edge to [[_COMMUNITY_Offline Sync - OutboxError]]
- 1 edge to [[_COMMUNITY_Auth - RequireAdmin]]

## Top bridge nodes

- [[common.ts]] - degree 28, connects to 14 communities
- [[ApiResponse]] - degree 11, connects to 7 communities
- [[MutationRequestOptions]] - degree 8, connects to 6 communities
- [[purchasestypes.ts]] - degree 12, connects to 4 communities
- [[StockPurchase]] - degree 7, connects to 4 communities
