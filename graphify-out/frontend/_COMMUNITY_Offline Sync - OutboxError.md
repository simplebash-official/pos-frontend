---
type: community
cohesion: 0.23
members: 20
---

# Offline Sync - OutboxError

**Cohesion:** 0.23 - loosely connected
**Members:** 20 nodes

## Members

- [[EnqueueInput]] - code - src/offline/outbox/outbox.ts
- [[LOCAL_ID_PREFIX]] - code - src/offline/ids/localId.ts
- [[OutboxError]] - code - src/offline/db/tables.ts
- [[SyncResourceId]] - code - src/offline/types.ts
- [[assertOutboxHasCapacity()]] - code - src/offline/outbox/outbox.ts
- [[assignLedgerEntriesToOperation()]] - code - src/offline/engine/stockLedger.ts
- [[claimReadyOperations()]] - code - src/offline/outbox/outbox.ts
- [[createIdempotencyKey()]] - code - src/offline/ids/localId.ts
- [[deviceId.ts]] - code - src/offline/ids/deviceId.ts
- [[enqueueOperation()]] - code - src/offline/outbox/outbox.ts
- [[getDeviceId()]] - code - src/offline/ids/deviceId.ts
- [[getResourceRanks()]] - code - src/offline/registry/registry.ts
- [[getSyncResource()]] - code - src/offline/registry/registry.ts
- [[listOperations()]] - code - src/offline/outbox/outbox.ts
- [[localId.ts]] - code - src/offline/ids/localId.ts
- [[outbox.ts]] - code - src/offline/outbox/outbox.ts
- [[randomUuid()]] - code - src/offline/ids/localId.ts
- [[submit.ts]] - code - src/offline/outbox/submit.ts
- [[submitOperation()]] - code - src/offline/outbox/submit.ts
- [[useSyncedMutation.ts]] - code - src/offline/react/useSyncedMutation.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_OutboxError
SORT file.name ASC
```

## Connections to other communities

- 26 edges to [[_COMMUNITY_Offline Sync - constructor_1]]
- 20 edges to [[_COMMUNITY_Offline Sync - signal]]
- 12 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 9 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 7 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 6 edges to [[_COMMUNITY_Offline Sync - start]]
- 5 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 5 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 5 edges to [[_COMMUNITY_Offline Sync - STORAGE]]
- 2 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 1 edge to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 1 edge to [[_COMMUNITY_Offline Sync - depsChanged]]
- 1 edge to [[_COMMUNITY_Billing - fetchInvoices]]
- 1 edge to [[_COMMUNITY_Employees - CURRENCY]]
- 1 edge to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 1 edge to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 1 edge to [[_COMMUNITY_Notifications - initialState]]
- 1 edge to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 1 edge to [[_COMMUNITY_Billing - MutationRequestOptions]]

## Top bridge nodes

- [[useSyncedMutation.ts]] - degree 18, connects to 10 communities
- [[outbox.ts]] - degree 46, connects to 7 communities
- [[SyncResourceId]] - degree 17, connects to 6 communities
- [[submit.ts]] - degree 22, connects to 5 communities
- [[deviceId.ts]] - degree 10, connects to 5 communities
