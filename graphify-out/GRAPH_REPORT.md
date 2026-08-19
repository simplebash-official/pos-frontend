# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 44 files · ~160,963 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1652 nodes · 4801 edges · 119 communities (88 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.73)
- Token cost: 78,823 input · 0 output

## Community Hubs (Navigation)
- Sync Redux Slice
- Notifications Feature
- Settings Feature
- Employees Feature
- Billing Feature
- Billing Feature
- Cart Redux Slice
- Customers Feature
- Offline Sync Types
- Offline DB (Dexie)
- Offline Sync Engine
- package.json Dependencies
- Shared Hooks
- Shared Utility Library
- Suppliers Feature
- Offline Local ID Handling
- package.json Dependencies
- Offline Outbox
- Shared Utility Library
- Shared UI Components
- Inventory Feature
- TypeScript Config
- App Layout Shell
- Inventory Feature
- Offline Connectivity Monitor
- Auth Redux Slice
- Billing Feature
- Supplier Products Feature
- Offline Connectivity Monitor
- Backend Sync Requirements Doc
- Shared UI Components
- Auth Feature
- Offline Sync Resource Descriptors
- Inventory Feature
- Offline Sync Engine
- Shared Utility Library
- App Config
- Offline Sync Engine
- API Client Layer
- Customers Feature
- Settings Redux Slice
- Inventory Feature
- Inventory Feature
- Inventory Feature
- Print Jobs Feature
- Settings Feature
- App-Level Components
- Purchases Feature
- Repairs Feature
- Offline Sync Constants
- Shared Utility Library
- Print Jobs Feature
- Suppliers Feature
- Invoices Feature
- Billing Feature
- Offline DB (Dexie)
- CI Verification Steps (Deploy Workflow x CLAUDE.md)
- Icon Shard Generator Script
- Sync Feature UI
- Sync Feature UI
- CLAUDE.md Project Docs
- CLAUDE.md Project Docs
- CLAUDE.md Project Docs
- package.json Dependencies
- Repairs Feature
- Shared UI Components
- Shared Utility Library
- CLAUDE.md Project Docs
- CLAUDE.md Project Docs
- Public Social/Doc Icons
- App Entry Chain (main.tsx, App.tsx, router)
- Billing Feature
- Auth Feature
- CLAUDE.md Project Docs
- package.json Dependencies
- Theme & Styling
- CLAUDE.md Project Docs
- Settings Feature
- Shared UI Components
- graphify Agent Config Docs
- ESLint Config
- index.html Color-Scheme Init
- @mantine/form Dependency
- package.json Dependencies
- package.json Dependencies
- package.json Dependencies
- package.json Dependencies
- package.json Dependencies
- package.json Dependencies
- package.json Dependencies
- AGENTS.md Doc
- CLAUDE.md Project Docs
- CLAUDE.md Project Docs
- CLAUDE.md Project Docs
- CLAUDE.md Project Docs
- Login Screen Concept
- Phone Repair Technician Concept
- Repair/Retail POS Domain Concept
- GEMINI.md Doc
- POS App Icon Concept
- Apple Touch Icon Asset
- Favicon Asset
- Icon 192 Asset
- Icon 512 Asset
- PWA Manifest Concept
- TypeScript Logo Asset
- TypeScript Language Concept
- Vite Logo Asset
- Wall Login Background Asset

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 67 edges
2. `formatMoney()` - 53 edges
3. `useAppSelector` - 53 edges
4. `db` - 38 edges
5. `useAppDispatch` - 37 edges
6. `useSyncedMutation()` - 35 edges
7. `ConnectivityMonitor` - 30 edges
8. `useEntitySearch()` - 27 edges
9. `useSyncedQuery()` - 26 edges
10. `fetchResourceDelta()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `build-and-deploy Job` --conceptually_related_to--> `Post-Change Verification Rule`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Type Check Step (npm run type-check)` --references--> `npm run type-check`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Lint Step (npm run lint)` --references--> `npm run lint`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Build Step (npm run build)` --references--> `npm run build`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `paths-ignore Trigger Filter` --shares_data_with--> `graphify Knowledge Graph Integration`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md

## Import Cycles
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)
- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (119 total, 31 thin omitted)

