---
type: community
cohesion: 0.20
members: 22
---

# Employees - CURRENCY

**Cohesion:** 0.20 - loosely connected
**Members:** 22 nodes

## Members

- [[CURRENCY]] - code - src/constants/payment.ts
- [[Employee]] - code - src/features/employees/types.ts
- [[EmployeeFormModal()]] - code - src/features/employees/components/EmployeeFormModal.tsx
- [[EmployeeFormModal.tsx]] - code - src/features/employees/components/EmployeeFormModal.tsx
- [[EmployeeFormModalProps]] - code - src/features/employees/components/EmployeeFormModal.tsx
- [[EmployeeFormValues]] - code - src/shared/lib/moneyFormUtils.ts
- [[EmployeeInput]] - code - src/features/employees/types.ts
- [[MoneyInput()]] - code - src/shared/components/MoneyInput.tsx
- [[MoneyInput.tsx]] - code - src/shared/components/MoneyInput.tsx
- [[MoneyInputProps]] - code - src/shared/components/MoneyInput.tsx
- [[constantsindex.ts]] - code - src/constants/index.ts
- [[fromCents()]] - code - src/shared/lib/money.ts
- [[fromEmployee()]] - code - src/shared/lib/moneyFormUtils.ts
- [[fromPrintJob()]] - code - src/shared/lib/moneyFormUtils.ts
- [[fromRepairJob()]] - code - src/shared/lib/moneyFormUtils.ts
- [[money.ts]] - code - src/shared/lib/money.ts
- [[moneyFormUtils.ts]] - code - src/shared/lib/moneyFormUtils.ts
- [[parseMoneyToCents()]] - code - src/shared/lib/money.ts
- [[toCents()]] - code - src/shared/lib/money.ts
- [[toEmployeeInput()]] - code - src/shared/lib/moneyFormUtils.ts
- [[toPrintJobInput()]] - code - src/shared/lib/moneyFormUtils.ts
- [[toRepairInput()]] - code - src/shared/lib/moneyFormUtils.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Employees_-_CURRENCY
SORT file.name ASC
```

## Connections to other communities

- 24 edges to [[_COMMUNITY_Employees - JOB STATUS]]
- 17 edges to [[_COMMUNITY_Employees - createEmployee]]
- 12 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 6 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 6 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 5 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 5 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 4 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 4 edges to [[_COMMUNITY_Notifications - initialState]]
- 3 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 3 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 2 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 2 edges to [[_COMMUNITY_Shared UI - EntityListPage]]
- 2 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 2 edges to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 2 edges to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 1 edge to [[_COMMUNITY_Auth - RequireAdmin]]
- 1 edge to [[_COMMUNITY_Offline Sync - OutboxError]]
- 1 edge to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 1 edge to [[_COMMUNITY_Inventory - ProductTable]]
- 1 edge to [[_COMMUNITY_Billing - fetchPaymentsForInvoice]]

## Top bridge nodes

- [[money.ts]] - degree 39, connects to 13 communities
- [[constantsindex.ts]] - degree 27, connects to 12 communities
- [[EmployeeFormModal.tsx]] - degree 16, connects to 4 communities
- [[toCents()]] - degree 14, connects to 4 communities
- [[fromCents()]] - degree 10, connects to 3 communities
