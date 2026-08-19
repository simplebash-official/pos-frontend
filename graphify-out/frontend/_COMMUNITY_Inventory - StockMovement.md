---
type: community
cohesion: 0.13
members: 28
---

# Inventory - StockMovement

**Cohesion:** 0.13 - loosely connected
**Members:** 28 nodes

## Members

- [[dot-constructor()_2]] - code - src/offline/db/schema.ts
- [[AuditEvent]] - code - src/offline/db/tables.ts
- [[ConflictReason]] - code - src/offline/db/tables.ts
- [[ConflictRecord]] - code - src/offline/db/tables.ts
- [[EmptyState()]] - code - src/shared/components/EmptyState.tsx
- [[EmptyState.tsx]] - code - src/shared/components/EmptyState.tsx
- [[EmptyStateProps]] - code - src/shared/components/EmptyState.tsx
- [[IdMapRecord]] - code - src/offline/db/tables.ts
- [[IdMapStatus]] - code - src/offline/db/tables.ts
- [[MirrorTableName]] - code - src/offline/db/schema.ts
- [[MirroredRow]] - code - src/offline/db/tables.ts
- [[OfflineDb]] - code - src/offline/db/schema.ts
- [[OutboxOp]] - code - src/offline/db/tables.ts
- [[OutboxStatus]] - code - src/offline/db/tables.ts
- [[PendingOperationsList()]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[PendingOperationsList.tsx]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[PendingOperationsListProps]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[PullState]] - code - src/offline/db/tables.ts
- [[PushState]] - code - src/offline/db/tables.ts
- [[STATUS_LABEL]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[SessionRecord]] - code - src/offline/db/tables.ts
- [[StockLedgerEntry]] - code - src/offline/db/tables.ts
- [[StockMovement]] - code - src/features/inventory/types.ts
- [[SyncMetaRecord]] - code - src/offline/db/tables.ts
- [[discardOperation()]] - code - src/offline/outbox/outbox.ts
- [[retryOperation()]] - code - src/offline/outbox/outbox.ts
- [[schema.ts]] - code - src/offline/db/schema.ts
- [[tables.ts]] - code - src/offline/db/tables.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Inventory_-_StockMovement
SORT file.name ASC
```

## Connections to other communities

- 14 edges to [[_COMMUNITY_Offline Sync - signal]]
- 12 edges to [[_COMMUNITY_Offline Sync - OutboxError]]
- 10 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 9 edges to [[_COMMUNITY_Offline Sync - start]]
- 7 edges to [[_COMMUNITY_Offline Sync - constructor_1]]
- 7 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 7 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 6 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 6 edges to [[_COMMUNITY_Auth - RequireAdmin]]
- 5 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 5 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 5 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 4 edges to [[_COMMUNITY_Offline Sync - depsChanged]]
- 3 edges to [[_COMMUNITY_Inventory - createCategory]]
- 3 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 3 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 3 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 3 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 2 edges to [[_COMMUNITY_Offline Sync - STORAGE]]
- 2 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 1 edge to [[_COMMUNITY_Customers - createCustomer]]

## Top bridge nodes

- [[schema.ts]] - degree 56, connects to 20 communities
- [[tables.ts]] - degree 39, connects to 12 communities
- [[OfflineDb]] - degree 17, connects to 6 communities
- [[MirroredRow]] - degree 11, connects to 6 communities
- [[PendingOperationsList.tsx]] - degree 17, connects to 4 communities
