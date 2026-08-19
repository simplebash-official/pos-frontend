# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 310 files · ~160,753 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1599 nodes · 4929 edges · 113 communities (82 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a24e6fd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- offline/index.ts
- useCategories.ts
- registry.ts
- tablerIconShards/index.ts
- settings/types.ts
- SyncEngine.ts
- useAppSelector
- flush.ts
- SyncPanel.tsx
- offline/constants.ts
- products.resource.ts
- router.tsx
- CustomerList.tsx
- useIsMobile
- outbox.ts
- BillingCounter.tsx
- inventory/types.ts
- dependencies
- constants/index.ts
- SaleDocumentPreviewModal.tsx
- resources/index.ts
- devDependencies
- mockEmployees.ts
- invoicesApi.ts
- pull.test.ts
- SupplierDetailDrawer.tsx
- schema.ts
- compilerOptions
- ProductCatalogTree.tsx
- purchasesApi.ts
- Backend Requirements — Offline Sync Spec
- tablerIcons.ts
- customers.resource.ts
- supplierProducts.resource.ts
- useSyncedMutation
- useResponsive.tsx
- ROUTES
- printJobs.resource.ts
- Invoice
- syncSlice.ts
- ProductTable.tsx
- RequireAuth.tsx
- categories.resource.ts
- search.ts
- authSlice.ts
- EmployeeList.tsx
- generate-icon-shards.mjs
- RequireAdmin.tsx
- scripts
- queryKeys.ts
- AmountInput.tsx
- ApiClient
- useSearchHistory.ts
- repairs.resource.ts
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- app/App.tsx
- MobileSignUpForm.tsx
- suppliers.resource.ts
- providers.tsx
- Responsive and Mobile Layout Tiers
- package.json
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell, and Router Architecture
- syncApi.ts
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- Sidebar.tsx
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
- PrintJobList.tsx
- useSupplierProducts.ts
- notificationSlice.ts
- themeSlice.ts
- typescript
- RepairJobList.tsx
- useSyncedQuery
- notifications/types.ts
- mirror.ts
- ui.ts
- navigation.ts
- eslint-plugin-react-hooks

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 75 edges
2. `formatMoney()` - 60 edges
3. `useAppSelector` - 60 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 38 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `useEntitySearch()` - 28 edges
10. `fetchResourceDelta()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `Sidebar()` --indirect_call--> `selectUserRole()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `NotificationPopover()` --indirect_call--> `selectAllNotifications()`  [INFERRED]
  src/features/notifications/components/NotificationPopover.tsx → src/store/slices/notificationSlice.ts
- `ProductsPageData` --references--> `Product`  [EXTRACTED]
  src/features/inventory/api/productsApi.ts → src/features/inventory/types.ts

## Import Cycles
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)
- **Offline-First Sync and Storage Architecture** — claude_md_offline_sync_engine, claude_md_sync_resource_descriptor, claude_md_connectivity_monitor, claude_md_backend_sync_contract [EXTRACTED 1.00]
- **Responsive and Performant UI Design System** — claude_md_responsive_rules, claude_md_center_modal_standard, claude_md_detail_drawer_standard, claude_md_animation_performance [EXTRACTED 1.00]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline [INFERRED 0.75]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow, claude_md_graphify_guidelines [INFERRED 0.95]

## Communities (113 total, 31 thin omitted)

### Community 0 - "offline/index.ts"
Cohesion: 0.11
Nodes (22): db, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ, OutboxFullError (+14 more)

### Community 1 - "useCategories.ts"
Cohesion: 0.22
Nodes (15): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCategoryIcons() (+7 more)

### Community 2 - "registry.ts"
Cohesion: 0.10
Nodes (20): reclaimInflightOperations(), getReferringResources(), resetRegistry(), resources, Widget, widgetResource, mockStatus(), RFC-3339 (+12 more)

### Community 4 - "settings/types.ts"
Cohesion: 0.23
Nodes (9): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+1 more)

### Community 5 - "SyncEngine.ts"
Cohesion: 0.10
Nodes (21): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, pruneByRetention(), rowAgeTimestamp(), getAllSyncMeta(), AuditLevel, logError(), logInfo() (+13 more)

### Community 6 - "useAppSelector"
Cohesion: 0.09
Nodes (43): HeldCartCatchupNotifier(), Sidebar(), NotificationItem(), NotificationPopover(), NotificationPopoverProps, ACCEPTED_TYPES, LogoUpload(), LogoUploadProps (+35 more)

### Community 7 - "flush.ts"
Cohesion: 0.09
Nodes (39): ConflictReason, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+31 more)

### Community 8 - "SyncPanel.tsx"
Cohesion: 0.09
Nodes (36): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+28 more)

### Community 9 - "offline/constants.ts"
Cohesion: 0.05
Nodes (46): isApiErrorLike(), readServerTime(), RequestOptions, env, clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete() (+38 more)

