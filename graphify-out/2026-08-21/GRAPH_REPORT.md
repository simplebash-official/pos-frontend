# Graph Report - frontend  (2026-08-21)

## Corpus Check
- 328 files · ~169,155 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1749 nodes · 5390 edges · 115 communities (84 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `87e50eb1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SyncEngine.ts
- notificationSlice.ts
- useAppSelector
- registry.ts
- BillingCounter.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- db
- CustomerList.tsx
- SegmentedToggle.tsx
- dependencies
- formatMoney
- RepairFormModal.tsx
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- products.resource.ts
- tablerIconShards/index.ts
- Sidebar.tsx
- searchFields.ts
- compilerOptions
- BillingRegions.tsx
- outbox.ts
- InvoicesList.tsx
- useIsMobile
- common.ts
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- EmployeeList.tsx
- returns.resource.ts
- AppShell.tsx
- PrintJobList.tsx
- LoginForm.tsx
- router.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine
- SupplierList.tsx
- settingsSlice.ts
- useCategories.ts
- Invoice
- tablerIcons.ts
- inventory/index.ts
- customers.resource.ts
- SettingsPage.tsx
- CartLineItem.tsx
- @mantine/form
- suppliers.resource.ts
- purchases.resource.ts
- syncApi.ts
- cssVariablesResolver.ts
- categories.resource.ts
- AmountInput.tsx
- client.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- postcss
- supplierProducts.resource.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- LogoUpload.tsx
- payments.resource.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- billing/types.ts
- react-dom
- prettier
- typescript
- typescript-eslint
- @tanstack/react-query
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
2. `useAppSelector` - 64 edges
3. `formatMoney()` - 61 edges
4. `useSyncedMutation()` - 46 edges
5. `useAppDispatch` - 44 edges
6. `db` - 43 edges
7. `queryKeys` - 33 edges
8. `useSyncedQuery()` - 33 edges
9. `ConnectivityMonitor` - 30 edges
10. `ApiClient` - 28 edges

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
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

## Communities (115 total, 31 thin omitted)

### Community 0 - "SyncEngine.ts"
Cohesion: 0.14
Nodes (22): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), toServerRow(), logError(), logInfo() (+14 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.07
Nodes (41): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+33 more)

### Community 2 - "useAppSelector"
Cohesion: 0.14
Nodes (29): AppUpdatePrompt(), HeldCartCatchupNotifier(), Sidebar(), AppProvidersProps, AuthInitializer(), LowStockNotifier(), notifiedProductIds, useLowStockProducts() (+21 more)

### Community 3 - "registry.ts"
Cohesion: 0.08
Nodes (26): CursorInvalidError, reclaimInflightOperations(), resetRegistry(), resources, Widget, widgetResource, deltaCursors, deltaPages (+18 more)

### Community 4 - "BillingCounter.tsx"
Cohesion: 0.13
Nodes (21): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegions, DiscountPopover(), DiscountPopoverProps, useCartSound() (+13 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.14
Nodes (24): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+16 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (31): PAYMENT_METHODS, PaymentMethod, useCartCheckout(), useCartTotals(), SaleHeroPresentation, SplitPaymentDetail, cartSlice, CartState (+23 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.32
Nodes (13): BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData, toPrintJob() (+5 more)

### Community 8 - "db"
Cohesion: 0.21
Nodes (12): db, depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, useResolvedId(), NO_CONFLICTS, NO_KEYS (+4 more)

### Community 9 - "CustomerList.tsx"
Cohesion: 0.15
Nodes (27): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters(), CustomerFilters (+19 more)

### Community 10 - "SegmentedToggle.tsx"
Cohesion: 0.26
Nodes (10): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, SegmentedToggle(), SegmentedToggleProps, EmployeeFormValues (+2 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "formatMoney"
Cohesion: 0.16
Nodes (18): CURRENCY, HeldSalesDrawer(), HeldSalesDrawerProps, ProductsPageData, ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormContent() (+10 more)

### Community 13 - "RepairFormModal.tsx"
Cohesion: 0.17
Nodes (27): JOB_STATUS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+19 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.30
Nodes (14): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), FetchRepairsParams (+6 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.14
Nodes (23): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), LoginPayload, LoginResponse (+15 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (37): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+29 more)

### Community 18 - "products.resource.ts"
Cohesion: 0.10
Nodes (22): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, updateProduct(), BarcodeSource, ProductInput (+14 more)

### Community 20 - "Sidebar.tsx"
Cohesion: 0.14
Nodes (17): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup (+9 more)

### Community 21 - "searchFields.ts"
Cohesion: 0.12
Nodes (30): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch() (+22 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "BillingRegions.tsx"
Cohesion: 0.22
Nodes (14): BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, CartPanel (+6 more)

### Community 24 - "outbox.ts"
Cohesion: 0.16
Nodes (21): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, OutboxOp, OutboxStatus, assignLedgerEntriesToOperation(), getDeviceId() (+13 more)

### Community 25 - "InvoicesList.tsx"
Cohesion: 0.12
Nodes (26): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+18 more)

### Community 26 - "useIsMobile"
Cohesion: 0.10
Nodes (34): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, fetchEmployeeEarnings(), EmployeeDetailDrawer(), ProductPickerModal(), ProductPickerModalProps, useAllProducts() (+26 more)

### Community 27 - "common.ts"
Cohesion: 0.13
Nodes (24): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats() (+16 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.15
Nodes (20): ProductCatalogTree, applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+12 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.06
Nodes (34): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation (+26 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "EmployeeList.tsx"
Cohesion: 0.09
Nodes (29): ReportsDashboard, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore (+21 more)

### Community 32 - "returns.resource.ts"
Cohesion: 0.24
Nodes (15): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+7 more)

### Community 33 - "AppShell.tsx"
Cohesion: 0.23
Nodes (9): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, BillingPageSkeleton(), FILL (+1 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.28
Nodes (11): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+3 more)

### Community 35 - "LoginForm.tsx"
Cohesion: 0.21
Nodes (13): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+5 more)

### Community 36 - "router.tsx"
Cohesion: 0.10
Nodes (16): App(), AppProviders(), BillingCounter, CustomerList, EmployeeList, PrintJobList, ProductTable, RepairJobList (+8 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.25
Nodes (12): JOB_STATUS_COLORS, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob() (+4 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.07
Nodes (43): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+35 more)

### Community 39 - "SyncEngine"
Cohesion: 0.14
Nodes (15): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+7 more)

### Community 40 - "SupplierList.tsx"
Cohesion: 0.21
Nodes (18): useSetSupplierLinks(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, NO_SUPPLIERS (+10 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "useCategories.ts"
Cohesion: 0.18
Nodes (15): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCreateCategory(), useCreateSubcategory() (+7 more)

### Community 43 - "Invoice"
Cohesion: 0.11
Nodes (23): InvoicesList, CompleteSaleResult, ProcessReturnItemInput, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, useInvoicePayments(), useRecordPayment() (+15 more)

### Community 44 - "tablerIcons.ts"
Cohesion: 0.20
Nodes (17): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+9 more)

### Community 45 - "inventory/index.ts"
Cohesion: 0.44
Nodes (6): CatalogCategoryFilter, CategoryIconInfo, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon(), TablerIcon

### Community 46 - "customers.resource.ts"
Cohesion: 0.19
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 47 - "SettingsPage.tsx"
Cohesion: 0.26
Nodes (10): SettingsPage, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS (+2 more)

### Community 48 - "CartLineItem.tsx"
Cohesion: 0.47
Nodes (5): CartLineItem, CartLineItemProps, getCategoryIconInfo(), LineSourceType, CartItem

### Community 50 - "suppliers.resource.ts"
Cohesion: 0.19
Nodes (15): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+7 more)

### Community 51 - "purchases.resource.ts"
Cohesion: 0.17
Nodes (17): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, enrich(), NO_PURCHASES (+9 more)

### Community 52 - "syncApi.ts"
Cohesion: 0.23
Nodes (13): ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus (+5 more)

### Community 53 - "cssVariablesResolver.ts"
Cohesion: 0.40
Nodes (4): darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars

### Community 54 - "categories.resource.ts"
Cohesion: 0.31
Nodes (10): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), Category, CategoryInput (+2 more)

### Community 55 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 56 - "client.ts"
Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.09
Nodes (34): AuthUser, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorTableName, OfflineDb, AuditEvent, AuditLevel (+26 more)

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

### Community 67 - "supplierProducts.resource.ts"
Cohesion: 0.20
Nodes (16): Subcategory, fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct() (+8 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "LogoUpload.tsx"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 72 - "payments.resource.ts"
Cohesion: 0.35
Nodes (9): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, defineOperation(), paymentsResource (+1 more)

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
Cohesion: 0.30
Nodes (11): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), resolveOrCreateCustomer() (+3 more)

### Community 83 - "billing/types.ts"
Cohesion: 0.15
Nodes (6): InvoiceItem, getPrintCountForInvoice(), getPrintLogsForInvoice(), PrintLogEntry, printLogStore, LocalStorageStore

## Knowledge Gaps
- **354 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+349 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `SegmentedToggle.tsx`, `formatMoney`, `RepairFormModal.tsx`, `Sidebar.tsx`, `BillingRegions.tsx`, `ProductTable.tsx`, `LoginForm.tsx`, `syncSlice.ts`, `SupplierList.tsx`, `useCategories.ts`, `Invoice`, `CartLineItem.tsx`, `AmountInput.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `AppShell.tsx`, `notificationSlice.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `CustomerList.tsx`, `Invoice`, `SyncProvider.tsx`, `authSlice.ts`, `Sidebar.tsx`, `searchFields.ts`, `BillingRegions.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `SyncEngine.ts`, `flush.ts`, `schema.ts`, `authSlice.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _354 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SyncEngine.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13636363636363635 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06734006734006734 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.13937282229965156 - nodes in this community are weakly interconnected._