### Community 0 - "Sync Redux Slice"
Cohesion: 0.06
Nodes (42): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+34 more)

### Community 1 - "Notifications Feature"
Cohesion: 0.06
Nodes (44): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+36 more)

### Community 2 - "Settings Feature"
Cohesion: 0.13
Nodes (29): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProvidersProps, AuthInitializer(), useCartSound(), LowStockNotifier(), notifiedProductIds, BankDetailsFormValues (+21 more)

### Community 3 - "Employees Feature"
Cohesion: 0.10
Nodes (30): queryKeys, createEmployee(), deleteEarningRecordsForWork(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+22 more)

### Community 4 - "Billing Feature"
Cohesion: 0.12
Nodes (28): PAYMENT_METHODS, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+20 more)

### Community 5 - "Billing Feature"
Cohesion: 0.13
Nodes (23): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, StandalonePrintView() (+15 more)

### Community 6 - "Cart Redux Slice"
Cohesion: 0.11
Nodes (29): PaymentMethod, CartLineItemProps, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+21 more)

### Community 7 - "Customers Feature"
Cohesion: 0.16
Nodes (24): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal() (+16 more)

### Community 8 - "Offline Sync Types"
Cohesion: 0.09
Nodes (25): EnqueueInput, reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, SyncStatus, Widget (+17 more)

### Community 9 - "Offline DB (Dexie)"
Cohesion: 0.09
Nodes (27): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, ConflictReason, ConflictRecord, IdMapRecord, IdMapStatus, MirroredRow (+19 more)

### Community 10 - "Offline Sync Engine"
Cohesion: 0.12
Nodes (23): toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, logInfo() (+15 more)

### Community 11 - "package.json Dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "Shared Hooks"
Cohesion: 0.14
Nodes (24): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps (+16 more)

### Community 13 - "Shared Utility Library"
Cohesion: 0.14
Nodes (26): CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModalProps, SearchHighlight(), SearchHighlightProps, EntitySearchResult, useEntitySearch() (+18 more)

### Community 14 - "Suppliers Feature"
Cohesion: 0.15
Nodes (23): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps (+15 more)

### Community 15 - "Offline Local ID Handling"
Cohesion: 0.13
Nodes (23): assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap() (+15 more)

### Community 16 - "package.json Dependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "Offline Outbox"
Cohesion: 0.13
Nodes (26): ApiErrorLike, classifyFailure(), commitSuccess(), conflictReasonFor(), FailureClass, flushOutbox(), FlushSummary, handleConflict() (+18 more)

### Community 18 - "Shared Utility Library"
Cohesion: 0.22
Nodes (20): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+12 more)

### Community 20 - "Shared UI Components"
Cohesion: 0.10
Nodes (17): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, ReportsDashboard, SettingsPage, SupplierList (+9 more)

### Community 21 - "Inventory Feature"
Cohesion: 0.13
Nodes (19): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+11 more)

### Community 22 - "TypeScript Config"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "App Layout Shell"
Cohesion: 0.13
Nodes (19): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+11 more)

### Community 24 - "Inventory Feature"
Cohesion: 0.12
Nodes (20): PaymentRecord, BarcodeSource, Category, Product, ProductInput, ProductListResponse, ProductSupplierIntake, StockMovement (+12 more)

### Community 25 - "Offline Connectivity Monitor"
Cohesion: 0.11
Nodes (17): env, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation, observeNetwork() (+9 more)

### Community 26 - "Auth Redux Slice"
Cohesion: 0.19
Nodes (17): getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, cacheSession(), clearCachedSession() (+9 more)

### Community 27 - "Billing Feature"
Cohesion: 0.14
Nodes (20): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+12 more)

### Community 28 - "Supplier Products Feature"
Cohesion: 0.19
Nodes (17): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+9 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "Shared UI Components"
Cohesion: 0.18
Nodes (14): CURRENCY, CartLineItem, DiscountPopover(), DiscountPopoverProps, ProductFormContent(), SupplierIntakeRow, MoneyInput(), MoneyInputProps (+6 more)

