# Graph Report - frontend (2026-08-19)

## Corpus Check

- 302 files · ~156,718 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1559 nodes · 4683 edges · 112 communities (83 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `054f0c9f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- offline/constants.ts
- SyncPanel.tsx
- offline/index.ts
- tablerIconShards/index.ts
- settingsSlice.ts
- pull.ts
- useAppSelector
- flush.ts
- syncSlice.ts
- RequireAdmin.tsx
- products.resource.ts
- router.tsx
- CustomerList.tsx
- useIsMobile
- cssVariablesResolver.ts
- cartSlice.ts
- useEntitySearch
- dependencies
- EmployeeList.tsx
- SaleDocumentPreviewModal.tsx
- useCategories.ts
- devDependencies
- idMap.ts
- pull.test.ts
- syncApi.ts
- useSupplierProducts.ts
- SupplierDetailDrawer.tsx
- compilerOptions
- invoicesApi.ts
- schema.ts
- Backend Requirements — Offline Sync Spec
- supplierProductsApi.ts
- PrintJobFormModal.tsx
- supplierProducts.resource.ts
- SupplierList.tsx
- BillingCounter.tsx
- common.ts
- PrintJobList.tsx
- outbox.ts
- SyncEngine.ts
- ProductTable.tsx
- suppliers.resource.ts
- categories.resource.ts
- ROUTES
- useSearchHistory.ts
- searchFields.ts
- generate-icon-shards.mjs
- authSlice.ts
- scripts
- customers.resource.ts
- AmountInput.tsx
- ApiClient
- authApi.ts
- InvoicesList.tsx
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- app/App.tsx
- MobileSignUpForm.tsx
- purchasesApi.ts
- store/index.ts
- Responsive and Mobile Layout Tiers
- package.json
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell, and Router Architecture
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- ProductCatalogTree.tsx
- prettier
- typescript-eslint
- vite-plugin-pwa
- vitest
- AGENTS.md Instructions Document
- Integer Cents Money Representation
- Non-Technical Shop User UI Copy Guidelines
- Login Screen (Auth Feature)
- Phone Repair Technician Servicing Device
- Repair/Retail Shop POS Domain
- GEMINI.md Instructions Document
- Deploy Frontend GitHub Actions Workflow
- POS App Icon / Branding
- Apple Touch Icon (Lightning Bolt Logo)
- Favicon (Jana2u POS Logo Mark)
- App Icon 192px (Lightning Bolt)
- App Icon (512x512, Lightning Bolt)
- PWA Manifest / App Icons
- TypeScript Logo (typescript.svg)
- TypeScript (Language/Technology)
- Vite Logo (vite.svg)
- wall_login.jpg (Login Background Image)
- RepairJobList.tsx
- money.ts
- NotificationPopover.tsx
- useSyncData.ts
- typescript
- ReportsDashboard.tsx
- notificationSlice.ts
- ExpandableCard.tsx
- SyncModuleCard.tsx
- formatDateTime
- ui.ts

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 75 edges
2. `formatMoney()` - 60 edges
3. `useAppSelector` - 60 edges
4. `useAppDispatch` - 42 edges
5. `useSyncedMutation()` - 31 edges
6. `ConnectivityMonitor` - 30 edges
7. `db` - 30 edges
8. `useEntitySearch()` - 28 edges
9. `flushOutbox()` - 27 edges
10. `queryKeys` - 22 edges

## Surprising Connections (you probably didn't know these)

- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `GuestOnly()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/components/GuestOnly.tsx → src/store/slices/authSlice.ts
- `RequireAuth()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/components/RequireAuth.tsx → src/store/slices/authSlice.ts
- `AppShell()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/layout/AppShell.tsx → src/store/slices/authSlice.ts

## Import Cycles

- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)

- **Offline-First Sync and Storage Architecture** — claude_md_offline_sync_engine, claude_md_sync_resource_descriptor, claude_md_connectivity_monitor, claude_md_backend_sync_contract [EXTRACTED 1.00]
- **Responsive and Performant UI Design System** — claude_md_responsive_rules, claude_md_center_modal_standard, claude_md_detail_drawer_standard, claude_md_animation_performance [EXTRACTED 1.00]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline [INFERRED 0.75]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow, claude_md_graphify_guidelines [INFERRED 0.95]

