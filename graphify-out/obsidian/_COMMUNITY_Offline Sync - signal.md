---
type: community
cohesion: 0.07
members: 53
---

# Offline Sync - signal

**Cohesion:** 0.07 - loosely connected
**Members:** 53 nodes

## Members
- [[AnySyncResource]] - code - src/offline/types.ts
- [[ConflictPolicy]] - code - src/offline/types.ts
- [[ConflictStrategy]] - code - src/offline/types.ts
- [[LocalApplyHandler]] - code - src/offline/types.ts
- [[LocalApplyResult]] - code - src/offline/types.ts
- [[LocalContext]] - code - src/offline/types.ts
- [[PullContext]] - code - src/offline/types.ts
- [[PullPage]] - code - src/offline/types.ts
- [[PullSpec]] - code - src/offline/types.ts
- [[PushContext]] - code - src/offline/types.ts
- [[PushHandler]] - code - src/offline/types.ts
- [[PushResult]] - code - src/offline/types.ts
- [[RFC-3339]] - concept - src/offline/engine/pullTargets.ts
- [[RFC-3339_1]] - concept - src/offline/__tests__/pullTargets.test.ts
- [[ReferenceDeclaration]] - code - src/offline/types.ts
- [[SyncMetaPatch]] - code - src/offline/db/syncMeta.ts
- [[SyncOperation]] - code - src/offline/types.ts
- [[SyncResource]] - code - src/offline/types.ts
- [[Widget_1]] - code - src/offline/__tests__/outbox.test.ts
- [[Widget]] - code - src/offline/__tests__/pull.test.ts
- [[blankMeta()]] - code - src/offline/db/syncMeta.ts
- [[db]] - code - src/offline/db/schema.ts
- [[deltaCursors]] - code - src/offline/__tests__/pull.test.ts
- [[deltaPages]] - code - src/offline/__tests__/pull.test.ts
- [[fetchSyncStatus()]] - code - src/offline/resources/syncApi.ts
- [[getAllSyncMeta()]] - code - src/offline/db/syncMeta.ts
- [[getReferringResources()]] - code - src/offline/registry/registry.ts
- [[getResourcesInDependencyOrder()]] - code - src/offline/registry/registry.ts
- [[getSyncMeta()]] - code - src/offline/db/syncMeta.ts
- [[hasSyncResource()]] - code - src/offline/registry/registry.ts
- [[invalidateCursor()]] - code - src/offline/db/syncMeta.ts
- [[offlinetypes.ts]] - code - src/offline/types.ts
- [[outbox.test.ts]] - code - src/offline/__tests__/outbox.test.ts
- [[patchSyncMeta()]] - code - src/offline/db/syncMeta.ts
- [[pull.test.ts]] - code - src/offline/__tests__/pull.test.ts
- [[pullTargets.test.ts]] - code - src/offline/__tests__/pullTargets.test.ts
- [[pullTargets.ts]] - code - src/offline/engine/pullTargets.ts
- [[putRow()_1]] - code - src/offline/__tests__/outbox.test.ts
- [[putRow()]] - code - src/offline/__tests__/pull.test.ts
- [[reclaimInflightOperations()]] - code - src/offline/outbox/outbox.ts
- [[registry.ts]] - code - src/offline/registry/registry.ts
- [[resetRegistry()]] - code - src/offline/registry/registry.ts
- [[resolvePullTargets()]] - code - src/offline/engine/pullTargets.ts
- [[resources]] - code - src/offline/registry/registry.ts
- [[seedSyncMeta()]] - code - src/offline/db/syncMeta.ts
- [[signal()_1]] - code - src/offline/__tests__/outbox.test.ts
- [[signal()]] - code - src/offline/__tests__/pull.test.ts
- [[signal()_2]] - code - src/offline/__tests__/pullTargets.test.ts
- [[snapshot]] - code - src/offline/__tests__/pull.test.ts
- [[stubResource()]] - code - src/offline/__tests__/pullTargets.test.ts
- [[syncMeta.ts]] - code - src/offline/db/syncMeta.ts
- [[widgetResource_1]] - code - src/offline/__tests__/outbox.test.ts
- [[widgetResource]] - code - src/offline/__tests__/pull.test.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_signal
SORT file.name ASC
```

## Connections to other communities
- 31 edges to [[_COMMUNITY_Offline Sync - start]]
- 20 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 20 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 15 edges to [[_COMMUNITY_Offline Sync - constructor_1]]
- 14 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 7 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 7 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 4 edges to [[_COMMUNITY_Customers - createCustomer]]
- 4 edges to [[_COMMUNITY_Offline Sync - STORAGE]]
- 4 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 3 edges to [[_COMMUNITY_Notifications - clearConnectivityNotification]]
- 2 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 2 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 2 edges to [[_COMMUNITY_Offline Sync - depsChanged]]
- 2 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 2 edges to [[_COMMUNITY_Inventory - createCategory]]
- 2 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 1 edge to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 1 edge to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]
- 1 edge to [[_COMMUNITY_Auth - RequireAdmin]]

## Top bridge nodes
- [[db]] - degree 30, connects to 18 communities
- [[registry.ts]] - degree 42, connects to 13 communities
- [[offlinetypes.ts]] - degree 42, connects to 9 communities
- [[outbox.test.ts]] - degree 23, connects to 8 communities
- [[getResourcesInDependencyOrder()]] - degree 13, connects to 5 communities