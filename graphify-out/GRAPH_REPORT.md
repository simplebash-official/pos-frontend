# Graph Report - frontend  (2026-08-21)

## Corpus Check
- 322 files · ~164,619 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1711 nodes · 5218 edges · 114 communities (82 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4501cfb4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ReportsDashboard.tsx
- notificationSlice.ts
- useAppSelector
- auth/index.ts
- BillingCounter.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- registry.ts
- syncApi.ts
- purchasesApi.ts
- AppShell.tsx
- dependencies
- inventory/types.ts
- CustomerList.tsx
- EmployeeList.tsx
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobFormModal.tsx
- tablerIconShards/index.ts
- router.tsx
- search.ts
- compilerOptions
- ConnectivityMonitor
- outbox.ts
- PrintJobList.tsx
- offline/constants.ts
- db
- ProductTable.tsx
- ConnectivityMonitor.ts
- Backend Sync Requirements Doc
- offline/types.ts
- providers.tsx
- products.resource.ts
- client.ts
- outbox.test.ts
- invoicesApi.ts
- SupplierList.tsx
- syncSlice.ts
- SyncEngine
- PaymentPanel.tsx
- settingsSlice.ts
- CatalogPanel.tsx
- categories.resource.ts
- formatMoney
- repairs.resource.ts
- customers.resource.ts
- @mantine/form
- ApiClient
- LogoUpload.tsx
- react-dom
- @tanstack/react-query
- printJobs.resource.ts
- SyncEngine.ts
- supplierProducts.resource.ts
- money.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- SegmentedToggle.tsx
- RepairJobList.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- useResponsive.tsx
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- audio.ts
- billing/types.ts
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- useShortcuts.ts
- vite-plugin-pwa
- prettier
- typescript
- typescript-eslint
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
- useIsMobile

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 72 edges
2. `useAppSelector` - 62 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 39 edges
7. `queryKeys` - 32 edges
8. `ConnectivityMonitor` - 30 edges
9. `useSyncedQuery()` - 30 edges
10. `ApiClient` - 27 edges

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
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
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

## Communities (114 total, 32 thin omitted)

### Community 0 - "ReportsDashboard.tsx"
Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 1 - "notificationSlice.ts"
Cohesion: 0.07
Nodes (39): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+31 more)

### Community 2 - "useAppSelector"
Cohesion: 0.14
Nodes (30): Header(), HeaderProps, useCartSound(), usePrint(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+22 more)

### Community 3 - "auth/index.ts"
Cohesion: 0.24
Nodes (11): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+3 more)

### Community 4 - "BillingCounter.tsx"
Cohesion: 0.20
Nodes (17): BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps (+9 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.19
Nodes (17): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult (+9 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (32): PaymentMethod, CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+24 more)

### Community 7 - "registry.ts"
Cohesion: 0.12
Nodes (30): MutationRequestOptions, cancelInvoice(), completeSale(), BackendPaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), createPurchase() (+22 more)

