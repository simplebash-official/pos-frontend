---
type: community
cohesion: 0.23
members: 17
---

# Inventory - createCategory

**Cohesion:** 0.23 - loosely connected
**Members:** 17 nodes

## Members

- [[AddSubcategoryPayload]] - code - src/offline/resources/categories.resource.ts
- [[Category]] - code - src/features/inventory/types.ts
- [[CategoryInput]] - code - src/features/inventory/types.ts
- [[DeleteCategoryPayload]] - code - src/offline/resources/categories.resource.ts
- [[RemoveSubcategoryPayload]] - code - src/offline/resources/categories.resource.ts
- [[UpdateCategoryPayload]] - code - src/offline/resources/categories.resource.ts
- [[categories.resource.ts]] - code - src/offline/resources/categories.resource.ts
- [[categoriesApi.ts]] - code - src/features/inventory/api/categoriesApi.ts
- [[categoriesResource]] - code - src/offline/resources/categories.resource.ts
- [[createCategory()]] - code - src/features/inventory/api/categoriesApi.ts
- [[createSubcategory()]] - code - src/features/inventory/api/categoriesApi.ts
- [[deleteCategory()]] - code - src/features/inventory/api/categoriesApi.ts
- [[deleteSubcategory()]] - code - src/features/inventory/api/categoriesApi.ts
- [[fetchCategories()]] - code - src/features/inventory/api/categoriesApi.ts
- [[fetchSubcategories()]] - code - src/features/inventory/api/categoriesApi.ts
- [[fetchValidCategories()]] - code - src/features/inventory/api/categoriesApi.ts
- [[updateCategory()]] - code - src/features/inventory/api/categoriesApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Inventory_-_createCategory
SORT file.name ASC
```

## Connections to other communities

- 10 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 9 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 8 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 3 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 3 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 3 edges to [[_COMMUNITY_Customers - createCustomer]]
- 2 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 2 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 2 edges to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Billing - CartLineItem]]
- 1 edge to [[_COMMUNITY_Suppliers - createSupplier]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]
- 1 edge to [[_COMMUNITY_Offline Sync - readServerVersion]]

## Top bridge nodes

- [[categories.resource.ts]] - degree 32, connects to 9 communities
- [[Category]] - degree 11, connects to 5 communities
- [[categoriesApi.ts]] - degree 19, connects to 4 communities
- [[categoriesResource]] - degree 13, connects to 4 communities
- [[CategoryInput]] - degree 5, connects to 2 communities