## Communities (112 total, 29 thin omitted)

### Community 0 - "offline/constants.ts"

Cohesion: 0.05
Nodes (45): isApiErrorLike(), readServerTime(), RequestOptions, env, clearConnectivityNotification(), notifyBackOnline(), notifySyncComplete(), notifySyncProblems() (+37 more)

### Community 1 - "SyncPanel.tsx"

Cohesion: 0.20
Nodes (15): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), formatBytes(), SyncPanel(), SyncSettingsSection(), clearLocalData(), ClearLocalDataOptions (+7 more)

### Community 2 - "offline/index.ts"

Cohesion: 0.08
Nodes (29): ConnectivitySnapshot, ConnectivityState, MirroredRow, pendingDeltaFor(), LOCAL_ID_PREFIX, EnqueueInput, reclaimInflightOperations(), defineOperation() (+21 more)

### Community 3 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 4 - "settingsSlice.ts"

Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 5 - "pull.ts"

Cohesion: 0.12
Nodes (16): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, logError(), logInfo(), logSyncEvent(), logWarn(), trimAuditLog(), LeaderElection (+8 more)

### Community 6 - "useAppSelector"

Cohesion: 0.09
Nodes (44): AppUpdatePrompt(), HeldCartCatchupNotifier(), Sidebar(), SidebarProps, AppProvidersProps, AuthInitializer(), LowStockNotifier(), notifiedProductIds (+36 more)

### Community 7 - "flush.ts"

Cohesion: 0.15
Nodes (27): abandonMapping(), loadIdMap(), resolveMapping(), isLocalId(), ApiErrorLike, classifyFailure(), commitSuccess(), conflictReasonFor() (+19 more)

### Community 8 - "syncSlice.ts"

Cohesion: 0.12
Nodes (14): PULL_INTERVAL_MS, SyncMetaRecord, SyncEngineState, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectModuleView() (+6 more)

### Community 9 - "RequireAdmin.tsx"

Cohesion: 0.29
Nodes (7): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, RoleGuard(), RoleGuardProps, selectUserRole()

### Community 10 - "products.resource.ts"

Cohesion: 0.13
Nodes (20): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+12 more)

### Community 11 - "router.tsx"

Cohesion: 0.11
Nodes (16): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList, ProductTable, RepairJobList (+8 more)

### Community 12 - "CustomerList.tsx"

Cohesion: 0.19
Nodes (20): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal() (+12 more)

### Community 13 - "useIsMobile"

Cohesion: 0.10
Nodes (39): BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, CartLineItem (+31 more)

### Community 14 - "cssVariablesResolver.ts"

Cohesion: 0.40
Nodes (4): darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars

### Community 15 - "cartSlice.ts"

Cohesion: 0.11
Nodes (32): PAYMENT_METHODS, PaymentMethod, useCartCheckout(), useCartTotals(), SaleHeroPresentation, LineSourceType, SplitPaymentDetail, CartItem (+24 more)

### Community 16 - "useEntitySearch"

Cohesion: 0.19
Nodes (20): SearchHighlightProps, EntitySearchResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier() (+12 more)

### Community 17 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "EmployeeList.tsx"

Cohesion: 0.11
Nodes (19): queryKeys, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS (+11 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.12
Nodes (30): getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, fetchPaymentsForInvoice(), A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal() (+22 more)

### Community 20 - "useCategories.ts"

Cohesion: 0.16
Nodes (20): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCategoryIcons() (+12 more)

### Community 21 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "idMap.ts"

Cohesion: 0.14
Nodes (12): AbandonedReferenceError, BarcodeConflictError, OutboxFullError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), mintLocalId(), resolveValue() (+4 more)

### Community 23 - "pull.test.ts"