### Community 32 - "Auth Feature"
Cohesion: 0.20
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 33 - "Offline Sync Resource Descriptors"
Cohesion: 0.19
Nodes (17): RecordPaymentInput, defineSyncResource(), paymentsResource, RecordPaymentPayload, stockMovementsResource, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta() (+9 more)

### Community 34 - "Inventory Feature"
Cohesion: 0.24
Nodes (17): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useLowStockProducts(), useProductMovements() (+9 more)

### Community 35 - "Offline Sync Engine"
Cohesion: 0.13
Nodes (15): ConnectivitySnapshot, AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, AuditEvent, AuditLevel, SyncMetaRecord, logError(), logSyncEvent() (+7 more)

### Community 36 - "Shared Utility Library"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 37 - "App Config"
Cohesion: 0.15
Nodes (15): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+7 more)

### Community 38 - "Offline Sync Engine"
Cohesion: 0.22
Nodes (6): getAllSyncMeta(), resolvePullTargets(), RFC-3339, SyncEngine, getResourcesInDependencyOrder(), fetchSyncStatus()

### Community 39 - "API Client Layer"
Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 40 - "Customers Feature"
Cohesion: 0.18
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 41 - "Settings Redux Slice"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "Inventory Feature"
Cohesion: 0.20
Nodes (14): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, getCategoryIconInfo(), ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy (+6 more)

### Community 43 - "Inventory Feature"
Cohesion: 0.20
Nodes (14): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, ValidCategoryOption (+6 more)

### Community 44 - "Inventory Feature"
Cohesion: 0.26
Nodes (13): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, NO_CATEGORIES, useCategories(), useCategoryIcons(), useCreateCategory() (+5 more)

### Community 45 - "Print Jobs Feature"
Cohesion: 0.21
Nodes (12): PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload, UpdatePrintJobPayload (+4 more)

### Community 46 - "Settings Feature"
Cohesion: 0.23
Nodes (12): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS, SettingsSectionId (+4 more)

### Community 47 - "App-Level Components"
Cohesion: 0.21
Nodes (11): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+3 more)

### Community 48 - "Purchases Feature"
Cohesion: 0.24
Nodes (12): createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+4 more)

### Community 49 - "Repairs Feature"
Cohesion: 0.29
Nodes (13): BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), RepairListResponseData, toRepairJob(), updateRepairJobRaw() (+5 more)

### Community 50 - "Offline Sync Constants"
Cohesion: 0.17
Nodes (13): MAX_CLOCK_SKEW_MS, MAX_PUSH_ATTEMPTS, NOTIFICATION_ID_CONNECTIVITY, NOTIFICATION_ID_SYNC_ERROR, OFFLINE_DB_NAME, OFFLINE_SESSION_GRACE_MS, OUTBOX_CAPACITY, PULL_PAGE_LIMIT (+5 more)

### Community 51 - "Shared Utility Library"
Cohesion: 0.21
Nodes (4): addEarningRecord(), updateEarningRecordForWork(), updateEmployee(), LocalStorageStore

### Community 52 - "Print Jobs Feature"
Cohesion: 0.32
Nodes (12): BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob(), updatePrintJobRaw() (+4 more)

### Community 53 - "Suppliers Feature"
Cohesion: 0.26
Nodes (10): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), toLocalRow(), DeleteSupplierPayload (+2 more)

### Community 54 - "Invoices Feature"
Cohesion: 0.30
Nodes (8): InvoicesList, useAllInvoices(), NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer(), InvoiceDetailDrawerProps, InvoicesList()

### Community 55 - "Billing Feature"
Cohesion: 0.32
Nodes (10): CatalogPanel, CatalogPanelProps, chunk(), getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound(), resolveOrCreateCustomer() (+2 more)

### Community 56 - "Offline DB (Dexie)"
Cohesion: 0.20
Nodes (10): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), StorageEstimate, db (+2 more)

### Community 57 - "CI Verification Steps (Deploy Workflow x CLAUDE.md)"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "Icon Shard Generator Script"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "Sync Feature UI"
Cohesion: 0.25
Nodes (9): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxOp, OutboxStatus, discardOperation(), retryOperation(), EmptyState() (+1 more)

