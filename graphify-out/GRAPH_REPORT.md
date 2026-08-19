# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 310 files · ~160,956 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1602 nodes · 4934 edges · 106 communities (77 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4e7c38e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schema.ts
- useCategories.ts
- registry.ts
- settingsSlice.ts
- pull.ts
- useAppSelector
- flush.ts
- syncSlice.ts
- offline/constants.ts
- products.resource.ts
- router.tsx
- CustomerList.tsx
- CatalogPanel.tsx
- outbox.ts
- cartSlice.ts
- inventory/types.ts
- dependencies
- PrintJobFormModal.tsx
- SaleDocumentPreviewModal.tsx
- db
- devDependencies
- mockEmployees.ts
- invoicesApi.ts
- maintenance.ts
- useSyncedQuery
- BillingCounter.tsx
- compilerOptions
- ProductCatalogTree.tsx
- money.ts
- Backend Requirements — Offline Sync Spec
- tablerIcons.ts
- customers.resource.ts
- supplierProducts.resource.ts
- SupplierList.tsx
- AppShell.tsx
- LoginForm.tsx
- printJobs.resource.ts
- searchFields.ts
- SyncEngine.ts
- ProductTable.tsx
- moneyFormUtils.ts
- categories.resource.ts
- useEntitySearch
- authSlice.ts
- EmployeeList.tsx
- generate-icon-shards.mjs
- SyncProvider.tsx
- scripts
- ReportsDashboard.tsx
- AmountInput.tsx
- useResponsive.tsx
- useSearchHistory.ts
- repairs.resource.ts
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- EmployeeDetailDrawer.tsx
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
- constants/index.ts
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
10. `flushOutbox()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `HeldCartCatchupNotifier()` --indirect_call--> `selectHeldCarts()`  [INFERRED]
  src/app/components/HeldCartCatchupNotifier.tsx → src/store/slices/cartSlice.ts
- `Sidebar()` --indirect_call--> `selectUserRole()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `BillingCounter()` --indirect_call--> `selectAuthUser()`  [INFERRED]
  src/features/billing/components/BillingCounter.tsx → src/store/slices/authSlice.ts

## Import Cycles
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)
- **Offline-First Sync and Storage Architecture** — claude_md_offline_sync_engine, claude_md_sync_resource_descriptor, claude_md_connectivity_monitor, claude_md_backend_sync_contract [EXTRACTED 1.00]
- **Responsive and Performant UI Design System** — claude_md_responsive_rules, claude_md_center_modal_standard, claude_md_detail_drawer_standard, claude_md_animation_performance [EXTRACTED 1.00]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline [INFERRED 0.75]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow, claude_md_graphify_guidelines [INFERRED 0.95]

## Communities (106 total, 29 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.11
Nodes (28): PaymentRecord, StockMovement, PendingOperationsListProps, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord (+20 more)

### Community 1 - "useCategories.ts"
Cohesion: 0.16
Nodes (21): ProductTable, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductFormModal(), CATEGORY_COLOR_OPTIONS (+13 more)

### Community 2 - "registry.ts"
Cohesion: 0.07
Nodes (30): MirroredRow, discardOperation(), reclaimInflightOperations(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource (+22 more)

### Community 4 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 5 - "pull.ts"
Cohesion: 0.15
Nodes (18): AUDIT_LOG_LIMIT, readServerVersion(), toServerRow(), patchSyncMeta(), AuditLevel, logError(), logInfo(), logSyncEvent() (+10 more)

### Community 6 - "useAppSelector"
Cohesion: 0.13
Nodes (32): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+24 more)

### Community 7 - "flush.ts"
Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+30 more)

### Community 8 - "syncSlice.ts"
Cohesion: 0.06
Nodes (48): PendingOperationsList(), STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel() (+40 more)

### Community 9 - "offline/constants.ts"
Cohesion: 0.05
Nodes (41): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor (+33 more)

### Community 10 - "products.resource.ts"
Cohesion: 0.33
Nodes (8): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), updateProduct(), appendStockDelta(), BarcodeConflictError, productsResource