### Community 10 - "products.resource.ts"
Cohesion: 0.16
Nodes (13): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+5 more)

### Community 11 - "router.tsx"
Cohesion: 0.11
Nodes (15): BillingCounter, CustomerList, EmailLoginScreen, InvoicesList, PrintJobList, RepairJobList, StandalonePrintView, SupplierList (+7 more)

### Community 12 - "CustomerList.tsx"
Cohesion: 0.16
Nodes (22): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModalProps (+14 more)

### Community 13 - "useIsMobile"
Cohesion: 0.10
Nodes (49): CartLineItem, CartPanel, CartPanelProps, CatalogPanel, CatalogPanelProps, chunk(), DiscountPopover(), DiscountPopoverProps (+41 more)

### Community 14 - "outbox.ts"
Cohesion: 0.13
Nodes (26): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, IdMapStatus, OutboxError, OutboxOp, OutboxStatus (+18 more)

### Community 15 - "BillingCounter.tsx"
Cohesion: 0.08
Nodes (52): Header(), HeaderProps, PAYMENT_METHODS, PaymentMethod, BillingCounter(), BillingRegionsProps, FILL, BillingPane (+44 more)

### Community 16 - "inventory/types.ts"
Cohesion: 0.14
Nodes (21): CURRENCY, FormContentProps, ProductFormContent(), ProductFormModalProps, SupplierIntakeRow, useValidCategories(), BarcodeSource, Category (+13 more)

### Community 17 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "constants/index.ts"
Cohesion: 0.17
Nodes (25): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+17 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.13
Nodes (26): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+18 more)

### Community 20 - "resources/index.ts"
Cohesion: 0.27
Nodes (12): RecordPaymentInput, createPurchase(), toLocalRow(), defineSyncResource(), registerSyncResource(), registerSyncResources(), paymentsResource, RecordPaymentPayload (+4 more)

### Community 21 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "mockEmployees.ts"
Cohesion: 0.15
Nodes (11): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+3 more)

### Community 23 - "invoicesApi.ts"
Cohesion: 0.15
Nodes (21): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+13 more)

### Community 24 - "pull.test.ts"
Cohesion: 0.12
Nodes (23): toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, logWarn() (+15 more)

### Community 25 - "SupplierDetailDrawer.tsx"
Cohesion: 0.21
Nodes (17): ProductPickerModal(), useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesByProduct() (+9 more)

### Community 26 - "schema.ts"
Cohesion: 0.33
Nodes (8): MirrorTableName, OfflineDb, AuditEvent, ConflictRecord, IdMapRecord, MirroredRow, SessionRecord, StockLedgerEntry

### Community 27 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "ProductCatalogTree.tsx"
Cohesion: 0.23
Nodes (12): ProductTable, CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductFormModal(), CATEGORY_COLOR_OPTIONS (+4 more)

### Community 29 - "purchasesApi.ts"
Cohesion: 0.23
Nodes (10): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), toPaymentRecord(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier() (+2 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "tablerIcons.ts"
Cohesion: 0.20
Nodes (17): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+9 more)

### Community 32 - "customers.resource.ts"
Cohesion: 0.19
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 33 - "supplierProducts.resource.ts"
Cohesion: 0.27
Nodes (11): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+3 more)

### Community 34 - "useSyncedMutation"
Cohesion: 0.19
Nodes (20): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS (+12 more)

### Community 35 - "useResponsive.tsx"
Cohesion: 0.12
Nodes (20): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, BillingRegions, HeldSalesDrawer() (+12 more)

### Community 36 - "ROUTES"
Cohesion: 0.19
Nodes (14): AppRoute, ROUTES, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer() (+6 more)

### Community 37 - "printJobs.resource.ts"
Cohesion: 0.30
Nodes (13): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData, toPrintJob() (+5 more)

### Community 38 - "Invoice"
Cohesion: 0.16
Nodes (15): CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, useAllInvoices(), NO_PAYMENTS, useInvoicePayments(), useRecordPayment() (+7 more)

### Community 39 - "syncSlice.ts"
Cohesion: 0.12
Nodes (13): ConnectivitySnapshot, ConnectivityState, PULL_INTERVAL_MS, SyncMetaRecord, SyncEngineState, deriveModuleStatus(), initialState, selectHasBlockingProblem (+5 more)

### Community 40 - "ProductTable.tsx"
Cohesion: 0.26
Nodes (11): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+3 more)

### Community 41 - "RequireAuth.tsx"
Cohesion: 0.20
Nodes (12): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), PageLoader() (+4 more)

### Community 42 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 43 - "search.ts"
Cohesion: 0.23
Nodes (15): buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier(), normalizeDigits(), normalizeText(), scoreEntry() (+7 more)

### Community 44 - "authSlice.ts"
Cohesion: 0.20
Nodes (16): getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, cacheSession(), clearCachedSession() (+8 more)

### Community 45 - "EmployeeList.tsx"
Cohesion: 0.15
Nodes (20): EmployeeList, fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS (+12 more)

