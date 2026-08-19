---
type: community
cohesion: 0.36
members: 9
---

# ApiClient

**Cohesion:** 0.36 - loosely connected
**Members:** 9 nodes

## Members
- [[dot-delete()]] - code - src/api/client.ts
- [[dot-get()]] - code - src/api/client.ts
- [[dot-patch()]] - code - src/api/client.ts
- [[dot-post()]] - code - src/api/client.ts
- [[dot-put()]] - code - src/api/client.ts
- [[dot-request()]] - code - src/api/client.ts
- [[ApiClient]] - code - src/api/client.ts
- [[buildParams()]] - code - src/api/client.ts
- [[buildSyncHeaders()]] - code - src/api/client.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/ApiClient
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 2 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 2 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 1 edge to [[_COMMUNITY_Auth - RequireAdmin]]
- 1 edge to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 1 edge to [[_COMMUNITY_Billing - BackendInvoice]]
- 1 edge to [[_COMMUNITY_Customers - createCustomer]]
- 1 edge to [[_COMMUNITY_Inventory - createCategory]]
- 1 edge to [[_COMMUNITY_Inventory - adjustStock]]
- 1 edge to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 1 edge to [[_COMMUNITY_Suppliers - createSupplier]]
- 1 edge to [[_COMMUNITY_Purchases - createPurchase]]

## Top bridge nodes
- [[ApiClient]] - degree 21, connects to 12 communities
- [[buildParams()]] - degree 2, connects to 1 community
- [[buildSyncHeaders()]] - degree 2, connects to 1 community