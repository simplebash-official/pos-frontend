---
type: community
cohesion: 0.19
members: 15
---

# Offline Sync - readServerVersion

**Cohesion:** 0.19 - loosely connected
**Members:** 15 nodes

## Members
- [[dot-constructor()_8]] - code - src/offline/errors.ts
- [[MirrorMeta]] - code - src/offline/db/tables.ts
- [[OutboxFullError]] - code - src/offline/errors.ts
- [[StockDeltaInput]] - code - src/offline/engine/stockLedger.ts
- [[UNASSIGNED_OUTBOX_SEQ]] - code - src/offline/engine/stockLedger.ts
- [[UNSYNCED_VERSION]] - code - src/offline/db/mirror.ts
- [[applyLedgerToProducts()]] - code - src/offline/engine/stockLedger.ts
- [[mirror.ts]] - code - src/offline/db/mirror.ts
- [[offlineindex.ts]] - code - src/offline/index.ts
- [[pendingDeltaFor()]] - code - src/offline/engine/stockLedger.ts
- [[pendingDeltasByProduct()]] - code - src/offline/engine/stockLedger.ts
- [[pruneConfirmedLedgerEntries()]] - code - src/offline/engine/stockLedger.ts
- [[readServerVersion()]] - code - src/offline/db/mirror.ts
- [[stockLedger.ts]] - code - src/offline/engine/stockLedger.ts
- [[stripMirrorMeta()]] - code - src/offline/db/mirror.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_readServerVersion
SORT file.name ASC
```

## Connections to other communities
- 10 edges to [[_COMMUNITY_Offline Sync - start]]
- 9 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 7 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 7 edges to [[_COMMUNITY_Offline Sync - signal]]
- 6 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 5 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 5 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 5 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 4 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 2 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 2 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 2 edges to [[_COMMUNITY_Notifications - clearConnectivityNotification]]
- 2 edges to [[_COMMUNITY_Offline Sync - depsChanged]]
- 2 edges to [[_COMMUNITY_Offline Sync - constructor_1]]
- 1 edge to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 1 edge to [[_COMMUNITY_Billing - CartLineItem]]
- 1 edge to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 1 edge to [[_COMMUNITY_Suppliers - createSupplier]]
- 1 edge to [[_COMMUNITY_Inventory - createCategory]]
- 1 edge to [[_COMMUNITY_Customers - createCustomer]]

## Top bridge nodes
- [[offlineindex.ts]] - degree 43, connects to 11 communities
- [[mirror.ts]] - degree 22, connects to 11 communities
- [[stockLedger.ts]] - degree 18, connects to 7 communities
- [[applyLedgerToProducts()]] - degree 6, connects to 3 communities
- [[stripMirrorMeta()]] - degree 4, connects to 2 communities