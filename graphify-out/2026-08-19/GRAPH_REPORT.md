# Graph Report - frontend (2026-08-19)

## Corpus Check

- 302 files · ~156,734 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1559 nodes · 4680 edges · 102 communities (73 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `054f0c9f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- offline/constants.ts
- syncSlice.ts
- registry.ts
- tablerIconShards/index.ts
- settingsSlice.ts
- SyncEngine.ts
- useAppSelector
- flush.ts
- useResponsive.tsx
- RequireAdmin.tsx
- productsApi.ts
- router.tsx
- CustomerList.tsx
- CatalogPanel.tsx
- providers.tsx
- BillingCounter.tsx
- useEntitySearch
- dependencies
- mockEmployees.ts
- SaleDocumentPreviewModal.tsx
- useCategories.ts
- devDependencies
- offline/index.ts
- pull.test.ts
- syncApi.ts
- useIsMobile
- SupplierDetailDrawer.tsx
- compilerOptions
- invoicesApi.ts
- schema.ts
- Backend Requirements — Offline Sync Spec
- purchases.resource.ts
- money.ts
- supplierProducts.resource.ts
- SupplierList.tsx
- AppShell.tsx
- common.ts
- GlobalQuickSearchModal.tsx
- outbox.ts
- customersApi.ts
- ProductTable.tsx
- suppliers.resource.ts
- categories.resource.ts
- RequireAuth.tsx
- SearchHistoryInput.tsx
- searchFields.ts
- generate-icon-shards.mjs
- authSlice.ts
- scripts
- customers.resource.ts
- Sidebar.tsx
- ApiClient
- authApi.ts
- InvoicesList.tsx
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- app/App.tsx
- MobileSignUpForm.tsx
- paymentsApi.ts
- Responsive and Mobile Layout Tiers
- package.json
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell, and Router Architecture
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- products.resource.ts
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
- typescript

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 75 edges
2. `formatMoney()` - 60 edges
3. `useAppSelector` - 60 edges
4. `useAppDispatch` - 42 edges
5. `useSyncedMutation()` - 31 edges
6. `ConnectivityMonitor` - 30 edges
7. `db` - 30 edges
8. `useEntitySearch()` - 28 edges
9. `flushOutbox()` - 27 edges
10. `queryKeys` - 22 edges

## Surprising Connections (you probably didn't know these)

- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `GuestOnly()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/components/GuestOnly.tsx → src/store/slices/authSlice.ts
- `RequireAuth()` --indirect_call--> `selectIsAuthenticated()` [INFERRED]
  src/app/components/RequireAuth.tsx → src/store/slices/authSlice.ts
- `Sidebar()` --indirect_call--> `selectUserRole()` [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts

## Import Cycles

- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
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

## Communities (102 total, 29 thin omitted)

### Community 0 - "offline/constants.ts"

Cohesion: 0.05
Nodes (45): isApiErrorLike(), readServerTime(), RequestOptions, env, clearConnectivityNotification(), notifyBackOnline(), notifySyncComplete(), notifySyncProblems() (+37 more)

### Community 1 - "syncSlice.ts"

Cohesion: 0.05
Nodes (55): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+47 more)

### Community 2 - "registry.ts"

Cohesion: 0.09
Nodes (22): reclaimInflightOperations(), defineOperation(), getReferringResources(), getResourceRanks(), getResourcesInDependencyOrder(), resetRegistry(), resources, Widget (+14 more)

### Community 3 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 4 - "settingsSlice.ts"

Cohesion: 0.05
Nodes (46): SettingsPage, STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopoverProps (+38 more)

### Community 5 - "SyncEngine.ts"

Cohesion: 0.10
Nodes (20): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, pruneByRetention(), rowAgeTimestamp(), getAllSyncMeta(), AuditLevel, logError(), logInfo() (+12 more)

### Community 6 - "useAppSelector"

Cohesion: 0.14
Nodes (30): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+22 more)

### Community 7 - "flush.ts"

Cohesion: 0.11
Nodes (36): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), resolveMapping(), resolveValue() (+28 more)

### Community 8 - "useResponsive.tsx"