### Community 11 - "router.tsx"
Cohesion: 0.07
Nodes (34): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), Sidebar(), SidebarProps (+26 more)

### Community 12 - "CustomerList.tsx"
Cohesion: 0.14
Nodes (27): fetchInvoices(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList() (+19 more)

### Community 13 - "CatalogPanel.tsx"
Cohesion: 0.16
Nodes (25): BillingCounter(), CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModal() (+17 more)

### Community 14 - "outbox.ts"
Cohesion: 0.21
Nodes (16): assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), createLocalId(), LOCAL_ID_PREFIX, randomUuid(), assertOutboxHasCapacity(), countByStatus() (+8 more)

### Community 15 - "cartSlice.ts"
Cohesion: 0.11
Nodes (32): PaymentMethod, CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+24 more)

### Community 16 - "inventory/types.ts"
Cohesion: 0.11
Nodes (21): ProductListParams, ProductsPageData, FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product (+13 more)

### Community 17 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "PrintJobFormModal.tsx"
Cohesion: 0.22
Nodes (18): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps (+10 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.11
Nodes (33): getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+25 more)

### Community 20 - "db"
Cohesion: 0.21
Nodes (15): queryKeys, BackendPaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), createPurchase(), db, defineOperation() (+7 more)

### Community 21 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "mockEmployees.ts"
Cohesion: 0.15
Nodes (8): createEmployee(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee(), LocalStorageStore

### Community 23 - "invoicesApi.ts"
Cohesion: 0.15
Nodes (19): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+11 more)

### Community 24 - "maintenance.ts"
Cohesion: 0.15
Nodes (16): ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor() (+8 more)

### Community 25 - "useSyncedQuery"
Cohesion: 0.14
Nodes (20): NO_INVOICES, useCancelInvoice(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, enrich(), NO_PURCHASES (+12 more)

### Community 26 - "BillingCounter.tsx"
Cohesion: 0.19
Nodes (16): PAYMENT_METHODS, BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps (+8 more)

### Community 27 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "ProductCatalogTree.tsx"
Cohesion: 0.31
Nodes (9): ProductCatalogTreeProps, ProductHierarchy, Category, SearchHighlight(), SearchHighlightProps, EntitySearchResult, getMatchRanges(), SearchTerm (+1 more)

### Community 29 - "money.ts"
Cohesion: 0.22
Nodes (14): CURRENCY, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, useCreatePurchase(), SupplierDetailDrawerProps (+6 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 32 - "customers.resource.ts"
Cohesion: 0.23
Nodes (11): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+3 more)

### Community 33 - "supplierProducts.resource.ts"
Cohesion: 0.27
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProduct (+4 more)

### Community 34 - "SupplierList.tsx"
Cohesion: 0.16
Nodes (21): FormContentProps, SupplierFormContent(), SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, DEFAULT_SUGGESTED_TAGS (+13 more)

### Community 35 - "AppShell.tsx"
Cohesion: 0.16
Nodes (14): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+6 more)

### Community 36 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 37 - "printJobs.resource.ts"
Cohesion: 0.36
Nodes (11): addEarningRecord(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData, toPrintJob(), updatePrintJobRaw() (+3 more)

### Community 38 - "searchFields.ts"
Cohesion: 0.20
Nodes (11): InvoicesList, useAllInvoices(), InvoicesList(), mergeByCategory(), QuickSearchResult, CUSTOMER_SEARCH_FIELDS, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS (+3 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (15): ConnectivitySnapshot, SYNC_LEADER_LOCK, UNSYNCED_VERSION, LeaderElection, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+7 more)

### Community 40 - "ProductTable.tsx"
Cohesion: 0.14
Nodes (26): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+18 more)

### Community 41 - "moneyFormUtils.ts"
Cohesion: 0.32
Nodes (11): EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), fromCents(), EmployeeFormValues, fromEmployee() (+3 more)

### Community 42 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 43 - "useEntitySearch"
Cohesion: 0.22
Nodes (17): useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier(), normalizeDigits(), normalizeText() (+9 more)

### Community 44 - "authSlice.ts"
Cohesion: 0.13
Nodes (26): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+18 more)

