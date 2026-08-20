# Graph Report - frontend (2026-08-20)

## Corpus Check

- 317 files · ~162,849 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1677 nodes · 5032 edges · 109 communities (79 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `00176555`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- EmployeeList.tsx
- notificationSlice.ts
- useAppSelector
- auth/index.ts
- useIsMobile
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- pull.test.ts
- purchases.resource.ts
- SyncEngine.ts
- dependencies
- ProductTable.tsx
- searchFields.ts
- mockEmployees.ts
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobFormModal.tsx
- tablerIconShards/index.ts
- router.tsx
- products.resource.ts
- compilerOptions
- db
- outbox.ts
- PrintJobList.tsx
- navigation.ts
- invoicesApi.ts
- ROUTES
- offline/constants.ts
- Backend Sync Requirements Doc
- offline/types.ts
- ReportsDashboard.tsx
- registry.ts
- useSyncData.ts
- RepairJobList.tsx
- BillingCounter.tsx
- SupplierList.tsx
- syncSlice.ts
- ApiClient
- RequireAdmin.tsx
- settingsSlice.ts
- syncApi.ts
- categories.resource.ts
- useCategories.ts
- printJobs.resource.ts
- AppShell.tsx
- @mantine/form
- SettingsNav.tsx
- LogoUpload.tsx
- react-dom
- @tanstack/react-query
- providers.tsx
- RepairFormModal.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- customers.resource.ts
- AmountInput.tsx
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- vite-plugin-pwa
- prettier
- typescript
- typescript-eslint
- vitest
- AGENTS.md Instructions Document
- src/constants/ Shared Business Constants
- npm run dev
- npm run preview
- src/api/queryKeys.ts Query Key Factory
- Login Screen (Auth Feature)
- Phone Repair Technician Servicing Device
- Repair/Retail Shop POS Domain
- GEMINI.md Instructions Document
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

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 60 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 39 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `flushOutbox()` - 27 edges
10. `fetchResourceDelta()` - 27 edges

## Surprising Connections (you probably didn't know these)

- `build-and-deploy Job` --conceptually_related_to--> `Post-Change Verification Rule` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Build Step (npm run build)` --references--> `npm run build` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Lint Step (npm run lint)` --references--> `npm run lint` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Type Check Step (npm run type-check)` --references--> `npm run type-check` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `paths-ignore Trigger Filter` --shares_data_with--> `graphify Knowledge Graph Integration` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md

## Import Cycles

- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)

- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (109 total, 30 thin omitted)

### Community 0 - "EmployeeList.tsx"

Cohesion: 0.16
Nodes (16): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, EmployeeInput, EmployeeRole (+8 more)

### Community 1 - "notificationSlice.ts"

Cohesion: 0.09
Nodes (29): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+21 more)

### Community 2 - "useAppSelector"

Cohesion: 0.17
Nodes (26): Sidebar(), SidebarProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues (+18 more)

### Community 3 - "auth/index.ts"

Cohesion: 0.24
Nodes (11): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+3 more)

### Community 4 - "useIsMobile"

Cohesion: 0.12
Nodes (28): CartLineItem, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, getCategoryIconInfo(), CustomerDetailDrawer(), CustomerDetailDrawerProps (+20 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.08
Nodes (41): InvoicesList, getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal() (+33 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.11
Nodes (32): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), SaleHeroPresentation, LineSourceType, SplitPaymentDetail, CartItem (+24 more)

### Community 7 - "CustomerList.tsx"

Cohesion: 0.18
Nodes (21): CustomerList, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal(), CustomerPickerModalProps (+13 more)

### Community 8 - "pull.test.ts"

Cohesion: 0.11
Nodes (22): blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, adoptNewestCursor(), applyChanges() (+14 more)

### Community 9 - "purchases.resource.ts"

Cohesion: 0.24
Nodes (12): createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+4 more)

### Community 10 - "SyncEngine.ts"

Cohesion: 0.09
Nodes (28): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES, getAllSyncMeta() (+20 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "ProductTable.tsx"

Cohesion: 0.14
Nodes (30): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+22 more)

### Community 13 - "searchFields.ts"

Cohesion: 0.09
Nodes (39): useAllInvoices(), ProductPickerModalProps, InvoicesList(), SupplierPickerModalProps, mergeByCategory(), QuickSearchResult, MetricCardDef, MetricCardRow() (+31 more)

### Community 14 - "mockEmployees.ts"

Cohesion: 0.14
Nodes (11): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+3 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.18
Nodes (19): UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession (+11 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.08
Nodes (42): readServerVersion(), toServerRow(), ConflictReason, AbandonedReferenceError, BarcodeConflictError, OutboxFullError, UnresolvedReferenceError, abandonMapping() (+34 more)

### Community 18 - "PrintJobFormModal.tsx"

Cohesion: 0.26
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob (+6 more)

### Community 19 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"

Cohesion: 0.11
Nodes (18): AppShell(), BillingCounter, EmailLoginScreen, EmployeeList, ProductTable, SettingsPage, StandalonePrintView, SupplierList (+10 more)

### Community 21 - "products.resource.ts"

Cohesion: 0.18
Nodes (11): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+3 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "db"

Cohesion: 0.17
Nodes (16): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), fetchPrintJobStats(), PrintJobStats, usePrintJobStats(), fetchRepairStats() (+8 more)

### Community 24 - "outbox.ts"

Cohesion: 0.14
Nodes (24): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxError, OutboxOp, OutboxStatus, assignLedgerEntriesToOperation(), getDeviceId() (+16 more)

### Community 25 - "PrintJobList.tsx"

Cohesion: 0.20
Nodes (14): PrintJobList, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload (+6 more)

### Community 26 - "navigation.ts"

Cohesion: 0.40
Nodes (4): NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig

### Community 27 - "invoicesApi.ts"

Cohesion: 0.16
Nodes (18): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+10 more)

### Community 28 - "ROUTES"

Cohesion: 0.21
Nodes (12): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTES, PageLoader(), PageLoaderProps (+4 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.05
Nodes (43): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+35 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "offline/types.ts"

Cohesion: 0.12
Nodes (13): reclaimInflightOperations(), Widget, widgetResource, ConflictPolicy, ConflictStrategy, LocalApplyHandler, LocalApplyResult, LocalContext (+5 more)

### Community 32 - "ReportsDashboard.tsx"

Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 33 - "registry.ts"

Cohesion: 0.18
Nodes (17): RecordPaymentInput, linkSupplierProduct(), setLinksForSupplier(), unlinkSupplierProduct(), defineOperation(), defineSyncResource(), registerSyncResource(), resources (+9 more)

### Community 34 - "useSyncData.ts"

Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 35 - "RepairJobList.tsx"

Cohesion: 0.30
Nodes (9): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload (+1 more)

### Community 36 - "BillingCounter.tsx"

Cohesion: 0.14
Nodes (28): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+20 more)

### Community 37 - "SupplierList.tsx"

Cohesion: 0.15
Nodes (21): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormContent(), SupplierFormModal(), SupplierFormModalProps, SupplierList(), DEFAULT_SUGGESTED_TAGS (+13 more)

### Community 38 - "syncSlice.ts"

Cohesion: 0.07
Nodes (40): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+32 more)

### Community 39 - "ApiClient"

Cohesion: 0.15
Nodes (12): ApiClient, buildParams(), buildSyncHeaders(), MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), toPaymentRecord() (+4 more)

### Community 40 - "RequireAdmin.tsx"

Cohesion: 0.29
Nodes (7): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, RoleGuard(), RoleGuardProps, selectUserRole()

### Community 41 - "settingsSlice.ts"

Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "syncApi.ts"

Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 43 - "categories.resource.ts"

Cohesion: 0.33
Nodes (9): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, categoriesResource (+1 more)

### Community 44 - "useCategories.ts"

Cohesion: 0.08
Nodes (47): CURRENCY, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps (+39 more)

### Community 45 - "printJobs.resource.ts"

Cohesion: 0.19
Nodes (22): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData, toPrintJob() (+14 more)

### Community 46 - "AppShell.tsx"

Cohesion: 0.27
Nodes (8): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS

### Community 48 - "SettingsNav.tsx"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 49 - "LogoUpload.tsx"

Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 54 - "providers.tsx"

Cohesion: 0.10
Nodes (18): App(), AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProviders(), AppProvidersProps, AuthInitializer(), router, DEFAULT_PAGINATION (+10 more)

### Community 56 - "RepairFormModal.tsx"

Cohesion: 0.24
Nodes (15): RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJob, MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents() (+7 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.11
Nodes (28): NO_INVOICES, useCancelInvoice(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorTableName, OfflineDb, AuditEvent, ConflictRecord (+20 more)

### Community 60 - "SyncProvider.tsx"

Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 61 - "App Entry Chain"

Cohesion: 0.18
Nodes (11): Deploy Frontend Workflow, paths-ignore Trigger Filter, AppShell.tsx, cssVariablesResolver.ts Design Tokens, App Entry Chain, Feature Module Pattern (components/, types.ts, index.ts barrel), graphify Knowledge Graph Integration, isBillingBoundaryChange Render-Time State Adjustment (+3 more)

### Community 62 - "Animation Performance Rules"

Cohesion: 0.29
Nodes (10): AmountInput.tsx, Animation Performance Rules, BillingRegions.tsx, CartLineItem.tsx, CartPanel.tsx, CatalogPanel.tsx, LayoutTierProvider, Responsive & Mobile UI Layout Tiers (+2 more)

### Community 63 - "Offline & Sync Architecture"

Cohesion: 0.31
Nodes (9): ApiClient (src/api/client.ts), AppUpdatePrompt.tsx, Backend Sync Contract (Rust/Axum), ConnectivityMonitor, localId.ts (Provisional local_ IDs), Offline & Sync Architecture, Durable Outbox Pattern, vite-plugin-pwa Service Worker (+1 more)

### Community 64 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 65 - "customers.resource.ts"

Cohesion: 0.14
Nodes (20): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+12 more)

### Community 66 - "AmountInput.tsx"

Cohesion: 0.25
Nodes (7): AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 67 - "useSearchHistory.ts"

Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 68 - "Redux Toolkit Store (src/store/)"

Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"

Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 73 - "MobileSignUpForm.tsx"

Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "invoices.resource.ts"

Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json"

Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 77 - "Right-Side Detail Drawer Visual Family"

Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CatalogPanel.tsx"

Cohesion: 0.21
Nodes (18): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+10 more)

## Knowledge Gaps

- **339 isolated node(s):** `MirrorTableName`, `PullState`, `PushState`, `IdMapStatus`, `MetricCardDef` (+334 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `EmployeeList.tsx`, `notificationSlice.ts`, `useAppSelector`, `auth/index.ts`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `ProductTable.tsx`, `searchFields.ts`, `PrintJobFormModal.tsx`, `ROUTES`, `BillingCounter.tsx`, `SupplierList.tsx`, `syncSlice.ts`, `useCategories.ts`, `AppShell.tsx`, `RepairFormModal.tsx`, `AmountInput.tsx`, `CatalogPanel.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `flush.ts`, `SyncEngine.ts`, `schema.ts`, `authSlice.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `RequireAdmin.tsx`, `ProductTable.tsx`, `AppShell.tsx`, `SyncProvider.tsx`, `router.tsx`, `providers.tsx`, `ROUTES`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `MirrorTableName`, `PullState`, `PushState` to the rest of the system?**
  _339 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08943089430894309 - nodes in this community are weakly interconnected._
- **Should `useIsMobile` be split into smaller, more focused modules?**
  _Cohesion score 0.11923076923076924 - nodes in this community are weakly interconnected._
- **Should `SaleDocumentPreviewModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08270676691729323 - nodes in this community are weakly interconnected._
