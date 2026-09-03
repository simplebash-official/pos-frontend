---
type: community
cohesion: 0.14
members: 20
---

# InvoicesList.tsx

**Cohesion:** 0.14 - loosely connected
**Members:** 20 nodes

## Members
- [[BackendInvoice]] - code - src/features/billing/api/invoicesApi.ts
- [[BackendInvoiceItem]] - code - src/features/billing/api/invoicesApi.ts
- [[BackendPaymentRecord_1]] - code - src/features/billing/api/invoicesApi.ts
- [[BackendSplitPayment]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleItemInput]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSalePaymentInput]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSalePricingAdjustments]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleResponseData]] - code - src/features/billing/api/invoicesApi.ts
- [[CompleteSaleSplitPaymentInput]] - code - src/features/billing/api/invoicesApi.ts
- [[FetchInvoicesParams]] - code - src/features/billing/api/invoicesApi.ts
- [[InvoiceListResponseData]] - code - src/features/billing/api/invoicesApi.ts
- [[InvoiceStatus]] - code - src/features/billing/types.ts
- [[closeInvoice()]] - code - src/features/billing/api/invoicesApi.ts
- [[fetchAllInvoices()]] - code - src/features/billing/api/invoicesApi.ts
- [[fetchInvoiceById()]] - code - src/features/billing/api/invoicesApi.ts
- [[invoicesApi.ts]] - code - src/features/billing/api/invoicesApi.ts
- [[toInvoice()]] - code - src/features/billing/api/invoicesApi.ts
- [[toInvoiceItem()]] - code - src/features/billing/api/invoicesApi.ts
- [[toSplitPayment()]] - code - src/features/billing/api/invoicesApi.ts
- [[voidInvoice()]] - code - src/features/billing/api/invoicesApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/InvoicesListtsx
SORT file.name ASC
```

## Connections to other communities
- 14 edges to [[_COMMUNITY_usePayments.ts]]
- 2 edges to [[_COMMUNITY_useModuleStats]]
- 2 edges to [[_COMMUNITY_extract-missing.mjs]]
- 2 edges to [[_COMMUNITY_display-labels.mjs]]
- 1 edge to [[_COMMUNITY_AnalyticsReportPreviewModal.tsx]]
- 1 edge to [[_COMMUNITY_cartSlice.ts]]
- 1 edge to [[_COMMUNITY_hard-gates.mjs]]
- 1 edge to [[_COMMUNITY_router.tsx]]
- 1 edge to [[_COMMUNITY_CustomerList.tsx]]
- 1 edge to [[_COMMUNITY_ai-application]]

## Top bridge nodes
- [[invoicesApi.ts]] - degree 35, connects to 10 communities
- [[toInvoice()]] - degree 9, connects to 1 community
- [[closeInvoice()]] - degree 4, connects to 1 community
- [[fetchAllInvoices()]] - degree 4, connects to 1 community
- [[voidInvoice()]] - degree 4, connects to 1 community