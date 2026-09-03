---
type: community
cohesion: 0.36
members: 10
---

# useIsMobile

**Cohesion:** 0.36 - loosely connected
**Members:** 10 nodes

## Members
- [[BackendPaymentRecord]] - code - src/features/billing/api/paymentsApi.ts
- [[NO_PAYMENTS]] - code - src/features/billing/hooks/usePayments.ts
- [[PaymentRecord]] - code - src/features/billing/api/paymentsApi.ts
- [[RecordPaymentInput]] - code - src/features/billing/api/paymentsApi.ts
- [[RecordPaymentPayload]] - code - src/features/billing/hooks/usePayments.ts
- [[fetchInvoicePayments()]] - code - src/features/billing/api/paymentsApi.ts
- [[paymentsApi.ts]] - code - src/features/billing/api/paymentsApi.ts
- [[recordPayment()]] - code - src/features/billing/api/paymentsApi.ts
- [[toPaymentRecord()]] - code - src/features/billing/api/paymentsApi.ts
- [[usePayments.ts]] - code - src/features/billing/hooks/usePayments.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/useIsMobile
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_usePayments.ts]]
- 2 edges to [[_COMMUNITY_useModuleStats]]
- 2 edges to [[_COMMUNITY_CreditNoteModal.tsx]]
- 1 edge to [[_COMMUNITY_hard-gates.mjs]]
- 1 edge to [[_COMMUNITY_router.tsx]]

## Top bridge nodes
- [[paymentsApi.ts]] - degree 11, connects to 3 communities
- [[usePayments.ts]] - degree 12, connects to 2 communities
- [[fetchInvoicePayments()]] - degree 4, connects to 1 community
- [[recordPayment()]] - degree 4, connects to 1 community