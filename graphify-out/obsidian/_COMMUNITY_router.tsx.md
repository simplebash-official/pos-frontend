---
type: community
cohesion: 0.11
members: 35
---

# router.tsx

**Cohesion:** 0.11 - loosely connected
**Members:** 35 nodes

## Members
- [[dot-constructor()]] - code - src/api/client.ts
- [[ConnectivityMonitor.ts]] - code - src/offline/connectivity/ConnectivityMonitor.ts
- [[DEGRADED_LATENCY_MS]] - code - src/offline/constants.ts
- [[HEADER_DEVICE_ID]] - code - src/offline/constants.ts
- [[HEADER_IDEMPOTENCY_KEY]] - code - src/offline/constants.ts
- [[HEADER_SERVER_TIME]] - code - src/offline/constants.ts
- [[HEALTH_PROBE_BACKOFF_MS]] - code - src/offline/constants.ts
- [[HEALTH_PROBE_INTERVAL_ONLINE_MS]] - code - src/offline/constants.ts
- [[HEALTH_PROBE_TIMEOUT_MS]] - code - src/offline/constants.ts
- [[Listener]] - code - src/offline/connectivity/networkSignal.ts
- [[MUTATING_METHODS]] - code - src/api/client.ts
- [[NetworkObservation]] - code - src/offline/connectivity/networkSignal.ts
- [[OFFLINE_FAILURE_THRESHOLD]] - code - src/offline/constants.ts
- [[ONLINE_SETTLE_MS]] - code - src/offline/constants.ts
- [[ProbeResult]] - code - src/offline/connectivity/healthProbe.ts
- [[REQUEST_TIMEOUT_MS]] - code - src/offline/constants.ts
- [[RequestOptions]] - code - src/api/client.ts
- [[client.ts]] - code - src/api/client.ts
- [[createIdempotencyKey()]] - code - src/shared/lib/id.ts
- [[deviceId.ts]] - code - src/api/deviceId.ts
- [[env]] - code - src/config/env.ts
- [[env.ts]] - code - src/config/env.ts
- [[getDeviceId()]] - code - src/api/deviceId.ts
- [[healthProbe.ts]] - code - src/offline/connectivity/healthProbe.ts
- [[id.ts]] - code - src/shared/lib/id.ts
- [[isApiErrorLike()]] - code - src/api/client.ts
- [[listeners]] - code - src/offline/connectivity/networkSignal.ts
- [[networkSignal.ts]] - code - src/offline/connectivity/networkSignal.ts
- [[observeNetwork()]] - code - src/offline/connectivity/networkSignal.ts
- [[offlineconstants.ts]] - code - src/offline/constants.ts
- [[probeClient]] - code - src/offline/connectivity/healthProbe.ts
- [[probeHealth()]] - code - src/offline/connectivity/healthProbe.ts
- [[randomUuid()]] - code - src/shared/lib/id.ts
- [[readServerTime()]] - code - src/api/client.ts
- [[reportNetworkObservation()]] - code - src/offline/connectivity/networkSignal.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/routertsx
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_constantsindex.ts]]
- 7 edges to [[_COMMUNITY_useModuleStats]]
- 5 edges to [[_COMMUNITY_SearchHistoryInput.tsx]]
- 4 edges to [[_COMMUNITY_settingsSlice.ts]]
- 3 edges to [[_COMMUNITY_hard-gates.mjs]]
- 3 edges to [[_COMMUNITY_Step 2 Choose a Deploy Method]]
- 2 edges to [[_COMMUNITY_useCategories.ts]]
- 1 edge to [[_COMMUNITY_SupplierDetailDrawer.tsx]]
- 1 edge to [[_COMMUNITY_display-labels.mjs]]
- 1 edge to [[_COMMUNITY_SaleDocumentPreviewModal.tsx]]
- 1 edge to [[_COMMUNITY_InvoicesList.tsx]]
- 1 edge to [[_COMMUNITY_useIsMobile]]
- 1 edge to [[_COMMUNITY_CustomerList.tsx]]
- 1 edge to [[_COMMUNITY_ConnectivityMonitor.ts]]
- 1 edge to [[_COMMUNITY_EmployeeList.tsx]]
- 1 edge to [[_COMMUNITY_Vercel CLI with Tokens]]
- 1 edge to [[_COMMUNITY_analyticsApi.ts]]
- 1 edge to [[_COMMUNITY_useShortcuts.ts]]
- 1 edge to [[_COMMUNITY_PrintJobList.tsx]]
- 1 edge to [[_COMMUNITY_CatalogPanel.tsx]]
- 1 edge to [[_COMMUNITY_CreditNoteModal.tsx]]
- 1 edge to [[_COMMUNITY_UsersList.tsx]]
- 1 edge to [[_COMMUNITY_5. Re-render Optimization]]
- 1 edge to [[_COMMUNITY_authSlice.ts]]

## Top bridge nodes
- [[client.ts]] - degree 47, connects to 20 communities
- [[ConnectivityMonitor.ts]] - degree 21, connects to 5 communities
- [[offlineconstants.ts]] - degree 19, connects to 3 communities
- [[deviceId.ts]] - degree 6, connects to 2 communities
- [[dot-constructor()]] - degree 6, connects to 1 community