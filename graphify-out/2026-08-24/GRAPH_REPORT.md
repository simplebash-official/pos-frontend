# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~179,760 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1826 nodes · 5657 edges · 119 communities (88 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fde04eff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ConnectivityMonitor
- notificationSlice.ts
- useAppSelector
- registry.ts
- InvoiceDetailDrawer.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- customers.resource.ts
- BillingCounter.tsx
- client.ts
- router.tsx
- dependencies
- providers.tsx
- SyncEngine
- common.ts
- useSyncedQuery
- devDependencies
- flush.ts
- idMap.ts
- tablerIconShards/index.ts
- ProductTable.tsx
- printJobs.resource.ts
- compilerOptions
- authSlice.ts
- offline/index.ts
- invoicesApi.ts
- settingsSlice.ts
- HeldCartCatchupNotifier.tsx
- RepairJobList.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- db
- InvoicesList.tsx
- CatalogPanel.tsx
- RepairFormModal.tsx
- products.resource.ts
- SyncEngine.ts
- CustomerList.tsx
- syncSlice.ts
- syncApi.ts
- purchasesApi.ts
- useModuleStats
- GlobalQuickSearchModal.tsx
- suppliers.resource.ts
- useIsMobile
- @mantine/form
- react-dom
- SyncProvider.tsx
- @tanstack/react-query
- payments.resource.ts
- vite-plugin-pwa
- PrintJobList.tsx
- useSyncedMutation.ts
- resources/index.ts
- schema.ts
- PendingOperationsList.tsx
- mockEmployees.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- creditNotesApi.ts
- eslint-plugin-react-hooks
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useResponsive.tsx
- search.ts
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- categories.resource.ts
- useSuppliers.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- AmountInput.tsx
- Right-Side Detail Drawer Visual Family
- CartPanel.tsx
- posCalculations.ts
- Graphify Knowledge Graph Rules
- SegmentedToggle.tsx
- Inline Color Scheme Init Script
- useInventoryStats.ts
- useCategories.ts
- usePrintJobStats.ts
- prettier
- typescript
- typescript-eslint
- SupplierFormModal.tsx
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
10. `Invoice` - 29 edges

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
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
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

## Communities (119 total, 31 thin omitted)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.10
Nodes (24): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+16 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (32): Sidebar(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+24 more)

### Community 3 - "registry.ts"
Cohesion: 0.10
Nodes (22): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, mockStatus() (+14 more)

