---
type: community
cohesion: 0.24
members: 10
---

# Offline Sync - STORAGE

**Cohesion:** 0.24 - loosely connected
**Members:** 10 nodes

## Members
- [[ClearLocalDataOptions]] - code - src/offline/db/maintenance.ts
- [[MIRROR_TABLE_NAMES]] - code - src/offline/db/schema.ts
- [[STORAGE_QUOTA_WARN_RATIO]] - code - src/offline/constants.ts
- [[StorageEstimate]] - code - src/offline/db/maintenance.ts
- [[clearLocalData()]] - code - src/offline/db/maintenance.ts
- [[countUnsettled()]] - code - src/offline/outbox/outbox.ts
- [[maintenance.ts]] - code - src/offline/db/maintenance.ts
- [[pruneByRetention()]] - code - src/offline/db/maintenance.ts
- [[requestPersistentStorage()]] - code - src/offline/db/maintenance.ts
- [[rowAgeTimestamp()]] - code - src/offline/db/maintenance.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_STORAGE
SORT file.name ASC
```

## Connections to other communities
- 9 edges to [[_COMMUNITY_Offline Sync - start]]
- 7 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 5 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 4 edges to [[_COMMUNITY_Offline Sync - signal]]
- 2 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 2 edges to [[_COMMUNITY_Inventory - StockMovement]]

## Top bridge nodes
- [[maintenance.ts]] - degree 23, connects to 6 communities
- [[countUnsettled()]] - degree 6, connects to 2 communities
- [[clearLocalData()]] - degree 5, connects to 2 communities
- [[pruneByRetention()]] - degree 5, connects to 2 communities
- [[MIRROR_TABLE_NAMES]] - degree 4, connects to 2 communities