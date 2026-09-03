---
type: community
cohesion: 0.18
members: 27
---

# constants/index.ts

**Cohesion:** 0.18 - loosely connected
**Members:** 27 nodes

## Members
- [[dot-checkNow()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearProbeTimer()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearSettleTimer()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearTimers()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-commitPendingSettle()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-constructor()_6]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-getSnapshot()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-handleLinkDown()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-handleLinkUp()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-handleNetworkObservation()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-handleVisibilityChange()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-isOnline()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-isSimulatedOffline()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-recordFailure()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-recordSuccess()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-runProbe()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-scheduleNextProbe()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-start()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-stop()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-subscribe()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-transitionTo()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-update()_1]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[ConnectivityListener]] - code - src/offline/connectivity/types.ts
- [[ConnectivityMonitor]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[ConnectivitySnapshot]] - code - src/offline/connectivity/types.ts
- [[ConnectivityState]] - code - src/offline/connectivity/types.ts
- [[connectivitytypes.ts]] - code - src/offline/connectivity/types.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/constants/indexts
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_router.tsx]]
- 4 edges to [[_COMMUNITY_SearchHistoryInput.tsx]]
- 1 edge to [[_COMMUNITY_authSlice.ts]]

## Top bridge nodes
- [[ConnectivityMonitor]] - degree 27, connects to 3 communities
- [[ConnectivitySnapshot]] - degree 6, connects to 2 communities
- [[connectivitytypes.ts]] - degree 5, connects to 2 communities
- [[ConnectivityState]] - degree 5, connects to 2 communities
- [[dot-runProbe()]] - degree 10, connects to 1 community