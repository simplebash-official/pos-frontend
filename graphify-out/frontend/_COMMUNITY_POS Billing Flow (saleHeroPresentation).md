---
type: community
members: 12
---

# POS Billing Flow (saleHeroPresentation)

**Members:** 12 nodes

## Members

- [[CompleteSaleResult]] - code - src/features/billing/api/invoicesApi.ts
- [[CompletedSaleData]] - code - src/store/slices/cartSlice.ts
- [[Invoice]] - code - src/features/billing/types.ts
- [[InvoiceDetailDrawerProps]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[PAYMENT_METHODS]] - code - src/constants/payment.ts
- [[PaymentPanel.tsx]] - code - src/features/billing/components/PaymentPanel.tsx
- [[PaymentPanelProps]] - code - src/features/billing/components/PaymentPanel.tsx
- [[SaleDocumentPreviewModalProps]] - code - src/features/billing/components/SaleDocumentPreviewModal.tsx
- [[SaleHeroPresentation]] - code - src/features/billing/lib/saleHeroPresentation.ts
- [[getSaleHeroPresentation()]] - code - src/features/billing/lib/saleHeroPresentation.ts
- [[payment.ts]] - code - src/constants/payment.ts
- [[saleHeroPresentation.ts]] - code - src/features/billing/lib/saleHeroPresentation.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/POS_Billing_Flow_saleHeroPresentation
SORT file.name ASC
```

## Connections to other communities

- 13 edges to [[_COMMUNITY_POS Cart & Checkout State_1]]
- 12 edges to [[_COMMUNITY_POS Billing Flow (printLogStore)]]
- 10 edges to [[_COMMUNITY_POS Cart & Checkout State]]
- 4 edges to [[_COMMUNITY_index Module]]
- 3 edges to [[_COMMUNITY_POS Cart & Checkout State_2]]
- 3 edges to [[_COMMUNITY_Invoice & Document Printing]]
- 3 edges to [[_COMMUNITY_POS Billing Flow (paymentsApi)]]
- 2 edges to [[_COMMUNITY_POS Billing Flow (invoicesApi)]]
- 2 edges to [[_COMMUNITY_AmountInput Module]]
- 2 edges to [[_COMMUNITY_Billing Chrome & Navigation_1]]
- 2 edges to [[_COMMUNITY_POS Billing Flow (useResponsive)]]
- 1 edge to [[_COMMUNITY_Shop Settings & Profile]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_3]]

## Top bridge nodes

- [[PaymentPanel.tsx]] - degree 30, connects to 10 communities
- [[Invoice]] - degree 21, connects to 6 communities
- [[saleHeroPresentation.ts]] - degree 10, connects to 3 communities
- [[payment.ts]] - degree 9, connects to 3 communities
- [[getSaleHeroPresentation()]] - degree 6, connects to 3 communities
