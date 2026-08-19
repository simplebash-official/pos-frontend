---
type: community
cohesion: 0.06
members: 72
---

# Offline Sync - constructor

**Cohesion:** 0.06 - loosely connected
**Members:** 72 nodes

## Members
- [[dot-checkNow()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearProbeTimer()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearSettleTimer()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearTimers()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-commitPendingSettle()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-constructor()_5]] - code - src/api/client.ts
- [[dot-constructor()_3]] - code - src/offline/connectivity/ConnectivityMonitor.ts
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
- [[dot-start()_2]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-stop()_2]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-subscribe()_1]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-transitionTo()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-update()_1]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[ConnectivityListener]] - code - src/offline/connectivity/types.ts
- [[ConnectivityMonitor]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[ConnectivityMonitor.ts]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[ConnectivitySnapshot]] - code - src/offline/connectivity/types.ts
- [[ConnectivityState]] - code - src/offline/connectivity/types.ts
- [[DEGRADED_LATENCY_MS]] - code - src/offline/constants.ts
- [[HEADER_DEVICE_ID]] - code - src/offline/constants.ts
- [[HEADER_IDEMPOTENCY_KEY]] - code - src/offline/constants.ts
- [[HEADER_IF_MATCH]] - code - src/offline/constants.ts
- [[HEADER_SERVER_TIME]] - code - src/offline/constants.ts
- [[HEALTH_PROBE_BACKOFF_MS]] - code - src/offline/constants.ts
- [[HEALTH_PROBE_INTERVAL_ONLINE_MS]] - code - src/offline/constants.ts
- [[HEALTH_PROBE_TIMEOUT_MS]] - code - src/offline/constants.ts
- [[Listener]] - code - src/offline/connectivity/networkSignal.ts
- [[MAX_CLOCK_SKEW_MS]] - code - src/offline/constants.ts
- [[MAX_PUSH_ATTEMPTS]] - code - src/offline/constants.ts
- [[NOTIFICATION_ID_CONNECTIVITY]] - code - src/offline/constants.ts
- [[NOTIFICATION_ID_SYNC_ERROR]] - code - src/offline/constants.ts
- [[NetworkObservation]] - code - src/offline/connectivity/networkSignal.ts
- [[OFFLINE_DB_NAME]] - code - src/offline/constants.ts
- [[OFFLINE_FAILURE_THRESHOLD]] - code - src/offline/constants.ts
- [[ONLINE_SETTLE_MS]] - code - src/offline/constants.ts
- [[OUTBOX_CAPACITY]] - code - src/offline/constants.ts
- [[ProbeResult]] - code - src/offline/connectivity/healthProbe.ts
- [[REQUEST_TIMEOUT_MS]] - code - src/offline/constants.ts
- [[RETRY_BASE_MS]] - code - src/offline/constants.ts
- [[RETRY_JITTER_RATIO]] - code - src/offline/constants.ts
- [[RETRY_MAX_MS]] - code - src/offline/constants.ts
- [[RequestOptions]] - code - src/api/client.ts
- [[SYNC_LEADER_LOCK]] - code - src/offline/constants.ts
- [[backoff.ts]] - code - src/offline/outbox/backoff.ts
- [[client.ts]] - code - src/api/client.ts
- [[connectivitytypes.ts]] - code - src/offline/connectivity/types.ts
- [[env]] - code - src/config/env.ts
- [[env.ts]] - code - src/config/env.ts
- [[healthProbe.ts]] - code - src/offline/connectivity/healthProbe.ts
- [[isApiErrorLike()]] - code - src/api/client.ts
- [[leader.ts]] - code - src/offline/engine/leader.ts
- [[listeners_1]] - code - src/offline/connectivity/networkSignal.ts
- [[networkSignal.ts]] - code - src/offline/connectivity/networkSignal.ts
- [[nextAttemptAt()]] - code - src/offline/outbox/backoff.ts
- [[nextAttemptDelayMs()]] - code - src/offline/outbox/backoff.ts
- [[observeNetwork()]] - code - src/offline/connectivity/networkSignal.ts
- [[offlineconstants.ts]] - code - src/offline/constants.ts
- [[onlineManagerBridge.ts]] - code - src/offline/connectivity/onlineManagerBridge.ts
- [[probeClient]] - code - src/offline/connectivity/healthProbe.ts
- [[probeHealth()]] - code - src/offline/connectivity/healthProbe.ts
- [[readServerTime()]] - code - src/api/client.ts
- [[reportNetworkObservation()]] - code - src/offline/connectivity/networkSignal.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_constructor
SORT file.name ASC
```

## Connections to other communities
- 11 edges to [[_COMMUNITY_Offline Sync - start]]
- 7 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 7 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 5 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 5 edges to [[_COMMUNITY_Offline Sync - constructor_1]]
- 5 edges to [[_COMMUNITY_Auth - RequireAdmin]]
- 4 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 4 edges to [[_COMMUNITY_ApiClient]]
- 3 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 3 edges to [[_COMMUNITY_Notifications - clearConnectivityNotification]]
- 2 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 2 edges to [[_COMMUNITY_Offline Sync - STORAGE]]
- 2 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 2 edges to [[_COMMUNITY_Notifications - initialState]]
- 2 edges to [[_COMMUNITY_Customers - createCustomer]]
- 2 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 1 edge to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 1 edge to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Inventory - adjustStock]]
- 1 edge to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 1 edge to [[_COMMUNITY_Billing - BackendInvoice]]
- 1 edge to [[_COMMUNITY_Inventory - createCategory]]
- 1 edge to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 1 edge to [[_COMMUNITY_Suppliers - createSupplier]]
- 1 edge to [[_COMMUNITY_Inventory - AppUpdatePrompt]]

## Top bridge nodes
- [[client.ts]] - degree 37, connects to 16 communities
- [[offlineconstants.ts]] - degree 42, connects to 9 communities
- [[ConnectivityMonitor.ts]] - degree 25, connects to 7 communities
- [[ConnectivityMonitor]] - degree 30, connects to 4 communities
- [[ConnectivitySnapshot]] - degree 9, connects to 3 communities