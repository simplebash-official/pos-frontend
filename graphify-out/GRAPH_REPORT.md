# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 310 files · ~155,444 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1552 nodes · 4692 edges · 88 communities (72 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Inventory & Suppliers
- Sync Status UI & Maintenance
- Sync Resource Descriptors
- Outbox, IDs & Flush
- Sync Engine & Pull
- Customers Feature
- Sync Architecture Docs
- Cart & Payment State
- Sync Registry & Tests
- App Providers & Theme
- Responsive Layout Hooks
- Runtime Dependencies
- Document Preview & Print
- Tabler Icon Shards
- Dev Dependencies
- Billing Screen Layout
- Settings Sections
- Job & Repair Form Modals
- Employee & Customer Drawers
- Connectivity & Env Config
- Offline DB Schema & Tables
- Invoices & Payments Types
- TypeScript Config
- Search Highlighting
- App Routing
- Global Quick Search
- Notifications Feature
- Auth Login Screens
- Category & Product Pickers
- Offline Mirror & Stock Ledger
- Connectivity Monitor Internals
- API Client Core
- Settings State Slice
- Tabler Icon Picker
- Catalog & Service Job Picker
- Employee Form & List Chrome
- Shared Data Table & Confirm Dialog
- Invoices API Mapping
- Print Job List & API
- Category Sync Resource
- Money Formatting & Cart Line Items
- Product Catalog Tree & Icons
- Route Auth Guards
- Role-Based Access Guards
- Settings Page Navigation
- Auth Session Caching
- Employee Local Storage Store
- Search History Hook
- Icon Shard Generator Script
- Held Cart & Low Stock Notifiers
- Repair Jobs List & API
- Sync Provider & Toast Notifications
- Auth Types & Roles
- NPM Scripts
- Amount & Discount Inputs
- Sync/Connectivity State Types
- Social & Docs Icon Sprite
- App Entry Chain
- Mobile Sign-Up Forms
- Network Signal Observer
- Package Metadata
- Login Background Image
- Logo Upload Component
- Modal & Drawer UI Patterns Docs
- App Icon & PWA Manifest Docs
- React Hooks Lint Plugin
- Mantine Form Dependency
- React DOM Dependency
- TanStack Query Dependency
- Prettier Dependency
- TypeScript Dependency
- TypeScript ESLint Dependency
- Vite PWA Plugin Dependency
- Vitest Dependency
- TypeScript Logo Asset
- Apple Touch Icon Asset
- Favicon Asset
- App Icon 192px Asset
- Vite Logo Asset

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 75 edges
2. `formatMoney()` - 60 edges
3. `useAppSelector` - 60 edges
4. `useAppDispatch` - 42 edges
5. `useSyncedMutation()` - 31 edges
6. `db` - 30 edges
7. `ConnectivityMonitor` - 28 edges
8. `useEntitySearch()` - 28 edges
9. `flushOutbox()` - 27 edges
10. `ProductTable()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Deploy Frontend GitHub Actions Workflow` --conceptually_related_to--> `Architecture Overview & Entry Chain`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `SYNC-15: Collapse Dual id/key Identity` --conceptually_related_to--> `Architecture Overview & Entry Chain`  [INFERRED]
  backend-sync-requirements.html → CLAUDE.md
- `SYNC-14: Batch Push Endpoint (Conditional)` --conceptually_related_to--> `Offline & Sync Architecture`  [INFERRED]
  backend-sync-requirements.html → CLAUDE.md
- `index.html App Entry Document` --references--> `Architecture Overview & Entry Chain`  [EXTRACTED]
  index.html → CLAUDE.md
- `AGENTS.md Instructions Document` --references--> `Project Overview (POS System)`  [EXTRACTED]
  AGENTS.md → CLAUDE.md

## Import Cycles
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)
- **Duplicated AI Assistant Instruction Files** — claude_project_overview, agents_md_doc, gemini_md_doc [EXTRACTED 1.00]
- **Backend Requirements Supporting the Four Hard Rules** — claude_offline_sync_four_hard_rules, backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline, claude_commands, claude_project_overview [INFERRED 0.75]

## Communities (88 total, 16 thin omitted)

### Community 0 - "Inventory & Suppliers"
Cohesion: 0.06
Nodes (77): FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+69 more)

### Community 1 - "Sync Status UI & Maintenance"
Cohesion: 0.05
Nodes (58): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection() (+50 more)

### Community 2 - "Sync Resource Descriptors"
Cohesion: 0.07
Nodes (54): MutationRequestOptions, adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct() (+46 more)

### Community 3 - "Outbox, IDs & Flush"
Cohesion: 0.08
Nodes (54): MIRROR_TABLE_NAMES, OutboxError, assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), abandonMapping(), DROP_ELEMENT (+46 more)

