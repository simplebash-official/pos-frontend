---
type: community
members: 30
---

# POS Billing Flow (printLogStore)

**Members:** 30 nodes

## Members

- [[A4InvoicePreviewModal()]] - code - src/features/billing/components/A4InvoicePreviewModal.tsx
- [[A4InvoicePreviewModal.tsx]] - code - src/features/billing/components/A4InvoicePreviewModal.tsx
- [[A4InvoicePreviewModalProps]] - code - src/features/billing/components/A4InvoicePreviewModal.tsx
- [[InvoiceDocumentType]] - code - src/features/billing/api/documentsApi.ts
- [[InvoiceItem]] - code - src/features/billing/types.ts
- [[PdfCanvasViewer()]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PdfCanvasViewer.tsx]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PdfCanvasViewerProps]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PrintLogEntry]] - code - src/features/invoices/api/printLogStore.ts
- [[SaleDocumentPreviewModal()]] - code - src/features/billing/components/SaleDocumentPreviewModal.tsx
- [[SaleDocumentPreviewModal.tsx]] - code - src/features/billing/components/SaleDocumentPreviewModal.tsx
- [[StandalonePrintView()]] - code - src/features/billing/components/StandalonePrintView.tsx
- [[StandalonePrintView.tsx]] - code - src/features/billing/components/StandalonePrintView.tsx
- [[UseInvoiceDocumentResult]] - code - src/features/billing/hooks/useInvoiceDocument.ts
- [[billingtypes.ts]] - code - src/features/billing/types.ts
- [[documentsApi.ts]] - code - src/features/billing/api/documentsApi.ts
- [[formatTime()]] - code - src/shared/lib/date.ts
- [[getInvoiceDocument()]] - code - src/features/billing/api/documentsApi.ts
- [[getPrintCountForInvoice()]] - code - src/features/invoices/api/printLogStore.ts
- [[getPrintLogsForInvoice()]] - code - src/features/invoices/api/printLogStore.ts
- [[invoicestypes.ts]] - code - src/features/invoices/types.ts
- [[printLogStore]] - code - src/features/invoices/api/printLogStore.ts
- [[printLogStore.ts]] - code - src/features/invoices/api/printLogStore.ts
- [[printPdfBlob()]] - code - src/shared/print/printService.tsx
- [[printService.tsx]] - code - src/shared/print/printService.tsx
- [[recordPrintEvent()]] - code - src/features/invoices/api/printLogStore.ts
- [[useInvoiceDocument()]] - code - src/features/billing/hooks/useInvoiceDocument.ts
- [[useInvoiceDocument.ts]] - code - src/features/billing/hooks/useInvoiceDocument.ts
- [[usePrint()]] - code - src/features/billing/hooks/usePrint.ts
- [[usePrint.ts]] - code - src/features/billing/hooks/usePrint.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/POS_Billing_Flow_printLogStore
SORT file.name ASC
```

## Connections to other communities

- 13 edges to [[_COMMUNITY_POS Billing Flow (useResponsive)]]
- 12 edges to [[_COMMUNITY_POS Billing Flow (saleHeroPresentation)]]
- 11 edges to [[_COMMUNITY_POS Billing Flow (paymentsApi)]]
- 10 edges to [[_COMMUNITY_Invoice & Document Printing]]
- 8 edges to [[_COMMUNITY_POS Cart & Checkout State_1]]
- 6 edges to [[_COMMUNITY_useShortcuts Module]]
- 5 edges to [[_COMMUNITY_POS Cart & Checkout State]]
- 5 edges to [[_COMMUNITY_Employee Accounts & Earnings]]
- 4 edges to [[_COMMUNITY_POS Billing Flow (router)]]
- 2 edges to [[_COMMUNITY_POS Billing Flow (invoicesApi)]]
- 2 edges to [[_COMMUNITY_POS Cart & Checkout State_2]]
- 2 edges to [[_COMMUNITY_Shop Settings & Profile]]
- 1 edge to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 1 edge to [[_COMMUNITY_Billing Chrome & Navigation]]
- 1 edge to [[_COMMUNITY_index Module]]

## Top bridge nodes

- [[SaleDocumentPreviewModal.tsx]] - degree 30, connects to 9 communities
- [[SaleDocumentPreviewModal()]] - degree 15, connects to 7 communities
- [[billingtypes.ts]] - degree 19, connects to 5 communities
- [[usePrint.ts]] - degree 15, connects to 5 communities
- [[A4InvoicePreviewModal.tsx]] - degree 17, connects to 4 communities
