---
type: community
members: 11
---

# POS Billing Flow (paymentsApi)

**Members:** 11 nodes

## Members
- [[INVOICE_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[InvoiceDetailDrawer()]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[InvoiceDetailDrawer.tsx]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[InvoicesList]] - code - src/app/router.tsx
- [[InvoicesList()]] - code - src/features/invoices/components/InvoicesList.tsx
- [[InvoicesList.tsx]] - code - src/features/invoices/components/InvoicesList.tsx
- [[fetchInvoices()]] - code - src/features/billing/api/invoicesApi.ts
- [[fetchPaymentsForInvoice()]] - code - src/features/billing/api/paymentsApi.ts
- [[invoicesindex.ts]] - code - src/features/invoices/index.ts
- [[recordPayment()]] - code - src/features/billing/api/paymentsApi.ts
- [[toPaymentRecord()]] - code - src/features/billing/api/paymentsApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/POS_Billing_Flow_paymentsApi
SORT file.name ASC
```

## Connections to other communities
- 11 edges to [[_COMMUNITY_POS Billing Flow (printLogStore)]]
- 6 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_3]]
- 4 edges to [[_COMMUNITY_Billing Chrome & Navigation]]
- 4 edges to [[_COMMUNITY_POS Cart & Checkout State_2]]
- 3 edges to [[_COMMUNITY_POS Billing Flow (invoicesApi)]]
- 3 edges to [[_COMMUNITY_POS Billing Flow (saleHeroPresentation)]]
- 3 edges to [[_COMMUNITY_POS Billing Flow (useResponsive)]]
- 2 edges to [[_COMMUNITY_Employee Accounts & Earnings_5]]
- 2 edges to [[_COMMUNITY_POS Billing Flow (router)]]
- 2 edges to [[_COMMUNITY_POS Billing Flow (useCustomers)]]
- 2 edges to [[_COMMUNITY_index Module]]
- 2 edges to [[_COMMUNITY_Billing Chrome & Navigation_1]]
- 1 edge to [[_COMMUNITY_Product Catalog & Hierarchy]]

## Top bridge nodes
- [[InvoicesList.tsx]] - degree 18, connects to 8 communities
- [[InvoiceDetailDrawer.tsx]] - degree 21, connects to 7 communities
- [[InvoiceDetailDrawer()]] - degree 8, connects to 3 communities
- [[invoicesindex.ts]] - degree 7, connects to 2 communities
- [[fetchInvoices()]] - degree 6, connects to 2 communities