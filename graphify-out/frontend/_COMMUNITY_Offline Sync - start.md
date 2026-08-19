---
type: community
cohesion: 0.10
members: 46
---

# Offline Sync - start

**Cohesion:** 0.10 - loosely connected
**Members:** 46 nodes

## Members
- [[dot-canSync()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-constructor()_4]] - code - src/offline/errors.ts
- [[dot-constructor()]] - code - src/offline/errors.ts
- [[dot-handleConnectivityChange()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-isLeader()]] - code - src/offline/engine/leader.ts
- [[dot-onFlushComplete()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-publish()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-requestFlush()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-runFlush()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-runMaintenance()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-runPull()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-start()]] - code - src/offline/engine/leader.ts
- [[dot-start()_1]] - code - src/offline/engine/SyncEngine.ts
- [[dot-startLoops()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-stop()]] - code - src/offline/engine/leader.ts
- [[dot-stop()_1]] - code - src/offline/engine/SyncEngine.ts
- [[dot-stopLoops()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-subscribe()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-syncNow()]] - code - src/offline/engine/SyncEngine.ts
- [[AUDIT_LOG_LIMIT]] - code - src/offline/constants.ts
- [[AuditLevel]] - code - src/offline/db/tables.ts
- [[BarcodeConflictError]] - code - src/offline/errors.ts
- [[CursorInvalidError]] - code - src/offline/errors.ts
- [[FlushCompleteListener]] - code - src/offline/engine/SyncEngine.ts
- [[LeaderElection]] - code - src/offline/engine/leader.ts
- [[PullSummary]] - code - src/offline/engine/pull.ts
- [[SyncEngine]] - code - src/offline/engine/SyncEngine.ts
- [[SyncEngine.ts]] - code - src/offline/engine/SyncEngine.ts
- [[SyncEngineListener]] - code - src/offline/engine/SyncEngine.ts
- [[adoptNewestCursor()]] - code - src/offline/engine/pull.ts
- [[applyChanges()]] - code - src/offline/engine/pull.ts
- [[auditLog.ts]] - code - src/offline/engine/auditLog.ts
- [[countByStatus()]] - code - src/offline/outbox/outbox.ts
- [[countUnsettledForResource()]] - code - src/offline/outbox/outbox.ts
- [[describeError()]] - code - src/offline/errors.ts
- [[errors.ts]] - code - src/offline/errors.ts
- [[fetchNewestCursors()]] - code - src/offline/resources/syncApi.ts
- [[fullRefresh()]] - code - src/offline/engine/pull.ts
- [[logError()]] - code - src/offline/engine/auditLog.ts
- [[logInfo()]] - code - src/offline/engine/auditLog.ts
- [[logSyncEvent()]] - code - src/offline/engine/auditLog.ts
- [[logWarn()]] - code - src/offline/engine/auditLog.ts
- [[pull.ts]] - code - src/offline/engine/pull.ts
- [[pullResource()]] - code - src/offline/engine/pull.ts
- [[toServerRow()]] - code - src/offline/db/mirror.ts
- [[trimAuditLog()]] - code - src/offline/engine/auditLog.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_start
SORT file.name ASC
```

## Connections to other communities
- 31 edges to [[_COMMUNITY_Offline Sync - signal]]
- 18 edges to [[_COMMUNITY_Offline Sync - constructor_1]]
- 11 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 10 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 9 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 9 edges to [[_COMMUNITY_Offline Sync - STORAGE]]
- 6 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 6 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 5 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 2 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 2 edges to [[_COMMUNITY_Notifications - clearConnectivityNotification]]
- 2 edges to [[_COMMUNITY_Inventory - adjustStock]]

## Top bridge nodes
- [[SyncEngine.ts]] - degree 48, connects to 10 communities
- [[SyncEngine]] - degree 21, connects to 6 communities
- [[errors.ts]] - degree 15, connects to 6 communities
- [[auditLog.ts]] - degree 17, connects to 5 communities
- [[pull.ts]] - degree 25, connects to 4 communities