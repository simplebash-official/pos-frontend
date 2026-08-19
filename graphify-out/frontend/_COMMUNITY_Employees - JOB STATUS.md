---
type: community
cohesion: 0.27
members: 21
---

# Employees - JOB STATUS

**Cohesion:** 0.27 - loosely connected
**Members:** 21 nodes

## Members

- [[AssignmentInfo]] - code - src/shared/types/ticketInput.ts
- [[CustomerRef]] - code - src/shared/types/ticketInput.ts
- [[JOB_STATUS]] - code - src/constants/jobs.ts
- [[JOB_STATUS_COLORS]] - code - src/constants/jobs.ts
- [[JOB_STATUS_LABELS]] - code - src/constants/jobs.ts
- [[JobStatus]] - code - src/constants/jobs.ts
- [[PrintJob]] - code - src/features/print-jobs/types.ts
- [[PrintJobFormModal.tsx]] - code - src/features/print-jobs/components/PrintJobFormModal.tsx
- [[PrintJobFormModalProps]] - code - src/features/print-jobs/components/PrintJobFormModal.tsx
- [[PrintJobFormValues]] - code - src/shared/lib/moneyFormUtils.ts
- [[PrintJobInput]] - code - src/features/print-jobs/types.ts
- [[RepairFormModal.tsx]] - code - src/features/repairs/components/RepairFormModal.tsx
- [[RepairFormModalProps]] - code - src/features/repairs/components/RepairFormModal.tsx
- [[RepairFormValues]] - code - src/shared/lib/moneyFormUtils.ts
- [[RepairJob]] - code - src/features/repairs/types.ts
- [[RepairJobInput]] - code - src/features/repairs/types.ts
- [[SplitType]] - code - src/features/employees/types.ts
- [[jobs.ts]] - code - src/constants/jobs.ts
- [[print-jobstypes.ts]] - code - src/features/print-jobs/types.ts
- [[repairstypes.ts]] - code - src/features/repairs/types.ts
- [[ticketInput.ts]] - code - src/shared/types/ticketInput.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Employees_-_JOB_STATUS
SORT file.name ASC
```

## Connections to other communities

- 24 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 14 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 10 edges to [[_COMMUNITY_Employees - createEmployee]]
- 9 edges to [[_COMMUNITY_Employees - addEarningRecord]]
- 4 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 4 edges to [[_COMMUNITY_Shared UI - EntityListPage]]
- 2 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 2 edges to [[_COMMUNITY_Billing - CartLineItem]]

## Top bridge nodes

- [[PrintJobFormModal.tsx]] - degree 26, connects to 6 communities
- [[RepairFormModal.tsx]] - degree 26, connects to 6 communities
- [[print-jobstypes.ts]] - degree 15, connects to 4 communities
- [[repairstypes.ts]] - degree 14, connects to 4 communities
- [[PrintJob]] - degree 11, connects to 4 communities
