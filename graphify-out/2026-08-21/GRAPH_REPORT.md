# Graph Report - frontend (2026-08-21)

## Corpus Check

- 327 files · ~168,736 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1744 nodes · 5364 edges · 111 communities (80 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `29d36592`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ReportsDashboard.tsx
- notificationSlice.ts
- useAppSelector
- registry.ts
- formatMoney
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- db
- tablerIcons.ts
- client.ts
- providers.tsx
- dependencies
- inventory/types.ts
- money.ts
- EmployeeList.tsx
- authSlice.ts
- devDependencies
- flush.ts
- RepairFormModal.tsx
- invoicesApi.ts
- search.ts
- compilerOptions
- BillingCounter.tsx
- PendingOperationsList.tsx
- PrintJobList.tsx
- useIsMobile
- ApiResponse
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- pull.test.ts
- ConnectivityMonitor
- SyncPanel.tsx
- InvoicesList.tsx
- common.ts
- router.tsx
- SupplierList.tsx
- SyncEngine.ts
- SyncEngine
- Sidebar.tsx
- settingsSlice.ts
- ProductCatalogTree.tsx
- Invoice
- useResponsive.tsx
- useSearchHistory.ts
- CustomerList.tsx
- SettingsNav.tsx
- useShortcuts.ts
- useInventoryStats.ts
- useSyncData.ts
- purchasesApi.ts
- useRepairStats.ts
- useCategories.ts
- EmployeeDetailDrawer.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- RepairJobList.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
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
- vite-plugin-pwa

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 64 edges
3. `formatMoney()` - 61 edges
4. `useSyncedMutation()` - 46 edges
5. `useAppDispatch` - 44 edges
6. `db` - 42 edges
7. `queryKeys` - 33 edges
8. `useSyncedQuery()` - 33 edges
9. `ConnectivityMonitor` - 30 edges
10. `fetchResourceDelta()` - 29 edges

## Surprising Connections (you probably didn't know these)

- `build-and-deploy Job` --conceptually_related_to--> `Post-Change Verification Rule` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Build Step (npm run build)` --references--> `npm run build` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Lint Step (npm run lint)` --references--> `npm run lint` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `Type Check Step (npm run type-check)` --references--> `npm run type-check` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `paths-ignore Trigger Filter` --shares_data_with--> `graphify Knowledge Graph Integration` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md

## Import Cycles

- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)

- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (111 total, 31 thin omitted)

### Community 0 - "ReportsDashboard.tsx"

Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 1 - "notificationSlice.ts"

Cohesion: 0.09
Nodes (29): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+21 more)

### Community 2 - "useAppSelector"

Cohesion: 0.17
Nodes (25): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+17 more)

### Community 3 - "registry.ts"

Cohesion: 0.09
Nodes (26): getAllSyncMeta(), resolvePullTargets(), RFC-3339, reclaimInflightOperations(), getReferringResources(), getResourcesInDependencyOrder(), registerSyncResource(), resetRegistry() (+18 more)

### Community 4 - "formatMoney"

Cohesion: 0.15
Nodes (17): PAYMENT_METHODS, CartLineItem, DiscountPopover(), DiscountPopoverProps, PaymentPanel, getCategoryIconInfo(), getSaleHeroPresentation(), SaleHeroPresentation (+9 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.18
Nodes (20): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+12 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.10
Nodes (34): PaymentMethod, CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+26 more)

### Community 7 - "db"

Cohesion: 0.06
Nodes (94): MutationRequestOptions, queryKeys, cancelInvoice(), completeSale(), BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput (+86 more)

### Community 8 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 9 - "client.ts"

Cohesion: 0.14
Nodes (13): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners (+5 more)

### Community 10 - "providers.tsx"

Cohesion: 0.13
Nodes (14): App(), AppProviders(), AppProvidersProps, router, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), container (+6 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"

Cohesion: 0.11
Nodes (20): ProductListParams, ProductsPageData, FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories(), BarcodeSource (+12 more)

### Community 13 - "money.ts"

Cohesion: 0.18
Nodes (14): CURRENCY, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, ProductFormContent(), RepairFormModal(), MoneyInput(), MoneyInputProps (+6 more)

### Community 14 - "EmployeeList.tsx"

Cohesion: 0.11
Nodes (19): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+11 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.11
Nodes (28): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AuthInitializer(), AppRoute, ROUTE_PATHS (+20 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.08
Nodes (55): OutboxError, assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), abandonMapping(), DROP_ELEMENT, isRecord() (+47 more)

### Community 18 - "RepairFormModal.tsx"

Cohesion: 0.25
Nodes (18): JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput, PrintJobType (+10 more)

### Community 20 - "invoicesApi.ts"

Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+7 more)

### Community 21 - "search.ts"

Cohesion: 0.16
Nodes (23): SearchHighlightProps, useBackendFilteredList(), UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar() (+15 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "BillingCounter.tsx"

Cohesion: 0.14
Nodes (26): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+18 more)

### Community 24 - "PendingOperationsList.tsx"

Cohesion: 0.25
Nodes (9): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxOp, OutboxStatus, discardOperation(), retryOperation(), EmptyState() (+1 more)

### Community 25 - "PrintJobList.tsx"

Cohesion: 0.21
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS (+6 more)

### Community 26 - "useIsMobile"

Cohesion: 0.15
Nodes (23): ProductPickerModal(), useAllProducts(), Subcategory, ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase() (+15 more)

### Community 27 - "ApiResponse"

Cohesion: 0.18
Nodes (15): BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchPrintJobStats(), PrintJobStats (+7 more)

### Community 28 - "ProductTable.tsx"