Cohesion: 0.20
Nodes (12): BillingRegions, BillingRegionsProps, FILL, BillingPane, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue (+4 more)

### Community 9 - "RequireAdmin.tsx"

Cohesion: 0.29
Nodes (8): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, RoleGuard(), RoleGuardProps, selectUserRole()

### Community 10 - "productsApi.ts"

Cohesion: 0.16
Nodes (10): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+2 more)

### Community 11 - "router.tsx"

Cohesion: 0.10
Nodes (17): BillingCounter, EmailLoginScreen, EmployeeList, PrintJobList, ProductTable, RepairJobList, StandalonePrintView, NAV_ITEMS (+9 more)

### Community 12 - "CustomerList.tsx"

Cohesion: 0.15
Nodes (22): CustomerList, CustomerDetailDrawer(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), PRESET_CUSTOMER_TAGS, NO_CUSTOMERS (+14 more)

### Community 13 - "CatalogPanel.tsx"

Cohesion: 0.22
Nodes (18): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModal(), ServiceJobPickerModalProps (+10 more)

### Community 14 - "providers.tsx"

Cohesion: 0.13
Nodes (16): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppShell(), AppProvidersProps, AuthInitializer(), LowStockNotifier(), notifiedProductIds, selectIsAuthenticated() (+8 more)

### Community 15 - "BillingCounter.tsx"

Cohesion: 0.10
Nodes (39): PAYMENT_METHODS, PaymentMethod, completeSale(), BillingCounter(), BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS (+31 more)

### Community 16 - "useEntitySearch"

Cohesion: 0.17
Nodes (22): SearchHighlight(), SearchHighlightProps, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar() (+14 more)

### Community 17 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "mockEmployees.ts"

Cohesion: 0.11
Nodes (16): ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees() (+8 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.12
Nodes (30): getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, fetchPaymentsForInvoice(), A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal() (+22 more)

### Community 20 - "useCategories.ts"

Cohesion: 0.11
Nodes (34): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductCatalogTreeProps (+26 more)

### Community 21 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "offline/index.ts"

Cohesion: 0.19
Nodes (10): ConnectivitySnapshot, ConnectivityState, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirroredRow, MirrorMeta, pendingDeltaFor() (+2 more)

### Community 23 - "pull.test.ts"

Cohesion: 0.13
Nodes (22): toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, logWarn() (+14 more)

### Community 24 - "syncApi.ts"

Cohesion: 0.23
Nodes (13): PULL_PAGE_LIMIT, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges() (+5 more)

### Community 25 - "useIsMobile"

Cohesion: 0.18
Nodes (19): Header(), HeaderProps, CartLineItem, CartLineItemProps, CartPanel, CartPanelProps, DiscountPopover(), HeldSalesDrawer() (+11 more)

### Community 26 - "SupplierDetailDrawer.tsx"

Cohesion: 0.18
Nodes (20): useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesByProduct(), usePurchasesBySupplier() (+12 more)

### Community 27 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "invoicesApi.ts"

Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+7 more)

### Community 29 - "schema.ts"

Cohesion: 0.14
Nodes (21): StockMovement, Subcategory, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase, EnrichedLinkedProduct, EnrichedLinkedSupplier (+13 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "purchases.resource.ts"

Cohesion: 0.23
Nodes (12): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, StockPurchaseInput, toLocalRow() (+4 more)

### Community 32 - "money.ts"

Cohesion: 0.16
Nodes (27): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, CURRENCY, SplitType, ProductFormContent(), PrintJobFormModalProps (+19 more)

### Community 33 - "supplierProducts.resource.ts"

Cohesion: 0.21
Nodes (14): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), registerSyncResource() (+6 more)

### Community 34 - "SupplierList.tsx"

Cohesion: 0.20
Nodes (19): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS (+11 more)

### Community 35 - "AppShell.tsx"

Cohesion: 0.16
Nodes (14): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+6 more)

### Community 36 - "common.ts"

Cohesion: 0.20
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 37 - "GlobalQuickSearchModal.tsx"

Cohesion: 0.12
Nodes (30): AppRoute, addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJob(), deletePrintJobs() (+22 more)

