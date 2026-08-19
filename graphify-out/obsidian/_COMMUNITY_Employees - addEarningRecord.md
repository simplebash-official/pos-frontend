---
type: community
cohesion: 0.19
members: 20
---

# Employees - addEarningRecord

**Cohesion:** 0.19 - loosely connected
**Members:** 20 nodes

## Members
- [[BackendPrintJob]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[BackendRepair]] - code - src/features/repairs/api/repairsApi.ts
- [[PrintJobListResponseData]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[PrintJobType]] - code - src/features/print-jobs/types.ts
- [[RepairListResponseData]] - code - src/features/repairs/api/repairsApi.ts
- [[addEarningRecord()]] - code - src/features/employees/api/mockEmployees.ts
- [[calculatePrintEarnings()]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[calculateRepairEarnings()]] - code - src/features/repairs/api/repairsApi.ts
- [[createPrintJob()]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[createRepairJob()]] - code - src/features/repairs/api/repairsApi.ts
- [[deleteEarningRecordsForWork()]] - code - src/features/employees/api/mockEmployees.ts
- [[deletePrintJobs()]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[deleteRepairs()]] - code - src/features/repairs/api/repairsApi.ts
- [[printJobsApi.ts]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[repairsApi.ts]] - code - src/features/repairs/api/repairsApi.ts
- [[toPrintJob()]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[toRepairJob()]] - code - src/features/repairs/api/repairsApi.ts
- [[updateEarningRecordForWork()]] - code - src/features/employees/api/mockEmployees.ts
- [[updatePrintJob()]] - code - src/features/print-jobs/api/printJobsApi.ts
- [[updateRepairJob()]] - code - src/features/repairs/api/repairsApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Employees_-_addEarningRecord
SORT file.name ASC
```

## Connections to other communities
- 9 edges to [[_COMMUNITY_Employees - JOB STATUS]]
- 8 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 8 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 6 edges to [[_COMMUNITY_Employees - createEmployee]]
- 4 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 2 edges to [[_COMMUNITY_ApiClient]]
- 2 edges to [[_COMMUNITY_Shared UI - LocalStorageStore]]
- 2 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 2 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 1 edge to [[_COMMUNITY_Billing - fetchInvoices]]

## Top bridge nodes
- [[repairsApi.ts]] - degree 24, connects to 9 communities
- [[printJobsApi.ts]] - degree 24, connects to 8 communities
- [[addEarningRecord()]] - degree 7, connects to 2 communities
- [[updateEarningRecordForWork()]] - degree 7, connects to 2 communities
- [[deleteEarningRecordsForWork()]] - degree 8, connects to 1 community