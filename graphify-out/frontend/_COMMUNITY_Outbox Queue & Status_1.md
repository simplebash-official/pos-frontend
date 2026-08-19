---
type: community
members: 26
---

# Outbox Queue & Status

**Members:** 26 nodes

## Members

- [[EmptyState()]] - code - src/shared/components/EmptyState.tsx
- [[EmptyState.tsx]] - code - src/shared/components/EmptyState.tsx
- [[EmptyStateProps]] - code - src/shared/components/EmptyState.tsx
- [[MIRROR_TABLE_NAMES]] - code - src/offline/db/schema.ts
- [[OutboxStatus]] - code - src/offline/db/tables.ts
- [[PendingOperationsList()]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[PendingOperationsList.tsx]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[PendingOperationsListProps]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[STATUS_LABEL]] - code - src/features/sync/components/PendingOperationsList.tsx
- [[assertOutboxHasCapacity()]] - code - src/offline/outbox/outbox.ts
- [[assignLedgerEntriesToOperation()]] - code - src/offline/engine/stockLedger.ts
- [[createIdempotencyKey()]] - code - src/offline/ids/localId.ts
- [[createLocalId()]] - code - src/offline/ids/localId.ts
- [[deviceId.ts]] - code - src/offline/ids/deviceId.ts
- [[discardOperation()]] - code - src/offline/outbox/outbox.ts
- [[enqueueOperation()]] - code - src/offline/outbox/outbox.ts
- [[getDeviceId()]] - code - src/offline/ids/deviceId.ts
- [[getSyncResource()]] - code - src/offline/registry/registry.ts
- [[listOperations()]] - code - src/offline/outbox/outbox.ts
- [[localId.ts]] - code - src/offline/ids/localId.ts
- [[outbox.ts]] - code - src/offline/outbox/outbox.ts
- [[randomUuid()]] - code - src/offline/ids/localId.ts
- [[retryOperation()]] - code - src/offline/outbox/outbox.ts
- [[submit.ts]] - code - src/offline/outbox/submit.ts
- [[submitOperation()]] - code - src/offline/outbox/submit.ts
- [[useSyncedMutation.ts]] - code - src/offline/react/useSyncedMutation.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Outbox_Queue__Status
SORT file.name ASC
```

## Connections to other communities

- 21 edges to [[_COMMUNITY_Outbox Queue & Status]]
- 20 edges to [[_COMMUNITY_ID Mapping & Reference Resolution]]
- 17 edges to [[_COMMUNITY_Sync Metadata & Cursors]]
- 11 edges to [[_COMMUNITY_Offline Connectivity Monitoring_3]]
- 7 edges to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 7 edges to [[_COMMUNITY_Offline Connectivity Monitoring_1]]
- 4 edges to [[_COMMUNITY_Offline Sync Engine (useProducts)]]
- 4 edges to [[_COMMUNITY_POS Billing Flow (useResponsive)]]
- 2 edges to [[_COMMUNITY_Outbox Queue & Status_2]]
- 2 edges to [[_COMMUNITY_Authentication & Access Control_1]]
- 1 edge to [[_COMMUNITY_index Module]]
- 1 edge to [[_COMMUNITY_Notifications & Storage Keys]]
- 1 edge to [[_COMMUNITY_POS Billing Flow (useCustomers)]]
- 1 edge to [[_COMMUNITY_Inventory & Products API]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts_2]]
- 1 edge to [[_COMMUNITY_Supplier Directory & Stock Receipts]]

## Top bridge nodes

- [[useSyncedMutation.ts]] - degree 18, connects to 10 communities
- [[outbox.ts]] - degree 46, connects to 6 communities
- [[deviceId.ts]] - degree 10, connects to 5 communities
- [[PendingOperationsList.tsx]] - degree 17, connects to 4 communities
- [[submit.ts]] - degree 22, connects to 3 communities
