---
type: community
members: 30
---

# Authentication & Access Control

**Members:** 30 nodes

## Members

- [[AuthInitializer()]] - code - src/app/providers.tsx
- [[AuthState]] - code - src/store/slices/authSlice.ts
- [[AuthUser]] - code - src/features/auth/types.ts
- [[LoginPayload]] - code - src/features/auth/types.ts
- [[LoginResponse]] - code - src/features/auth/types.ts
- [[LoginResponseData]] - code - src/features/auth/types.ts
- [[MeResponse]] - code - src/features/auth/types.ts
- [[OFFLINE_SESSION_GRACE_MS]] - code - src/offline/constants.ts
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
- [[initialState]] - code - src/store/slices/authSlice.ts
- [[initializeAuth]] - code - src/store/slices/authSlice.ts
- [[isNetworkError()]] - code - src/store/slices/authSlice.ts
- [[isRejectedSession()]] - code - src/store/slices/authSlice.ts
- [[readCachedSession()]] - code - src/offline/db/session.ts
- [[roles.ts]] - code - src/constants/roles.ts
- [[selectIsPOSLocked()]] - code - src/store/slices/authSlice.ts
- [[session.ts]] - code - src/offline/db/session.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Authentication__Access_Control
SORT file.name ASC
```

## Connections to other communities

- 11 edges to [[_COMMUNITY_POS Billing Flow (routes)]]
- 9 edges to [[_COMMUNITY_Authentication & Access Control_1]]
- 7 edges to [[_COMMUNITY_Outbox Queue & Status]]
- 6 edges to [[_COMMUNITY_POS Cart & Checkout State_3]]
- 3 edges to [[_COMMUNITY_Offline Connectivity Monitoring]]
- 3 edges to [[_COMMUNITY_POS Cart & Checkout State_1]]
- 3 edges to [[_COMMUNITY_App Layout & Routing]]
- 3 edges to [[_COMMUNITY_Invoice & Document Printing]]
- 3 edges to [[_COMMUNITY_Employee Accounts & Earnings]]
- 3 edges to [[_COMMUNITY_Offline Sync Engine (useProducts)]]
- 3 edges to [[_COMMUNITY_Notifications & Storage Keys]]
- 2 edges to [[_COMMUNITY_Offline Connectivity Monitoring_1]]
- 1 edge to [[_COMMUNITY_Billing Chrome & Navigation]]
- 1 edge to [[_COMMUNITY_index Module]]
- 1 edge to [[_COMMUNITY_Offline Connectivity Monitoring_4]]

## Top bridge nodes

- [[authSlice.ts]] - degree 45, connects to 9 communities
- [[roles.ts]] - degree 11, connects to 4 communities
- [[authApi.ts]] - degree 14, connects to 3 communities
- [[RoleGuard.tsx]] - degree 9, connects to 3 communities
- [[USER_ROLES]] - degree 6, connects to 3 communities