Cohesion: 0.15
Nodes (11): readServerVersion(), stripMirrorMeta(), toServerRow(), UNSYNCED_VERSION, MirrorMeta, deltaCursors, deltaPages, snapshot (+3 more)

### Community 24 - "syncApi.ts"

Cohesion: 0.21
Nodes (12): PULL_PAGE_LIMIT, ApiEnvelope, fetchNewestCursors(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus (+4 more)

### Community 25 - "useSupplierProducts.ts"

Cohesion: 0.24
Nodes (11): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useProductsForSupplier(), useSetSupplierLinks(), useUnlinkProduct() (+3 more)

### Community 26 - "SupplierDetailDrawer.tsx"

Cohesion: 0.19
Nodes (16): ProductPickerModal(), useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesBySupplier() (+8 more)

### Community 27 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "invoicesApi.ts"

Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+7 more)

### Community 29 - "schema.ts"

Cohesion: 0.11
Nodes (21): BarcodeSource, ProductInput, ProductListResponse, ProductSupplierIntake, StockMovement, StockMovementType, Subcategory, ValidCategoryOption (+13 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "supplierProductsApi.ts"

Cohesion: 0.32
Nodes (6): MutationRequestOptions, fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), SupplierProductListParams, PushContext

### Community 32 - "PrintJobFormModal.tsx"

Cohesion: 0.23
Nodes (17): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+9 more)

### Community 33 - "supplierProducts.resource.ts"

Cohesion: 0.23
Nodes (16): createPurchase(), linkSupplierProduct(), setLinksForSupplier(), unlinkSupplierProduct(), toLocalRow(), appendStockDelta(), registerSyncResource(), registerSyncResources() (+8 more)

### Community 34 - "SupplierList.tsx"

Cohesion: 0.18
Nodes (20): SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS (+12 more)

### Community 35 - "BillingCounter.tsx"

Cohesion: 0.09
Nodes (33): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+25 more)

### Community 36 - "common.ts"

Cohesion: 0.20
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 37 - "PrintJobList.tsx"

Cohesion: 0.29
Nodes (11): BackendPrintJob, calculatePrintEarnings(), createPrintJob(), deletePrintJobs(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob(), updatePrintJob() (+3 more)

### Community 38 - "outbox.ts"

Cohesion: 0.12
Nodes (26): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, AuditLevel, ConflictReason, IdMapStatus, OutboxError (+18 more)

### Community 39 - "SyncEngine.ts"

Cohesion: 0.17
Nodes (18): pruneByRetention(), rowAgeTimestamp(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta() (+10 more)

### Community 40 - "ProductTable.tsx"

Cohesion: 0.24
Nodes (14): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+6 more)

### Community 41 - "suppliers.resource.ts"

Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 42 - "categories.resource.ts"

Cohesion: 0.40
Nodes (7): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), categoriesResource

### Community 43 - "ROUTES"

Cohesion: 0.16
Nodes (13): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, NAV_ITEMS, NavItemConfig, AppRoute, ROUTE_PATHS (+5 more)

### Community 44 - "useSearchHistory.ts"

Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 45 - "searchFields.ts"

Cohesion: 0.17
Nodes (16): ProductPickerModalProps, SupplierPickerModalProps, EntityListPage(), EntityListPageProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight() (+8 more)

### Community 46 - "generate-icon-shards.mjs"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 47 - "authSlice.ts"

Cohesion: 0.31
Nodes (10): getMeApi(), cacheSession(), clearCachedSession(), readCachedSession(), authSlice, initializeAuth, initialState, isNetworkError() (+2 more)

### Community 48 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "customers.resource.ts"

Cohesion: 0.18
Nodes (14): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+6 more)

### Community 50 - "AmountInput.tsx"

Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 51 - "ApiClient"

Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 52 - "authApi.ts"

Cohesion: 0.36
Nodes (8): UserRole, AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession, AuthState

### Community 53 - "InvoicesList.tsx"

