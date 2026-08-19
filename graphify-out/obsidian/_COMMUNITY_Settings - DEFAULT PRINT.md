---
type: community
cohesion: 0.17
members: 19
---

# Settings - DEFAULT PRINT

**Cohesion:** 0.17 - loosely connected
**Members:** 19 nodes

## Members

- [[AutoPrintOption]] - code - src/features/settings/types.ts
- [[DEFAULT_PRINT_SETTINGS]] - code - src/features/settings/constants.ts
- [[DEFAULT_SHOP_PROFILE]] - code - src/features/settings/constants.ts
- [[DocumentSelection]] - code - src/features/settings/types.ts
- [[InvoiceCopyOption]] - code - src/features/settings/types.ts
- [[PrintSettings]] - code - src/features/settings/types.ts
- [[SettingsState]] - code - src/store/slices/settingsSlice.ts
- [[ShopProfile]] - code - src/features/settings/types.ts
- [[StoredShopProfileVersion]] - code - src/store/slices/settingsSlice.ts
- [[initialState]] - code - src/store/slices/settingsSlice.ts
- [[loadSettingsFromStorage()]] - code - src/store/slices/settingsSlice.ts
- [[saveSettingsToStorage()]] - code - src/store/slices/settingsSlice.ts
- [[selectRawShopProfileVersions()]] - code - src/store/slices/settingsSlice.ts
- [[selectShopProfileByVersion()]] - code - src/store/slices/settingsSlice.ts
- [[selectShopProfileVersions]] - code - src/store/slices/settingsSlice.ts
- [[settingsconstants.ts]] - code - src/features/settings/constants.ts
- [[settingstypes.ts]] - code - src/features/settings/types.ts
- [[settingsSlice]] - code - src/store/slices/settingsSlice.ts
- [[settingsSlice.ts]] - code - src/store/slices/settingsSlice.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Settings_-_DEFAULT_PRINT
SORT file.name ASC
```

## Connections to other communities

- 8 edges to [[_COMMUNITY_Settings - ACCEPTED TYPES]]
- 3 edges to [[_COMMUNITY_Notifications - initialState]]
- 2 edges to [[_COMMUNITY_Billing - PAYMENT METHODS]]
- 2 edges to [[_COMMUNITY_Billing - SettingsPage]]
- 2 edges to [[_COMMUNITY_Billing - getInvoiceDocument]]

## Top bridge nodes

- [[settingsSlice.ts]] - degree 30, connects to 4 communities
- [[settingstypes.ts]] - degree 8, connects to 1 community
- [[settingsconstants.ts]] - degree 7, connects to 1 community