### Community 60 - "Sync Feature UI"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 61 - "CLAUDE.md Project Docs"
Cohesion: 0.20
Nodes (10): Deploy Frontend Workflow, paths-ignore Trigger Filter, AppShell.tsx, cssVariablesResolver.ts Design Tokens, App Entry Chain, Feature Module Pattern (components/, types.ts, index.ts barrel), graphify Knowledge Graph Integration, @/* Path Alias (+2 more)

### Community 62 - "CLAUDE.md Project Docs"
Cohesion: 0.29
Nodes (10): AmountInput.tsx, Animation Performance Rules, BillingRegions.tsx, CartLineItem.tsx, CartPanel.tsx, CatalogPanel.tsx, LayoutTierProvider, Responsive & Mobile UI Layout Tiers (+2 more)

### Community 63 - "CLAUDE.md Project Docs"
Cohesion: 0.27
Nodes (10): ApiClient (src/api/client.ts), AppUpdatePrompt.tsx, Backend Sync Contract (Rust/Axum), ConnectivityMonitor, isBillingBoundaryChange Render-Time State Adjustment, localId.ts (Provisional local_ IDs), Offline & Sync Architecture, Durable Outbox Pattern (+2 more)

### Community 64 - "package.json Dependencies"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 65 - "Repairs Feature"
Cohesion: 0.40
Nodes (7): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob()

### Community 66 - "Shared UI Components"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 67 - "Shared Utility Library"
Cohesion: 0.29
Nodes (8): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, PRODUCT_SEARCH_FIELDS, REPAIR_JOB_SEARCH_FIELDS

### Community 68 - "CLAUDE.md Project Docs"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "CLAUDE.md Project Docs"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "Public Social/Doc Icons"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "App Entry Chain (main.tsx, App.tsx, router)"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 72 - "Billing Feature"
Cohesion: 0.40
Nodes (5): MutationRequestOptions, BackendPaymentRecord, recordPayment(), toPaymentRecord(), ApiResponse

### Community 73 - "Auth Feature"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "CLAUDE.md Project Docs"
Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json Dependencies"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 76 - "Theme & Styling"
Cohesion: 0.40
Nodes (4): darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars

### Community 77 - "CLAUDE.md Project Docs"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "Settings Feature"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 79 - "Shared UI Components"
Cohesion: 0.50
Nodes (3): HEIGHT_MAP, QuantityInput(), QuantityInputProps

## Knowledge Gaps
- **344 isolated node(s):** `IdMapStatus`, `PullState`, `PushState`, `EmptyStateProps`, `CategoryManagerModalProps` (+339 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `Shared Hooks` to `Auth Feature`, `Notifications Feature`, `Inventory Feature`, `Employees Feature`, `Billing Feature`, `Billing Feature`, `App Config`, `Customers Feature`, `Sync Redux Slice`, `Shared UI Components`, `Inventory Feature`, `Inventory Feature`, `Shared Utility Library`, `Suppliers Feature`, `Shared Utility Library`, `Invoices Feature`, `App Layout Shell`, `Shared UI Components`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Settings Feature` to `Sync Redux Slice`, `Notifications Feature`, `Inventory Feature`, `Billing Feature`, `Billing Feature`, `App Config`, `Cart Redux Slice`, `App-Level Components`, `App Layout Shell`, `Sync Feature UI`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `Shared UI Components` to `Repairs Feature`, `Inventory Feature`, `Employees Feature`, `Billing Feature`, `Billing Feature`, `Shared Utility Library`, `Customers Feature`, `Inventory Feature`, `Shared Hooks`, `Shared Utility Library`, `Print Jobs Feature`, `Suppliers Feature`, `Shared Utility Library`, `Billing Feature`, `Invoices Feature`, `App Layout Shell`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `IdMapStatus`, `PullState`, `PushState` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Sync Redux Slice` be split into smaller, more focused modules?**
  _Cohesion score 0.06448087431693988 - nodes in this community are weakly interconnected._
- **Should `Notifications Feature` be split into smaller, more focused modules?**
  _Cohesion score 0.06019871420222092 - nodes in this community are weakly interconnected._
- **Should `Settings Feature` be split into smaller, more focused modules?**
  _Cohesion score 0.12956810631229235 - nodes in this community are weakly interconnected._