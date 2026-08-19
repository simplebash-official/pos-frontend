---
type: community
cohesion: 0.15
members: 34
---

# Billing - CartLineItem

**Cohesion:** 0.15 - loosely connected
**Members:** 34 nodes

## Members
- [[CartLineItem]] - code - src/features/billing/components/CartLineItem.tsx
- [[CartLineItem.tsx]] - code - src/features/billing/components/CartLineItem.tsx
- [[CatalogCategoryFilter]] - code - src/features/billing/lib/categoryIcons.ts
- [[CatalogPanel]] - code - src/features/billing/components/CatalogPanel.tsx
- [[CatalogPanel.tsx]] - code - src/features/billing/components/CatalogPanel.tsx
- [[CatalogPanelProps]] - code - src/features/billing/components/CatalogPanel.tsx
- [[CategoryIconInfo]] - code - src/features/billing/lib/categoryIcons.ts
- [[CombinedServiceJob]] - code - src/features/billing/components/ServiceJobPickerModal.tsx
- [[CustomerPickerModal()]] - code - src/features/customers/components/CustomerPickerModal.tsx
- [[DiscountPopover()]] - code - src/features/billing/components/DiscountPopover.tsx
- [[DiscountPopover.tsx]] - code - src/features/billing/components/DiscountPopover.tsx
- [[DiscountPopoverProps]] - code - src/features/billing/components/DiscountPopover.tsx
- [[GlobalQuickSearchModal()]] - code - src/shared/components/GlobalQuickSearchModal.tsx
- [[SERVICE_JOB_SEARCH_FIELDS]] - code - src/features/billing/components/ServiceJobPickerModal.tsx
- [[ServiceJobPickerModal()]] - code - src/features/billing/components/ServiceJobPickerModal.tsx
- [[ServiceJobPickerModal.tsx]] - code - src/features/billing/components/ServiceJobPickerModal.tsx
- [[ServiceJobPickerModalProps]] - code - src/features/billing/components/ServiceJobPickerModal.tsx
- [[TablerIcon]] - code - src/features/inventory/constants.ts
- [[audio.ts]] - code - src/features/billing/lib/audio.ts
- [[buildCatalogCategoryFilters()]] - code - src/features/billing/lib/categoryIcons.ts
- [[categoryIcons.ts]] - code - src/features/billing/lib/categoryIcons.ts
- [[chunk()]] - code - src/features/billing/components/CatalogPanel.tsx
- [[fetchPrintJobs()]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[fetchRepairs()]] - code - src/features/repairs/api/repairsApi.ts
- [[formatMoney()]] - code - src/shared/lib/money.ts
- [[generateServiceJobId()]] - code - src/features/billing/components/ServiceJobPickerModal.tsx
- [[getAudioContext()]] - code - src/features/billing/lib/audio.ts
- [[getCategoryIconInfo()]] - code - src/features/billing/lib/categoryIcons.ts
- [[playErrorSound()]] - code - src/features/billing/lib/audio.ts
- [[playPaymentCompleteSound()]] - code - src/features/billing/lib/audio.ts
- [[playScanSuccessSound()]] - code - src/features/billing/lib/audio.ts
- [[resolveOrCreateCustomer()]] - code - src/features/billing/lib/resolveOrCreateCustomer.ts
- [[useCreateCustomer()]] - code - src/features/customers/hooks/useCustomers.ts
- [[useEntitySearch()]] - code - src/shared/hooks/useEntitySearch.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_CartLineItem
SORT file.name ASC
```

## Connections to other communities
- 27 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 27 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 25 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 20 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 17 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 10 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 8 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 8 edges to [[_COMMUNITY_Employees - createEmployee]]
- 8 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 6 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 5 edges to [[_COMMUNITY_Billing - PaymentMethod]]
- 5 edges to [[_COMMUNITY_Billing - Header]]
- 4 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 4 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 4 edges to [[_COMMUNITY_Shared UI - EntityListPage]]
- 3 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 2 edges to [[_COMMUNITY_Billing - fetchPaymentsForInvoice]]
- 2 edges to [[_COMMUNITY_Employees - JOB STATUS]]
- 2 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 2 edges to [[_COMMUNITY_Shared UI - AmountInput]]
- 1 edge to [[_COMMUNITY_Inventory - createCategory]]
- 1 edge to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 1 edge to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 1 edge to [[_COMMUNITY_Shared UI - TablerIconPicker]]

## Top bridge nodes
- [[formatMoney()]] - degree 57, connects to 13 communities
- [[CatalogPanel.tsx]] - degree 44, connects to 13 communities
- [[ServiceJobPickerModal.tsx]] - degree 38, connects to 10 communities
- [[useEntitySearch()]] - degree 27, connects to 7 communities
- [[CatalogPanel]] - degree 21, connects to 5 communities