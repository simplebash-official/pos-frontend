---
type: community
members: 14
---

# Offline Sync Engine (syncApi)

**Members:** 14 nodes

## Members

- [[ApiEnvelope]] - code - src/offline/resources/syncApi.ts
- [[PULL_PAGE_LIMIT]] - code - src/offline/constants.ts
- [[ResourceSyncStatus]] - code - src/offline/resources/syncApi.ts
- [[SyncChangesEnvelope]] - code - src/offline/resources/syncApi.ts
- [[SyncResourceChanges]] - code - src/offline/resources/syncApi.ts
- [[SyncStatus]] - code - src/offline/resources/syncApi.ts
- [[fetchResourceDelta()]] - code - src/offline/resources/syncApi.ts
- [[fetchResourceSnapshotPage()]] - code - src/offline/resources/syncApi.ts
- [[fetchSyncChanges()]] - code - src/offline/resources/syncApi.ts
- [[isCursorInvalid()]] - code - src/offline/resources/syncApi.ts
- [[mockStatus()]] - code - src/offline/**tests**/pullTargets.test.ts
- [[readChanges()]] - code - src/offline/resources/syncApi.ts
- [[syncApi.ts]] - code - src/offline/resources/syncApi.ts
- [[toPullPage()]] - code - src/offline/resources/syncApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_Engine_syncApi
SORT file.name ASC
```

## Connections to other communities

- 10 edges to [[_COMMUNITY_Offline Sync Engine (productsApi)]]
- 7 edges to [[_COMMUNITY_Outbox Queue & Status_2]]
- 7 edges to [[_COMMUNITY_Sync Metadata & Cursors]]
- 3 edges to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 3 edges to [[_COMMUNITY_Inventory & Products API]]
- 3 edges to [[_COMMUNITY_Customer Management & Drawers]]
- 3 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_2]]
- 3 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_4]]
- 1 edge to [[_COMMUNITY_Billing Chrome & Navigation]]

## Top bridge nodes

- [[syncApi.ts]] - degree 35, connects to 9 communities
- [[fetchResourceDelta()]] - degree 19, connects to 5 communities
- [[fetchSyncChanges()]] - degree 4, connects to 1 community
- [[PULL_PAGE_LIMIT]] - degree 2, connects to 1 community
- [[SyncStatus]] - degree 2, connects to 1 community
