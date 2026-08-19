---
type: community
cohesion: 0.47
members: 6
---

# Billing - fetchPaymentsForInvoice

**Cohesion:** 0.47 - moderately connected
**Members:** 6 nodes

## Members
- [[InvoiceDetailDrawer()]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[InvoiceDetailDrawer.tsx]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[InvoiceDetailDrawerProps]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[fetchPaymentsForInvoice()]] - code - src/features/billing/api/paymentsApi.ts
- [[recordPayment()]] - code - src/features/billing/api/paymentsApi.ts
- [[toPaymentRecord()]] - code - src/features/billing/api/paymentsApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_fetchPaymentsForInvoice
SORT file.name ASC
```

## Connections to other communities
- 6 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 5 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 4 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 3 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 2 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 2 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 1 edge to [[_COMMUNITY_Employees - CURRENCY]]

## Top bridge nodes
- [[InvoiceDetailDrawer.tsx]] - degree 19, connects to 7 communities
- [[InvoiceDetailDrawer()]] - degree 7, connects to 4 communities
- [[fetchPaymentsForInvoice()]] - degree 4, connects to 1 community
- [[recordPayment()]] - degree 3, connects to 1 community
- [[toPaymentRecord()]] - degree 3, connects to 1 community