Cohesion: 0.13
Nodes (29): fetchProducts(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+21 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.10
Nodes (24): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, DEGRADED_LATENCY_MS, HEADER_IDEMPOTENCY_KEY, HEADER_IF_MATCH (+16 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "pull.test.ts"

Cohesion: 0.12
Nodes (24): readServerVersion(), toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+16 more)

### Community 33 - "SyncPanel.tsx"

Cohesion: 0.10
Nodes (32): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+24 more)

### Community 34 - "InvoicesList.tsx"

Cohesion: 0.13
Nodes (21): fetchInvoices(), useAllInvoices(), ProductPickerModalProps, applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), SupplierPickerModalProps (+13 more)

### Community 35 - "common.ts"

Cohesion: 0.17
Nodes (15): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+7 more)

### Community 36 - "router.tsx"

Cohesion: 0.15
Nodes (12): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, RepairJobList, StandalonePrintView, ROUTES (+4 more)

### Community 37 - "SupplierList.tsx"

Cohesion: 0.13
Nodes (25): SupplierList, fetchSuppliers(), SupplierListParams, SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters() (+17 more)

### Community 38 - "SyncEngine.ts"

Cohesion: 0.11
Nodes (18): ConnectivitySnapshot, PULL_INTERVAL_MS, SyncMetaRecord, pruneConfirmedLedgerEntries(), FlushCompleteListener, SyncEngineListener, SyncEngineState, SyncedQueryResult (+10 more)

### Community 39 - "SyncEngine"

Cohesion: 0.14
Nodes (9): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection (+1 more)

### Community 40 - "Sidebar.tsx"

Cohesion: 0.13
Nodes (17): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+9 more)

### Community 41 - "settingsSlice.ts"

Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "ProductCatalogTree.tsx"

Cohesion: 0.25
Nodes (12): ProductTable, CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+4 more)

### Community 43 - "Invoice"

Cohesion: 0.11
Nodes (23): InvoicesList, CompleteSaleResult, ProcessReturnItemInput, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, useInvoicePayments(), useRecordPayment() (+15 more)

### Community 44 - "useResponsive.tsx"

Cohesion: 0.11
Nodes (21): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer(), HeldSalesDrawerProps (+13 more)

### Community 45 - "useSearchHistory.ts"

Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 46 - "CustomerList.tsx"

Cohesion: 0.10
Nodes (36): resolveOrCreateCustomer(), fetchAllCustomers(), fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps (+28 more)

### Community 47 - "SettingsNav.tsx"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 48 - "useShortcuts.ts"

Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 49 - "useInventoryStats.ts"

Cohesion: 0.70
Nodes (3): fetchInventoryStats(), InventoryStats, useInventoryStats()

### Community 50 - "useSyncData.ts"

Cohesion: 0.21
Nodes (12): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, useResolvedId(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS (+4 more)

### Community 51 - "purchasesApi.ts"

Cohesion: 0.60
Nodes (4): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams

### Community 52 - "useRepairStats.ts"

Cohesion: 0.70
Nodes (3): fetchRepairStats(), RepairStats, useRepairStats()

### Community 54 - "useCategories.ts"

Cohesion: 0.11
Nodes (24): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCreateCategory(), useCreateSubcategory() (+16 more)

### Community 56 - "EmployeeDetailDrawer.tsx"

Cohesion: 0.20
Nodes (12): fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord (+4 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"

Cohesion: 0.08
Nodes (36): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+28 more)

### Community 60 - "SyncProvider.tsx"

Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 61 - "App Entry Chain"

Cohesion: 0.20
Nodes (10): Deploy Frontend Workflow, paths-ignore Trigger Filter, AppShell.tsx, cssVariablesResolver.ts Design Tokens, App Entry Chain, Feature Module Pattern (components/, types.ts, index.ts barrel), graphify Knowledge Graph Integration, @/* Path Alias (+2 more)

### Community 62 - "Animation Performance Rules"

Cohesion: 0.29
Nodes (10): AmountInput.tsx, Animation Performance Rules, BillingRegions.tsx, CartLineItem.tsx, CartPanel.tsx, CatalogPanel.tsx, LayoutTierProvider, Responsive & Mobile UI Layout Tiers (+2 more)

### Community 63 - "Offline & Sync Architecture"

Cohesion: 0.27
Nodes (10): ApiClient (src/api/client.ts), AppUpdatePrompt.tsx, Backend Sync Contract (Rust/Axum), ConnectivityMonitor, isBillingBoundaryChange Render-Time State Adjustment, localId.ts (Provisional local_ IDs), Offline & Sync Architecture, Durable Outbox Pattern (+2 more)

### Community 64 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 67 - "RepairJobList.tsx"

Cohesion: 0.18
Nodes (14): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+6 more)

### Community 68 - "Redux Toolkit Store (src/store/)"

Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"

Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

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

Cohesion: 0.25
Nodes (14): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+6 more)

## Knowledge Gaps

- **353 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `InvoicesList.tsx`, `common.ts`, `formatMoney`, `SaleDocumentPreviewModal.tsx`, `SupplierList.tsx`, `SyncPanel.tsx`, `Sidebar.tsx`, `Invoice`, `useResponsive.tsx`, `inventory/types.ts`, `CustomerList.tsx`, `money.ts`, `RepairFormModal.tsx`, `useCategories.ts`, `BillingCounter.tsx`, `EmployeeDetailDrawer.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `SyncPanel.tsx`, `formatMoney`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `SyncEngine.ts`, `Sidebar.tsx`, `providers.tsx`, `Invoice`, `useResponsive.tsx`, `SyncProvider.tsx`, `authSlice.ts`, `search.ts`, `BillingCounter.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `SyncEngine.ts`, `authSlice.ts`, `flush.ts`, `schema.ts`, `offline/constants.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08943089430894309 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09206349206349207 - nodes in this community are weakly interconnected._
- **Should `formatMoney` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._
