---
type: community
cohesion: 0.11
members: 33
---

# Inventory - AppUpdatePrompt

**Cohesion:** 0.11 - loosely connected
**Members:** 33 nodes

## Members
- [[AppProvidersProps]] - code - src/app/providers.tsx
- [[AppShell()]] - code - src/app/layout/AppShell.tsx
- [[AppUpdatePrompt()]] - code - src/app/components/AppUpdatePrompt.tsx
- [[AppUpdatePrompt.tsx]] - code - src/app/components/AppUpdatePrompt.tsx
- [[CONTAINER_SIZES]] - code - src/styles/theme.ts
- [[GuestOnly()]] - code - src/app/components/GuestOnly.tsx
- [[GuestOnly.tsx]] - code - src/app/components/GuestOnly.tsx
- [[GuestOnlyProps]] - code - src/app/components/GuestOnly.tsx
- [[HeldCartCatchupNotifier()]] - code - src/app/components/HeldCartCatchupNotifier.tsx
- [[HeldCartCatchupNotifier.tsx]] - code - src/app/components/HeldCartCatchupNotifier.tsx
- [[LowStockNotifier()]] - code - src/features/inventory/components/LowStockNotifier.tsx
- [[LowStockNotifier.tsx]] - code - src/features/inventory/components/LowStockNotifier.tsx
- [[PageLoader()]] - code - src/shared/components/PageLoader.tsx
- [[PageLoader.tsx]] - code - src/shared/components/PageLoader.tsx
- [[PageLoaderProps]] - code - src/shared/components/PageLoader.tsx
- [[RequireAuth()]] - code - src/app/components/RequireAuth.tsx
- [[RequireAuth.tsx]] - code - src/app/components/RequireAuth.tsx
- [[RequireAuthProps]] - code - src/app/components/RequireAuth.tsx
- [[Sidebar()]] - code - src/app/layout/Sidebar.tsx
- [[cssVariablesResolver.ts]] - code - src/styles/cssVariablesResolver.ts
- [[darkTokens]] - code - src/styles/cssVariablesResolver.ts
- [[lightTokens]] - code - src/styles/cssVariablesResolver.ts
- [[mantineCssVariableResolver()]] - code - src/styles/cssVariablesResolver.ts
- [[mantineTheme]] - code - src/styles/theme.ts
- [[notifiedProductIds]] - code - src/features/inventory/components/LowStockNotifier.tsx
- [[providers.tsx]] - code - src/app/providers.tsx
- [[selectIsAuthInitialized()]] - code - src/store/slices/authSlice.ts
- [[selectIsAuthLoading()]] - code - src/store/slices/authSlice.ts
- [[selectIsAuthenticated()]] - code - src/store/slices/authSlice.ts
- [[semanticVars]] - code - src/styles/cssVariablesResolver.ts
- [[theme.ts]] - code - src/styles/theme.ts
- [[useAppSelector]] - code - src/store/hooks.ts
- [[useLowStockProducts()]] - code - src/features/inventory/hooks/useProducts.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Inventory_-_AppUpdatePrompt
SORT file.name ASC
```

## Connections to other communities
- 25 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 15 edges to [[_COMMUNITY_Auth - RequireAdmin]]
- 13 edges to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 9 edges to [[_COMMUNITY_Notifications - initialState]]
- 8 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 7 edges to [[_COMMUNITY_Billing - Header]]
- 6 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 6 edges to [[_COMMUNITY_Billing - PaymentMethod]]
- 6 edges to [[_COMMUNITY_Notifications - clearConnectivityNotification]]
- 5 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 5 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]
- 5 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 3 edges to [[_COMMUNITY_Billing - HeldSalesDrawer]]
- 2 edges to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 2 edges to [[_COMMUNITY_Employees - CURRENCY]]
- 1 edge to [[_COMMUNITY_Offline Sync - readServerVersion]]
- 1 edge to [[_COMMUNITY_Offline Sync - constructor]]

## Top bridge nodes
- [[useAppSelector]] - degree 60, connects to 11 communities
- [[providers.tsx]] - degree 27, connects to 7 communities
- [[HeldCartCatchupNotifier.tsx]] - degree 13, connects to 7 communities
- [[LowStockNotifier.tsx]] - degree 13, connects to 6 communities
- [[RequireAuth.tsx]] - degree 13, connects to 4 communities