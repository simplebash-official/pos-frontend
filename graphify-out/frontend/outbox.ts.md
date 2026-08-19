---
source_file: "src/offline/outbox/outbox.ts"
type: "code"
community: "Outbox Queue & Status"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Outbox_Queue__Status
---

# outbox.ts

## Connections
- [[EnqueueInput]] - `contains` [EXTRACTED]
- [[MIRROR_TABLE_NAMES]] - `imports` [EXTRACTED]
- [[OUTBOX_CAPACITY]] - `imports` [EXTRACTED]
- [[OutboxError]] - `imports` [EXTRACTED]
- [[OutboxFullError]] - `imports` [EXTRACTED]
- [[OutboxOp]] - `imports` [EXTRACTED]
- [[OutboxStatus]] - `imports` [EXTRACTED]
- [[PendingOperationsList.tsx]] - `imports_from` [EXTRACTED]
- [[SyncEngine.ts]] - `imports_from` [EXTRACTED]
- [[SyncResourceId]] - `imports` [EXTRACTED]
- [[areDependenciesSatisfied()]] - `contains` [EXTRACTED]
- [[assertOutboxHasCapacity()]] - `contains` [EXTRACTED]
- [[backoff.ts]] - `imports_from` [EXTRACTED]
- [[claimReadyOperations()]] - `contains` [EXTRACTED]
- [[countByStatus()]] - `contains` [EXTRACTED]
- [[countUnsettled()]] - `contains` [EXTRACTED]
- [[countUnsettledForResource()]] - `contains` [EXTRACTED]
- [[createIdempotencyKey()]] - `imports` [EXTRACTED]
- [[db]] - `imports` [EXTRACTED]
- [[deleteOperation()]] - `contains` [EXTRACTED]
- [[deviceId.ts]] - `imports_from` [EXTRACTED]
- [[discardOperation()]] - `contains` [EXTRACTED]
- [[enqueueOperation()]] - `contains` [EXTRACTED]
- [[errors.ts]] - `imports_from` [EXTRACTED]
- [[flush.ts]] - `imports_from` [EXTRACTED]
- [[getDeviceId()]] - `imports` [EXTRACTED]
- [[getResourceRanks()]] - `imports` [EXTRACTED]
- [[getSyncResource()]] - `imports` [EXTRACTED]
- [[listOperations()]] - `contains` [EXTRACTED]
- [[localId.ts]] - `imports_from` [EXTRACTED]
- [[maintenance.ts]] - `imports_from` [EXTRACTED]
- [[markConflict()]] - `contains` [EXTRACTED]
- [[markDead()]] - `contains` [EXTRACTED]
- [[markInflight()]] - `contains` [EXTRACTED]
- [[nextAttemptAt()]] - `imports` [EXTRACTED]
- [[offlineconstants.ts]] - `imports_from` [EXTRACTED]
- [[offlinetypes.ts]] - `imports_from` [EXTRACTED]
- [[outbox.test.ts]] - `imports_from` [EXTRACTED]
- [[reclaimInflightOperations()]] - `contains` [EXTRACTED]
- [[recordFailure()]] - `contains` [EXTRACTED]
- [[registry.ts]] - `imports_from` [EXTRACTED]
- [[requeue()]] - `contains` [EXTRACTED]
- [[retryOperation()]] - `contains` [EXTRACTED]
- [[schema.ts]] - `imports_from` [EXTRACTED]
- [[submit.ts]] - `imports_from` [EXTRACTED]
- [[tables.ts]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Outbox_Queue__Status