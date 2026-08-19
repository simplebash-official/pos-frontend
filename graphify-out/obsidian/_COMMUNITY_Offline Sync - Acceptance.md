---
type: community
cohesion: 0.10
members: 21
---

# Offline Sync - Acceptance

**Cohesion:** 0.10 - loosely connected
**Members:** 21 nodes

## Members

- [[Acceptance Criteria Checklist]] - concept - backend-sync-requirements.html
- [[Backend Requirements — Offline Sync Spec]] - document - backend-sync-requirements.html
- [[Error Codes the Client Acts On]] - concept - backend-sync-requirements.html
- [[OPS-01 Reconnect Stampede Capacity Planning]] - rationale - backend-sync-requirements.html
- [[OPS-02 Keep Compound Writes Transactional]] - rationale - backend-sync-requirements.html
- [[OPS-03 Scheduled Cleanup Jobs]] - concept - backend-sync-requirements.html
- [[SYNC-01 Idempotency-Key on Mutating Requests]] - rationale - backend-sync-requirements.html
- [[SYNC-02 Unfiltered Collection List Endpoints]] - rationale - backend-sync-requirements.html
- [[SYNC-03 Server as Stock Authority, Reject Overselling]] - rationale - backend-sync-requirements.html
- [[SYNC-04 Sessions Survive Multi-Day Outage]] - rationale - backend-sync-requirements.html
- [[SYNC-05 Never Issue a local_ Prefixed Key]] - rationale - backend-sync-requirements.html
- [[SYNC-06 Real Timestamps on Purchases & Supplier Links]] - rationale - backend-sync-requirements.html
- [[SYNC-07 versioncreated_atupdated_atdeleted_at Columns]] - rationale - backend-sync-requirements.html
- [[SYNC-08 Soft Delete with 90-Day Tombstones]] - rationale - backend-sync-requirements.html
- [[SYNC-09 GET syncchanges Multiplexed Delta Endpoint]] - rationale - backend-sync-requirements.html
- [[SYNC-10 Conditional Writes (If-Match  VERSION_CONFLICT)]] - rationale - backend-sync-requirements.html
- [[SYNC-11 Health Endpoint & Server Clock]] - rationale - backend-sync-requirements.html
- [[SYNC-12 X-Device-Id on Every Request]] - rationale - backend-sync-requirements.html
- [[SYNC-13 Reserved Number Blocks for InvoicesTickets]] - rationale - backend-sync-requirements.html
- [[SYNC-14 Batch Push Endpoint (Conditional)]] - rationale - backend-sync-requirements.html
- [[SYNC-15 Collapse Dual idkey Identity]] - rationale - backend-sync-requirements.html

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Sync_-_Acceptance
SORT file.name ASC
```
