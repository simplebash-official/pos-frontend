# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~178,197 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1819 nodes · 5614 edges · 112 communities (79 shown, 33 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f720571e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ConnectivityMonitor.ts
- notificationSlice.ts
- useAppSelector
- offline/index.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- InvoiceDetailDrawer.tsx
- PrintJobList.tsx
- router.tsx
- dependencies
- RequireAuth.tsx
- SyncEngine.ts
- formatMoney
- SearchHistoryInput.tsx
- devDependencies
- flush.ts
- creditNotesApi.ts
- tablerIconShards/index.ts
- ProductTable.tsx
- providers.tsx
- compilerOptions
- authSlice.ts
- customers.resource.ts
- invoicesApi.ts
- SettingsPage.tsx
- queryKeys.ts
- products.resource.ts
- ConnectivityMonitor
- Backend Sync Requirements Doc
- syncApi.ts
- LoginForm.tsx
- money.ts
- print-jobs/types.ts
- inventory/types.ts
- repairs.resource.ts
- LeaderElection
- syncSlice.ts
- @mantine/form
- AmountInput.tsx
- client.ts
- useSyncData.ts
- SupplierList.tsx
- vite-plugin-pwa
- roles.ts
- registry.ts
- SyncProvider.tsx
- offline/constants.ts
- LocalStorageStore
- RepairJobList.tsx
- printJobs.resource.ts
- authApi.ts
- app/App.tsx
- categories.resource.ts
- CatalogPanel.tsx
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useIsMobile
- search.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- posCalculations.ts
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- useCategories.ts
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
3. `formatMoney()` - 64 edges
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
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

## Communities (112 total, 33 thin omitted)

### Community 0 - "ConnectivityMonitor.ts"
Cohesion: 0.15
Nodes (12): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS (+4 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.15
Nodes (17): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+9 more)

### Community 2 - "useAppSelector"
Cohesion: 0.11
Nodes (33): Sidebar(), SidebarProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps (+25 more)

### Community 3 - "offline/index.ts"
Cohesion: 0.07
Nodes (30): ConnectivitySnapshot, ConnectivityState, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), pendingDeltaFor() (+22 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.11
Nodes (22): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), CreditNoteModalProps, ExchangeLine, LineState, SerialUnitState, CREDIT_NOTE_FLAG_META (+14 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.10
Nodes (36): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+28 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (34): PAYMENT_METHODS, PaymentMethod, A4InvoicePreviewModalProps, PaymentPanelProps, useCartCheckout(), SaleHeroPresentation, Invoice, LineSourceType (+26 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.16
Nodes (23): fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+15 more)

### Community 8 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.13
Nodes (24): InvoicesList, useInvoiceCreditNotes(), NO_INVOICES, useAllInvoices(), useCloseInvoice(), useVoidInvoice(), useInvoicePayments(), useRecordPayment() (+16 more)

### Community 9 - "PrintJobList.tsx"
Cohesion: 0.16
Nodes (17): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+9 more)

### Community 10 - "router.tsx"
Cohesion: 0.10
Nodes (17): BillingCounter, CustomerList, EmailLoginScreen, PrintJobList, RepairJobList, StandalonePrintView, NAV_CATEGORIES, NAV_ITEMS (+9 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "RequireAuth.tsx"
Cohesion: 0.21
Nodes (11): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+3 more)

### Community 13 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (20): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, AuditLevel, logError() (+12 more)

### Community 14 - "formatMoney"
Cohesion: 0.17
Nodes (20): SupplierList, CustomerPickerModal(), CustomerPickerModalProps, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), SupplierFormContent(), SupplierPickerModal() (+12 more)

