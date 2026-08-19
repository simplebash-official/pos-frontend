---
type: community
members: 36
---

# Outbox Queue & Status

**Members:** 36 nodes

## Members
- [[dot-constructor()_2]] - code - src/offline/db/schema.ts
- [[AuditEvent]] - code - src/offline/db/tables.ts
- [[AuditLevel]] - code - src/offline/db/tables.ts
- [[ConflictReason]] - code - src/offline/db/tables.ts
- [[ConflictRecord]] - code - src/offline/db/tables.ts
- [[IdMapRecord]] - code - src/offline/db/tables.ts
- [[IdMapStatus]] - code - src/offline/db/tables.ts
- [[LOCAL_ID_PREFIX]] - code - src/offline/ids/localId.ts
- [[MirrorMeta]] - code - src/offline/db/tables.ts
- [[MirrorTableName]] - code - src/offline/db/schema.ts
- [[MirroredRow]] - code - src/offline/db/tables.ts
- [[OfflineDb]] - code - src/offline/db/schema.ts
- [[OutboxError]] - code - src/offline/db/tables.ts
- [[OutboxOp]] - code - src/offline/db/tables.ts
- [[PullState]] - code - src/offline/db/tables.ts
- [[PushState]] - code - src/offline/db/tables.ts
- [[SessionRecord]] - code - src/offline/db/tables.ts
- [[StockDeltaInput]] - code - src/offline/engine/stockLedger.ts
- [[StockLedgerEntry]] - code - src/offline/db/tables.ts
- [[StockMovement]] - code - src/features/inventory/types.ts
- [[SyncEngineState]] - code - src/offline/engine/SyncEngine.ts
- [[SyncMetaRecord]] - code - src/offline/db/tables.ts
- [[SyncResource]] - code - src/offline/types.ts
- [[UNASSIGNED_OUTBOX_SEQ]] - code - src/offline/engine/stockLedger.ts
- [[UNSYNCED_VERSION]] - code - src/offline/db/mirror.ts
- [[applyLedgerToProducts()]] - code - src/offline/engine/stockLedger.ts
- [[db]] - code - src/offline/db/schema.ts
- [[mirror.ts]] - code - src/offline/db/mirror.ts
- [[offlineindex.ts]] - code - src/offline/index.ts
- [[pendingDeltaFor()]] - code - src/offline/engine/stockLedger.ts
- [[pendingDeltasByProduct()]] - code - src/offline/engine/stockLedger.ts
- [[readServerVersion()]] - code - src/offline/db/mirror.ts
- [[schema.ts]] - code - src/offline/db/schema.ts
- [[stockLedger.ts]] - code - src/offline/engine/stockLedger.ts
- [[stripMirrorMeta()]] - code - src/offline/db/mirror.ts
- [[tables.ts]] - code - src/offline/db/tables.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Outbox_Queue__Status
SORT file.name ASC
```

## Connections to other communities
- 21 edges to [[_COMMUNITY_Outbox Queue & Status_1]]
- 20 edges to [[_COMMUNITY_Sync Metadata & Cursors]]
- 15 edges to [[_COMMUNITY_Offline Connectivity Monitoring_1]]
- 14 edges to [[_COMMUNITY_Offline Sync Engine (productsApi)]]
- 14 edges to [[_COMMUNITY_Offline Connectivity Monitoring_3]]
- 12 edges to [[_COMMUNITY_ID Mapping & Reference Resolution]]
- 11 edges to [[_COMMUNITY_POS Billing Flow (useCustomers)]]
- 10 edges to [[_COMMUNITY_Inventory & Products API]]
- 10 edges to [[_COMMUNITY_Outbox Queue & Status_2]]
- 9 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_2]]
- 8 edges to [[_COMMUNITY_Offline Sync Engine (useProducts)]]
- 8 edges to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 7 edges to [[_COMMUNITY_Authentication & Access Control]]
- 7 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_1]]
- 7 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts]]
- 4 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_4]]
- 4 edges to [[_COMMUNITY_Customer Management & Drawers]]
- 3 edges to [[_COMMUNITY_MutationRequestOptions Module]]
- 2 edges to [[_COMMUNITY_POS Billing Flow (useResponsive)]]
- 2 edges to [[_COMMUNITY_Offline Connectivity Monitoring_4]]
- 1 edge to [[_COMMUNITY_POS Cart & Checkout State_2]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_3]]
- 1 edge to [[_COMMUNITY_POS Billing Flow (routes)]]

## Top bridge nodes
- [[schema.ts]] - degree 56, connects to 19 communities
- [[db]] - degree 30, connects to 16 communities
- [[offlineindex.ts]] - degree 43, connects to 11 communities
- [[tables.ts]] - degree 39, connects to 10 communities
- [[mirror.ts]] - degree 22, connects to 9 communities