---
type: community
cohesion: 0.16
members: 34
---

# Billing - fetchInvoices

**Cohesion:** 0.16 - loosely connected
**Members:** 34 nodes

## Members
- [[Customer]] - code - src/features/customers/types.ts
- [[CustomerDetailDrawer()]] - code - src/features/customers/components/CustomerDetailDrawer.tsx
- [[CustomerDetailDrawer.tsx]] - code - src/features/customers/components/CustomerDetailDrawer.tsx
- [[CustomerDetailDrawerProps]] - code - src/features/customers/components/CustomerDetailDrawer.tsx
- [[CustomerFormContent()]] - code - src/features/customers/components/CustomerFormModal.tsx
- [[CustomerFormModal()]] - code - src/features/customers/components/CustomerFormModal.tsx
- [[CustomerFormModal.tsx]] - code - src/features/customers/components/CustomerFormModal.tsx
- [[CustomerFormModalProps]] - code - src/features/customers/components/CustomerFormModal.tsx
- [[CustomerInput]] - code - src/features/customers/types.ts
- [[CustomerList()]] - code - src/features/customers/components/CustomerList.tsx
- [[CustomerList.tsx]] - code - src/features/customers/components/CustomerList.tsx
- [[CustomerPickerModal.tsx]] - code - src/features/customers/components/CustomerPickerModal.tsx
- [[CustomerPickerModalProps]] - code - src/features/customers/components/CustomerPickerModal.tsx
- [[FormContentProps]] - code - src/features/customers/components/CustomerFormModal.tsx
- [[NO_CUSTOMERS]] - code - src/features/customers/hooks/useCustomers.ts
- [[PRESET_CUSTOMER_TAGS]] - code - src/features/customers/constants.ts
- [[PhoneDisplay()]] - code - src/shared/components/PhoneDisplay.tsx
- [[PhoneDisplay.tsx]] - code - src/shared/components/PhoneDisplay.tsx
- [[PhoneDisplayProps]] - code - src/shared/components/PhoneDisplay.tsx
- [[UpdateCustomerPayload]] - code - src/offline/resources/customers.resource.ts
- [[customersconstants.ts]] - code - src/features/customers/constants.ts
- [[customersindex.ts]] - code - src/features/customers/index.ts
- [[customerstypes.ts]] - code - src/features/customers/types.ts
- [[date.ts]] - code - src/shared/lib/date.ts
- [[fetchInvoices()]] - code - src/features/billing/api/invoicesApi.ts
- [[formatDate()]] - code - src/shared/lib/date.ts
- [[formatDateTime()]] - code - src/shared/lib/date.ts
- [[resolveOrCreateCustomer.ts]] - code - src/features/billing/lib/resolveOrCreateCustomer.ts
- [[useAllCustomers()]] - code - src/features/customers/hooks/useCustomers.ts
- [[useCustomerTags()]] - code - src/features/customers/hooks/useCustomers.ts
- [[useCustomers.ts]] - code - src/features/customers/hooks/useCustomers.ts
- [[useDeleteCustomer()]] - code - src/features/customers/hooks/useCustomers.ts
- [[useDeleteCustomers()]] - code - src/features/customers/hooks/useCustomers.ts
- [[useUpdateCustomer()]] - code - src/features/customers/hooks/useCustomers.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_fetchInvoices
SORT file.name ASC
```

## Connections to other communities
- 25 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 15 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 13 edges to [[_COMMUNITY_Customers - createCustomer]]
- 12 edges to [[_COMMUNITY_Shared UI - mergeByCategory]]
- 12 edges to [[_COMMUNITY_Employees - createEmployee]]
- 10 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 10 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 10 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 9 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 4 edges to [[_COMMUNITY_Suppliers - useSetSupplierLinks]]
- 4 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 4 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 3 edges to [[_COMMUNITY_Inventory - AddSubcategoryRow]]
- 3 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 2 edges to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 2 edges to [[_COMMUNITY_Notifications - initialState]]
- 2 edges to [[_COMMUNITY_Shared UI - EntityListPage]]
- 2 edges to [[_COMMUNITY_Offline Sync - signal]]
- 2 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 1 edge to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 1 edge to [[_COMMUNITY_Employees - addEarningRecord]]
- 1 edge to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 1 edge to [[_COMMUNITY_Offline Sync - OutboxError]]
- 1 edge to [[_COMMUNITY_Billing - PAYMENT METHODS]]

## Top bridge nodes
- [[date.ts]] - degree 18, connects to 9 communities
- [[useCustomers.ts]] - degree 29, connects to 8 communities
- [[CustomerList.tsx]] - degree 34, connects to 7 communities
- [[formatDateTime()]] - degree 21, connects to 7 communities
- [[CustomerDetailDrawer.tsx]] - degree 20, connects to 6 communities