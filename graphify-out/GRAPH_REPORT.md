# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 14 files · ~156,730 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1558 nodes · 4643 edges · 101 communities (71 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Offline Sync - constructor
- Settings - SyncDrawer
- Offline Sync - signal
- Shared UI - TablerIconPicker
- Notifications - initialState
- Offline Sync - start
- Settings - ACCEPTED TYPES
- Offline Sync - constructor
- Billing - HeldSalesDrawer
- Auth - RequireAdmin
- Inventory - adjustStock
- Billing - SettingsPage
- Billing - fetchInvoices
- Billing - CartLineItem
- Inventory - AppUpdatePrompt
- Billing - PaymentMethod
- Shared UI - mergeByCategory
- Dependencies - axios
- Employees - createEmployee
- Billing - getInvoiceDocument
- Inventory - AddSubcategoryRow
- Dependencies - eslint
- Inventory - StockMovement
- Billing - PAYMENT METHODS
- Purchases - createPurchase
- Repairs - InvoicesList
- Inventory - ProductTable
- DOM
- Billing - BackendInvoice
- Employees - CURRENCY
- Offline Sync - Acceptance
- Billing - MutationRequestOptions
- Employees - JOB STATUS
- Offline Sync - fetchSupplierProducts
- Suppliers - useSetSupplierLinks
- Billing - ROUTE TITLES
- Auth - EmailLoginScreen
- Employees - addEarningRecord
- Offline Sync - OutboxError
- Customers - createCustomer
- Settings - DEFAULT PRINT
- Suppliers - createSupplier
- Inventory - createCategory
- Offline Sync - readServerVersion
- Shared UI - getServerSnapshot
- Offline Sync - depsChanged
- generate icon shards mjs
- Shared UI - LocalStorageStore
- Dependencies - scripts
- Offline Sync - STORAGE
- Shared UI - AmountInput
- ApiClient
- Billing - Header
- Notifications - clearConnectivityNotification
- Backend Sync, Multiplexed Delta,
- Bluesky Icon
- Shared UI - activeScopes
- Auth - MobileSignUpForm
- Billing - fetchPaymentsForInvoice
- Shared UI - EntityListPage
- Animation Performance and Compositor
- Dependencies - name
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell,
- Dependencies - eslint plugin
- Inline Color Scheme Init
- Dependencies - @mantine/form
- Dependencies - react dom
- Dependencies - @tanstack/react query
- Dependencies - postcss
- Dependencies - prettier
- Dependencies - typescript eslint
- Dependencies - vite plugin
- Dependencies - vitest
- AGENTS md Instructions Document
- Integer Cents Money Representation
- Non Technical Shop User
- Login Screen Auth Feature
- Phone Repair Technician Servicing
- Repair/Retail Shop POS Domain
- GEMINI md Instructions Document
- Deploy Frontend GitHub Actions
- POS App Icon /
- App Shell - Apple
- Favicon Jana2u POS Logo
- App Icon 192px Lightning
- App Icon 512x512, Lightning
- PWA Manifest / App
- TypeScript Logo typescript svg
- TypeScript Language/Technology
- Vite Logo vite svg
- wall login jpg Login

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 75 edges
2. `useAppSelector` - 60 edges
3. `formatMoney()` - 57 edges
4. `useAppDispatch` - 39 edges
5. `useSyncedMutation()` - 31 edges
6. `ConnectivityMonitor` - 30 edges
7. `db` - 30 edges
8. `useEntitySearch()` - 27 edges
9. `flushOutbox()` - 27 edges
10. `useSyncedQuery()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `BackendRepair` --references--> `RepairJob`  [EXTRACTED]
  src/features/repairs/api/repairsApi.ts → src/features/repairs/types.ts
- `EmployeeDetailDrawerProps` --references--> `Employee`  [EXTRACTED]
  src/features/employees/components/EmployeeDetailDrawer.tsx → src/features/employees/types.ts
- `SyncStatus` --references--> `SyncResourceId`  [EXTRACTED]
  src/offline/resources/syncApi.ts → src/offline/types.ts

## Import Cycles
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)
- **Offline-First Sync and Storage Architecture** — claude_md_offline_sync_engine, claude_md_sync_resource_descriptor, claude_md_connectivity_monitor, claude_md_backend_sync_contract [EXTRACTED 1.00]
- **Responsive and Performant UI Design System** — claude_md_responsive_rules, claude_md_center_modal_standard, claude_md_detail_drawer_standard, claude_md_animation_performance [EXTRACTED 1.00]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow, claude_md_graphify_guidelines [INFERRED 0.95]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline [INFERRED 0.75]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]

## Communities (101 total, 30 thin omitted)

### Community 0 - "Offline Sync - constructor"
Cohesion: 0.06
Nodes (39): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+31 more)

### Community 1 - "Settings - SyncDrawer"
Cohesion: 0.06
Nodes (44): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+36 more)

### Community 2 - "Offline Sync - signal"
Cohesion: 0.07
Nodes (39): db, blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+31 more)

### Community 3 - "Shared UI - TablerIconPicker"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 4 - "Notifications - initialState"
Cohesion: 0.08
Nodes (32): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+24 more)

### Community 5 - "Offline Sync - start"
Cohesion: 0.10
Nodes (23): AUDIT_LOG_LIMIT, toServerRow(), AuditLevel, logError(), logInfo(), logSyncEvent(), logWarn(), trimAuditLog() (+15 more)

### Community 6 - "Settings - ACCEPTED TYPES"
Cohesion: 0.13
Nodes (28): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+20 more)

### Community 7 - "Offline Sync - constructor"
Cohesion: 0.11
Nodes (36): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+28 more)

### Community 8 - "Billing - HeldSalesDrawer"
Cohesion: 0.12
Nodes (27): HeldSalesDrawer(), HeldSalesDrawerProps, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, useCreatePurchase() (+19 more)

### Community 9 - "Auth - RequireAdmin"
Cohesion: 0.11
Nodes (28): RequireAdmin(), RequireAdminProps, AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser (+20 more)

### Community 10 - "Inventory - adjustStock"
Cohesion: 0.10
Nodes (27): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+19 more)

### Community 11 - "Billing - SettingsPage"
Cohesion: 0.08
Nodes (22): App(), AppProviders(), BillingCounter, CustomerList, EmployeeList, ProductTable, ReportsDashboard, router (+14 more)

### Community 12 - "Billing - fetchInvoices"
Cohesion: 0.16
Nodes (23): fetchInvoices(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList() (+15 more)

### Community 13 - "Billing - CartLineItem"
Cohesion: 0.15
Nodes (28): CartLineItem, CatalogPanel, CatalogPanelProps, chunk(), DiscountPopover(), DiscountPopoverProps, CombinedServiceJob, generateServiceJobId() (+20 more)

### Community 14 - "Inventory - AppUpdatePrompt"
Cohesion: 0.11
Nodes (24): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), Sidebar() (+16 more)

### Community 15 - "Billing - PaymentMethod"
Cohesion: 0.12
Nodes (28): PaymentMethod, CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+20 more)

### Community 16 - "Shared UI - mergeByCategory"
Cohesion: 0.13
Nodes (27): mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField (+19 more)

### Community 17 - "Dependencies - axios"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "Employees - createEmployee"
Cohesion: 0.14
Nodes (22): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees() (+14 more)

### Community 19 - "Billing - getInvoiceDocument"
Cohesion: 0.17
Nodes (20): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, StandalonePrintView(), useInvoiceDocument() (+12 more)

### Community 20 - "Inventory - AddSubcategoryRow"
Cohesion: 0.14
Nodes (24): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductFormContent() (+16 more)

### Community 21 - "Dependencies - eslint"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "Inventory - StockMovement"
Cohesion: 0.13
Nodes (23): StockMovement, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictReason (+15 more)

### Community 23 - "Billing - PAYMENT METHODS"
Cohesion: 0.16
Nodes (20): PAYMENT_METHODS, BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps (+12 more)

### Community 24 - "Purchases - createPurchase"
Cohesion: 0.14
Nodes (23): createPurchase(), PULL_PAGE_LIMIT, toLocalRow(), appendStockDelta(), defineOperation(), defineSyncResource(), registerSyncResource(), registerSyncResources() (+15 more)

### Community 25 - "Repairs - InvoicesList"
Cohesion: 0.15
Nodes (16): queryKeys, InvoicesList, PrintJobList, RepairJobList, InvoicesList(), PrintJobList(), RepairJobList(), Column (+8 more)

### Community 26 - "Inventory - ProductTable"
Cohesion: 0.18
Nodes (20): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+12 more)

### Community 27 - "DOM"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "Billing - BackendInvoice"
Cohesion: 0.11
Nodes (21): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, completeSale(), CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput (+13 more)

### Community 29 - "Employees - CURRENCY"
Cohesion: 0.20
Nodes (17): CURRENCY, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, MoneyInput(), MoneyInputProps, fromCents() (+9 more)

### Community 30 - "Offline Sync - Acceptance"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "Billing - MutationRequestOptions"
Cohesion: 0.13
Nodes (17): MutationRequestOptions, BackendPaymentRecord, PaymentListResponseData, PaymentRecord, RecordPaymentInput, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier() (+9 more)

### Community 32 - "Employees - JOB STATUS"
Cohesion: 0.27
Nodes (15): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+7 more)

### Community 33 - "Offline Sync - fetchSupplierProducts"
Cohesion: 0.20
Nodes (17): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+9 more)

### Community 34 - "Suppliers - useSetSupplierLinks"
Cohesion: 0.19
Nodes (16): useSetSupplierLinks(), SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier() (+8 more)

### Community 35 - "Billing - ROUTE TITLES"
Cohesion: 0.15
Nodes (14): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, SidebarProps, NAV_ITEMS, NavItemConfig (+6 more)

### Community 36 - "Auth - EmailLoginScreen"
Cohesion: 0.21
Nodes (13): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+5 more)

### Community 37 - "Employees - addEarningRecord"
Cohesion: 0.19
Nodes (18): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJob(), deletePrintJobs(), PrintJobListResponseData (+10 more)

### Community 38 - "Offline Sync - OutboxError"
Cohesion: 0.23
Nodes (14): OutboxError, assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), LOCAL_ID_PREFIX, randomUuid(), assertOutboxHasCapacity(), claimReadyOperations() (+6 more)

### Community 39 - "Customers - createCustomer"
Cohesion: 0.18
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 40 - "Settings - DEFAULT PRINT"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 41 - "Suppliers - createSupplier"
Cohesion: 0.22
Nodes (14): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+6 more)

### Community 42 - "Inventory - createCategory"
Cohesion: 0.23
Nodes (13): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), Category, CategoryInput (+5 more)

### Community 43 - "Offline Sync - readServerVersion"
Cohesion: 0.19
Nodes (11): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+3 more)

### Community 44 - "Shared UI - getServerSnapshot"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 45 - "Offline Sync - depsChanged"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 46 - "generate icon shards mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 48 - "Dependencies - scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "Offline Sync - STORAGE"
Cohesion: 0.24
Nodes (8): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES, countUnsettled()

### Community 50 - "Shared UI - AmountInput"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 51 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 52 - "Billing - Header"
Cohesion: 0.36
Nodes (8): Header(), HeaderProps, BillingCounter(), useCartSound(), useHeldCarts(), selectAuthUser(), selectHeldCarts(), selectSoundEnabled()

### Community 53 - "Notifications - clearConnectivityNotification"
Cohesion: 0.58
Nodes (7): clearConnectivityNotification(), notifyBackOnline(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider()

### Community 54 - "Backend Sync, Multiplexed Delta,"
Cohesion: 0.25
Nodes (8): Backend Sync, Multiplexed Delta, and Idempotency Contract, Connectivity Monitor and Asymmetric Hysteresis, CSS Variable Design Tokens and Dark Mode System, Offline Authentication and Grace Period, Offline-First Dexie Mirror and Outbox Engine, PWA Shell Pre-caching and API Guard Policy, Redux Toolkit State Architecture, Sync Resource Descriptor Protocol

### Community 55 - "Bluesky Icon"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 56 - "Shared UI - activeScopes"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 57 - "Auth - MobileSignUpForm"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 58 - "Billing - fetchPaymentsForInvoice"
Cohesion: 0.47
Nodes (5): fetchPaymentsForInvoice(), recordPayment(), toPaymentRecord(), InvoiceDetailDrawer(), InvoiceDetailDrawerProps

### Community 59 - "Shared UI - EntityListPage"
Cohesion: 0.40
Nodes (4): EntityListPage(), EntityListPageProps, SegmentedToggle(), SegmentedToggleProps

### Community 60 - "Animation Performance and Compositor"
Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "Dependencies - name"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"
Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

## Knowledge Gaps
- **325 isolated node(s):** `DetailDrawerProps`, `PhoneDisplayProps`, `IndexedField`, `MatchRange`, `SearchEntry` (+320 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `Billing - HeldSalesDrawer` to `Settings - SyncDrawer`, `Notifications - initialState`, `Inventory - adjustStock`, `Billing - fetchInvoices`, `Billing - CartLineItem`, `Inventory - AppUpdatePrompt`, `Employees - createEmployee`, `Billing - getInvoiceDocument`, `Inventory - AddSubcategoryRow`, `Billing - PAYMENT METHODS`, `Inventory - ProductTable`, `Employees - CURRENCY`, `Employees - JOB STATUS`, `Suppliers - useSetSupplierLinks`, `Billing - ROUTE TITLES`, `Auth - EmailLoginScreen`, `Shared UI - AmountInput`, `Billing - Header`, `Billing - fetchPaymentsForInvoice`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Inventory - AppUpdatePrompt` to `Settings - SyncDrawer`, `Billing - ROUTE TITLES`, `Notifications - initialState`, `Settings - ACCEPTED TYPES`, `Auth - RequireAdmin`, `Billing - PaymentMethod`, `Billing - getInvoiceDocument`, `Billing - Header`, `Notifications - clearConnectivityNotification`, `Billing - PAYMENT METHODS`, `Inventory - ProductTable`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `Offline Sync - constructor` to `Auth - RequireAdmin`, `Offline Sync - readServerVersion`, `Offline Sync - start`, `Offline Sync - constructor`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `DetailDrawerProps`, `PhoneDisplayProps`, `IndexedField` to the rest of the system?**
  _325 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Offline Sync - constructor` be split into smaller, more focused modules?**
  _Cohesion score 0.05594679186228482 - nodes in this community are weakly interconnected._
- **Should `Settings - SyncDrawer` be split into smaller, more focused modules?**
  _Cohesion score 0.06292966684294024 - nodes in this community are weakly interconnected._
- **Should `Offline Sync - signal` be split into smaller, more focused modules?**
  _Cohesion score 0.06966618287373004 - nodes in this community are weakly interconnected._