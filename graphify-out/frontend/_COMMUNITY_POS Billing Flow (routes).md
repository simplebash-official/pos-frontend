---
type: community
members: 30
---

# POS Billing Flow (routes)

**Members:** 30 nodes

## Members
- [[AppRoute]] - code - src/constants/routes.ts
- [[AppShell.tsx]] - code - src/app/layout/AppShell.tsx
- [[BILLING_HEADER_HEIGHT]] - code - src/app/layout/constants.ts
- [[KeyboardShortcutsModal()]] - code - src/features/billing/components/KeyboardShortcutsModal.tsx
- [[KeyboardShortcutsModal.tsx]] - code - src/features/billing/components/KeyboardShortcutsModal.tsx
- [[KeyboardShortcutsModalProps]] - code - src/features/billing/components/KeyboardShortcutsModal.tsx
- [[LowStockNotifier()]] - code - src/features/inventory/components/LowStockNotifier.tsx
- [[LowStockNotifier.tsx]] - code - src/features/inventory/components/LowStockNotifier.tsx
- [[NAV_ITEMS]] - code - src/config/navigation.ts
- [[NavItemConfig]] - code - src/config/navigation.ts
- [[ROUTES]] - code - src/constants/routes.ts
- [[ROUTE_PATHS]] - code - src/constants/routes.ts
- [[ROUTE_TITLES]] - code - src/app/layout/AppShell.tsx
- [[RequireAdmin()]] - code - src/app/components/RequireAdmin.tsx
- [[RequireAdmin.tsx]] - code - src/app/components/RequireAdmin.tsx
- [[RequireAdminProps]] - code - src/app/components/RequireAdmin.tsx
- [[RoleGuard()]] - code - src/shared/components/RoleGuard.tsx
- [[SHELL_HEADER_HEIGHT]] - code - src/app/layout/constants.ts
- [[SHELL_NAVBAR_RAIL_WIDTH]] - code - src/app/layout/constants.ts
- [[SHELL_NAVBAR_WIDTH]] - code - src/app/layout/constants.ts
- [[SHORTCUTS]] - code - src/features/billing/components/KeyboardShortcutsModal.tsx
- [[Sidebar()]] - code - src/app/layout/Sidebar.tsx
- [[Sidebar.tsx]] - code - src/app/layout/Sidebar.tsx
- [[SidebarProps]] - code - src/app/layout/Sidebar.tsx
- [[layoutconstants.ts]] - code - src/app/layout/constants.ts
- [[navigation.ts]] - code - src/config/navigation.ts
- [[notifiedProductIds]] - code - src/features/inventory/components/LowStockNotifier.tsx
- [[routes.ts]] - code - src/constants/routes.ts
- [[selectUserRole()]] - code - src/store/slices/authSlice.ts
- [[useLowStockProducts()]] - code - src/features/inventory/hooks/useProducts.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/POS_Billing_Flow_routes
SORT file.name ASC
```

## Connections to other communities
- 16 edges to [[_COMMUNITY_Invoice & Document Printing]]
- 11 edges to [[_COMMUNITY_Authentication & Access Control]]
- 9 edges to [[_COMMUNITY_POS Billing Flow (router)]]
- 9 edges to [[_COMMUNITY_POS Billing Flow (useResponsive)]]
- 8 edges to [[_COMMUNITY_POS Cart & Checkout State_3]]
- 6 edges to [[_COMMUNITY_POS Cart & Checkout State_1]]
- 5 edges to [[_COMMUNITY_Offline Sync Engine (useProducts)]]
- 4 edges to [[_COMMUNITY_Supplier Directory & Stock Receipts_3]]
- 4 edges to [[_COMMUNITY_Authentication & Access Control_1]]
- 3 edges to [[_COMMUNITY_Offline Connectivity Monitoring_1]]
- 3 edges to [[_COMMUNITY_index Module]]
- 2 edges to [[_COMMUNITY_useShortcuts Module]]
- 2 edges to [[_COMMUNITY_Billing Chrome & Navigation_1]]
- 2 edges to [[_COMMUNITY_App Layout & Routing]]
- 2 edges to [[_COMMUNITY_Notifications & Storage Keys]]
- 1 edge to [[_COMMUNITY_Employee Accounts & Earnings_3]]
- 1 edge to [[_COMMUNITY_Employee Accounts & Earnings_4]]
- 1 edge to [[_COMMUNITY_Employee Accounts & Earnings]]
- 1 edge to [[_COMMUNITY_Outbox Queue & Status]]

## Top bridge nodes
- [[AppShell.tsx]] - degree 30, connects to 9 communities
- [[ROUTES]] - degree 19, connects to 8 communities
- [[LowStockNotifier.tsx]] - degree 13, connects to 7 communities
- [[Sidebar.tsx]] - degree 20, connects to 5 communities
- [[routes.ts]] - degree 13, connects to 5 communities