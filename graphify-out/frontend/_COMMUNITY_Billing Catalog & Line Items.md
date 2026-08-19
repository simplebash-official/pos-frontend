---
type: community
members: 10
---

# Billing Catalog & Line Items

**Members:** 10 nodes

## Members

- [[CatalogCategoryFilter]] - code - src/features/billing/lib/categoryIcons.ts
- [[CategoryIconInfo]] - code - src/features/billing/lib/categoryIcons.ts
- [[DEFAULT_CATEGORY_ICON]] - code - src/features/inventory/constants.ts
- [[TablerIcon]] - code - src/features/inventory/constants.ts
- [[TablerIconMap]] - code - src/shared/lib/tablerIcons.ts
- [[buildCatalogCategoryFilters()]] - code - src/features/billing/lib/categoryIcons.ts
- [[categoryIcons.ts]] - code - src/features/billing/lib/categoryIcons.ts
- [[inventoryconstants.ts]] - code - src/features/inventory/constants.ts
- [[resolveCategoryIcon()]] - code - src/features/inventory/constants.ts
- [[resolveTablerIcon()]] - code - src/shared/lib/tablerIcons.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_Catalog__Line_Items
SORT file.name ASC
```

## Connections to other communities

- 8 edges to [[_COMMUNITY_Inventory & Products API_1]]
- 7 edges to [[_COMMUNITY_POS Cart & Checkout State_2]]
- 7 edges to [[_COMMUNITY_Tabler Icon Shards_1]]
- 5 edges to [[_COMMUNITY_Product Catalog & Hierarchy]]
- 3 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_3]]
- 2 edges to [[_COMMUNITY_Inventory & Products API]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_1]]

## Top bridge nodes

- [[categoryIcons.ts]] - degree 15, connects to 4 communities
- [[inventoryconstants.ts]] - degree 13, connects to 4 communities
- [[resolveCategoryIcon()]] - degree 12, connects to 4 communities
- [[TablerIconMap]] - degree 6, connects to 3 communities
- [[resolveTablerIcon()]] - degree 5, connects to 1 community
