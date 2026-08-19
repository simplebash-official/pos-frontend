---
type: community
cohesion: 0.18
members: 19
---

# Customers - createCustomer

**Cohesion:** 0.18 - loosely connected
**Members:** 19 nodes

## Members

- [[CustomerListParams]] - code - src/features/customers/types.ts
- [[CustomerListResponse]] - code - src/features/customers/types.ts
- [[CustomerTagsResponse]] - code - src/features/customers/types.ts
- [[DeleteCustomerPayload]] - code - src/offline/resources/customers.resource.ts
- [[DeleteCustomersPayload]] - code - src/offline/resources/customers.resource.ts
- [[createCustomer()]] - code - src/features/customers/api/customersApi.ts
- [[customers.resource.ts]] - code - src/offline/resources/customers.resource.ts
- [[customersApi.ts]] - code - src/features/customers/api/customersApi.ts
- [[customersResource]] - code - src/offline/resources/customers.resource.ts
- [[deleteCustomer()]] - code - src/features/customers/api/customersApi.ts
- [[deleteCustomers()]] - code - src/features/customers/api/customersApi.ts
- [[fetchAllCustomers()]] - code - src/features/customers/api/customersApi.ts
- [[fetchCustomerById()]] - code - src/features/customers/api/customersApi.ts
- [[fetchCustomerTags()]] - code - src/features/customers/api/customersApi.ts
- [[fetchCustomers()]] - code - src/features/customers/api/customersApi.ts
- [[patchCustomer()]] - code - src/features/customers/api/customersApi.ts
- [[pushOptions()]] - code - src/offline/resources/pushOptions.ts
- [[pushOptions.ts]] - code - src/offline/resources/pushOptions.ts
- [[updateCustomer()]] - code - src/features/customers/api/customersApi.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Customers_-_createCustomer
SORT file.name ASC
```

## Connections to other communities

- 13 edges to [[_COMMUNITY_Billing - fetchInvoices]]
- 12 edges to [[_COMMUNITY_Purchases - createPurchase]]
- 5 edges to [[_COMMUNITY_Inventory - adjustStock]]
- 5 edges to [[_COMMUNITY_Offline Sync - fetchSupplierProducts]]
- 4 edges to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 4 edges to [[_COMMUNITY_Offline Sync - signal]]
- 3 edges to [[_COMMUNITY_Inventory - createCategory]]
- 3 edges to [[_COMMUNITY_Suppliers - createSupplier]]
- 2 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 2 edges to [[_COMMUNITY_Repairs - InvoicesList]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Inventory - StockMovement]]
- 1 edge to [[_COMMUNITY_Offline Sync - readServerVersion]]

## Top bridge nodes

- [[customers.resource.ts]] - degree 30, connects to 8 communities
- [[pushOptions.ts]] - degree 11, connects to 8 communities
- [[pushOptions()]] - degree 13, connects to 5 communities
- [[customersApi.ts]] - degree 21, connects to 4 communities
- [[customersResource]] - degree 12, connects to 3 communities