### Community 46 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 47 - "RequireAdmin.tsx"
Cohesion: 0.26
Nodes (9): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, UserSession, RoleGuard(), RoleGuardProps (+1 more)

### Community 48 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "queryKeys.ts"
Cohesion: 0.22
Nodes (8): queryKeys, ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 50 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 51 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 52 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 53 - "repairs.resource.ts"
Cohesion: 0.39
Nodes (10): deleteEarningRecordsForWork(), calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), RepairListResponseData, toRepairJob(), updateRepairJobRaw(), creditCommission() (+2 more)

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

### Community 58 - "suppliers.resource.ts"
Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 59 - "providers.tsx"
Cohesion: 0.18
Nodes (10): AppUpdatePrompt(), AppProvidersProps, AuthInitializer(), reduxColorSchemeManager, darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars (+2 more)

### Community 60 - "Responsive and Mobile Layout Tiers"
Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"
Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 64 - "syncApi.ts"
Cohesion: 0.27
Nodes (11): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+3 more)

### Community 69 - "Sidebar.tsx"
Cohesion: 0.24
Nodes (7): SidebarProps, EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, SegmentedToggle(), SegmentedToggleProps

### Community 101 - "PrintJobList.tsx"
Cohesion: 0.29
Nodes (9): PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload, UpdatePrintJobPayload (+1 more)

### Community 102 - "useSupplierProducts.ts"
Cohesion: 0.31
Nodes (8): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useSuppliersForProduct(), useUnlinkProduct(), SupplierProduct

### Community 103 - "notificationSlice.ts"
Cohesion: 0.23
Nodes (10): STORAGE_KEYS, AppDispatch, RootState, listenerMiddleware, initialState, notificationSlice, selectAllNotifications(), selectNotificationsByCategory() (+2 more)

### Community 104 - "themeSlice.ts"
Cohesion: 0.24
Nodes (8): createReduxColorSchemeManager(), toAppScheme(), toMantineScheme(), store, ColorScheme, initialState, themeSlice, ThemeState

### Community 106 - "RepairJobList.tsx"
Cohesion: 0.38
Nodes (8): RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload, UpdateRepairPayload

### Community 107 - "useSyncedQuery"
Cohesion: 0.31
Nodes (7): NO_INVOICES, useCancelInvoice(), SyncedQueryResult, useSyncedQuery(), CancelInvoicePayload, selectResourceHasNeverSynced(), selectResourceIsSyncing()

### Community 108 - "notifications/types.ts"
Cohesion: 0.29
Nodes (6): NotificationItemProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, NotificationState

### Community 109 - "mirror.ts"
Cohesion: 0.40
Nodes (4): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta

### Community 110 - "ui.ts"
Cohesion: 0.50
Nodes (3): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN

## Knowledge Gaps
- **319 isolated node(s):** `HeaderProps`, `SidebarProps`, `NotificationPopoverProps`, `FlushCompleteListener`, `SyncEngineListener` (+314 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `useCategories.ts`, `useSyncedMutation`, `useResponsive.tsx`, `ROUTES`, `Sidebar.tsx`, `useAppSelector`, `Invoice`, `ProductTable.tsx`, `SyncPanel.tsx`, `CustomerList.tsx`, `EmployeeList.tsx`, `BillingCounter.tsx`, `inventory/types.ts`, `constants/index.ts`, `SaleDocumentPreviewModal.tsx`, `AmountInput.tsx`, `SupplierDetailDrawer.tsx`, `ProductCatalogTree.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `useResponsive.tsx`, `Sidebar.tsx`, `ProductTable.tsx`, `RequireAuth.tsx`, `SyncPanel.tsx`, `offline/constants.ts`, `useSyncedQuery`, `useIsMobile`, `BillingCounter.tsx`, `RequireAdmin.tsx`, `SaleDocumentPreviewModal.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `db` connect `offline/index.ts` to `useCategories.ts`, `registry.ts`, `SyncEngine.ts`, `flush.ts`, `SyncPanel.tsx`, `products.resource.ts`, `CustomerList.tsx`, `outbox.ts`, `resources/index.ts`, `invoicesApi.ts`, `pull.test.ts`, `SupplierDetailDrawer.tsx`, `schema.ts`, `customers.resource.ts`, `supplierProducts.resource.ts`, `useSyncedMutation`, `printJobs.resource.ts`, `Invoice`, `ProductTable.tsx`, `categories.resource.ts`, `authSlice.ts`, `repairs.resource.ts`, `suppliers.resource.ts`, `PrintJobList.tsx`, `useSupplierProducts.ts`, `RepairJobList.tsx`, `useSyncedQuery`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `HeaderProps`, `SidebarProps`, `NotificationPopoverProps` to the rest of the system?**
  _319 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10826210826210826 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10098522167487685 - nodes in this community are weakly interconnected._
- **Should `tablerIconShards/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._