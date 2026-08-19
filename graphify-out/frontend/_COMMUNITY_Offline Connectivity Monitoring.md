---
type: community
members: 72
---

# Offline Connectivity Monitoring

**Members:** 72 nodes

## Members

- [[dot-checkNow()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearProbeTimer()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearSettleTimer()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-clearTimers()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-commitPendingSettle()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[dot-constructor()]] - code - src/api/client.ts
- [[dot-constructor()_1]] - code - src/offline/connectivity/ConnectivityMonitor.ts
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
- [[dot-update()]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[AUDIT_LOG_LIMIT]] - code - src/offline/constants.ts
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
- [[STORAGE_QUOTA_WARN_RATIO]] - code - src/offline/constants.ts
- [[SYNC_LEADER_LOCK]] - code - src/offline/constants.ts
- [[backoff.ts]] - code - src/offline/outbox/backoff.ts
- [[client.ts]] - code - src/api/client.ts
- [[connectivitytypes.ts]] - code - src/offline/connectivity/types.ts
- [[env]] - code - src/config/env.ts
- [[env.ts]] - code - src/config/env.ts
- [[healthProbe.ts]] - code - src/offline/connectivity/healthProbe.ts
- [[isApiErrorLike()]] - code - src/api/client.ts
- [[listeners]] - code - src/offline/connectivity/networkSignal.ts
- [[networkSignal.ts]] - code - src/offline/connectivity/networkSignal.ts
- [[nextAttemptAt()]] - code - src/offline/outbox/backoff.ts
- [[nextAttemptDelayMs()]] - code - src/offline/outbox/backoff.ts
- [[observeNetwork()]] - code - src/offline/connectivity/networkSignal.ts
- [[offlineconstants.ts]] - code - src/offline/constants.ts
- [[probeClient]] - code - src/offline/connectivity/healthProbe.ts
- [[probeHealth()]] - code - src/offline/connectivity/healthProbe.ts
- [[readServerTime()]] - code - src/api/client.ts
- [[reportNetworkObservation()]] - code - src/offline/connectivity/networkSignal.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Connectivity_Monitoring
SORT file.name ASC
```

## Connections to other communities

- 11 edges to [[_COMMUNITY_Offline Connectivity Monitoring_3]]
- 8 edges to [[_COMMUNITY_Outbox Queue & Status]]
- 7 edges to [[_COMMUNITY_Outbox Queue & Status_1]]
- 7 edges to [[_COMMUNITY_Offline Connectivity Monitoring_1]]
- 5 edges to [[_COMMUNITY_Billing Chrome & Navigation]]
- 5 edges to [[_COMMUNITY_ID Mapping & Reference Resolution]]
- 3 edges to [[_COMMUNITY_Authentication & Access Control]]
- 3 edges to [[_COMMUNITY_Offline Sync Engine (syncApi)]]
- 3 edges to [[_COMMUNITY_Offline Connectivity Monitoring_4]]
- 2 edges to [[_COMMUNITY_MutationRequestOptions Module]]
- 2 edges to [[_COMMUNITY_index Module]]
- 2 edges to [[_COMMUNITY_Notifications & Storage Keys]]
- 2 edges to [[_COMMUNITY_Authentication & Access Control_1]]
- 1 edge to [[_COMMUNITY_POS Billing Flow (printLogStore)]]
- 1 edge to [[_COMMUNITY_POS Billing Flow (invoicesApi)]]
- 1 edge to [[_COMMUNITY_Customer Management & Drawers]]
- 1 edge to [[_COMMUNITY_Inventory & Products API]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_1]]
- 1 edge to [[_COMMUNITY_Employee Accounts & Earnings_3]]
- 1 edge to [[_COMMUNITY_Employee Accounts & Earnings_4]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_2]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_4]]
- 1 edge to [[_COMMUNITY_Offline Sync Engine (productsApi)]]
- 1 edge to [[_COMMUNITY_Sync Metadata & Cursors]]

## Top bridge nodes

- [[client.ts]] - degree 37, connects to 18 communities
- [[offlineconstants.ts]] - degree 42, connects to 8 communities
- [[ConnectivityMonitor.ts]] - degree 23, connects to 6 communities
- [[ConnectivityMonitor]] - degree 28, connects to 3 communities
- [[ConnectivitySnapshot]] - degree 10, connects to 3 communities
