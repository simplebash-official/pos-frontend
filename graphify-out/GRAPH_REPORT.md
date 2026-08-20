# Graph Report - frontend  (2026-08-20)

## Corpus Check
- 309 files · ~161,162 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1650 nodes · 4952 edges · 110 communities (79 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad5ef8b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- syncSlice.ts
- notificationSlice.ts
- useAppDispatch
- EmployeeList.tsx
- EntityListPage.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- useIsMobile
- offline/types.ts
- syncMeta.ts
- pull.test.ts
- dependencies
- Sidebar.tsx
- search.ts
- RepairJobList.tsx
- schema.ts
- devDependencies
- flush.ts
- constants/index.ts
- tablerIconShards/index.ts
- router.tsx
- products.resource.ts
- compilerOptions
- useResponsive.tsx
- outbox.ts
- customers.resource.ts
- authSlice.ts
- invoicesApi.ts
- supplierProducts.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- money.ts
- LoginForm.tsx
- registry.ts
- common.ts
- RequireAuth.tsx
- useAppSelector
- useSyncedMutation
- SyncEngine
- ApiClient
- PrintJobList.tsx
- settingsSlice.ts
- syncApi.ts
- categories.resource.ts
- useCategories.ts
- useSearchHistory.ts
- app/App.tsx
- @mantine/form
- SupplierDetailDrawer.tsx
- repairs.resource.ts
- react-dom
- @tanstack/react-query
- printJobs.resource.ts
- suppliers.resource.ts
- vite-plugin-pwa
- CatalogPanel.tsx
- SyncEngine.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- tables.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- mockEmployees.ts
- AmountInput.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- providers.tsx
- Right-Side Detail Drawer Visual Family
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
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

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 73 edges
2. `useAppSelector` - 60 edges
3. `formatMoney()` - 58 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 38 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `flushOutbox()` - 27 edges
10. `fetchResourceDelta()` - 27 edges

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
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
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

## Communities (110 total, 31 thin omitted)

### Community 0 - "syncSlice.ts"
Cohesion: 0.05
Nodes (59): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+51 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.09
Nodes (28): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+20 more)

### Community 2 - "useAppDispatch"
Cohesion: 0.13
Nodes (30): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+22 more)

### Community 3 - "EmployeeList.tsx"
Cohesion: 0.21
Nodes (14): fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS, EmployeeInput (+6 more)

### Community 4 - "EntityListPage.tsx"
Cohesion: 0.17
Nodes (10): DiscountPopover(), DiscountPopoverProps, EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, PageHeader(), PageHeaderProps (+2 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.07
Nodes (46): InvoicesList, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+38 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (32): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), SaleHeroPresentation, LineSourceType, SplitPaymentDetail, CartItem (+24 more)

### Community 7 - "useIsMobile"
Cohesion: 0.13
Nodes (32): fetchInvoices(), CartLineItem, getCategoryIconInfo(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps (+24 more)

### Community 8 - "offline/types.ts"
Cohesion: 0.12
Nodes (13): reclaimInflightOperations(), Widget, widgetResource, ConflictPolicy, ConflictStrategy, LocalApplyHandler, LocalApplyResult, LocalContext (+5 more)

### Community 9 - "syncMeta.ts"
Cohesion: 0.18
Nodes (14): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+6 more)

### Community 10 - "pull.test.ts"
Cohesion: 0.14
Nodes (18): readServerVersion(), toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary (+10 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "Sidebar.tsx"
Cohesion: 0.15
Nodes (16): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+8 more)

### Community 13 - "search.ts"
Cohesion: 0.17
Nodes (21): SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar(), MatchRange (+13 more)

### Community 14 - "RepairJobList.tsx"
Cohesion: 0.20
Nodes (14): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload (+6 more)

### Community 15 - "schema.ts"
Cohesion: 0.08
Nodes (46): PaymentRecord, FormContentProps, ProductFormModalProps, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+38 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+30 more)

### Community 18 - "constants/index.ts"
Cohesion: 0.27
Nodes (12): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, RepairFormModalProps, RepairJob (+4 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"
Cohesion: 0.10
Nodes (16): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, ReportsDashboard, SettingsPage, StandalonePrintView, SupplierList (+8 more)

### Community 21 - "products.resource.ts"
Cohesion: 0.21
Nodes (9): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+1 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "useResponsive.tsx"
Cohesion: 0.13
Nodes (18): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal() (+10 more)

### Community 24 - "outbox.ts"
Cohesion: 0.13
Nodes (26): stripMirrorMeta(), UNSYNCED_VERSION, MIRROR_TABLE_NAMES, MirroredRow, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct() (+18 more)

### Community 25 - "customers.resource.ts"
Cohesion: 0.24
Nodes (10): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+2 more)

