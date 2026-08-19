---
type: community
cohesion: 0.14
members: 27
---

# Purchases - createPurchase

**Cohesion:** 0.14 - loosely connected
**Members:** 27 nodes

## Members

- [[ApiEnvelope]] - code - src/offline/resources/syncApi.ts
- [[PULL_PAGE_LIMIT]] - code - src/offline/constants.ts
- [[ResourceSyncStatus]] - code - src/offline/resources/syncApi.ts
- [[SyncChangesEnvelope]] - code - src/offline/resources/syncApi.ts
- [[SyncResourceChanges]] - code - src/offline/resources/syncApi.ts
- [[SyncStatus]] - code - src/offline/resources/syncApi.ts
- [[appendStockDelta()]] - code - src/offline/engine/stockLedger.ts
- [[createPurchase()]] - code - src/features/purchases/api/purchasesApi.ts
- [[defineOperation()]] - code - src/offline/registry/registry.ts
- [[defineSyncResource()]] - code - src/offline/registry/registry.ts
- [[fetchResourceDelta()]] - code - src/offline/resources/syncApi.ts
- [[fetchResourceSnapshot()]] - code - src/offline/resources/syncApi.ts
- [[fetchResourceSnapshotPage()]] - code - src/offline/resources/syncApi.ts
- [[fetchSyncChanges()]] - code - src/offline/resources/syncApi.ts
- [[isCursorInvalid()]] - code - src/offline/resources/syncApi.ts
- [[mockStatus()]] - code - src/offline/**tests**/pullTargets.test.ts
- [[purchases.resource.ts]] - code - src/offline/resources/purchases.resource.ts
- [[purchasesResource]] - code - src/offline/resources/purchases.resource.ts
- [[readChanges()]] - code - src/offline/resources/syncApi.ts
- [[registerSyncResource()]] - code - src/offline/registry/registry.ts
- [[registerSyncResources()]] - code - src/offline/resources/index.ts
- [[resourcesindex.ts]] - code - src/offline/resources/index.ts
- [[stockMovements.resource.ts]] - code - src/offline/resources/stockMovements.resource.ts
- [[stockMovementsResource]] - code - src/offline/resources/stockMovements.resource.ts
- [[syncApi.ts]] - code - src/offline/resources/syncApi.ts
- [[toLocalRow()]] - code - src/offline/db/mirror.ts
- [[toPullPage()]] - code - src/offline/resources/syncApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Purchases_-_createPurchase
SORT file.name ASC
```

## Connections to other communities

- 20 edges to [[_COMMUNITY_Offline Sync - signal]]
- 12 edges to [[_COMMUNITY_Customers - createCustomer]]
- 12 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 11 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 9 edges to [[_COMMUNITY_Inventory - createCategory]]
- 9 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 6 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 5 edges to [[_COMMUNITY_Offline Sync - start]]
- 5 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 4 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 3 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 3 edges to [[_COMMUNITY_Notifications - clearConnectivityNotification]]
- 3 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 2 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 1 edge to [[_COMMUNITY_ApiClient]]

## Top bridge nodes

- [[syncApi.ts]] - degree 35, connects to 10 communities
- [[resourcesindex.ts]] - degree 18, connects to 7 communities
- [[toLocalRow()]] - degree 15, connects to 7 communities
- [[defineSyncResource()]] - degree 9, connects to 7 communities
- [[defineOperation()]] - degree 8, connects to 7 communities
