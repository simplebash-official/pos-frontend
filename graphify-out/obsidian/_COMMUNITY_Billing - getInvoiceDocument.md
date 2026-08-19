---
type: community
cohesion: 0.17
members: 30
---

# Billing - getInvoiceDocument

**Cohesion:** 0.17 - loosely connected
**Members:** 30 nodes

## Members

- [[A4InvoicePreviewModal()]] - code - src/features/billing/components/A4InvoicePreviewModal.tsx
- [[A4InvoicePreviewModal.tsx]] - code - src/features/billing/components/A4InvoicePreviewModal.tsx
- [[A4InvoicePreviewModalProps]] - code - src/features/billing/components/A4InvoicePreviewModal.tsx
- [[InvoiceDocumentType]] - code - src/features/billing/api/documentsApi.ts
- [[PdfCanvasViewer()]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PdfCanvasViewer.tsx]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PdfCanvasViewerProps]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PdfPageCanvas()]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[PdfPageCanvasProps]] - code - src/shared/components/PdfCanvasViewer.tsx
- [[SaleDocumentPreviewModal()]] - code - src/features/billing/components/SaleDocumentPreviewModal.tsx
- [[SaleDocumentPreviewModal.tsx]] - code - src/features/billing/components/SaleDocumentPreviewModal.tsx
- [[SaleDocumentPreviewModalProps]] - code - src/features/billing/components/SaleDocumentPreviewModal.tsx
- [[StandalonePrintView()]] - code - src/features/billing/components/StandalonePrintView.tsx
- [[StandalonePrintView.tsx]] - code - src/features/billing/components/StandalonePrintView.tsx
- [[UseInvoiceDocumentResult]] - code - src/features/billing/hooks/useInvoiceDocument.ts
- [[documentsApi.ts]] - code - src/features/billing/api/documentsApi.ts
- [[formatTime()]] - code - src/shared/lib/date.ts
- [[getInvoiceDocument()]] - code - src/features/billing/api/documentsApi.ts
- [[getPrintCountForInvoice()]] - code - src/features/invoices/api/printLogStore.ts
- [[getPrintLogsForInvoice()]] - code - src/features/invoices/api/printLogStore.ts
- [[printLogStore]] - code - src/features/invoices/api/printLogStore.ts
- [[printLogStore.ts]] - code - src/features/invoices/api/printLogStore.ts
- [[printPdfBlob()]] - code - src/shared/print/printService.tsx
- [[printService.tsx]] - code - src/shared/print/printService.tsx
- [[recordPrintEvent()]] - code - src/features/invoices/api/printLogStore.ts
- [[useAppShortcuts()]] - code - src/shared/hooks/useShortcuts.ts
- [[useInvoiceDocument()]] - code - src/features/billing/hooks/useInvoiceDocument.ts
- [[useInvoiceDocument.ts]] - code - src/features/billing/hooks/useInvoiceDocument.ts
- [[usePrint()]] - code - src/features/billing/hooks/usePrint.ts
- [[usePrint.ts]] - code - src/features/billing/hooks/usePrint.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_getInvoiceDocument
SORT file.name ASC
```

## Connections to other communities

- 9 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 8 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 8 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 6 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 5 edges to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 5 edges to [[_COMMUNITY_Billing - fetchPaymentsForInvoice]]
- 4 edges to [[_COMMUNITY_Shared UI - LocalStorageStore]]
- 4 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 4 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 4 edges to [[_COMMUNITY_Shared UI - activeScopes]]
- 3 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 2 edges to [[_COMMUNITY_Billing - Header]]
- 2 edges to [[_COMMUNITY_Settings - DEFAULT PRINT]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Employees - createEmployee]]
- 1 edge to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 1 edge to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 1 edge to [[_COMMUNITY_Employees - CURRENCY]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]

## Top bridge nodes

- [[SaleDocumentPreviewModal.tsx]] - degree 31, connects to 12 communities
- [[SaleDocumentPreviewModal()]] - degree 16, connects to 8 communities
- [[useAppShortcuts()]] - degree 12, connects to 7 communities
- [[usePrint.ts]] - degree 14, connects to 5 communities
- [[usePrint()]] - degree 8, connects to 4 communities