### Community 45 - "EmployeeList.tsx"
Cohesion: 0.24
Nodes (12): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable() (+4 more)

### Community 46 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 48 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "ReportsDashboard.tsx"
Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 50 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 51 - "useResponsive.tsx"
Cohesion: 0.21
Nodes (10): BillingPageSkeleton(), FILL, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue, LayoutTierProvider(), MEDIA_QUERY_OPTIONS (+2 more)

### Community 52 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 53 - "repairs.resource.ts"
Cohesion: 0.35
Nodes (11): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), RepairListResponseData, toRepairJob(), updateRepairJobRaw() (+3 more)

### Community 54 - "Offline-First Dexie Mirror and Outbox Engine"
Cohesion: 0.25
Nodes (8): Backend Sync, Multiplexed Delta, and Idempotency Contract, Connectivity Monitor and Asymmetric Hysteresis, CSS Variable Design Tokens and Dark Mode System, Offline Authentication and Grace Period, Offline-First Dexie Mirror and Outbox Engine, PWA Shell Pre-caching and API Guard Policy, Redux Toolkit State Architecture, Sync Resource Descriptor Protocol

### Community 55 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 56 - "EmployeeDetailDrawer.tsx"
Cohesion: 0.25
Nodes (6): EmployeeList, EmployeeDetailDrawerProps, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, DetailDrawer(), DetailDrawerProps

### Community 57 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 58 - "suppliers.resource.ts"
Cohesion: 0.29
Nodes (9): MutationRequestOptions, createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), pushOptions() (+1 more)

### Community 59 - "providers.tsx"
Cohesion: 0.10
Nodes (18): App(), AppProviders(), AppProvidersProps, AuthInitializer(), router, container, createReduxColorSchemeManager(), reduxColorSchemeManager (+10 more)

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
Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 69 - "useIsMobile"
Cohesion: 0.15
Nodes (19): Header(), HeaderProps, CartLineItem, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer() (+11 more)

### Community 101 - "PrintJobList.tsx"
Cohesion: 0.32
Nodes (9): PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload, UpdatePrintJobPayload (+1 more)

### Community 103 - "constants/index.ts"
Cohesion: 0.09
Nodes (26): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+18 more)

### Community 106 - "RepairJobList.tsx"
Cohesion: 0.30
Nodes (9): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload (+1 more)

## Knowledge Gaps
- **321 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+316 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `useCategories.ts`, `syncSlice.ts`, `router.tsx`, `CustomerList.tsx`, `CatalogPanel.tsx`, `inventory/types.ts`, `PrintJobFormModal.tsx`, `SaleDocumentPreviewModal.tsx`, `BillingCounter.tsx`, `money.ts`, `SupplierList.tsx`, `AppShell.tsx`, `LoginForm.tsx`, `ProductTable.tsx`, `moneyFormUtils.ts`, `AmountInput.tsx`, `useResponsive.tsx`, `EmployeeDetailDrawer.tsx`, `constants/index.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `AppShell.tsx`, `useIsMobile`, `constants/index.ts`, `ProductTable.tsx`, `syncSlice.ts`, `router.tsx`, `authSlice.ts`, `CatalogPanel.tsx`, `cartSlice.ts`, `SyncProvider.tsx`, `SaleDocumentPreviewModal.tsx`, `useSyncedQuery`, `BillingCounter.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `useIsMobile` to `useCategories.ts`, `SupplierList.tsx`, `PrintJobList.tsx`, `searchFields.ts`, `ProductTable.tsx`, `moneyFormUtils.ts`, `RepairJobList.tsx`, `CustomerList.tsx`, `CatalogPanel.tsx`, `EmployeeList.tsx`, `inventory/types.ts`, `ReportsDashboard.tsx`, `PrintJobFormModal.tsx`, `SaleDocumentPreviewModal.tsx`, `EmployeeDetailDrawer.tsx`, `BillingCounter.tsx`, `ProductCatalogTree.tsx`, `money.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _321 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07317073170731707 - nodes in this community are weakly interconnected._
- **Should `tablerIconShards/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._