---
type: community
cohesion: 0.12
members: 33
---

# Billing - PaymentMethod

**Cohesion:** 0.12 - loosely connected
**Members:** 33 nodes

## Members

- [[CartItem]] - code - src/store/slices/cartSlice.ts
- [[CartLineItemProps]] - code - src/features/billing/components/CartLineItem.tsx
- [[CartState]] - code - src/store/slices/cartSlice.ts
- [[DiscountType]] - code - src/store/slices/cartSlice.ts
- [[HeldCart]] - code - src/store/slices/cartSlice.ts
- [[LineSourceType]] - code - src/features/billing/types.ts
- [[PaymentMethod]] - code - src/constants/payment.ts
- [[SplitPaymentDetail]] - code - src/features/billing/types.ts
- [[cartSlice]] - code - src/store/slices/cartSlice.ts
- [[cartSlice.ts]] - code - src/store/slices/cartSlice.ts
- [[initialState_2]] - code - src/store/slices/cartSlice.ts
- [[loadHeldCartsFromStorage()]] - code - src/store/slices/cartSlice.ts
- [[loadInitialPrintSelection()]] - code - src/store/slices/cartSlice.ts
- [[resetCartState()]] - code - src/store/slices/cartSlice.ts
- [[saveHeldCartsToStorage()]] - code - src/store/slices/cartSlice.ts
- [[selectCartDiscountCents()]] - code - src/store/slices/cartSlice.ts
- [[selectCartDiscountType()]] - code - src/store/slices/cartSlice.ts
- [[selectCartDiscountValue()]] - code - src/store/slices/cartSlice.ts
- [[selectCartItemsCount]] - code - src/store/slices/cartSlice.ts
- [[selectCompletedSale()]] - code - src/store/slices/cartSlice.ts
- [[selectCustomerInfo]] - code - src/store/slices/cartSlice.ts
- [[selectDocumentSelection()]] - code - src/store/slices/cartSlice.ts
- [[selectDueDate()]] - code - src/store/slices/cartSlice.ts
- [[selectSourceBreakdown]] - code - src/store/slices/cartSlice.ts
- [[selectSplitAllocatedCents()]] - code - src/store/slices/cartSlice.ts
- [[selectSplitRemainingCents]] - code - src/store/slices/cartSlice.ts
- [[selectSubtotalCents]] - code - src/store/slices/cartSlice.ts
- [[selectTenderedAmountCents()]] - code - src/store/slices/cartSlice.ts
- [[selectTotalCents]] - code - src/store/slices/cartSlice.ts
- [[selectTotalUnitCount]] - code - src/store/slices/cartSlice.ts
- [[useCart.ts]] - code - src/features/billing/hooks/useCart.ts
- [[useCartCheckout()]] - code - src/features/billing/hooks/useCart.ts
- [[useCartTotals()]] - code - src/features/billing/hooks/useCart.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Billing_-_PaymentMethod
SORT file.name ASC
```

## Connections to other communities

- 28 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 9 edges to [[_COMMUNITY_Billing - Header]]
- 8 edges to [[_COMMUNITY_Billing - BackendInvoice]]
- 6 edges to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 5 edges to [[_COMMUNITY_Billing - CartLineItem]]
- 4 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 4 edges to [[_COMMUNITY_Notifications - initialState]]
- 1 edge to [[_COMMUNITY_Billing - HeldSalesDrawer]]

## Top bridge nodes

- [[useCart.ts]] - degree 42, connects to 7 communities
- [[cartSlice.ts]] - degree 45, connects to 6 communities
- [[useCartCheckout()]] - degree 12, connects to 5 communities
- [[useCartTotals()]] - degree 14, connects to 4 communities
- [[SplitPaymentDetail]] - degree 6, connects to 2 communities
