---
type: community
cohesion: 0.11
members: 25
---

# Billing - BackendInvoice

**Cohesion:** 0.11 - loosely connected
**Members:** 25 nodes

## Members
- [[BackendInvoice]] - code - src/features/billing/api/invoicesApi.ts
- [[BackendInvoiceItem]] - code - src/features/billing/api/invoicesApi.ts
- [[BackendPaymentRecord_1]] - code - src/features/billing/api/invoicesApi.ts
- [[BackendSplitPayment]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleInput]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleItemInput]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSalePaymentInput]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSalePricingAdjustments]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleResponseData]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleResult]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleSplitPaymentInput]] - code - src/features/billing/api/invoicesApi.ts
- [[CompletedSaleData]] - code - src/store/slices/cartSlice.ts
- [[Invoice]] - code - src/features/billing/types.ts
- [[InvoiceItem]] - code - src/features/billing/types.ts
- [[InvoiceListResponseData]] - code - src/features/billing/api/invoicesApi.ts
- [[PrintLogEntry]] - code - src/features/invoices/api/printLogStore.ts
- [[billingindex.ts]] - code - src/features/billing/index.ts
- [[billingtypes.ts]] - code - src/features/billing/types.ts
- [[completeSale()]] - code - src/features/billing/api/invoicesApi.ts
- [[fetchInvoiceById()]] - code - src/features/billing/api/invoicesApi.ts
- [[invoicestypes.ts]] - code - src/features/invoices/types.ts
- [[invoicesApi.ts]] - code - src/features/billing/api/invoicesApi.ts
- [[toInvoice()]] - code - src/features/billing/api/invoicesApi.ts
- [[toInvoiceItem()]] - code - src/features/billing/api/invoicesApi.ts
- [[toSplitPayment()]] - code - src/features/billing/api/invoicesApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_BackendInvoice
SORT file.name ASC
```

## Connections to other communities
- 13 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 8 edges to [[_COMMUNITY_Billing - PaymentMethod]]
- 8 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 4 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 3 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 2 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 2 edges to [[_COMMUNITY_Billing - fetchPaymentsForInvoice]]
- 2 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 2 edges to [[_COMMUNITY_Billing - Header]]
- 2 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]

## Top bridge nodes
- [[invoicesApi.ts]] - degree 29, connects to 7 communities
- [[Invoice]] - degree 17, connects to 6 communities
- [[billingtypes.ts]] - degree 19, connects to 5 communities
- [[billingindex.ts]] - degree 6, connects to 4 communities
- [[invoicestypes.ts]] - degree 6, connects to 2 communities