### Community 4 - "Sync Engine & Pull"
Cohesion: 0.09
Nodes (33): pruneByRetention(), readServerVersion(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta() (+25 more)

### Community 5 - "Customers Feature"
Cohesion: 0.12
Nodes (32): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawer(), CustomerDetailDrawerProps (+24 more)

### Community 6 - "Sync Architecture Docs"
Cohesion: 0.07
Nodes (43): AGENTS.md Instructions Document, Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On (+35 more)

### Community 7 - "Cart & Payment State"
Cohesion: 0.10
Nodes (33): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), SaleHeroPresentation, LineSourceType, SplitPaymentDetail, CartItem (+25 more)

### Community 8 - "Sync Registry & Tests"
Cohesion: 0.08
Nodes (28): reclaimInflightOperations(), defineOperation(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource (+20 more)

### Community 9 - "App Providers & Theme"
Cohesion: 0.09
Nodes (22): AppUpdatePrompt(), AppProvidersProps, AuthInitializer(), STORAGE_KEYS, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme() (+14 more)

### Community 10 - "Responsive Layout Hooks"
Cohesion: 0.10
Nodes (24): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, BillingRegions, HeldSalesDrawer(), HeldSalesDrawerProps (+16 more)

### Community 11 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "Document Preview & Print"
Cohesion: 0.17
Nodes (21): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+13 more)

### Community 14 - "Dev Dependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 15 - "Billing Screen Layout"
Cohesion: 0.19
Nodes (21): Header(), HeaderProps, completeSale(), BillingCounter(), BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+13 more)

### Community 16 - "Settings Sections"
Cohesion: 0.22
Nodes (20): Sidebar(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection(), PrintingFormValues (+12 more)

### Community 17 - "Job & Repair Form Modals"
Cohesion: 0.22
Nodes (20): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+12 more)

### Community 18 - "Employee & Customer Drawers"
Cohesion: 0.14
Nodes (17): queryKeys, earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees(), INITIAL_EARNINGS, INITIAL_EMPLOYEES (+9 more)

### Community 19 - "Connectivity & Env Config"
Cohesion: 0.12
Nodes (22): env, probeClient, probeHealth(), ProbeResult, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS (+14 more)

### Community 20 - "Offline DB Schema & Tables"
Cohesion: 0.13
Nodes (22): StockMovement, PendingOperationsListProps, STATUS_LABEL, OFFLINE_DB_NAME, MirrorTableName, OfflineDb, AuditEvent, ConflictReason (+14 more)

### Community 21 - "Invoices & Payments Types"
Cohesion: 0.12
Nodes (21): CompleteSaleResult, BackendPaymentRecord, fetchPaymentsForInvoice(), PaymentListResponseData, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord() (+13 more)

### Community 22 - "TypeScript Config"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "Search Highlighting"
Cohesion: 0.17
Nodes (21): SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar(), MatchRange (+13 more)

### Community 24 - "App Routing"
Cohesion: 0.11
Nodes (16): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, ProductTable, RepairJobList, ReportsDashboard (+8 more)

### Community 25 - "Global Quick Search"
Cohesion: 0.16
Nodes (17): InvoicesList, fetchInvoices(), InvoicesList(), SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHistoryInput (+9 more)

### Community 26 - "Notifications Feature"
Cohesion: 0.17
Nodes (16): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+8 more)

### Community 27 - "Auth Login Screens"
Cohesion: 0.20
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 28 - "Category & Product Pickers"
Cohesion: 0.20
Nodes (17): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, buildCategoryLookup(), NO_CATEGORIES (+9 more)

### Community 29 - "Offline Mirror & Stock Ledger"
Cohesion: 0.13
Nodes (14): stripMirrorMeta(), UNSYNCED_VERSION, db, MirrorMeta, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+6 more)

### Community 31 - "API Client Core"
Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 32 - "Settings State Slice"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 33 - "Tabler Icon Picker"
Cohesion: 0.20
Nodes (17): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+9 more)

### Community 34 - "Catalog & Service Job Picker"
Cohesion: 0.23
Nodes (15): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModal(), ServiceJobPickerModalProps (+7 more)

### Community 35 - "Employee Form & List Chrome"
Cohesion: 0.16
Nodes (14): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EntityListPage(), EntityListPageProps, PageHeader() (+6 more)

### Community 36 - "Shared Data Table & Confirm Dialog"
Cohesion: 0.24
Nodes (12): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable() (+4 more)

### Community 37 - "Invoices API Mapping"
Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+7 more)

### Community 38 - "Print Job List & API"
Cohesion: 0.28
Nodes (12): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJob(), deletePrintJobs(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob() (+4 more)

### Community 39 - "Category Sync Resource"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 40 - "Money Formatting & Cart Line Items"
Cohesion: 0.24
Nodes (11): CURRENCY, CartLineItem, DiscountPopover(), DiscountPopoverProps, ProductFormContent(), MoneyInput(), MoneyInputProps, formatMoney() (+3 more)

### Community 41 - "Product Catalog Tree & Icons"
Cohesion: 0.28
Nodes (11): CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon() (+3 more)

### Community 42 - "Route Auth Guards"
Cohesion: 0.20
Nodes (10): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+2 more)

