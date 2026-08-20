# Graph Report - frontend  (2026-08-20)

## Corpus Check
- 318 files · ~164,358 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1692 nodes · 5089 edges · 126 communities (94 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 115 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1b1aa948`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mockEmployees.ts
- notificationSlice.ts
- useAppDispatch
- LoginForm.tsx
- useIsMobile
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- syncApi.ts
- common.ts
- SyncEngine.ts
- dependencies
- products.resource.ts
- GlobalQuickSearchModal.tsx
- LocalStorageStore
- authSlice.ts
- devDependencies
- flush.ts
- RepairFormModal.tsx
- router.tsx
- tablerIcons.ts
- compilerOptions
- useBillingStats.ts
- outbox.ts
- PrintJobList.tsx
- Sidebar.tsx
- invoicesApi.ts
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- registry.ts
- providers.tsx
- customers.resource.ts
- useSyncData.ts
- ConnectivityMonitor
- BillingCounter.tsx
- SupplierList.tsx
- syncSlice.ts
- client.ts
- formatMoney
- settingsSlice.ts
- useCategories.ts
- categories.resource.ts
- ProductCatalogTree.tsx
- repairs.resource.ts
- SyncPanel.tsx
- @mantine/form
- SettingsNav.tsx
- LogoUpload.tsx
- react-dom
- @tanstack/react-query
- printJobs.resource.ts
- SyncEngine
- store/index.ts
- useSupplierProducts.ts
- moneyFormUtils.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- EmployeeList.tsx
- AmountInput.tsx
- RepairJobList.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- InvoicesList.tsx
- suppliers.resource.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- networkSignal.ts
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- InvoiceDetailDrawer.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- useSearchHistory.ts
- useShortcuts.ts
- vite-plugin-pwa
- prettier
- typescript
- typescript-eslint
- RequireAuth.tsx
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
- SyncModuleCard.tsx
- authApi.ts
- searchFields.ts
- ExpandableCard.tsx
- formatDateTime
- SyncStatusBadge.tsx
- QuantityInput.tsx

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 62 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 39 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `flushOutbox()` - 27 edges
10. `fetchResourceDelta()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `build-and-deploy Job` --conceptually_related_to--> `Post-Change Verification Rule`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Build Step (npm run build)` --references--> `npm run build`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Lint Step (npm run lint)` --references--> `npm run lint`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Type Check Step (npm run type-check)` --references--> `npm run type-check`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `paths-ignore Trigger Filter` --shares_data_with--> `graphify Knowledge Graph Integration`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md

## Import Cycles
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
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

## Communities (126 total, 32 thin omitted)

### Community 0 - "mockEmployees.ts"
Cohesion: 0.14
Nodes (14): queryKeys, ReportsDashboard, createEmployee(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees(), INITIAL_EARNINGS (+6 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.17
Nodes (15): NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, formatRelativeTime() (+7 more)

### Community 2 - "useAppDispatch"
Cohesion: 0.21
Nodes (19): BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection(), PrintingFormValues, PrintingSection() (+11 more)

### Community 3 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 4 - "useIsMobile"
Cohesion: 0.09
Nodes (37): HeldCartCatchupNotifier(), AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header() (+29 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.17
Nodes (21): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+13 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (33): PaymentMethod, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, useCartCheckout(), useCartItems(), useCartTotals() (+25 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.18
Nodes (20): fetchInvoices(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList() (+12 more)

### Community 8 - "syncApi.ts"
Cohesion: 0.12
Nodes (21): toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary, CursorInvalidError (+13 more)

### Community 9 - "common.ts"
Cohesion: 0.11
Nodes (18): MutationRequestOptions, fetchAllCustomers(), fetchCustomers(), CustomerListParams, CustomerListResponse, CustomerTagsResponse, fetchPurchases(), fetchPurchasesByProduct() (+10 more)

### Community 10 - "SyncEngine.ts"
Cohesion: 0.13
Nodes (22): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES, blankMeta() (+14 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "products.resource.ts"
Cohesion: 0.09
Nodes (30): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+22 more)

### Community 13 - "GlobalQuickSearchModal.tsx"
Cohesion: 0.13
Nodes (29): CustomerPickerModal(), CustomerPickerModalProps, useAllCustomers(), GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps (+21 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.23
Nodes (13): AuthInitializer(), getMeApi(), OFFLINE_SESSION_GRACE_MS, cacheSession(), clearCachedSession(), readCachedSession(), SESSION_RECORD_ID, authSlice (+5 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (37): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+29 more)

### Community 18 - "RepairFormModal.tsx"
Cohesion: 0.23
Nodes (17): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+9 more)

### Community 20 - "router.tsx"
Cohesion: 0.11
Nodes (15): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList, RepairJobList, StandalonePrintView (+7 more)

### Community 21 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "useBillingStats.ts"
Cohesion: 0.23
Nodes (11): BillingStats, fetchBillingStats(), useBillingStats(), fetchPrintJobStats(), PrintJobStats, usePrintJobStats(), fetchRepairStats(), RepairStats (+3 more)

### Community 24 - "outbox.ts"
Cohesion: 0.13
Nodes (23): PendingOperationsListProps, STATUS_LABEL, OutboxError, OutboxStatus, assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), LOCAL_ID_PREFIX (+15 more)

### Community 25 - "PrintJobList.tsx"
Cohesion: 0.21
Nodes (14): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+6 more)

### Community 26 - "Sidebar.tsx"
Cohesion: 0.15
Nodes (15): RequireAdmin(), RequireAdminProps, SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, USER_ROLE_LABELS (+7 more)

### Community 27 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (16): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+8 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.14
Nodes (32): useCancelInvoice(), LowStockNotifier(), notifiedProductIds, ProductPickerModal(), ProductPickerModalProps, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS (+24 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.11
Nodes (23): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME (+15 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "registry.ts"
Cohesion: 0.10
Nodes (20): reclaimInflightOperations(), resetRegistry(), resources, Widget, widgetResource, mockStatus(), RFC-3339, AnySyncResource (+12 more)

### Community 32 - "providers.tsx"
Cohesion: 0.13
Nodes (12): App(), AppUpdatePrompt(), AppProviders(), AppProvidersProps, router, container, darkTokens, lightTokens (+4 more)

### Community 33 - "customers.resource.ts"
Cohesion: 0.13
Nodes (32): cancelInvoice(), completeSale(), recordPayment(), toPaymentRecord(), createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer() (+24 more)

### Community 34 - "useSyncData.ts"
Cohesion: 0.27
Nodes (9): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+1 more)

### Community 36 - "BillingCounter.tsx"
Cohesion: 0.15
Nodes (19): CompleteSaleInput, A4InvoicePreviewModalProps, BillingRegions, BillingRegionsProps, FILL, BillingPane, CatalogMode, PaymentPanelHandle (+11 more)

### Community 37 - "SupplierList.tsx"
Cohesion: 0.28
Nodes (12): useSetSupplierLinks(), SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier() (+4 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.14
Nodes (11): PULL_INTERVAL_MS, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectModuleView(), selectModuleViews, selectResourceHasNeverSynced() (+3 more)

### Community 39 - "client.ts"
Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 40 - "formatMoney"
Cohesion: 0.21
Nodes (14): CURRENCY, PAYMENT_METHODS, CartLineItem, CartLineItemProps, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps (+6 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "useCategories.ts"
Cohesion: 0.18
Nodes (15): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCreateCategory(), useCreateSubcategory() (+7 more)

### Community 43 - "categories.resource.ts"
Cohesion: 0.33
Nodes (9): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, categoriesResource (+1 more)

### Community 44 - "ProductCatalogTree.tsx"
Cohesion: 0.24
Nodes (12): ProductTable, CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTreeProps, ProductHierarchy, ProductFormModal(), CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+4 more)

### Community 45 - "repairs.resource.ts"
Cohesion: 0.28
Nodes (14): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams (+6 more)

### Community 46 - "SyncPanel.tsx"
Cohesion: 0.23
Nodes (13): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, formatBytes(), SyncPanel(), SyncSettingsSection(), MAX_CLOCK_SKEW_MS, estimateStorage() (+5 more)

### Community 48 - "SettingsNav.tsx"
Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 49 - "LogoUpload.tsx"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 52 - "printJobs.resource.ts"
Cohesion: 0.28
Nodes (14): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+6 more)

### Community 53 - "SyncEngine"
Cohesion: 0.16
Nodes (7): AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection, SyncEngine

### Community 54 - "store/index.ts"
Cohesion: 0.13
Nodes (15): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch (+7 more)

### Community 55 - "useSupplierProducts.ts"
Cohesion: 0.21
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+8 more)

### Community 56 - "moneyFormUtils.ts"
Cohesion: 0.18
Nodes (20): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), RepairFormModal(), MoneyInput() (+12 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.09
Nodes (34): BackendPaymentRecord, PaymentRecord, RecordPaymentInput, NO_PAYMENTS, ConnectivitySnapshot, ConnectivityState, readServerVersion(), stripMirrorMeta() (+26 more)

### Community 60 - "SyncProvider.tsx"
Cohesion: 0.39
Nodes (10): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+2 more)

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

### Community 65 - "EmployeeList.tsx"
Cohesion: 0.25
Nodes (12): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable() (+4 more)

### Community 66 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 67 - "RepairJobList.tsx"
Cohesion: 0.22
Nodes (13): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+5 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "InvoicesList.tsx"
Cohesion: 0.19
Nodes (12): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), EntityListPage(), EntityListPageProps, SearchHistoryInput (+4 more)

### Community 72 - "suppliers.resource.ts"
Cohesion: 0.19
Nodes (15): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+7 more)

### Community 73 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "invoices.resource.ts"
Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 76 - "networkSignal.ts"
Cohesion: 0.40
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CatalogPanel.tsx"
Cohesion: 0.22
Nodes (16): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+8 more)

### Community 79 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.70
Nodes (3): useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer()

### Community 83 - "useSearchHistory.ts"
Cohesion: 0.23
Nodes (13): STORAGE_KEYS, getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData (+5 more)

### Community 84 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 89 - "RequireAuth.tsx"
Cohesion: 0.27
Nodes (9): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, PageLoader(), PageLoaderProps, selectIsAuthenticated(), selectIsAuthInitialized() (+1 more)

### Community 119 - "SyncModuleCard.tsx"
Cohesion: 0.24
Nodes (9): SyncModuleCard(), SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, ModuleSyncStatus, ModuleSyncView, ExpandableCard() (+1 more)

### Community 120 - "authApi.ts"
Cohesion: 0.36
Nodes (8): UserRole, AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession, AuthState

### Community 121 - "searchFields.ts"
Cohesion: 0.24
Nodes (7): SupplierFormModal(), DEFAULT_SUGGESTED_TAGS, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, PRODUCT_SEARCH_FIELDS, REPAIR_JOB_SEARCH_FIELDS

### Community 122 - "ExpandableCard.tsx"
Cohesion: 0.31
Nodes (7): ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 123 - "formatDateTime"
Cohesion: 0.33
Nodes (5): ProductCatalogTree, MetricCardDef, MetricCardRow(), MetricCardRowProps, formatDateTime()

### Community 124 - "SyncStatusBadge.tsx"
Cohesion: 0.43
Nodes (6): SyncStatusBadge(), SyncStatusBadgeProps, selectIsOfflineSession(), selectConnectivity(), selectOverallSyncStatus, selectSyncTotals()

### Community 125 - "QuantityInput.tsx"
Cohesion: 0.50
Nodes (3): HEIGHT_MAP, QuantityInput(), QuantityInputProps

## Knowledge Gaps
- **350 isolated node(s):** `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments`, `CompleteSalePaymentInput`, `BackendInvoiceItem` (+345 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `LoginForm.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `products.resource.ts`, `GlobalQuickSearchModal.tsx`, `RepairFormModal.tsx`, `Sidebar.tsx`, `ProductTable.tsx`, `BillingCounter.tsx`, `SupplierList.tsx`, `formatMoney`, `useCategories.ts`, `ProductCatalogTree.tsx`, `SyncPanel.tsx`, `moneyFormUtils.ts`, `AmountInput.tsx`, `InvoicesList.tsx`, `InvoiceDetailDrawer.tsx`, `searchFields.ts`, `SyncStatusBadge.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useIsMobile` to `providers.tsx`, `notificationSlice.ts`, `useAppDispatch`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `formatMoney`, `InvoicesList.tsx`, `SyncPanel.tsx`, `SyncProvider.tsx`, `SyncStatusBadge.tsx`, `RequireAuth.tsx`, `Sidebar.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `db` connect `schema.ts` to `CustomerList.tsx`, `syncApi.ts`, `SyncEngine.ts`, `products.resource.ts`, `authSlice.ts`, `flush.ts`, `useBillingStats.ts`, `outbox.ts`, `PrintJobList.tsx`, `ProductTable.tsx`, `registry.ts`, `customers.resource.ts`, `useSyncData.ts`, `BillingCounter.tsx`, `SupplierList.tsx`, `useCategories.ts`, `categories.resource.ts`, `repairs.resource.ts`, `printJobs.resource.ts`, `SyncEngine`, `useSupplierProducts.ts`, `RepairJobList.tsx`, `suppliers.resource.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments` to the rest of the system?**
  _350 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `mockEmployees.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1368421052631579 - nodes in this community are weakly interconnected._
- **Should `useIsMobile` be split into smaller, more focused modules?**
  _Cohesion score 0.08687943262411348 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._