### Community 38 - "outbox.ts"

Cohesion: 0.11
Nodes (29): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, ConflictReason, IdMapStatus, OutboxError, OutboxOp (+21 more)

### Community 39 - "customersApi.ts"

Cohesion: 0.24
Nodes (7): fetchAllCustomers(), fetchCustomers(), CustomerPickerModalProps, Customer, CustomerListParams, CustomerListResponse, CustomerTagsResponse

### Community 40 - "ProductTable.tsx"

Cohesion: 0.26
Nodes (11): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+3 more)

### Community 41 - "suppliers.resource.ts"

Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 42 - "categories.resource.ts"

Cohesion: 0.40
Nodes (7): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), categoriesResource

### Community 43 - "RequireAuth.tsx"

Cohesion: 0.25
Nodes (8): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, PageLoader(), PageLoaderProps, selectIsAuthInitialized(), selectIsAuthLoading()

### Community 44 - "SearchHistoryInput.tsx"

Cohesion: 0.15
Nodes (18): EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, SearchHistoryInput, SearchHistoryInputProps, getServerSnapshot(), getSnapshot() (+10 more)

### Community 45 - "searchFields.ts"

Cohesion: 0.21
Nodes (9): SupplierList, SupplierPickerModal(), SupplierPickerModalProps, CUSTOMER_SEARCH_FIELDS, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, REPAIR_JOB_SEARCH_FIELDS (+1 more)

### Community 46 - "generate-icon-shards.mjs"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 47 - "authSlice.ts"

Cohesion: 0.31
Nodes (10): getMeApi(), cacheSession(), clearCachedSession(), readCachedSession(), authSlice, initializeAuth, initialState, isNetworkError() (+2 more)

### Community 48 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "customers.resource.ts"

Cohesion: 0.33
Nodes (9): createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer(), markDeleted(), markPending(), customersResource, DeleteCustomerPayload (+1 more)

### Community 50 - "Sidebar.tsx"

Cohesion: 0.14
Nodes (14): Sidebar(), SidebarProps, DiscountPopoverProps, useLowStockProducts(), AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP (+6 more)

### Community 51 - "ApiClient"

Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 52 - "authApi.ts"

Cohesion: 0.36
Nodes (7): AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession, AuthState

### Community 53 - "InvoicesList.tsx"

Cohesion: 0.39
Nodes (5): InvoicesList, fetchInvoices(), InvoicesList(), getListEmptyText(), QueryConnectivityStatus

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

### Community 58 - "paymentsApi.ts"

Cohesion: 0.29
Nodes (7): BackendPaymentRecord, PaymentListResponseData, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), ApiResponse

### Community 60 - "Responsive and Mobile Layout Tiers"

Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"

Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"

Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 69 - "products.resource.ts"

Cohesion: 0.14
Nodes (20): FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput, ProductListResponse (+12 more)

### Community 102 - "EmployeeList.tsx"

Cohesion: 0.17
Nodes (18): queryKeys, CustomerDetailDrawerProps, fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee (+10 more)

## Knowledge Gaps

- **317 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `syncSlice.ts`, `settingsSlice.ts`, `useResponsive.tsx`, `CustomerList.tsx`, `CatalogPanel.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `useCategories.ts`, `SupplierDetailDrawer.tsx`, `money.ts`, `SupplierList.tsx`, `AppShell.tsx`, `common.ts`, `customersApi.ts`, `ProductTable.tsx`, `SearchHistoryInput.tsx`, `searchFields.ts`, `Sidebar.tsx`, `products.resource.ts`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `authSlice.ts`, `SyncEngine.ts`, `offline/index.ts`, `flush.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `offline/constants.ts`, `syncSlice.ts`, `AppShell.tsx`, `settingsSlice.ts`, `ProductTable.tsx`, `RequireAdmin.tsx`, `RequireAuth.tsx`, `CatalogPanel.tsx`, `providers.tsx`, `BillingCounter.tsx`, `Sidebar.tsx`, `SaleDocumentPreviewModal.tsx`, `useIsMobile`, `SupplierDetailDrawer.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `syncSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05157894736842105 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09462365591397849 - nodes in this community are weakly interconnected._
