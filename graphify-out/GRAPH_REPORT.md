# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 310 files · ~160,956 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1601 nodes · 4932 edges · 106 communities (76 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db56fbaa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schema.ts
- useCategories.ts
- offline/types.ts
- tablerIconShards/index.ts
- settingsSlice.ts
- maintenance.ts
- SettingsPage.tsx
- flush.ts
- syncSlice.ts
- offline/constants.ts
- ConnectivityMonitor
- useAppDispatch
- CustomerList.tsx
- CatalogPanel.tsx
- outbox.ts
- cartSlice.ts
- products.resource.ts
- dependencies
- PrintJobFormModal.tsx
- SaleDocumentPreviewModal.tsx
- registry.ts
- devDependencies
- mockEmployees.ts
- invoicesApi.ts
- syncApi.ts
- common.ts
- client.ts
- compilerOptions
- ApiClient
- toCents
- Backend Requirements — Offline Sync Spec
- healthProbe.ts
- customers.resource.ts
- db
- SupplierList.tsx
- useResponsive.tsx
- app/App.tsx
- printJobs.resource.ts
- searchFields.ts
- SyncEngine.ts
- ProductTable.tsx
- EmployeeFormModal.tsx
- categories.resource.ts
- search.ts
- authSlice.ts
- formatMoney
- generate-icon-shards.mjs
- SyncProvider.tsx
- scripts
- ReportsDashboard.tsx
- CartLineItem.tsx
- router.tsx
- useSearchHistory.ts
- notifications/types.ts
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- navigation.ts
- MobileSignUpForm.tsx
- suppliers.resource.ts
- themeSlice.ts
- Responsive and Mobile Layout Tiers
- package.json
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell, and Router Architecture
- ui.ts
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- useIsMobile
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
- notificationSlice.ts
- typescript
- RepairJobList.tsx
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
- `CartLineItemProps` --references--> `CartItem`  [EXTRACTED]
  src/features/billing/components/CartLineItem.tsx → src/store/slices/cartSlice.ts
- `BackendRepair` --references--> `RepairJob`  [EXTRACTED]
  src/features/repairs/api/repairsApi.ts → src/features/repairs/types.ts

## Import Cycles
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

## Communities (106 total, 30 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.14
Nodes (21): PaymentRecord, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictRecord (+13 more)

### Community 1 - "useCategories.ts"
Cohesion: 0.16
Nodes (20): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTreeProps, ProductFormModal(), CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+12 more)

### Community 2 - "offline/types.ts"
Cohesion: 0.12
Nodes (13): reclaimInflightOperations(), Widget, widgetResource, ConflictPolicy, ConflictStrategy, LocalApplyHandler, LocalContext, ModuleSyncStatus (+5 more)

### Community 3 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 4 - "settingsSlice.ts"
Cohesion: 0.13
Nodes (17): SettingsPage, renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption (+9 more)

### Community 5 - "maintenance.ts"
Cohesion: 0.12
Nodes (16): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, AuditLevel, logError() (+8 more)

### Community 6 - "SettingsPage.tsx"
Cohesion: 0.11
Nodes (29): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+21 more)

### Community 7 - "flush.ts"
Cohesion: 0.09
Nodes (37): ConflictReason, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+29 more)

### Community 8 - "syncSlice.ts"
Cohesion: 0.05
Nodes (51): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+43 more)

### Community 9 - "offline/constants.ts"
Cohesion: 0.10
Nodes (22): ConnectivityListener, ConnectivityState, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEALTH_PROBE_BACKOFF_MS, HEALTH_PROBE_INTERVAL_ONLINE_MS, MAX_CLOCK_SKEW_MS, MAX_PUSH_ATTEMPTS (+14 more)

### Community 11 - "useAppDispatch"
Cohesion: 0.09
Nodes (32): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, Sidebar(), SidebarProps (+24 more)

### Community 12 - "CustomerList.tsx"
Cohesion: 0.21
Nodes (19): CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal(), CustomerPickerModalProps (+11 more)

### Community 13 - "CatalogPanel.tsx"
Cohesion: 0.15
Nodes (23): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModal(), ServiceJobPickerModalProps (+15 more)