### Community 26 - "authSlice.ts"
Cohesion: 0.30
Nodes (10): getMeApi(), cacheSession(), clearCachedSession(), readCachedSession(), authSlice, initializeAuth, initialState, isNetworkError() (+2 more)

### Community 27 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (16): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+8 more)

### Community 28 - "supplierProducts.resource.ts"
Cohesion: 0.38
Nodes (8): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), supplierProductsResource

### Community 29 - "offline/constants.ts"
Cohesion: 0.05
Nodes (43): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+35 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "money.ts"
Cohesion: 0.19
Nodes (18): CURRENCY, ProductFormContent(), SupplierIntakeRow, useValidCategories(), BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobType (+10 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 33 - "registry.ts"
Cohesion: 0.20
Nodes (20): queryKeys, cancelInvoice(), completeSale(), RecordPaymentInput, createPurchase(), toLocalRow(), db, appendStockDelta() (+12 more)

### Community 34 - "common.ts"
Cohesion: 0.21
Nodes (11): MutationRequestOptions, BackendPaymentRecord, recordPayment(), toPaymentRecord(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams (+3 more)

### Community 35 - "RequireAuth.tsx"
Cohesion: 0.20
Nodes (10): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+2 more)

### Community 36 - "useAppSelector"
Cohesion: 0.15
Nodes (28): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+20 more)

### Community 37 - "useSyncedMutation"
Cohesion: 0.16
Nodes (24): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps (+16 more)

### Community 39 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 40 - "PrintJobList.tsx"
Cohesion: 0.29
Nodes (10): PrintJobList, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), PrintJobInput (+2 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "syncApi.ts"
Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 43 - "categories.resource.ts"
Cohesion: 0.40
Nodes (7): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), categoriesResource

### Community 44 - "useCategories.ts"
Cohesion: 0.11
Nodes (30): ProductTable, CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree (+22 more)

### Community 45 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 46 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 48 - "SupplierDetailDrawer.tsx"
Cohesion: 0.17
Nodes (21): ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase() (+13 more)

### Community 49 - "repairs.resource.ts"
Cohesion: 0.32
Nodes (12): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), RepairListResponseData, toRepairJob() (+4 more)

### Community 52 - "printJobs.resource.ts"
Cohesion: 0.39
Nodes (10): deleteEarningRecordsForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData, toPrintJob(), updatePrintJobRaw(), creditCommission() (+2 more)

### Community 53 - "suppliers.resource.ts"
Cohesion: 0.30
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), markDeleted(), markPending() (+1 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.13
Nodes (26): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+18 more)

### Community 56 - "SyncEngine.ts"
Cohesion: 0.13
Nodes (17): STORAGE_QUOTA_WARN_RATIO, ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, logError(), logInfo(), logSyncEvent() (+9 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "tables.ts"
Cohesion: 0.15
Nodes (16): AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, OFFLINE_SESSION_GRACE_MS, AuditLevel, ConflictReason (+8 more)

### Community 60 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

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

### Community 65 - "mockEmployees.ts"
Cohesion: 0.12
Nodes (15): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees(), INITIAL_EARNINGS (+7 more)

### Community 66 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

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

### Community 76 - "providers.tsx"
Cohesion: 0.11
Nodes (18): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppShell(), AppProvidersProps, AuthInitializer(), DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN (+10 more)

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

## Knowledge Gaps
- **335 isolated node(s):** `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps`, `SyncDrawerProps`, `SyncStatusBadgeProps` (+330 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `SyncEngine.ts`, `outbox.ts`, `authSlice.ts`, `flush.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `syncSlice.ts`, `notificationSlice.ts`, `useAppDispatch`, `RequireAuth.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `providers.tsx`, `Sidebar.tsx`, `schema.ts`, `SupplierDetailDrawer.tsx`, `useResponsive.tsx`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `notificationSlice.ts`, `syncSlice.ts`, `EmployeeList.tsx`, `useAppSelector`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `useSyncedMutation`, `AmountInput.tsx`, `EntityListPage.tsx`, `Sidebar.tsx`, `useCategories.ts`, `schema.ts`, `SupplierDetailDrawer.tsx`, `constants/index.ts`, `CatalogPanel.tsx`, `useResponsive.tsx`, `money.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps` to the rest of the system?**
  _335 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `syncSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09024390243902439 - nodes in this community are weakly interconnected._
- **Should `useAppDispatch` be split into smaller, more focused modules?**
  _Cohesion score 0.1254355400696864 - nodes in this community are weakly interconnected._