### Community 43 - "Role-Based Access Guards"
Cohesion: 0.22
Nodes (9): RequireAdmin(), RequireAdminProps, SidebarProps, NAV_ITEMS, NavItemConfig, USER_ROLE_LABELS, USER_ROLES, RoleGuard() (+1 more)

### Community 44 - "Settings Page Navigation"
Cohesion: 0.26
Nodes (10): SettingsPage, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS (+2 more)

### Community 45 - "Auth Session Caching"
Cohesion: 0.29
Nodes (10): getMeApi(), OFFLINE_SESSION_GRACE_MS, cacheSession(), clearCachedSession(), readCachedSession(), authSlice, initializeAuth, initialState (+2 more)

### Community 46 - "Employee Local Storage Store"
Cohesion: 0.22
Nodes (3): createEmployee(), normalizeEmployee(), LocalStorageStore

### Community 47 - "Search History Hook"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 48 - "Icon Shard Generator Script"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 49 - "Held Cart & Low Stock Notifiers"
Cohesion: 0.21
Nodes (9): HeldCartCatchupNotifier(), AppShell(), DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, LowStockNotifier(), notifiedProductIds, useLowStockProducts() (+1 more)

### Community 50 - "Repair Jobs List & API"
Cohesion: 0.39
Nodes (10): addEarningRecord(), updateEarningRecordForWork(), calculateRepairEarnings(), createRepairJob(), deleteRepairs(), fetchRepairs(), RepairListResponseData, toRepairJob() (+2 more)

### Community 51 - "Sync Provider & Toast Notifications"
Cohesion: 0.38
Nodes (10): clearConnectivityNotification(), notifyBackOnline(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY, NOTIFICATION_ID_SYNC_ERROR (+2 more)

### Community 52 - "Auth Types & Roles"
Cohesion: 0.31
Nodes (9): UserRole, AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession, RoleGuardProps (+1 more)

### Community 53 - "NPM Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 54 - "Amount & Discount Inputs"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 55 - "Sync/Connectivity State Types"
Cohesion: 0.25
Nodes (6): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, SyncMetaRecord, SyncEngineState, SyncState

### Community 56 - "Social & Docs Icon Sprite"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 57 - "App Entry Chain"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 58 - "Mobile Sign-Up Forms"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 59 - "Network Signal Observer"
Cohesion: 0.33
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

### Community 60 - "Package Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 61 - "Login Background Image"
Cohesion: 0.67
Nodes (4): Login Screen (Auth Feature), Phone Repair Technician Servicing Device, Repair/Retail Shop POS Domain, wall_login.jpg (Login Background Image)

### Community 62 - "Logo Upload Component"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 63 - "Modal & Drawer UI Patterns Docs"
Cohesion: 0.67
Nodes (3): Center Modals Visual Family Pattern, Right-Side Detail & Profile Drawers Pattern, UI Copy for Non-Technical Shop User

### Community 64 - "App Icon & PWA Manifest Docs"
Cohesion: 0.67
Nodes (3): POS App Icon / Branding, App Icon (512x512, Lightning Bolt), PWA Manifest / App Icons

## Knowledge Gaps
- **299 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+294 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `Responsive Layout Hooks` to `Inventory & Suppliers`, `Sync Status UI & Maintenance`, `Catalog & Service Job Picker`, `Employee Form & List Chrome`, `Customers Feature`, `Money Formatting & Cart Line Items`, `Role-Based Access Guards`, `Document Preview & Print`, `Billing Screen Layout`, `Settings Sections`, `Job & Repair Form Modals`, `Employee & Customer Drawers`, `Invoices & Payments Types`, `Amount & Discount Inputs`, `Global Quick Search`, `Notifications Feature`, `Auth Login Screens`, `Category & Product Pickers`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `Connectivity Monitor Internals` to `Outbox, IDs & Flush`, `Sync Engine & Pull`, `Connectivity & Env Config`, `Sync/Connectivity State Types`, `Network Signal Observer`, `Offline Mirror & Stock Ledger`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Settings Sections` to `Inventory & Suppliers`, `Sync Status UI & Maintenance`, `Cart & Payment State`, `App Providers & Theme`, `Responsive Layout Hooks`, `Route Auth Guards`, `Role-Based Access Guards`, `Document Preview & Print`, `Billing Screen Layout`, `Held Cart & Low Stock Notifiers`, `Sync Provider & Toast Notifications`, `Notifications Feature`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Inventory & Suppliers` be split into smaller, more focused modules?**
  _Cohesion score 0.05916305916305916 - nodes in this community are weakly interconnected._
- **Should `Sync Status UI & Maintenance` be split into smaller, more focused modules?**
  _Cohesion score 0.05063291139240506 - nodes in this community are weakly interconnected._
- **Should `Sync Resource Descriptors` be split into smaller, more focused modules?**
  _Cohesion score 0.06572769953051644 - nodes in this community are weakly interconnected._