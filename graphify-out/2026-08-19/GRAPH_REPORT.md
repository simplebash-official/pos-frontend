# Graph Report - frontend (2026-08-19)

## Corpus Check

- 310 files · ~160,732 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1599 nodes · 4931 edges · 111 communities (81 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `f5497ea2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- formatMoney
- useCategories.ts
- registry.ts
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
- offline/index.ts
- cartSlice.ts
- BillingCounter.tsx
- dependencies
- constants/index.ts
- A4InvoicePreviewModal.tsx
- payments.resource.ts
- devDependencies
- LocalStorageStore
- invoicesApi.ts
- syncApi.ts
- SupplierDetailDrawer.tsx
- schema.ts
- compilerOptions
- ProductCatalogTree.tsx
- moneyFormUtils.ts
- Backend Requirements — Offline Sync Spec
- tablerIcons.ts
- customers.resource.ts
- supplierProducts.resource.ts
- useSupplierProducts.ts
- useResponsive.tsx
- ROUTES
- printJobs.resource.ts
- tables.ts
- idMap.ts
- ProductTable.tsx
- RequireAuth.tsx
- categories.resource.ts
- search.ts
- authSlice.ts
- SupplierList.tsx
- generate-icon-shards.mjs
- RequireAdmin.tsx
- scripts
- inventory/types.ts
- Sidebar.tsx
- ApiClient
- PrintJobList.tsx
- useSearchHistory.ts
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
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- useSyncData.ts
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
- EmployeeList.tsx
- themeSlice.ts
- notificationSlice.ts
- RepairJobList.tsx
- typescript
- useSyncedQuery
- EntityListPage.tsx
- notifications/types.ts
- ui.ts
- navigation.ts

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

- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `ProductsPageData` --references--> `Product` [EXTRACTED]
  src/features/inventory/api/productsApi.ts → src/features/inventory/types.ts
- `SyncStatus` --references--> `SyncResourceId` [EXTRACTED]
  src/offline/resources/syncApi.ts → src/offline/types.ts
- `BackendRepair` --references--> `RepairJob` [EXTRACTED]
  src/features/repairs/api/repairsApi.ts → src/features/repairs/types.ts

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

## Communities (111 total, 30 thin omitted)

### Community 0 - "formatMoney"

Cohesion: 0.13
Nodes (26): PAYMENT_METHODS, CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanel, PaymentPanelProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, useAllInvoices() (+18 more)

### Community 1 - "useCategories.ts"

Cohesion: 0.12
Nodes (25): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductFormContent(), buildCategoryLookup(), NO_CATEGORIES, useCategories() (+17 more)

### Community 2 - "registry.ts"

Cohesion: 0.08
Nodes (27): PendingOperationsListProps, OutboxOp, getReferringResources(), resetRegistry(), resources, Widget, widgetResource, deltaCursors (+19 more)

### Community 4 - "settings/types.ts"

Cohesion: 0.23
Nodes (9): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+1 more)

### Community 5 - "SyncEngine.ts"

Cohesion: 0.09
Nodes (35): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, pruneByRetention(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor() (+27 more)

### Community 6 - "useAppSelector"

Cohesion: 0.08
Nodes (44): HeldCartCatchupNotifier(), HeaderProps, Sidebar(), NotificationItem(), NotificationPopover(), NotificationPopoverProps, ACCEPTED_TYPES, LogoUpload() (+36 more)

### Community 7 - "flush.ts"

Cohesion: 0.13
Nodes (33): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), createIdempotencyKey(), isLocalId(), ApiErrorLike, classifyFailure() (+25 more)

### Community 8 - "SyncPanel.tsx"

Cohesion: 0.09
Nodes (37): PendingOperationsList(), STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel() (+29 more)

### Community 9 - "offline/constants.ts"

Cohesion: 0.05
Nodes (46): isApiErrorLike(), readServerTime(), RequestOptions, env, clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete() (+38 more)

### Community 10 - "products.resource.ts"

Cohesion: 0.14
Nodes (13): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+5 more)

### Community 11 - "router.tsx"

Cohesion: 0.11
Nodes (15): BillingCounter, CustomerList, EmailLoginScreen, InvoicesList, PrintJobList, RepairJobList, StandalonePrintView, SupplierList (+7 more)

### Community 12 - "CustomerList.tsx"

Cohesion: 0.18
Nodes (20): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModalProps (+12 more)

### Community 13 - "useIsMobile"

Cohesion: 0.11
Nodes (42): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModal(), ServiceJobPickerModalProps (+34 more)

### Community 14 - "offline/index.ts"

Cohesion: 0.19
Nodes (16): db, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ, getDeviceId() (+8 more)

### Community 15 - "cartSlice.ts"

Cohesion: 0.12
Nodes (29): PaymentMethod, useCartCheckout(), useCartTotals(), SplitPaymentDetail, cartSlice, CartState, DiscountType, HeldCart (+21 more)

### Community 16 - "BillingCounter.tsx"

Cohesion: 0.20
Nodes (18): Header(), BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+10 more)

### Community 17 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "constants/index.ts"

Cohesion: 0.23
Nodes (17): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob (+9 more)

### Community 19 - "A4InvoicePreviewModal.tsx"

Cohesion: 0.21
Nodes (14): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint(), recordPrintEvent() (+6 more)

### Community 20 - "payments.resource.ts"

Cohesion: 0.18
Nodes (14): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), fetchPurchases(), fetchPurchasesByProduct() (+6 more)

### Community 21 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "LocalStorageStore"

Cohesion: 0.16
Nodes (7): createEmployee(), deleteEmployee(), deleteEmployees(), normalizeEmployee(), updateEmployee(), EmployeeList(), LocalStorageStore

### Community 23 - "invoicesApi.ts"

Cohesion: 0.15
Nodes (21): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+13 more)

### Community 24 - "syncApi.ts"

Cohesion: 0.27
Nodes (11): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+3 more)

### Community 25 - "SupplierDetailDrawer.tsx"

Cohesion: 0.27
Nodes (12): ProductPickerModal(), useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesByProduct() (+4 more)

### Community 26 - "schema.ts"

Cohesion: 0.16
Nodes (20): Category, Product, StockMovement, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase, StockPurchaseInput (+12 more)

### Community 27 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "ProductCatalogTree.tsx"

Cohesion: 0.23
Nodes (12): ProductTable, CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductFormModal(), CATEGORY_COLOR_OPTIONS (+4 more)

### Community 29 - "moneyFormUtils.ts"

Cohesion: 0.20
Nodes (16): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents() (+8 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 32 - "customers.resource.ts"

Cohesion: 0.14
Nodes (17): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+9 more)

### Community 33 - "supplierProducts.resource.ts"

Cohesion: 0.16
Nodes (21): createPurchase(), fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct() (+13 more)

### Community 34 - "useSupplierProducts.ts"

Cohesion: 0.18
Nodes (15): EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useProductsForSupplier(), useSetSupplierLinks(), useSuppliersForProduct(), SupplierDetailDrawerProps, FormContentProps (+7 more)

### Community 35 - "useResponsive.tsx"

Cohesion: 0.10
Nodes (26): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer(), HeldSalesDrawerProps (+18 more)

### Community 36 - "ROUTES"

Cohesion: 0.19
Nodes (14): AppRoute, ROUTES, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer() (+6 more)

### Community 37 - "printJobs.resource.ts"

Cohesion: 0.19
Nodes (22): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData, toPrintJob() (+14 more)

### Community 38 - "tables.ts"

Cohesion: 0.09
Nodes (19): ConnectivitySnapshot, ConnectivityState, PULL_INTERVAL_MS, AuditLevel, ConflictReason, IdMapStatus, PullState, PushState (+11 more)

### Community 39 - "idMap.ts"

Cohesion: 0.14
Nodes (13): AbandonedReferenceError, CursorInvalidError, OutboxFullError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), mintLocalId(), resolveValue() (+5 more)

### Community 40 - "ProductTable.tsx"

Cohesion: 0.26
Nodes (14): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+6 more)

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

### Community 45 - "SupplierList.tsx"

Cohesion: 0.20
Nodes (16): SupplierList(), NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier(), useDeleteSuppliers(), useSupplierCategories(), useUpdateSupplier() (+8 more)

### Community 46 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 47 - "RequireAdmin.tsx"

Cohesion: 0.26
Nodes (9): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, UserSession, RoleGuard(), RoleGuardProps (+1 more)

### Community 48 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "inventory/types.ts"

Cohesion: 0.18
Nodes (14): CURRENCY, FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, ProductInput, ProductListResponse (+6 more)

### Community 50 - "Sidebar.tsx"

Cohesion: 0.12
Nodes (17): SidebarProps, CartLineItem, CartLineItemProps, DiscountPopover(), DiscountPopoverProps, getCategoryIconInfo(), AmountInput, AmountInputProps (+9 more)

### Community 51 - "ApiClient"

Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 52 - "PrintJobList.tsx"

Cohesion: 0.29
Nodes (9): PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload, UpdatePrintJobPayload (+1 more)

### Community 53 - "useSearchHistory.ts"

Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

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

### Community 69 - "useSyncData.ts"

Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 101 - "EmployeeList.tsx"

Cohesion: 0.16
Nodes (17): queryKeys, EmployeeList, ReportsDashboard, earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees() (+9 more)

### Community 102 - "themeSlice.ts"

Cohesion: 0.24
Nodes (8): createReduxColorSchemeManager(), toAppScheme(), toMantineScheme(), store, ColorScheme, initialState, themeSlice, ThemeState

### Community 103 - "notificationSlice.ts"

Cohesion: 0.23
Nodes (10): STORAGE_KEYS, AppDispatch, RootState, listenerMiddleware, initialState, notificationSlice, selectAllNotifications(), selectNotificationsByCategory() (+2 more)

### Community 104 - "RepairJobList.tsx"

Cohesion: 0.38
Nodes (8): RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload, UpdateRepairPayload

### Community 106 - "useSyncedQuery"

Cohesion: 0.31
Nodes (7): NO_INVOICES, useCancelInvoice(), SyncedQueryResult, useSyncedQuery(), CancelInvoicePayload, selectResourceHasNeverSynced(), selectResourceIsSyncing()

### Community 107 - "EntityListPage.tsx"

Cohesion: 0.28
Nodes (6): EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, PageHeader(), PageHeaderProps

### Community 108 - "notifications/types.ts"

Cohesion: 0.29
Nodes (6): NotificationItemProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, NotificationState

### Community 109 - "ui.ts"

Cohesion: 0.50
Nodes (3): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN

## Knowledge Gaps

- **319 isolated node(s):** `CategoryManagerModalProps`, `ProductListParams`, `SupplierIntakeRow`, `ProductHierarchy`, `DetailDrawerProps` (+314 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `formatMoney`, `useCategories.ts`, `useAppSelector`, `SyncPanel.tsx`, `CustomerList.tsx`, `BillingCounter.tsx`, `constants/index.ts`, `A4InvoicePreviewModal.tsx`, `SupplierDetailDrawer.tsx`, `ProductCatalogTree.tsx`, `moneyFormUtils.ts`, `useSupplierProducts.ts`, `useResponsive.tsx`, `ROUTES`, `ProductTable.tsx`, `inventory/types.ts`, `Sidebar.tsx`, `EmployeeList.tsx`, `EntityListPage.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `ApiClient` connect `ApiClient` to `customers.resource.ts`, `supplierProducts.resource.ts`, `printJobs.resource.ts`, `offline/constants.ts`, `categories.resource.ts`, `products.resource.ts`, `authSlice.ts`, `A4InvoicePreviewModal.tsx`, `payments.resource.ts`, `invoicesApi.ts`, `syncApi.ts`, `suppliers.resource.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `formatMoney`, `useResponsive.tsx`, `ProductTable.tsx`, `RequireAuth.tsx`, `SyncPanel.tsx`, `offline/constants.ts`, `useSyncedQuery`, `useIsMobile`, `RequireAdmin.tsx`, `BillingCounter.tsx`, `cartSlice.ts`, `Sidebar.tsx`, `A4InvoicePreviewModal.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `CategoryManagerModalProps`, `ProductListParams`, `SupplierIntakeRow` to the rest of the system?**
  _319 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formatMoney` be split into smaller, more focused modules?**
  _Cohesion score 0.13086770981507823 - nodes in this community are weakly interconnected._
- **Should `useCategories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07557354925775979 - nodes in this community are weakly interconnected._
