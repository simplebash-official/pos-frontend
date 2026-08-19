---
type: community
cohesion: 0.36
members: 9
---

# Billing - Header

**Cohesion:** 0.36 - loosely connected
**Members:** 9 nodes

## Members

- [[BillingCounter()]] - code - src/features/billing/components/BillingCounter.tsx
- [[Header()]] - code - src/app/layout/Header.tsx
- [[Header.tsx]] - code - src/app/layout/Header.tsx
- [[HeaderProps]] - code - src/app/layout/Header.tsx
- [[selectAuthUser()]] - code - src/store/slices/authSlice.ts
- [[selectHeldCarts()]] - code - src/store/slices/cartSlice.ts
- [[selectSoundEnabled()]] - code - src/store/slices/cartSlice.ts
- [[useCartSound()]] - code - src/features/billing/hooks/useCart.ts
- [[useHeldCarts()]] - code - src/features/billing/hooks/useCart.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_Header
SORT file.name ASC
```

## Connections to other communities

- 10 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 9 edges to [[_COMMUNITY_Billing - PaymentMethod]]
- 7 edges to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 6 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 5 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 4 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 4 edges to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 2 edges to [[_COMMUNITY_Notifications - initialState]]
- 2 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 2 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 2 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 2 edges to [[_COMMUNITY_Auth - RequireAdmin]]

## Top bridge nodes

- [[Header.tsx]] - degree 19, connects to 9 communities
- [[BillingCounter()]] - degree 16, connects to 8 communities
- [[useCartSound()]] - degree 12, connects to 5 communities
- [[useHeldCarts()]] - degree 12, connects to 5 communities
- [[Header()]] - degree 8, connects to 4 communities
