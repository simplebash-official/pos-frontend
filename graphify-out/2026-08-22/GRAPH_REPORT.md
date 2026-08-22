# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~176,258 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1798 nodes · 5570 edges · 111 communities (81 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04d70aba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pull.ts
- notificationSlice.ts
- useAppSelector
- registry.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- EmployeeList.tsx
- InvoiceDetailDrawer.tsx
- router.tsx
- dependencies
- money.ts
- SyncEngine.ts
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- creditNotes.resource.ts
- tablerIconShards/index.ts
- SupplierList.tsx
- ReportsDashboard.tsx
- compilerOptions
- useCategories.ts
- offline/index.ts
- invoicesApi.ts
- settingsSlice.ts
- queryKeys.ts
- providers.tsx
- client.ts
- Backend Sync Requirements Doc
- Sidebar.tsx
- LoginForm.tsx
- useIsMobile
- PrintJobList.tsx
- authApi.ts
- SyncProvider.tsx
- RepairJobList.tsx
- syncSlice.ts
- @mantine/form
- inventory/types.ts
- RequireAuth.tsx
- useSyncData.ts
- suppliers.resource.ts
- vite-plugin-pwa
- toLocalRow
- supplierProducts.resource.ts
- app/App.tsx
- syncApi.ts
- ProductTable.tsx
- AppShell.tsx
- categories.resource.ts
- CatalogPanel.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- BillingCounter.tsx
- formatMoney
- products.resource.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- mockEmployees.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- AmountInput.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- ApiClient
- ProductCatalogTree.tsx
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

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 76 edges
2. `useAppSelector` - 66 edges
3. `formatMoney()` - 61 edges
4. `useSyncedMutation()` - 48 edges
5. `db` - 44 edges
6. `useAppDispatch` - 42 edges
7. `queryKeys` - 35 edges
8. `useSyncedQuery()` - 33 edges
9. `ConnectivityMonitor` - 30 edges
10. `flushOutbox()` - 29 edges

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
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
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

## Communities (111 total, 30 thin omitted)

