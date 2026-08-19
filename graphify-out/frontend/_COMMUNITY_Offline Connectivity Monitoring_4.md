---
type: community
members: 10
---

# Offline Connectivity Monitoring

**Members:** 10 nodes

## Members
- [[SyncProvider()]] - code - src/offline/react/SyncProvider.tsx
- [[SyncProvider.tsx]] - code - src/offline/react/SyncProvider.tsx
- [[clearConnectivityNotification()]] - code - src/features/sync/lib/syncNotifications.ts
- [[notifyBackOnline()]] - code - src/features/sync/lib/syncNotifications.ts
- [[notifySyncComplete()]] - code - src/features/sync/lib/syncNotifications.ts
- [[notifySyncProblems()]] - code - src/features/sync/lib/syncNotifications.ts
- [[notifyWentOffline()]] - code - src/features/sync/lib/syncNotifications.ts
- [[registerSyncResources()]] - code - src/offline/resources/index.ts
- [[showOrUpdate()]] - code - src/features/sync/lib/syncNotifications.ts
- [[syncNotifications.ts]] - code - src/features/sync/lib/syncNotifications.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Connectivity_Monitoring
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Invoice & Document Printing]]
- 4 edges to [[_COMMUNITY_Offline Connectivity Monitoring_3]]
- 3 edges to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 2 edges to [[_COMMUNITY_App Layout & Routing]]
- 2 edges to [[_COMMUNITY_Outbox Queue & Status]]
- 2 edges to [[_COMMUNITY_Sync Metadata & Cursors]]
- 2 edges to [[_COMMUNITY_Offline Sync Engine (productsApi)]]
- 2 edges to [[_COMMUNITY_POS Cart & Checkout State_3]]
- 1 edge to [[_COMMUNITY_Authentication & Access Control]]
- 1 edge to [[_COMMUNITY_Notifications & Storage Keys]]
- 1 edge to [[_COMMUNITY_Offline Connectivity Monitoring_1]]

## Top bridge nodes
- [[SyncProvider.tsx]] - degree 22, connects to 10 communities
- [[SyncProvider()]] - degree 13, connects to 5 communities
- [[registerSyncResources()]] - degree 4, connects to 2 communities
- [[syncNotifications.ts]] - degree 10, connects to 1 community