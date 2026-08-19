---
type: community
cohesion: 0.11
members: 36
---

# Auth - RequireAdmin

**Cohesion:** 0.11 - loosely connected
**Members:** 36 nodes

## Members

- [[AuthInitializer()]] - code - src/app/providers.tsx
- [[AuthState]] - code - src/store/slices/authSlice.ts
- [[AuthUser]] - code - src/features/auth/types.ts
- [[LoginPayload]] - code - src/features/auth/types.ts
- [[LoginResponse]] - code - src/features/auth/types.ts
- [[LoginResponseData]] - code - src/features/auth/types.ts
- [[MeResponse]] - code - src/features/auth/types.ts
- [[OFFLINE_SESSION_GRACE_MS]] - code - src/offline/constants.ts
- [[RequireAdmin()]] - code - src/app/components/RequireAdmin.tsx
- [[RequireAdmin.tsx]] - code - src/app/components/RequireAdmin.tsx
- [[RequireAdminProps]] - code - src/app/components/RequireAdmin.tsx
- [[RoleGuard()]] - code - src/shared/components/RoleGuard.tsx
- [[RoleGuard.tsx]] - code - src/shared/components/RoleGuard.tsx
- [[RoleGuardProps]] - code - src/shared/components/RoleGuard.tsx
- [[SESSION_RECORD_ID]] - code - src/offline/db/tables.ts
- [[USER_ROLES]] - code - src/constants/roles.ts
- [[USER_ROLE_LABELS]] - code - src/constants/roles.ts
- [[UserRole]] - code - src/constants/roles.ts
- [[UserSession]] - code - src/features/auth/types.ts
- [[authtypes.ts]] - code - src/features/auth/types.ts
- [[authApi.ts]] - code - src/features/auth/api/authApi.ts
- [[authSlice]] - code - src/store/slices/authSlice.ts
- [[authSlice.ts]] - code - src/store/slices/authSlice.ts
- [[cacheSession()]] - code - src/offline/db/session.ts
- [[clearCachedSession()]] - code - src/offline/db/session.ts
- [[getMeApi()]] - code - src/features/auth/api/authApi.ts
- [[initialState_4]] - code - src/store/slices/authSlice.ts
- [[initializeAuth]] - code - src/store/slices/authSlice.ts
- [[isNetworkError()]] - code - src/store/slices/authSlice.ts
- [[isRejectedSession()]] - code - src/store/slices/authSlice.ts
- [[readCachedSession()]] - code - src/offline/db/session.ts
- [[roles.ts]] - code - src/constants/roles.ts
- [[selectIsPOSLocked()]] - code - src/store/slices/authSlice.ts
- [[selectUserRole()]] - code - src/store/slices/authSlice.ts
- [[session.ts]] - code - src/offline/db/session.ts
- [[tryRestoreFromCache()]] - code - src/store/slices/authSlice.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Auth_-_RequireAdmin
SORT file.name ASC
```

## Connections to other communities

- 15 edges to [[_COMMUNITY_Inventory - AppUpdatePrompt]]
- 8 edges to [[_COMMUNITY_Auth - EmailLoginScreen]]
- 7 edges to [[_COMMUNITY_Billing - ROUTE TITLES]]
- 6 edges to [[_COMMUNITY_Inventory - StockMovement]]
- 5 edges to [[_COMMUNITY_Offline Sync - constructor]]
- 5 edges to [[_COMMUNITY_Inventory - ProductTable]]
- 4 edges to [[_COMMUNITY_Employees - createEmployee]]
- 3 edges to [[_COMMUNITY_Notifications - initialState]]
- 2 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 2 edges to [[_COMMUNITY_Billing - Header]]
- 2 edges to [[_COMMUNITY_Settings - SyncDrawer]]
- 2 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 1 edge to [[_COMMUNITY_ApiClient]]
- 1 edge to [[_COMMUNITY_Employees - CURRENCY]]
- 1 edge to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 1 edge to [[_COMMUNITY_Offline Sync - signal]]
- 1 edge to [[_COMMUNITY_Billing - MutationRequestOptions]]
- 1 edge to [[_COMMUNITY_Notifications - clearConnectivityNotification]]

## Top bridge nodes

- [[authSlice.ts]] - degree 48, connects to 11 communities
- [[RequireAdmin.tsx]] - degree 11, connects to 4 communities
- [[roles.ts]] - degree 11, connects to 4 communities
- [[authApi.ts]] - degree 14, connects to 3 communities
- [[session.ts]] - degree 12, connects to 3 communities