### Community 14 - "outbox.ts"
Cohesion: 0.19
Nodes (18): OutboxError, assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), createLocalId(), isLocalId(), randomUuid(), assertOutboxHasCapacity() (+10 more)

### Community 15 - "cartSlice.ts"
Cohesion: 0.12
Nodes (30): PAYMENT_METHODS, PaymentMethod, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+22 more)

### Community 16 - "products.resource.ts"
Cohesion: 0.10
Nodes (27): CURRENCY, adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct() (+19 more)

### Community 17 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "PrintJobFormModal.tsx"
Cohesion: 0.26
Nodes (17): JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput, PrintJobType (+9 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.09
Nodes (36): InvoicesList, StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps (+28 more)

### Community 20 - "registry.ts"
Cohesion: 0.19
Nodes (20): queryKeys, RecordPaymentInput, createPurchase(), toLocalRow(), defineOperation(), defineSyncResource(), getReferringResources(), registerSyncResource() (+12 more)

### Community 21 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "mockEmployees.ts"
Cohesion: 0.14
Nodes (8): createEmployee(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee(), EmployeeEarningRecord, LocalStorageStore

### Community 23 - "invoicesApi.ts"
Cohesion: 0.12
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+16 more)

### Community 24 - "syncApi.ts"
Cohesion: 0.08
Nodes (37): toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+29 more)

### Community 25 - "common.ts"
Cohesion: 0.15
Nodes (17): BackendPaymentRecord, recordPayment(), toPaymentRecord(), Subcategory, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams (+9 more)

### Community 26 - "client.ts"
Cohesion: 0.15
Nodes (12): isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners, NetworkObservation, observeNetwork(), reportNetworkObservation() (+4 more)

### Community 27 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 29 - "toCents"
Cohesion: 0.31
Nodes (8): ProductFormContent(), MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents(), toCents(), fromPrintJob(), toPrintJobInput()

### Community 30 - "Backend Requirements — Offline Sync Spec"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "healthProbe.ts"
Cohesion: 0.29
Nodes (6): env, probeClient, probeHealth(), ProbeResult, HEADER_SERVER_TIME, HEALTH_PROBE_TIMEOUT_MS

### Community 32 - "customers.resource.ts"
Cohesion: 0.16
Nodes (16): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+8 more)

### Community 33 - "db"
Cohesion: 0.19
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+8 more)

### Community 34 - "SupplierList.tsx"
Cohesion: 0.14
Nodes (22): useSetSupplierLinks(), SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier() (+14 more)

### Community 35 - "useResponsive.tsx"
Cohesion: 0.10
Nodes (25): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, BillingRegions, KeyboardShortcutsModal() (+17 more)

### Community 36 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 37 - "printJobs.resource.ts"
Cohesion: 0.17
Nodes (24): MutationRequestOptions, addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData (+16 more)

### Community 38 - "searchFields.ts"
Cohesion: 0.15
Nodes (16): useAllInvoices(), InvoicesList(), SupplierFormModal(), DEFAULT_SUGGESTED_TAGS, EntityListPage(), EntityListPageProps, QuickSearchResult, SearchHistoryInput (+8 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.16
Nodes (15): ConnectivitySnapshot, MirrorMeta, SyncMetaRecord, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput (+7 more)

### Community 40 - "ProductTable.tsx"
Cohesion: 0.18
Nodes (26): ProductPickerModal(), ProductPickerModalProps, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useAllProducts(), useCreateProduct() (+18 more)

### Community 41 - "EmployeeFormModal.tsx"
Cohesion: 0.36
Nodes (8): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EmployeeFormValues, fromEmployee(), toEmployeeInput()

### Community 42 - "categories.resource.ts"
Cohesion: 0.21
Nodes (14): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), Category, CategoryInput (+6 more)

### Community 43 - "search.ts"
Cohesion: 0.17
Nodes (21): SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar(), MatchRange (+13 more)

### Community 44 - "authSlice.ts"
Cohesion: 0.08
Nodes (40): RequireAdmin(), RequireAdminProps, AuthInitializer(), EmailLoginScreen, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi() (+32 more)