### Community 0 - "pull.ts"
Cohesion: 0.11
Nodes (28): toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+20 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.06
Nodes (44): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+36 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (33): Sidebar(), LowStockNotifier(), notifiedProductIds, useLowStockProducts(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues (+25 more)

### Community 3 - "registry.ts"
Cohesion: 0.10
Nodes (22): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, mockStatus() (+14 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.07
Nodes (36): BackendCreditNote, BackendCreditNoteExchangeItem, BackendCreditNoteItem, CreateCreditNoteExchangeItemInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+28 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.13
Nodes (23): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModalProps, StandalonePrintView() (+15 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (33): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), getSaleHeroPresentation(), SaleHeroPresentation, LineSourceType, SplitPaymentDetail (+25 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 8 - "EmployeeList.tsx"
Cohesion: 0.13
Nodes (20): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, EmployeeInput, EmployeeRole (+12 more)

### Community 9 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.13
Nodes (22): CompleteSaleInput, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal(), useInvoiceCreditNotes(), NO_INVOICES, useCloseInvoice(), useVoidInvoice() (+14 more)

### Community 10 - "router.tsx"
Cohesion: 0.11
Nodes (16): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList, RepairJobList, StandalonePrintView (+8 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "money.ts"
Cohesion: 0.21
Nodes (17): CURRENCY, ProductFormContent(), RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJob, MoneyInput(), MoneyInputProps (+9 more)

### Community 13 - "SyncEngine.ts"
Cohesion: 0.10
Nodes (21): PULL_INTERVAL_MS, SYNC_LEADER_LOCK, ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES (+13 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.23
Nodes (13): AuthInitializer(), getMeApi(), OFFLINE_SESSION_GRACE_MS, cacheSession(), clearCachedSession(), readCachedSession(), SESSION_RECORD_ID, authSlice (+5 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.09
Nodes (45): OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+37 more)

### Community 18 - "creditNotes.resource.ts"
Cohesion: 0.40
Nodes (9): createCreditNote(), CreateCreditNoteInput, fetchCreditNotes(), toCreditNote(), voidCreditNote(), markPending(), CreateCreditNotePayload, creditNotesResource (+1 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "SupplierList.tsx"
Cohesion: 0.13
Nodes (25): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters (+17 more)

### Community 21 - "ReportsDashboard.tsx"
Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "useCategories.ts"
Cohesion: 0.14
Nodes (20): AddSubcategoryRow(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCategoryLookup(), useCreateCategory() (+12 more)

### Community 24 - "offline/index.ts"
Cohesion: 0.14
Nodes (20): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct() (+12 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+16 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.13
Nodes (17): SettingsPage, renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption (+9 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.14
Nodes (20): queryKeys, BillingStats, fetchBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats (+12 more)

### Community 28 - "providers.tsx"
Cohesion: 0.18
Nodes (10): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProvidersProps, selectHeldCarts(), darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars (+2 more)

### Community 29 - "client.ts"
Cohesion: 0.06
Nodes (36): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+28 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "Sidebar.tsx"
Cohesion: 0.17
Nodes (12): RequireAdmin(), RequireAdminProps, SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, USER_ROLE_LABELS (+4 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 33 - "useIsMobile"
Cohesion: 0.11
Nodes (33): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, fetchEmployeeEarnings(), EmployeeDetailDrawer(), ProductPickerModal(), ProductPickerModalProps, useAllProducts() (+25 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.18
Nodes (20): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, PrintJobFormModalProps, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters (+12 more)

### Community 35 - "authApi.ts"
Cohesion: 0.36
Nodes (8): UserRole, AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession, AuthState

### Community 36 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.20
Nodes (17): SplitType, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob() (+9 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.07
Nodes (43): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+35 more)

### Community 40 - "inventory/types.ts"
Cohesion: 0.18
Nodes (17): FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput, ProductListResponse (+9 more)

### Community 41 - "RequireAuth.tsx"
Cohesion: 0.21
Nodes (11): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+3 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 45 - "toLocalRow"
Cohesion: 0.23
Nodes (13): createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+5 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.30
Nodes (10): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), markDeleted() (+2 more)

### Community 47 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 48 - "syncApi.ts"
Cohesion: 0.14
Nodes (25): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, PULL_PAGE_LIMIT, defineSyncResource() (+17 more)

### Community 52 - "ProductTable.tsx"
Cohesion: 0.16
Nodes (24): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useInventoryStats(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+16 more)

### Community 53 - "AppShell.tsx"
Cohesion: 0.19
Nodes (14): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, useLayoutTier(), activeScopes (+6 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.20
Nodes (14): MutationRequestOptions, createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput (+6 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.25
Nodes (13): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+5 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.15
Nodes (23): NO_CREDIT_NOTES, useCreditNotes(), useVoidCreditNote(), AUDIT_LOG_LIMIT, db, MirrorTableName, OfflineDb, AuditEvent (+15 more)

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

### Community 65 - "BillingCounter.tsx"
Cohesion: 0.15
Nodes (25): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+17 more)

### Community 66 - "formatMoney"
Cohesion: 0.05
Nodes (82): useBillingStats(), useAllInvoices(), createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer() (+74 more)

### Community 67 - "products.resource.ts"
Cohesion: 0.13
Nodes (16): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+8 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "mockEmployees.ts"
Cohesion: 0.13
Nodes (10): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+2 more)

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

### Community 79 - "AmountInput.tsx"
Cohesion: 0.19
Nodes (10): DiscountPopover(), DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP (+2 more)

### Community 83 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 84 - "ProductCatalogTree.tsx"
Cohesion: 0.17
Nodes (17): ProductTable, CartLineItem, CatalogCategoryFilter, CategoryIconInfo, getCategoryIconInfo(), CategoryItem(), ProductCatalogTree, ProductCatalogTreeProps (+9 more)

## Knowledge Gaps
- **368 isolated node(s):** `CreditNoteModalProps`, `SerialUnitState`, `LineState`, `ExchangeLine`, `PullSummary` (+363 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `BillingCounter.tsx`, `notificationSlice.ts`, `useIsMobile`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `SyncProvider.tsx`, `RequireAuth.tsx`, `InvoiceDetailDrawer.tsx`, `formatMoney`, `ProductTable.tsx`, `AppShell.tsx`, `providers.tsx`, `Sidebar.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `client.ts` to `syncSlice.ts`, `SyncEngine.ts`, `authSlice.ts`, `flush.ts`, `offline/index.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `EmployeeList.tsx`, `InvoiceDetailDrawer.tsx`, `money.ts`, `SupplierList.tsx`, `useCategories.ts`, `Sidebar.tsx`, `LoginForm.tsx`, `PrintJobList.tsx`, `syncSlice.ts`, `inventory/types.ts`, `ProductTable.tsx`, `BillingCounter.tsx`, `formatMoney`, `products.resource.ts`, `AmountInput.tsx`, `ProductCatalogTree.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `CreditNoteModalProps`, `SerialUnitState`, `LineState` to the rest of the system?**
  _368 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pull.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06078316773816481 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12560386473429952 - nodes in this community are weakly interconnected._