### Community 4 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.09
Nodes (34): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), useCloseInvoice(), useVoidInvoice(), useInvoicePayments(), useRecordPayment(), CreditNoteModal() (+26 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.07
Nodes (39): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, DocumentPreviewSubject, SaleDocumentPreviewModal() (+31 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (36): Header(), HeaderProps, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, CartPanel, useCartCheckout() (+28 more)

### Community 7 - "customers.resource.ts"
Cohesion: 0.10
Nodes (33): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawerProps, CustomerFormModal() (+25 more)

### Community 8 - "BillingCounter.tsx"
Cohesion: 0.16
Nodes (22): PAYMENT_METHODS, PaymentMethod, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+14 more)

### Community 9 - "client.ts"
Cohesion: 0.15
Nodes (12): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners (+4 more)

### Community 10 - "router.tsx"
Cohesion: 0.07
Nodes (29): RequireAdmin(), RequireAdminProps, SidebarProps, BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList (+21 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "providers.tsx"
Cohesion: 0.09
Nodes (21): App(), AppUpdatePrompt(), AppProviders(), AppProvidersProps, AuthInitializer(), router, LowStockNotifier(), notifiedProductIds (+13 more)

### Community 13 - "SyncEngine"
Cohesion: 0.24
Nodes (4): SyncEngine, describeError(), countByStatus(), countUnsettledForResource()

### Community 14 - "common.ts"
Cohesion: 0.20
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 15 - "useSyncedQuery"
Cohesion: 0.22
Nodes (14): NO_CREDIT_NOTES, useCreditNotes(), useInvoiceCreditNotes(), useVoidCreditNote(), ProductPickerModal(), useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps (+6 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.14
Nodes (34): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), createIdempotencyKey(), isLocalId(), ApiErrorLike, classifyFailure() (+26 more)

### Community 18 - "idMap.ts"
Cohesion: 0.15
Nodes (11): AbandonedReferenceError, BarcodeConflictError, OutboxFullError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), resolveValue(), rewriteNode() (+3 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.16
Nodes (24): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+16 more)

### Community 21 - "printJobs.resource.ts"
Cohesion: 0.16
Nodes (28): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs() (+20 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.16
Nodes (20): UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession (+12 more)

### Community 24 - "offline/index.ts"
Cohesion: 0.19
Nodes (12): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+4 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (25): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+17 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "HeldCartCatchupNotifier.tsx"
Cohesion: 0.16
Nodes (13): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN (+5 more)

### Community 28 - "RepairJobList.tsx"
Cohesion: 0.23
Nodes (13): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS (+5 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.10
Nodes (24): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, ConnectivityState, DEGRADED_LATENCY_MS, HEADER_DEVICE_ID (+16 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "db"
Cohesion: 0.15
Nodes (21): toServerRow(), db, blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+13 more)

### Community 32 - "InvoicesList.tsx"
Cohesion: 0.14
Nodes (17): SupplierList, useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS, SupplierPickerModal() (+9 more)

### Community 33 - "CatalogPanel.tsx"
Cohesion: 0.20
Nodes (15): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, useCartCustomer(), getAudioContext() (+7 more)

### Community 34 - "RepairFormModal.tsx"
Cohesion: 0.16
Nodes (30): JobStatus, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EmployeeRole, SplitType, PrintJobFormModalProps (+22 more)

### Community 35 - "products.resource.ts"
Cohesion: 0.09
Nodes (28): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+20 more)

### Community 36 - "SyncEngine.ts"
Cohesion: 0.09
Nodes (29): ConnectivitySnapshot, AUDIT_LOG_LIMIT, STORAGE_QUOTA_WARN_RATIO, SYNC_LEADER_LOCK, clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention() (+21 more)

### Community 37 - "CustomerList.tsx"
Cohesion: 0.14
Nodes (23): queryKeys, CustomerFilters, deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), SupplierFormModal(), SupplierFilters (+15 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (52): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+44 more)

### Community 39 - "syncApi.ts"
Cohesion: 0.18
Nodes (14): PULL_PAGE_LIMIT, EnqueueInput, ApiEnvelope, fetchNewestCursors(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges() (+6 more)

### Community 40 - "purchasesApi.ts"
Cohesion: 0.23
Nodes (11): Subcategory, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+3 more)

### Community 41 - "useModuleStats"
Cohesion: 0.18
Nodes (14): BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchRepairStats(), RepairStats (+6 more)

### Community 42 - "GlobalQuickSearchModal.tsx"
Cohesion: 0.14
Nodes (21): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTreeProps, ProductHierarchy, ProductPickerModalProps, CATEGORY_COLOR_OPTIONS (+13 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.19
Nodes (15): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+7 more)

### Community 44 - "useIsMobile"
Cohesion: 0.14
Nodes (24): CURRENCY, HeldSalesDrawer(), HeldSalesDrawerProps, CustomerDetailDrawer(), CustomerFormContent(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EMPLOYEE_ROLE_LABELS (+16 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 49 - "payments.resource.ts"
Cohesion: 0.31
Nodes (10): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, paymentsResource (+2 more)

### Community 51 - "PrintJobList.tsx"
Cohesion: 0.29
Nodes (11): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+3 more)

### Community 52 - "useSyncedMutation.ts"
Cohesion: 0.35
Nodes (9): assignLedgerEntriesToOperation(), getDeviceId(), mintLocalId(), createLocalId(), randomUuid(), assertOutboxHasCapacity(), enqueueOperation(), submitOperation() (+1 more)

### Community 53 - "resources/index.ts"
Cohesion: 0.21
Nodes (18): createPurchase(), fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct() (+10 more)

### Community 54 - "schema.ts"
Cohesion: 0.21
Nodes (17): StockMovement, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord, CreditNote, IdMapRecord (+9 more)

### Community 55 - "PendingOperationsList.tsx"
Cohesion: 0.28
Nodes (7): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, retryOperation(), EmptyState(), EmptyStateProps

### Community 56 - "mockEmployees.ts"
Cohesion: 0.23
Nodes (10): createEmployee(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees(), INITIAL_EARNINGS, INITIAL_EMPLOYEES (+2 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "creditNotesApi.ts"
Cohesion: 0.16
Nodes (21): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+13 more)

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

### Community 65 - "useResponsive.tsx"
Cohesion: 0.12
Nodes (19): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+11 more)

### Community 66 - "search.ts"
Cohesion: 0.17
Nodes (22): QueryKeyFactory, UseBackendFilteredListResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchSequenceTier() (+14 more)

### Community 67 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "categories.resource.ts"
Cohesion: 0.36
Nodes (8): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), Category, categoriesResource

### Community 72 - "useSuppliers.ts"
Cohesion: 0.29
Nodes (10): applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierList(), NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier(), useDeleteSuppliers() (+2 more)

### Community 73 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "invoices.resource.ts"
Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 76 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CartPanel.tsx"
Cohesion: 0.36
Nodes (6): CartLineItem, CartLineItemProps, CartPanelProps, getCategoryIconInfo(), LineSourceType, CartItem

### Community 79 - "posCalculations.ts"
Cohesion: 0.14
Nodes (20): PaymentPanel, calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculatePaymentState(), calculateQuickTenderSuggestions(), calculateReturnTotals(), CartLineItemSource (+12 more)

### Community 81 - "SegmentedToggle.tsx"
Cohesion: 0.40
Nodes (4): DiscountPopover(), DiscountPopoverProps, SegmentedToggle(), SegmentedToggleProps

### Community 83 - "useInventoryStats.ts"
Cohesion: 0.70
Nodes (3): fetchInventoryStats(), InventoryStats, useInventoryStats()

### Community 84 - "useCategories.ts"
Cohesion: 0.17
Nodes (19): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCategoryIcons() (+11 more)

### Community 85 - "usePrintJobStats.ts"
Cohesion: 0.70
Nodes (3): fetchPrintJobStats(), PrintJobStats, usePrintJobStats()

### Community 89 - "SupplierFormModal.tsx"
Cohesion: 0.60
Nodes (3): useProductsForSupplier(), SupplierFormContent(), DEFAULT_SUGGESTED_TAGS

## Knowledge Gaps
- **380 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `InvoicesList.tsx`, `useResponsive.tsx`, `CatalogPanel.tsx`, `notificationSlice.ts`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `BillingCounter.tsx`, `search.ts`, `router.tsx`, `providers.tsx`, `posCalculations.ts`, `SyncProvider.tsx`, `useSyncedQuery`, `ProductTable.tsx`, `authSlice.ts`, `HeldCartCatchupNotifier.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `customers.resource.ts`, `BillingCounter.tsx`, `router.tsx`, `common.ts`, `useSyncedQuery`, `ProductTable.tsx`, `InvoicesList.tsx`, `CatalogPanel.tsx`, `RepairFormModal.tsx`, `CustomerList.tsx`, `syncSlice.ts`, `GlobalQuickSearchModal.tsx`, `useResponsive.tsx`, `AmountInput.tsx`, `CartPanel.tsx`, `posCalculations.ts`, `useCategories.ts`, `SupplierFormModal.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `useIsMobile` to `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `customers.resource.ts`, `BillingCounter.tsx`, `useSyncedQuery`, `ProductTable.tsx`, `RepairJobList.tsx`, `InvoicesList.tsx`, `CatalogPanel.tsx`, `RepairFormModal.tsx`, `CustomerList.tsx`, `GlobalQuickSearchModal.tsx`, `PrintJobList.tsx`, `mockEmployees.ts`, `CartPanel.tsx`, `posCalculations.ts`, `SegmentedToggle.tsx`, `SupplierFormModal.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.13002114164904863 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._