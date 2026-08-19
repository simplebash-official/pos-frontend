---
type: community
members: 41
---

# Offline Connectivity Monitoring

**Members:** 41 nodes

## Members

- [[dot-canSync()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-handleConnectivityChange()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-isLeader()]] - code - src/offline/engine/leader.ts
- [[dot-onFlushComplete()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-publish()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-requestFlush()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-runFlush()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-runMaintenance()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-runPull()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-start()_2]] - code - src/offline/engine/leader.ts
- [[dot-start()_1]] - code - src/offline/engine/SyncEngine.ts
- [[dot-startLoops()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-stop()_2]] - code - src/offline/engine/leader.ts
- [[dot-stop()_1]] - code - src/offline/engine/SyncEngine.ts
- [[dot-stopLoops()]] - code - src/offline/engine/SyncEngine.ts
- [[dot-subscribe()_1]] - code - src/offline/engine/SyncEngine.ts
- [[dot-syncNow()]] - code - src/offline/engine/SyncEngine.ts
- [[ClearLocalDataOptions]] - code - src/offline/db/maintenance.ts
- [[FlushCompleteListener]] - code - src/offline/engine/SyncEngine.ts
- [[LeaderElection]] - code - src/offline/engine/leader.ts
- [[SyncEngine]] - code - src/offline/engine/SyncEngine.ts
- [[SyncEngine.ts]] - code - src/offline/engine/SyncEngine.ts
- [[SyncEngineListener]] - code - src/offline/engine/SyncEngine.ts
- [[auditLog.ts]] - code - src/offline/engine/auditLog.ts
- [[clearLocalData()]] - code - src/offline/db/maintenance.ts
- [[countByStatus()]] - code - src/offline/outbox/outbox.ts
- [[countUnsettled()]] - code - src/offline/outbox/outbox.ts
- [[countUnsettledForResource()]] - code - src/offline/outbox/outbox.ts
- [[forceFullResync()]] - code - src/offline/db/maintenance.ts
- [[getResourcesInDependencyOrder()]] - code - src/offline/registry/registry.ts
- [[leader.ts]] - code - src/offline/engine/leader.ts
- [[logError()]] - code - src/offline/engine/auditLog.ts
- [[logInfo()]] - code - src/offline/engine/auditLog.ts
- [[logSyncEvent()]] - code - src/offline/engine/auditLog.ts
- [[logWarn()]] - code - src/offline/engine/auditLog.ts
- [[maintenance.ts]] - code - src/offline/db/maintenance.ts
- [[pruneByRetention()]] - code - src/offline/db/maintenance.ts
- [[pruneConfirmedLedgerEntries()]] - code - src/offline/engine/stockLedger.ts
- [[requestPersistentStorage()]] - code - src/offline/db/maintenance.ts
- [[rowAgeTimestamp()]] - code - src/offline/db/maintenance.ts
- [[trimAuditLog()]] - code - src/offline/engine/auditLog.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Connectivity_Monitoring
SORT file.name ASC
```

## Connections to other communities

- 18 edges to [[_COMMUNITY_Sync Metadata & Cursors]]
- 14 edges to [[_COMMUNITY_Outbox Queue & Status]]
- 14 edges to [[_COMMUNITY_Outbox Queue & Status_2]]
- 12 edges to [[_COMMUNITY_Offline Connectivity Monitoring_1]]
- 12 edges to [[_COMMUNITY_ID Mapping & Reference Resolution]]
- 11 edges to [[_COMMUNITY_Outbox Queue & Status_1]]
- 11 edges to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 4 edges to [[_COMMUNITY_Offline Connectivity Monitoring_4]]
- 2 edges to [[_COMMUNITY_POS Cart & Checkout State_1]]

## Top bridge nodes

- [[SyncEngine.ts]] - degree 48, connects to 9 communities
- [[maintenance.ts]] - degree 23, connects to 5 communities
- [[SyncEngine]] - degree 21, connects to 5 communities
- [[auditLog.ts]] - degree 17, connects to 4 communities
- [[dot-runFlush()]] - degree 11, connects to 3 communities
