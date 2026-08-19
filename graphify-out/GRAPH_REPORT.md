# Graph Report - frontend  (2026-08-19)

## Corpus Check
- 302 files · ~156,730 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1558 nodes · 4666 edges · 106 communities (75 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f59880f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- offline/constants.ts
- syncSlice.ts
- registry.ts
- tablerIconShards/index.ts
- notificationSlice.ts
- SyncEngine.ts
- useAppSelector
- flush.ts
- useResponsive.tsx
- authApi.ts
- products.resource.ts
- router.tsx
- CustomerList.tsx
- CatalogPanel.tsx
- hooks.ts
- cartSlice.ts
- search.ts
- dependencies
- EmployeeList.tsx
- SaleDocumentPreviewModal.tsx
- useCategories.ts
- devDependencies
- schema.ts
- BillingCounter.tsx
- syncApi.ts
- formatMoney
- useIsMobile
- compilerOptions
- invoicesApi.ts
- moneyFormUtils.ts
- Backend Requirements — Offline Sync Spec
- purchases.resource.ts
- constants/index.ts
- supplierProducts.resource.ts
- SupplierList.tsx
- AppShell.tsx
- LoginForm.tsx
- PrintJobList.tsx
- submit.ts
- customers.resource.ts
- settingsSlice.ts
- suppliers.resource.ts
- inventory/types.ts
- RequireAuth.tsx
- useSearchHistory.ts
- useSyncData.ts
- generate-icon-shards.mjs
- authSlice.ts
- scripts
- SettingsPage.tsx
- AmountInput.tsx
- ApiClient
- SyncEngine
- SyncProvider.tsx
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- useShortcuts.ts
- MobileSignUpForm.tsx
- common.ts
- EntityListPage.tsx
- Responsive and Mobile Layout Tiers
- package.json
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell, and Router Architecture
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- ProductFormModal.tsx
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
- Sidebar.tsx
- EmployeeDetailDrawer.tsx
- PendingOperationsList.tsx
- saleHeroPresentation.ts
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
10. `ProductTable()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow`  [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `Sidebar()` --indirect_call--> `selectUserRole()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `ProductTable()` --indirect_call--> `selectUserRole()`  [INFERRED]
  src/features/inventory/components/ProductTable.tsx → src/store/slices/authSlice.ts
- `HeldCartCatchupNotifier()` --indirect_call--> `selectIsAuthenticated()`  [INFERRED]
  src/app/components/HeldCartCatchupNotifier.tsx → src/store/slices/authSlice.ts

## Import Cycles
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

## Communities (106 total, 31 thin omitted)

### Community 0 - "offline/constants.ts"
Cohesion: 0.05
Nodes (40): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+32 more)

### Community 1 - "syncSlice.ts"
Cohesion: 0.06
Nodes (44): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+36 more)

### Community 2 - "registry.ts"
Cohesion: 0.07
Nodes (37): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+29 more)

### Community 3 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 4 - "notificationSlice.ts"
Cohesion: 0.17
Nodes (16): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+8 more)

### Community 5 - "SyncEngine.ts"
Cohesion: 0.10
Nodes (29): AUDIT_LOG_LIMIT, STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, toServerRow() (+21 more)

### Community 6 - "useAppSelector"
Cohesion: 0.18
Nodes (22): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+14 more)

### Community 7 - "flush.ts"
Cohesion: 0.09
Nodes (41): ConflictReason, OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap() (+33 more)

### Community 8 - "useResponsive.tsx"
Cohesion: 0.20
Nodes (9): FilterTagChips(), FilterTagChipsProps, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue, LayoutTierProvider(), MEDIA_QUERY_OPTIONS (+1 more)

### Community 9 - "authApi.ts"
Cohesion: 0.19
Nodes (14): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, AuthUser, LoginPayload, LoginResponse (+6 more)

### Community 10 - "products.resource.ts"
Cohesion: 0.13
Nodes (15): MutationRequestOptions, adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct() (+7 more)

### Community 11 - "router.tsx"
Cohesion: 0.10
Nodes (19): App(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList (+11 more)

### Community 12 - "CustomerList.tsx"
Cohesion: 0.15
Nodes (28): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal() (+20 more)

### Community 13 - "CatalogPanel.tsx"
Cohesion: 0.16
Nodes (20): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, ServiceJobPickerModal(), ServiceJobPickerModalProps (+12 more)

### Community 14 - "hooks.ts"
Cohesion: 0.09
Nodes (25): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProvidersProps, AuthInitializer(), DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createReduxColorSchemeManager() (+17 more)

### Community 15 - "cartSlice.ts"
Cohesion: 0.11
Nodes (29): PaymentMethod, CartLineItemProps, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+21 more)

### Community 16 - "search.ts"
Cohesion: 0.14
Nodes (26): ProductCatalogTreeProps, ProductHierarchy, Product, EnrichedLinkedProduct, SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex() (+18 more)

### Community 17 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "EmployeeList.tsx"
Cohesion: 0.10
Nodes (19): ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings() (+11 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.15
Nodes (22): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, StandalonePrintView(), useInvoiceDocument() (+14 more)

### Community 20 - "useCategories.ts"
Cohesion: 0.20
Nodes (19): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+11 more)

### Community 21 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "schema.ts"
Cohesion: 0.12
Nodes (27): StockMovement, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, db, MirrorTableName, OfflineDb, AuditEvent (+19 more)

### Community 23 - "BillingCounter.tsx"
Cohesion: 0.16
Nodes (24): Header(), HeaderProps, completeSale(), BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+16 more)

### Community 24 - "syncApi.ts"
Cohesion: 0.16
Nodes (19): PULL_PAGE_LIMIT, defineSyncResource(), registerSyncResource(), registerSyncResources(), purchasesResource, stockMovementsResource, ApiEnvelope, fetchResourceDelta() (+11 more)

### Community 25 - "formatMoney"
Cohesion: 0.14
Nodes (16): fetchInvoices(), CartLineItem, CartPanelProps, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, InvoiceDetailDrawer() (+8 more)

### Community 26 - "useIsMobile"
Cohesion: 0.16
Nodes (32): ProductCatalogTree, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useAllProducts(), useCreateProduct(), useDeleteProducts() (+24 more)

### Community 27 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "invoicesApi.ts"
Cohesion: 0.12
Nodes (19): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+11 more)

### Community 29 - "moneyFormUtils.ts"
Cohesion: 0.20
Nodes (17): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, MoneyInput(), MoneyInputProps, fromCents() (+9 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "purchases.resource.ts"
Cohesion: 0.24
Nodes (11): createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+3 more)

### Community 32 - "constants/index.ts"
Cohesion: 0.21
Nodes (18): queryKeys, JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps (+10 more)

### Community 33 - "supplierProducts.resource.ts"
Cohesion: 0.23
Nodes (13): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProduct (+5 more)

### Community 34 - "SupplierList.tsx"
Cohesion: 0.15
Nodes (22): FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS (+14 more)

### Community 35 - "AppShell.tsx"
Cohesion: 0.17
Nodes (12): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+4 more)

### Community 36 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 37 - "PrintJobList.tsx"
Cohesion: 0.14
Nodes (28): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJob(), deletePrintJobs(), fetchPrintJobs() (+20 more)

### Community 38 - "submit.ts"
Cohesion: 0.33
Nodes (10): assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), createLocalId(), LOCAL_ID_PREFIX, randomUuid(), assertOutboxHasCapacity(), enqueueOperation() (+2 more)

### Community 39 - "customers.resource.ts"
Cohesion: 0.21
Nodes (12): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+4 more)

### Community 40 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): STORAGE_KEYS, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 41 - "suppliers.resource.ts"
Cohesion: 0.33
Nodes (8): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), toLocalRow(), suppliersResource

### Community 42 - "inventory/types.ts"
Cohesion: 0.13
Nodes (23): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), BarcodeSource, Category (+15 more)

### Community 43 - "RequireAuth.tsx"
Cohesion: 0.21
Nodes (11): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+3 more)

### Community 44 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 45 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 46 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 47 - "authSlice.ts"
Cohesion: 0.25
Nodes (12): getMeApi(), cacheSession(), clearCachedSession(), readCachedSession(), SESSION_RECORD_ID, authSlice, AuthState, initializeAuth (+4 more)

### Community 48 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 49 - "SettingsPage.tsx"
Cohesion: 0.26
Nodes (10): SettingsPage, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS (+2 more)

### Community 50 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 51 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 53 - "SyncProvider.tsx"
Cohesion: 0.58
Nodes (7): clearConnectivityNotification(), notifyBackOnline(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider()

### Community 54 - "Offline-First Dexie Mirror and Outbox Engine"
Cohesion: 0.25
Nodes (8): Backend Sync, Multiplexed Delta, and Idempotency Contract, Connectivity Monitor and Asymmetric Hysteresis, CSS Variable Design Tokens and Dark Mode System, Offline Authentication and Grace Period, Offline-First Dexie Mirror and Outbox Engine, PWA Shell Pre-caching and API Guard Policy, Redux Toolkit State Architecture, Sync Resource Descriptor Protocol

### Community 55 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 56 - "useShortcuts.ts"
Cohesion: 0.36
Nodes (7): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope, useAppShortcuts()

### Community 57 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 58 - "common.ts"
Cohesion: 0.21
Nodes (10): BackendPaymentRecord, fetchPaymentsForInvoice(), PaymentListResponseData, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), ApiResponse (+2 more)

### Community 59 - "EntityListPage.tsx"
Cohesion: 0.28
Nodes (6): EntityListPage(), EntityListPageProps, PageHeader(), PageHeaderProps, SegmentedToggle(), SegmentedToggleProps

### Community 60 - "Responsive and Mobile Layout Tiers"
Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"
Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 69 - "ProductFormModal.tsx"
Cohesion: 0.27
Nodes (10): CURRENCY, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories(), CreateProductInput (+2 more)

### Community 101 - "Sidebar.tsx"
Cohesion: 0.27
Nodes (7): Sidebar(), SidebarProps, NAV_ITEMS, NavItemConfig, LowStockNotifier(), notifiedProductIds, useLowStockProducts()

### Community 102 - "EmployeeDetailDrawer.tsx"
Cohesion: 0.31
Nodes (6): EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, DetailDrawer(), DetailDrawerProps, PhoneDisplay(), PhoneDisplayProps

### Community 103 - "PendingOperationsList.tsx"
Cohesion: 0.27
Nodes (8): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, discardOperation(), retryOperation(), EmptyState(), EmptyStateProps

## Knowledge Gaps
- **324 isolated node(s):** `AppProvidersProps`, `StatusPresentation`, `QueryConnectivityStatus`, `AuthState`, `initialState` (+319 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `syncSlice.ts`, `notificationSlice.ts`, `useResponsive.tsx`, `CustomerList.tsx`, `CatalogPanel.tsx`, `EmployeeList.tsx`, `SaleDocumentPreviewModal.tsx`, `useCategories.ts`, `BillingCounter.tsx`, `formatMoney`, `moneyFormUtils.ts`, `constants/index.ts`, `SupplierList.tsx`, `AppShell.tsx`, `LoginForm.tsx`, `AmountInput.tsx`, `ProductFormModal.tsx`, `Sidebar.tsx`, `EmployeeDetailDrawer.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `syncSlice.ts`, `AppShell.tsx`, `notificationSlice.ts`, `Sidebar.tsx`, `authApi.ts`, `RequireAuth.tsx`, `hooks.ts`, `cartSlice.ts`, `SaleDocumentPreviewModal.tsx`, `SyncProvider.tsx`, `BillingCounter.tsx`, `useIsMobile`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `authSlice.ts`, `SyncEngine.ts`, `schema.ts`, `flush.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `AppProvidersProps`, `StatusPresentation`, `QueryConnectivityStatus` to the rest of the system?**
  _324 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0547945205479452 - nodes in this community are weakly interconnected._
- **Should `syncSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06292966684294024 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07294117647058823 - nodes in this community are weakly interconnected._