### Community 15 - "SearchHistoryInput.tsx"
Cohesion: 0.22
Nodes (14): SearchHistoryInput, SearchHistoryInputProps, getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory() (+6 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.08
Nodes (53): OutboxError, assignLedgerEntriesToOperation(), AbandonedReferenceError, OutboxFullError, UnresolvedReferenceError, getDeviceId(), abandonMapping(), DROP_ELEMENT (+45 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.17
Nodes (18): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById(), fetchCreditNotes() (+10 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.12
Nodes (33): useCreditNotes(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useCategoryIcons(), NO_MOVEMENTS, NO_PRODUCTS (+25 more)

### Community 21 - "providers.tsx"
Cohesion: 0.08
Nodes (26): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProvidersProps, AuthInitializer(), DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createReduxColorSchemeManager() (+18 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.25
Nodes (12): getMeApi(), OFFLINE_SESSION_GRACE_MS, cacheSession(), clearCachedSession(), readCachedSession(), SESSION_RECORD_ID, authSlice, initializeAuth (+4 more)

### Community 24 - "customers.resource.ts"
Cohesion: 0.19
Nodes (12): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse, CustomerTagsResponse (+4 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (23): BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput (+15 more)

### Community 26 - "SettingsPage.tsx"
Cohesion: 0.12
Nodes (20): SettingsPage, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS (+12 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.08
Nodes (36): ApiClient, buildParams(), buildSyncHeaders(), queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats (+28 more)

### Community 28 - "products.resource.ts"
Cohesion: 0.11
Nodes (19): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+11 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "syncApi.ts"
Cohesion: 0.08
Nodes (43): BackendInvoice, toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta() (+35 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 33 - "money.ts"
Cohesion: 0.17
Nodes (22): CURRENCY, EmployeeFormModal(), EmployeeFormModalProps, PrintJobFormModalProps, PrintJob, RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE (+14 more)

### Community 34 - "print-jobs/types.ts"
Cohesion: 0.53
Nodes (6): JobStatus, SplitType, PrintJobInput, UpdatePrintJobPayload, AssignmentInfo, CustomerRef

### Community 35 - "inventory/types.ts"
Cohesion: 0.20
Nodes (16): FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput, ProductListResponse (+8 more)

### Community 36 - "repairs.resource.ts"
Cohesion: 0.32
Nodes (14): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+6 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.07
Nodes (44): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection() (+36 more)

### Community 40 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 41 - "client.ts"
Cohesion: 0.15
Nodes (12): isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners, NetworkObservation, observeNetwork(), reportNetworkObservation() (+4 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.23
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+2 more)

### Community 43 - "SupplierList.tsx"
Cohesion: 0.12
Nodes (31): useVoidCreditNote(), useSetSupplierLinks(), createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier() (+23 more)

### Community 45 - "roles.ts"
Cohesion: 0.29
Nodes (8): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, RoleGuard(), RoleGuardProps, selectUserRole()

### Community 46 - "registry.ts"
Cohesion: 0.14
Nodes (31): MutationRequestOptions, CreateCreditNoteInput, recordPayment(), toPaymentRecord(), createPurchase(), fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier() (+23 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 48 - "offline/constants.ts"
Cohesion: 0.14
Nodes (15): AUDIT_LOG_LIMIT, MAX_CLOCK_SKEW_MS, MAX_PUSH_ATTEMPTS, NOTIFICATION_ID_CONNECTIVITY, NOTIFICATION_ID_SYNC_ERROR, OFFLINE_DB_NAME, OUTBOX_CAPACITY, PULL_PAGE_LIMIT (+7 more)

### Community 50 - "RepairJobList.tsx"
Cohesion: 0.20
Nodes (15): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS (+7 more)

### Community 51 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 52 - "authApi.ts"
Cohesion: 0.36
Nodes (7): AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession, AuthState

### Community 53 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 54 - "categories.resource.ts"
Cohesion: 0.33
Nodes (9): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, categoriesResource (+1 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.26
Nodes (12): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+4 more)

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.09
Nodes (34): EmployeeList, ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+26 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.11
Nodes (29): BackendPaymentRecord, PaymentRecord, RecordPaymentInput, NO_CREDIT_NOTES, NO_PAYMENTS, PendingOperationsListProps, STATUS_LABEL, MirrorTableName (+21 more)

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

### Community 65 - "useIsMobile"
Cohesion: 0.09
Nodes (44): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+36 more)

### Community 66 - "search.ts"
Cohesion: 0.18
Nodes (20): SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar(), MatchRange, matchTier() (+12 more)

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

### Community 79 - "posCalculations.ts"
Cohesion: 0.09
Nodes (27): CartLineItem, CartLineItemProps, DiscountPopover(), DiscountPopoverProps, getCategoryIconInfo(), SegmentedToggle(), SegmentedToggleProps, calculateCartTotals() (+19 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.10
Nodes (32): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps (+24 more)

## Knowledge Gaps
- **382 isolated node(s):** `DiscountPopoverProps`, `PaymentPanelProps`, `EmployeeFormModalProps`, `PrintJobFormModalProps`, `STATUSES_REQUIRING_PRICE` (+377 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `InvoiceDetailDrawer.tsx`, `formatMoney`, `SearchHistoryInput.tsx`, `ProductTable.tsx`, `products.resource.ts`, `LoginForm.tsx`, `money.ts`, `inventory/types.ts`, `syncSlice.ts`, `AmountInput.tsx`, `SupplierList.tsx`, `EmployeeList.tsx`, `posCalculations.ts`, `useCategories.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `db` connect `registry.ts` to `offline/index.ts`, `CustomerList.tsx`, `InvoiceDetailDrawer.tsx`, `PrintJobList.tsx`, `SyncEngine.ts`, `flush.ts`, `ProductTable.tsx`, `authSlice.ts`, `customers.resource.ts`, `queryKeys.ts`, `products.resource.ts`, `syncApi.ts`, `repairs.resource.ts`, `useSyncData.ts`, `SupplierList.tsx`, `RepairJobList.tsx`, `printJobs.resource.ts`, `categories.resource.ts`, `schema.ts`, `useCategories.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `useIsMobile`, `notificationSlice.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoiceDetailDrawer.tsx`, `PrintJobList.tsx`, `RequireAuth.tsx`, `roles.ts`, `SyncProvider.tsx`, `ProductTable.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `DiscountPopoverProps`, `PaymentPanelProps`, `EmployeeFormModalProps` to the rest of the system?**
  _382 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ConnectivityMonitor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14705882352941177 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.1147086031452359 - nodes in this community are weakly interconnected._
- **Should `offline/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07112375533428165 - nodes in this community are weakly interconnected._