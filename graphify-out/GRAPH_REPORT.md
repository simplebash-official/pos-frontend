# Graph Report - frontend (2026-08-19)

## Corpus Check

- 310 files · ~160,724 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1600 nodes · 4932 edges · 102 communities (72 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `0eb9e2c1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- SyncEngine.ts
- useCategories.ts
- registry.ts
- settingsSlice.ts
- SyncEngine
- useAppSelector
- flush.ts
- syncSlice.ts
- ConnectivityMonitor
- useProducts.ts
- router.tsx
- CustomerList.tsx
- CatalogPanel.tsx
- outbox.ts
- cartSlice.ts
- BillingCounter.tsx
- dependencies
- mockEmployees.ts
- SaleDocumentPreviewModal.tsx
- invoices.resource.ts
- devDependencies
- offline/constants.ts
- invoicesApi.ts
- syncApi.ts
- formatMoney
- schema.ts
- compilerOptions
- inventory/index.ts
- purchasesApi.ts
- Backend Requirements — Offline Sync Spec
- tablerIcons.ts
- customers.resource.ts
- useSupplierProducts.ts
- SupplierList.tsx
- useIsMobile
- common.ts
- printJobs.resource.ts
- tables.ts
- ConnectivityMonitor.ts
- ProductTable.tsx
- ROUTES
- inventory/types.ts
- SyncProvider.tsx
- authSlice.ts
- EmployeeList.tsx
- generate-icon-shards.mjs
- authApi.ts
- scripts
- healthProbe.ts
- Sidebar.tsx
- client.ts
- networkSignal.ts
- postcss
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
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
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
- EmployeeDetailDrawer.tsx
- notificationSlice.ts
- typescript

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

- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `HeldCartCatchupNotifier()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/components/HeldCartCatchupNotifier.tsx → src/store/slices/authSlice.ts
- `AppShell()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/layout/AppShell.tsx → src/store/slices/authSlice.ts
- `Sidebar()` --indirect_call--> `selectUserRole()` [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts

## Import Cycles

- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)

- **Offline-First Sync and Storage Architecture** — claude_md_offline_sync_engine, claude_md_sync_resource_descriptor, claude_md_connectivity_monitor, claude_md_backend_sync_contract [EXTRACTED 1.00]
- **Responsive and Performant UI Design System** — claude_md_responsive_rules, claude_md_center_modal_standard, claude_md_detail_drawer_standard, claude_md_animation_performance [EXTRACTED 1.00]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline [INFERRED 0.75]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow, claude_md_graphify_guidelines [INFERRED 0.95]

## Communities (102 total, 30 thin omitted)

### Community 0 - "SyncEngine.ts"

Cohesion: 0.18
Nodes (18): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, SyncMetaRecord (+10 more)

### Community 1 - "useCategories.ts"

Cohesion: 0.24
Nodes (14): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCategoryIcons() (+6 more)

### Community 2 - "registry.ts"

Cohesion: 0.10
Nodes (22): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, mockStatus() (+14 more)

### Community 4 - "settingsSlice.ts"

Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 5 - "SyncEngine"

Cohesion: 0.21
Nodes (3): logInfo(), LeaderElection, SyncEngine

### Community 6 - "useAppSelector"

Cohesion: 0.11
Nodes (37): HeldCartCatchupNotifier(), Sidebar(), LowStockNotifier(), notifiedProductIds, useLowStockProducts(), NotificationPopover(), ACCEPTED_TYPES, LogoUpload() (+29 more)

### Community 7 - "flush.ts"

Cohesion: 0.10
Nodes (37): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+29 more)

### Community 8 - "syncSlice.ts"

Cohesion: 0.05
Nodes (55): SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge(), SyncStatusBadgeProps, MODULE_STATUS_PRESENTATION (+47 more)

### Community 10 - "useProducts.ts"

Cohesion: 0.12
Nodes (24): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), ProductCatalogTreeProps (+16 more)

### Community 11 - "router.tsx"

Cohesion: 0.12
Nodes (13): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, SettingsPage, StandalonePrintView, SupplierList, BillingPageSkeleton() (+5 more)

### Community 12 - "CustomerList.tsx"

Cohesion: 0.20
Nodes (20): CustomerDetailDrawer(), CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal(), CustomerPickerModalProps (+12 more)

### Community 13 - "CatalogPanel.tsx"

Cohesion: 0.10
Nodes (38): InvoicesList, CatalogPanelProps, useAllInvoices(), InvoicesList(), SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult (+30 more)

### Community 14 - "outbox.ts"

Cohesion: 0.18
Nodes (18): MIRROR_TABLE_NAMES, OutboxError, assignLedgerEntriesToOperation(), OutboxFullError, getDeviceId(), createIdempotencyKey(), createLocalId(), LOCAL_ID_PREFIX (+10 more)

### Community 15 - "cartSlice.ts"

Cohesion: 0.12
Nodes (27): useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState, DiscountType, initialState (+19 more)

### Community 16 - "BillingCounter.tsx"

Cohesion: 0.11
Nodes (35): PAYMENT_METHODS, PaymentMethod, BillingCounter(), BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+27 more)

### Community 17 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "mockEmployees.ts"

Cohesion: 0.05
Nodes (68): PrintJobList, RepairJobList, ReportsDashboard, JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, CURRENCY (+60 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.10
Nodes (36): getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+28 more)

### Community 20 - "invoices.resource.ts"

Cohesion: 0.21
Nodes (19): queryKeys, CompleteSaleInput, BackendPaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), createPurchase(), toLocalRow() (+11 more)

### Community 21 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies (+21 more)

### Community 22 - "offline/constants.ts"

Cohesion: 0.13
Nodes (16): MAX_CLOCK_SKEW_MS, MAX_PUSH_ATTEMPTS, NOTIFICATION_ID_CONNECTIVITY, NOTIFICATION_ID_SYNC_ERROR, OFFLINE_DB_NAME, OFFLINE_SESSION_GRACE_MS, OUTBOX_CAPACITY, PULL_INTERVAL_MS (+8 more)

### Community 23 - "invoicesApi.ts"

Cohesion: 0.15
Nodes (18): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+10 more)

### Community 24 - "syncApi.ts"

Cohesion: 0.10
Nodes (27): readServerVersion(), toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary (+19 more)

### Community 25 - "formatMoney"

Cohesion: 0.20
Nodes (19): NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), ProductPickerModal(), ProductPickerModalProps, useAllProducts(), InvoiceDetailDrawer(), ReceiveStockModal() (+11 more)

### Community 26 - "schema.ts"

Cohesion: 0.13
Nodes (21): PaymentRecord, NO_INVOICES, useCancelInvoice(), StockMovement, stripMirrorMeta(), UNSYNCED_VERSION, db, MirrorTableName (+13 more)

### Community 27 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "inventory/index.ts"

Cohesion: 0.26
Nodes (11): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, ProductFormModal(), CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon() (+3 more)

### Community 29 - "purchasesApi.ts"

Cohesion: 0.22
Nodes (11): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+3 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (18): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+10 more)

### Community 32 - "customers.resource.ts"

Cohesion: 0.20
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 33 - "useSupplierProducts.ts"

Cohesion: 0.21
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+8 more)

### Community 34 - "SupplierList.tsx"

Cohesion: 0.20
Nodes (17): SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS (+9 more)

### Community 35 - "useIsMobile"

Cohesion: 0.10
Nodes (30): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+22 more)

### Community 36 - "common.ts"

Cohesion: 0.17
Nodes (15): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+7 more)

### Community 37 - "printJobs.resource.ts"

Cohesion: 0.19
Nodes (24): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData (+16 more)

### Community 38 - "tables.ts"

Cohesion: 0.12
Nodes (20): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, AUDIT_LOG_LIMIT, AuditEvent, AuditLevel, ConflictReason, IdMapStatus (+12 more)

### Community 39 - "ConnectivityMonitor.ts"

Cohesion: 0.19
Nodes (9): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, DEGRADED_LATENCY_MS, HEALTH_PROBE_BACKOFF_MS, HEALTH_PROBE_INTERVAL_ONLINE_MS, OFFLINE_FAILURE_THRESHOLD, ONLINE_SETTLE_MS (+1 more)

### Community 40 - "ProductTable.tsx"

Cohesion: 0.23
Nodes (15): ProductTable(), useCategoryLookup(), useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct(), useLinkProduct() (+7 more)

### Community 41 - "ROUTES"

Cohesion: 0.20
Nodes (12): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, NAV_ITEMS, NavItemConfig, AppRoute, ROUTE_PATHS (+4 more)

### Community 42 - "inventory/types.ts"

Cohesion: 0.14
Nodes (21): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), BarcodeSource, Category (+13 more)

### Community 43 - "SyncProvider.tsx"

Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 44 - "authSlice.ts"

Cohesion: 0.27
Nodes (11): AuthInitializer(), getMeApi(), cacheSession(), clearCachedSession(), readCachedSession(), authSlice, initializeAuth, initialState (+3 more)

### Community 45 - "EmployeeList.tsx"

Cohesion: 0.14
Nodes (18): USER_ROLES, deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps, Column (+10 more)

### Community 46 - "generate-icon-shards.mjs"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 47 - "authApi.ts"

Cohesion: 0.18
Nodes (14): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, UserRole, AuthUser, LoginPayload, LoginResponse, LoginResponseData (+6 more)

### Community 48 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "healthProbe.ts"

Cohesion: 0.29
Nodes (6): env, probeClient, probeHealth(), ProbeResult, HEADER_SERVER_TIME, HEALTH_PROBE_TIMEOUT_MS

### Community 50 - "Sidebar.tsx"

Cohesion: 0.13
Nodes (14): SidebarProps, CartLineItemProps, DiscountPopover(), DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP (+6 more)

### Community 51 - "client.ts"

Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 52 - "networkSignal.ts"

Cohesion: 0.33
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

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

Cohesion: 0.19
Nodes (8): AppUpdatePrompt(), AppProvidersProps, darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars, CONTAINER_SIZES, mantineTheme

### Community 60 - "Responsive and Mobile Layout Tiers"

Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"

Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"

Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 101 - "EmployeeDetailDrawer.tsx"

Cohesion: 0.21
Nodes (11): CustomerDetailDrawerProps, fetchEmployeeEarnings(), EmployeeDetailDrawer(), EMPLOYEE_ROLE_LABELS, ProductCatalogTree, ProductHierarchy, DetailDrawer(), DetailDrawerProps (+3 more)

### Community 103 - "notificationSlice.ts"

Cohesion: 0.06
Nodes (43): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification (+35 more)

## Knowledge Gaps

- **319 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+314 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `useCategories.ts`, `SupplierList.tsx`, `common.ts`, `EmployeeDetailDrawer.tsx`, `useAppSelector`, `notificationSlice.ts`, `ProductTable.tsx`, `syncSlice.ts`, `useProducts.ts`, `CustomerList.tsx`, `CatalogPanel.tsx`, `BillingCounter.tsx`, `Sidebar.tsx`, `SaleDocumentPreviewModal.tsx`, `mockEmployees.ts`, `formatMoney`, `inventory/index.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `useIsMobile`, `notificationSlice.ts`, `ProductTable.tsx`, `ROUTES`, `syncSlice.ts`, `SyncProvider.tsx`, `authApi.ts`, `BillingCounter.tsx`, `cartSlice.ts`, `Sidebar.tsx`, `SaleDocumentPreviewModal.tsx`, `formatMoney`, `providers.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `SyncEngine.ts`, `ConnectivityMonitor.ts`, `flush.ts`, `authSlice.ts`, `networkSignal.ts`, `schema.ts`, `providers.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _319 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._
- **Should `tablerIconShards/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.10901960784313726 - nodes in this community are weakly interconnected._