### Community 8 - "syncApi.ts"
Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 9 - "purchasesApi.ts"
Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 10 - "AppShell.tsx"
Cohesion: 0.14
Nodes (18): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT (+10 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"
Cohesion: 0.14
Nodes (21): ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories() (+13 more)

### Community 13 - "CustomerList.tsx"
Cohesion: 0.08
Nodes (45): fetchInvoices(), useAllInvoices(), fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps (+37 more)

### Community 14 - "EmployeeList.tsx"
Cohesion: 0.12
Nodes (17): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES (+9 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.10
Nodes (32): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+24 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.09
Nodes (40): ConflictReason, OutboxError, AbandonedReferenceError, CursorInvalidError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord() (+32 more)

### Community 18 - "PrintJobFormModal.tsx"
Cohesion: 0.33
Nodes (11): JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput, PrintJobType (+3 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"
Cohesion: 0.09
Nodes (20): App(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, ProductTable (+12 more)

### Community 21 - "search.ts"
Cohesion: 0.16
Nodes (22): SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar() (+14 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 24 - "outbox.ts"
Cohesion: 0.12
Nodes (27): stripMirrorMeta(), UNSYNCED_VERSION, MIRROR_TABLE_NAMES, MirrorMeta, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct() (+19 more)

### Community 25 - "PrintJobList.tsx"
Cohesion: 0.21
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS (+6 more)

### Community 26 - "offline/constants.ts"
Cohesion: 0.14
Nodes (16): AUDIT_LOG_LIMIT, MAX_CLOCK_SKEW_MS, MAX_PUSH_ATTEMPTS, NOTIFICATION_ID_CONNECTIVITY, NOTIFICATION_ID_SYNC_ERROR, OFFLINE_DB_NAME, OFFLINE_SESSION_GRACE_MS, OUTBOX_CAPACITY (+8 more)

### Community 27 - "db"
Cohesion: 0.12
Nodes (25): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats() (+17 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.12
Nodes (32): ProductCatalogTree, applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+24 more)

### Community 29 - "ConnectivityMonitor.ts"
Cohesion: 0.12
Nodes (16): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, ConnectivitySnapshot, ConnectivityState, DEGRADED_LATENCY_MS (+8 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "offline/types.ts"
Cohesion: 0.08
Nodes (29): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+21 more)

### Community 32 - "providers.tsx"
Cohesion: 0.12
Nodes (17): AppUpdatePrompt(), AppProvidersProps, AuthInitializer(), LowStockNotifier(), notifiedProductIds, useLowStockProducts(), createReduxColorSchemeManager(), reduxColorSchemeManager (+9 more)

### Community 33 - "products.resource.ts"
Cohesion: 0.15
Nodes (12): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+4 more)

### Community 34 - "client.ts"
Cohesion: 0.14
Nodes (13): isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners, NetworkObservation, observeNetwork(), reportNetworkObservation() (+5 more)

### Community 35 - "outbox.test.ts"
Cohesion: 0.14
Nodes (12): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, discardOperation(), reclaimInflightOperations(), retryOperation(), Widget (+4 more)

### Community 36 - "invoicesApi.ts"
Cohesion: 0.08
Nodes (27): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+19 more)

### Community 37 - "SupplierList.tsx"
Cohesion: 0.15
Nodes (22): EnrichedLinkedSupplier, useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive() (+14 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.05
Nodes (53): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+45 more)

### Community 40 - "PaymentPanel.tsx"
Cohesion: 0.18
Nodes (12): PAYMENT_METHODS, PaymentPanel, getSaleHeroPresentation(), SaleHeroPresentation, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP (+4 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "CatalogPanel.tsx"
Cohesion: 0.13
Nodes (29): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), CatalogCategoryFilter (+21 more)

### Community 43 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 44 - "formatMoney"
Cohesion: 0.24
Nodes (9): CartLineItem, DiscountPopover(), HeldSalesDrawer(), HeldSalesDrawerProps, getCategoryIconInfo(), HEIGHT_MAP, QuantityInput(), QuantityInputProps (+1 more)

### Community 45 - "repairs.resource.ts"
Cohesion: 0.35
Nodes (11): BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData, toRepairJob() (+3 more)

### Community 46 - "customers.resource.ts"
Cohesion: 0.36
Nodes (6): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), customersResource

### Community 48 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 49 - "LogoUpload.tsx"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 52 - "printJobs.resource.ts"
Cohesion: 0.28
Nodes (15): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 53 - "SyncEngine.ts"
Cohesion: 0.11
Nodes (27): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), readServerVersion(), toServerRow(), AuditLevel (+19 more)

### Community 55 - "supplierProducts.resource.ts"
Cohesion: 0.21
Nodes (15): Subcategory, fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct() (+7 more)

### Community 56 - "money.ts"
Cohesion: 0.20
Nodes (18): CURRENCY, RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJob, RepairJobInput, UpdateRepairPayload, MoneyInput() (+10 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.20
Nodes (17): PaymentRecord, NO_PAYMENTS, StockMovement, MirrorTableName, OfflineDb, AuditEvent, ConflictRecord, IdMapRecord (+9 more)

### Community 60 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

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

### Community 65 - "SegmentedToggle.tsx"
Cohesion: 0.22
Nodes (11): DiscountPopoverProps, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, SegmentedToggle(), SegmentedToggleProps (+3 more)

### Community 67 - "RepairJobList.tsx"
Cohesion: 0.29
Nodes (11): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+3 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "useResponsive.tsx"
Cohesion: 0.15
Nodes (13): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, BillingPageSkeleton(), FILL, below(), LayoutTier, LayoutTierContext (+5 more)

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

### Community 78 - "audio.ts"
Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

### Community 79 - "billing/types.ts"
Cohesion: 0.21
Nodes (10): InvoicesList, useInvoicePayments(), useRecordPayment(), InvoiceItem, getPrintCountForInvoice(), getPrintLogsForInvoice(), PrintLogEntry, printLogStore (+2 more)

### Community 84 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 121 - "useIsMobile"
Cohesion: 0.17
Nodes (22): ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, SupplierFormContent(), SupplierPickerModal(), SupplierPickerModalProps (+14 more)

## Knowledge Gaps
- **346 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+341 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `auth/index.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `AppShell.tsx`, `inventory/types.ts`, `CustomerList.tsx`, `EmployeeList.tsx`, `authSlice.ts`, `PrintJobFormModal.tsx`, `ProductTable.tsx`, `SupplierList.tsx`, `syncSlice.ts`, `PaymentPanel.tsx`, `CatalogPanel.tsx`, `formatMoney`, `money.ts`, `SegmentedToggle.tsx`, `useResponsive.tsx`, `billing/types.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `providers.tsx`, `notificationSlice.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `PaymentPanel.tsx`, `AppShell.tsx`, `CustomerList.tsx`, `SyncProvider.tsx`, `authSlice.ts`, `search.ts`, `ProductTable.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `STORAGE_KEYS` connect `notificationSlice.ts` to `client.ts`, `cartSlice.ts`, `settingsSlice.ts`, `authSlice.ts`, `outbox.ts`, `ConnectivityMonitor.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _346 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06748911465892599 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.14174972314507198 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1066066066066066 - nodes in this community are weakly interconnected._