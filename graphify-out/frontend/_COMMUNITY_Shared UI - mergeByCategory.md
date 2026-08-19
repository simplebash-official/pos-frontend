---
type: community
cohesion: 0.13
members: 33
---

# Shared UI - mergeByCategory

**Cohesion:** 0.13 - loosely connected
**Members:** 33 nodes

## Members
- [[CUSTOMER_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[EntitySearchResult]] - code - src/shared/hooks/useEntitySearch.ts
- [[FIELDS]] - code - src/shared/lib/__tests__/search.test.ts
- [[GlobalQuickSearchModal.tsx]] - code - src/shared/components/GlobalQuickSearchModal.tsx
- [[IndexedField]] - code - src/shared/lib/search.ts
- [[MatchRange]] - code - src/shared/lib/search.ts
- [[PRINT_JOB_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[PRODUCT_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[QuickSearchResult]] - code - src/shared/components/GlobalQuickSearchModal.tsx
- [[REPAIR_JOB_SEARCH_FIELDS]] - code - src/shared/lib/searchFields.ts
- [[Row]] - code - src/shared/lib/__tests__/search.test.ts
- [[SearchEntry]] - code - src/shared/lib/search.ts
- [[SearchField]] - code - src/shared/lib/search.ts
- [[SearchFieldKind]] - code - src/shared/lib/search.ts
- [[SearchHighlight()]] - code - src/shared/components/SearchHighlight.tsx
- [[SearchHighlight.tsx]] - code - src/shared/components/SearchHighlight.tsx
- [[SearchHighlightProps]] - code - src/shared/components/SearchHighlight.tsx
- [[SearchTerm]] - code - src/shared/lib/search.ts
- [[buildSearchIndex()]] - code - src/shared/lib/search.ts
- [[getMatchRanges()]] - code - src/shared/lib/search.ts
- [[isWordChar()]] - code - src/shared/lib/search.ts
- [[matchTier()]] - code - src/shared/lib/search.ts
- [[mergeByCategory()]] - code - src/shared/components/GlobalQuickSearchModal.tsx
- [[normalizeDigits()]] - code - src/shared/lib/search.ts
- [[normalizeText()]] - code - src/shared/lib/search.ts
- [[run()]] - code - src/shared/lib/__tests__/search.test.ts
- [[scoreEntry()]] - code - src/shared/lib/search.ts
- [[search.test.ts]] - code - src/shared/lib/__tests__/search.test.ts
- [[search.ts]] - code - src/shared/lib/search.ts
- [[searchFields.ts]] - code - src/shared/lib/searchFields.ts
- [[searchIndex]] - code - src/shared/lib/search.ts
- [[tokenizeQuery()]] - code - src/shared/lib/search.ts
- [[useEntitySearch.ts]] - code - src/shared/hooks/useEntitySearch.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Shared_UI_-_mergeByCategory
SORT file.name ASC
```

## Connections to other communities
- 20 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 12 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 11 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 8 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 7 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 6 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 4 edges to [[_COMMUNITY_Employees - createEmployee]]
- 4 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 3 edges to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 2 edges to [[_COMMUNITY_Employees - JOB STATUS]]
- 2 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 2 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 2 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 1 edge to [[_COMMUNITY_Suppliers - createSupplier]]
- 1 edge to [[_COMMUNITY_Inventory - adjustStock]]
- 1 edge to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 1 edge to [[_COMMUNITY_Shared UI - activeScopes]]

## Top bridge nodes
- [[searchFields.ts]] - degree 34, connects to 13 communities
- [[GlobalQuickSearchModal.tsx]] - degree 33, connects to 10 communities
- [[useEntitySearch.ts]] - degree 20, connects to 7 communities
- [[SearchHighlight.tsx]] - degree 12, connects to 5 communities
- [[SearchHighlight()]] - degree 9, connects to 5 communities