Cohesion: 0.20
Nodes (11): fetchInvoices(), InvoicesList(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable(), DataTableProps, getListEmptyText() (+3 more)

### Community 54 - "Offline-First Dexie Mirror and Outbox Engine"

Cohesion: 0.25
Nodes (8): Backend Sync, Multiplexed Delta, and Idempotency Contract, Connectivity Monitor and Asymmetric Hysteresis, CSS Variable Design Tokens and Dark Mode System, Offline Authentication and Grace Period, Offline-First Dexie Mirror and Outbox Engine, PWA Shell Pre-caching and API Guard Policy, Redux Toolkit State Architecture, Sync Resource Descriptor Protocol

### Community 55 - "icons.svg (Social/Doc Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 56 - "app/App.tsx"

Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 57 - "MobileSignUpForm.tsx"

Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 58 - "purchasesApi.ts"

Cohesion: 0.18
Nodes (12): BackendPaymentRecord, PaymentListResponseData, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), fetchPurchases(), fetchPurchasesByProduct() (+4 more)

### Community 59 - "store/index.ts"

Cohesion: 0.18
Nodes (12): createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch, RootState, store, listenerMiddleware (+4 more)

### Community 60 - "Responsive and Mobile Layout Tiers"

Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"

Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"

Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 69 - "ProductCatalogTree.tsx"

Cohesion: 0.28
Nodes (11): CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon() (+3 more)

### Community 101 - "RepairJobList.tsx"

Cohesion: 0.37
Nodes (11): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculateRepairEarnings(), createRepairJob(), deleteRepairs(), fetchRepairs(), RepairListResponseData (+3 more)

### Community 102 - "money.ts"

Cohesion: 0.18
Nodes (19): CURRENCY, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), MoneyInput() (+11 more)

### Community 103 - "NotificationPopover.tsx"

Cohesion: 0.27
Nodes (9): NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, formatRelativeTime() (+1 more)

### Community 104 - "useSyncData.ts"

Cohesion: 0.24
Nodes (10): ConflictRecord, depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+2 more)

### Community 106 - "ReportsDashboard.tsx"

Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 107 - "notificationSlice.ts"

Cohesion: 0.27
Nodes (7): STORAGE_KEYS, initialState, notificationSlice, selectAllNotifications(), selectNotificationsByCategory(), selectUnreadNotificationCount, selectUnreadNotifications

### Community 108 - "ExpandableCard.tsx"

Cohesion: 0.27
Nodes (8): ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 109 - "SyncModuleCard.tsx"

Cohesion: 0.31
Nodes (7): SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, ModuleSyncStatus, ModuleSyncView, OverallSyncStatus

### Community 110 - "formatDateTime"

Cohesion: 0.39
Nodes (7): SyncStatusBadge(), SyncStatusBadgeProps, formatDateTime(), selectIsOfflineSession(), selectConnectivity(), selectOverallSyncStatus, selectSyncTotals()

### Community 111 - "ui.ts"

Cohesion: 0.50
Nodes (3): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN

## Knowledge Gaps

- **317 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `SyncPanel.tsx`, `useAppSelector`, `products.resource.ts`, `CustomerList.tsx`, `cartSlice.ts`, `EmployeeList.tsx`, `SaleDocumentPreviewModal.tsx`, `useCategories.ts`, `useSupplierProducts.ts`, `SupplierDetailDrawer.tsx`, `PrintJobFormModal.tsx`, `SupplierList.tsx`, `BillingCounter.tsx`, `common.ts`, `ProductTable.tsx`, `searchFields.ts`, `AmountInput.tsx`, `money.ts`, `NotificationPopover.tsx`, `formatDateTime`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `offline/index.ts`, `flush.ts`, `authSlice.ts`, `SyncEngine.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `offline/constants.ts`, `SyncPanel.tsx`, `BillingCounter.tsx`, `NotificationPopover.tsx`, `ProductTable.tsx`, `RequireAdmin.tsx`, `syncSlice.ts`, `ROUTES`, `useIsMobile`, `formatDateTime`, `cartSlice.ts`, `SaleDocumentPreviewModal.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `offline/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07781649245063879 - nodes in this community are weakly interconnected._
- **Should `tablerIconShards/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05697278911564626 - nodes in this community are weakly interconnected._