### Community 45 - "formatMoney"
Cohesion: 0.18
Nodes (17): CustomerDetailDrawer(), deleteEmployee(), deleteEmployees(), fetchEmployeeEarnings(), updateEmployee(), EmployeeDetailDrawer(), EmployeeList(), EMPLOYEE_ROLE_LABELS (+9 more)

### Community 46 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 48 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "ReportsDashboard.tsx"
Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 50 - "CartLineItem.tsx"
Cohesion: 0.13
Nodes (14): CartLineItemProps, DiscountPopover(), DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP (+6 more)

### Community 51 - "router.tsx"
Cohesion: 0.11
Nodes (14): BillingCounter, CustomerList, EmployeeList, PrintJobList, ProductTable, RepairJobList, SupplierList, ROUTE_PATHS (+6 more)

### Community 52 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 53 - "notifications/types.ts"
Cohesion: 0.29
Nodes (6): NotificationItemProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, NotificationState

### Community 54 - "Offline-First Dexie Mirror and Outbox Engine"
Cohesion: 0.25
Nodes (8): Backend Sync, Multiplexed Delta, and Idempotency Contract, Connectivity Monitor and Asymmetric Hysteresis, CSS Variable Design Tokens and Dark Mode System, Offline Authentication and Grace Period, Offline-First Dexie Mirror and Outbox Engine, PWA Shell Pre-caching and API Guard Policy, Redux Toolkit State Architecture, Sync Resource Descriptor Protocol

### Community 55 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 56 - "navigation.ts"
Cohesion: 0.40
Nodes (4): NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig

### Community 57 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 58 - "suppliers.resource.ts"
Cohesion: 0.23
Nodes (13): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+5 more)

### Community 59 - "themeSlice.ts"
Cohesion: 0.21
Nodes (9): createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), store, ColorScheme, initialState, themeSlice (+1 more)

### Community 60 - "Responsive and Mobile Layout Tiers"
Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"
Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 64 - "ui.ts"
Cohesion: 0.50
Nodes (3): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN

### Community 69 - "useIsMobile"
Cohesion: 0.16
Nodes (28): Header(), HeaderProps, BillingCounter(), BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+20 more)

### Community 101 - "PrintJobList.tsx"
Cohesion: 0.35
Nodes (9): PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload, UpdatePrintJobPayload (+1 more)

### Community 103 - "notificationSlice.ts"
Cohesion: 0.23
Nodes (10): STORAGE_KEYS, AppDispatch, RootState, listenerMiddleware, initialState, notificationSlice, selectAllNotifications(), selectNotificationsByCategory() (+2 more)

### Community 106 - "RepairJobList.tsx"
Cohesion: 0.24
Nodes (11): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+3 more)

## Knowledge Gaps
- **321 isolated node(s):** `SidebarProps`, `NavItemConfig`, `NavCategoryGroup`, `NAV_ITEMS`, `MirrorTableName` (+316 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `useCategories.ts`, `SupplierList.tsx`, `useResponsive.tsx`, `searchFields.ts`, `ProductTable.tsx`, `EmployeeFormModal.tsx`, `syncSlice.ts`, `useAppDispatch`, `authSlice.ts`, `CatalogPanel.tsx`, `CustomerList.tsx`, `cartSlice.ts`, `formatMoney`, `products.resource.ts`, `CartLineItem.tsx`, `SaleDocumentPreviewModal.tsx`, `PrintJobFormModal.tsx`, `toCents`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useIsMobile` to `useResponsive.tsx`, `SettingsPage.tsx`, `ProductTable.tsx`, `syncSlice.ts`, `useAppDispatch`, `authSlice.ts`, `cartSlice.ts`, `SyncProvider.tsx`, `SaleDocumentPreviewModal.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `SyncEngine` connect `maintenance.ts` to `schema.ts`, `useIsMobile`, `searchFields.ts`, `SyncEngine.ts`, `syncSlice.ts`, `outbox.ts`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `SidebarProps`, `NavItemConfig`, `NavCategoryGroup` to the rest of the system?**
  _321 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `offline/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `tablerIconShards/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05697278911564626 - nodes in this community are weakly interconnected._