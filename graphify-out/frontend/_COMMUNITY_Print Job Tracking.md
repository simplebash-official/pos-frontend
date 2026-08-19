---
type: community
members: 2
---

# Print Job Tracking

**Members:** 2 nodes

## Members

- [[print.ts]] - code - src/shared/lib/print.ts
- [[triggerThermalPrint()]] - code - src/shared/lib/print.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Print_Job_Tracking
SORT file.name ASC
```
