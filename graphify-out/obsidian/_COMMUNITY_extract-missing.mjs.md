---
type: community
cohesion: 0.33
members: 6
---

# extract-missing.mjs

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[CompleteSaleResult]] - code - src/features/billing/api/invoicesApi.ts
- [[CompletedSaleData]] - code - src/store/slices/cartSlice.ts
- [[CreditNoteModalProps]] - code - src/features/invoices/components/CreditNoteModal.tsx
- [[Invoice]] - code - src/features/billing/types.ts
- [[InvoiceDetailDrawerProps]] - code - src/features/invoices/components/InvoiceDetailDrawer.tsx
- [[PaymentPanelProps]] - code - src/features/billing/components/PaymentPanel.tsx

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/extract-missingmjs
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_usePayments.ts]]
- 3 edges to [[_COMMUNITY_cartSlice.ts]]
- 3 edges to [[_COMMUNITY_ai-application]]
- 3 edges to [[_COMMUNITY_LocalStorageStore]]
- 2 edges to [[_COMMUNITY_InvoicesList.tsx]]
- 2 edges to [[_COMMUNITY_SupplierList.tsx]]
- 2 edges to [[_COMMUNITY_SaleDocumentPreviewModal.tsx]]
- 2 edges to [[_COMMUNITY_t]]
- 1 edge to [[_COMMUNITY_EmployeeList.tsx]]
- 1 edge to [[_COMMUNITY_useSupplierProducts.ts]]
- 1 edge to [[_COMMUNITY_calculatorindex.ts]]
- 1 edge to [[_COMMUNITY_AnalyticsReportPreviewModal.tsx]]
- 1 edge to [[_COMMUNITY_display-labels.mjs]]

## Top bridge nodes
- [[Invoice]] - degree 27, connects to 13 communities
- [[CompleteSaleResult]] - degree 3, connects to 2 communities
- [[PaymentPanelProps]] - degree 2, connects to 1 community
- [[CreditNoteModalProps]] - degree 2, connects to 1 community
- [[InvoiceDetailDrawerProps]] - degree 2, connects to 1 community