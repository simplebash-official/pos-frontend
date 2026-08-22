# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~178,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1823 nodes · 5642 edges · 122 communities (92 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `244c3653`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PaymentPanel.tsx
- notificationSlice.ts
- useAppSelector
- syncApi.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- formatMoney
- formatDateTime
- PrintJobList.tsx
- router.tsx
- dependencies
- BillingCounter.tsx
- SyncEngine.ts
- SupplierDetailDrawer.tsx
- useSearchHistory.ts
- devDependencies
- flush.ts
- creditNotesApi.ts
- tablerIconShards/index.ts
- ProductTable.tsx
- providers.tsx
- compilerOptions
- authSlice.ts
- products.resource.ts
- invoicesApi.ts
- settingsSlice.ts
- ApiClient
- productsApi.ts
- ConnectivityMonitor
- Backend Sync Requirements Doc
- pull.ts
- LoginForm.tsx
- EmployeeFormModal.tsx
- money.ts
- inventory/types.ts
- repairs.resource.ts
- useIsMobile
- SyncPanel.tsx
- @mantine/form
- AmountInput.tsx
- common.ts
- useSyncData.ts
- resources/index.ts
- vite-plugin-pwa
- client.ts
- supplierProducts.resource.ts
- SyncProvider.tsx
- syncSlice.ts
- useSyncedMutation
- RepairJobList.tsx
- printJobs.resource.ts
- offline/index.ts
- db
- categories.resource.ts
- CatalogPanel.tsx
- SupplierList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- InvoiceDetailDrawer.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useResponsive.tsx
- search.ts
- ProductCatalogTree.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- registry.ts
- PendingOperationsList.tsx
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- networkSignal.ts
- Right-Side Detail Drawer Visual Family
- CartLineItem.tsx
- posCalculations.ts
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- purchasesApi.ts
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
- backoff.ts
- useInventoryStats.ts
- usePrintJobStats.ts

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
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
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

## Communities (122 total, 30 thin omitted)

### Community 0 - "PaymentPanel.tsx"
Cohesion: 0.19
Nodes (15): PAYMENT_METHODS, PaymentMethod, PaymentPanel, PaymentPanelProps, getSaleHeroPresentation(), SaleHeroPresentation, Invoice, InvoiceItem (+7 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.09
Nodes (29): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+21 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (32): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+24 more)

### Community 3 - "syncApi.ts"
Cohesion: 0.08
Nodes (32): PULL_PAGE_LIMIT, getAllSyncMeta(), seedSyncMeta(), resolvePullTargets(), RFC-3339, EnqueueInput, getResourcesInDependencyOrder(), ApiEnvelope (+24 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.10
Nodes (25): BackendCreditNoteItem, CreateCreditNoteExchangeItemInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput, useCreateCreditNote(), CreditNoteModal(), CreditNoteModalProps, ExchangeLine (+17 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.08
Nodes (36): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, DocumentPreviewSubject, SaleDocumentPreviewModal() (+28 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.13
Nodes (25): useCartCheckout(), useCartTotals(), cartSlice, DiscountType, initialState, resetCartState(), saveHeldCartsToStorage(), selectCartDiscountCents() (+17 more)

### Community 7 - "formatMoney"
Cohesion: 0.10
Nodes (37): fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+29 more)

### Community 8 - "formatDateTime"
Cohesion: 0.16
Nodes (11): fetchEmployeeEarnings(), EmployeeDetailDrawer(), EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, EmployeeRole, DetailDrawer(), DetailDrawerProps, MetricCardDef (+3 more)

### Community 9 - "PrintJobList.tsx"
Cohesion: 0.16
Nodes (17): PrintJobList, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob() (+9 more)

### Community 10 - "router.tsx"
Cohesion: 0.06
Nodes (35): GuestOnly(), GuestOnlyProps, RequireAdmin(), RequireAdminProps, RequireAuth(), RequireAuthProps, AppShell(), Sidebar() (+27 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "BillingCounter.tsx"
Cohesion: 0.15
Nodes (24): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+16 more)

### Community 13 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (14): pruneByRetention(), rowAgeTimestamp(), logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection, pruneConfirmedLedgerEntries() (+6 more)

### Community 14 - "SupplierDetailDrawer.tsx"
Cohesion: 0.17
Nodes (18): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useProductsForSupplier(), useUnlinkProduct(), SupplierDetailDrawer() (+10 more)

### Community 15 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.13
Nodes (34): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), rewriteReferences(), ApiErrorLike, classifyFailure(), commitSuccess() (+26 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.22
Nodes (17): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteInput, CreditNoteListResponseData, fetchCreditNoteById(), fetchCreditNotes(), FetchCreditNotesParams (+9 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.18
Nodes (20): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useAllProducts() (+12 more)

### Community 21 - "providers.tsx"
Cohesion: 0.10
Nodes (20): App(), HeldCartCatchupNotifier(), AppProviders(), AppProvidersProps, AuthInitializer(), router, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS (+12 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.14
Nodes (23): USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData (+15 more)

### Community 24 - "products.resource.ts"
Cohesion: 0.16
Nodes (20): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), adjustStock(), createProduct(), deleteProducts() (+12 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (25): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+17 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 28 - "productsApi.ts"
Cohesion: 0.17
Nodes (8): fetchProductSerials(), ProductListParams, ProductsPageData, SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), StockAdjustmentResult, ProductSerialStatus

### Community 29 - "ConnectivityMonitor"
Cohesion: 0.17
Nodes (3): ConnectivityMonitor, observeNetwork(), ConnectivityListener

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "pull.ts"
Cohesion: 0.13
Nodes (22): toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), SyncMetaPatch, logWarn(), adoptNewestCursor() (+14 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.18
Nodes (14): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+6 more)

### Community 33 - "EmployeeFormModal.tsx"
Cohesion: 0.26
Nodes (10): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, SegmentedToggle(), SegmentedToggleProps, EmployeeFormValues (+2 more)

### Community 34 - "money.ts"
Cohesion: 0.19
Nodes (24): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+16 more)

### Community 35 - "inventory/types.ts"
Cohesion: 0.16
Nodes (19): CURRENCY, FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput (+11 more)

### Community 36 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 37 - "useIsMobile"
Cohesion: 0.19
Nodes (15): ProductFormContent(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesBySupplier(), EnrichedStockPurchase (+7 more)

### Community 38 - "SyncPanel.tsx"
Cohesion: 0.10
Nodes (31): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+23 more)

### Community 40 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 41 - "common.ts"
Cohesion: 0.16
Nodes (17): BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchRepairStats(), RepairStats (+9 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 43 - "resources/index.ts"
Cohesion: 0.21
Nodes (13): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), defineSyncResource(), productSerialsResource (+5 more)

### Community 45 - "client.ts"
Cohesion: 0.13
Nodes (22): RequestOptions, env, probeClient, probeHealth(), ProbeResult, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEADER_DEVICE_ID (+14 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.26
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProduct (+4 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 48 - "syncSlice.ts"
Cohesion: 0.12
Nodes (15): ConnectivitySnapshot, ConnectivityState, SyncMetaRecord, SyncEngineState, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem (+7 more)

### Community 49 - "useSyncedMutation"
Cohesion: 0.28
Nodes (11): useSetSupplierLinks(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierList(), NO_SUPPLIERS, useCreateSupplier(), useDeleteSupplier(), useDeleteSuppliers() (+3 more)

### Community 50 - "RepairJobList.tsx"
Cohesion: 0.28
Nodes (11): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+3 more)

### Community 51 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 52 - "offline/index.ts"
Cohesion: 0.14
Nodes (20): assignLedgerEntriesToOperation(), AbandonedReferenceError, OutboxFullError, UnresolvedReferenceError, getDeviceId(), DROP_ELEMENT, isRecord(), mintLocalId() (+12 more)

### Community 53 - "db"
Cohesion: 0.22
Nodes (16): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, createPurchase() (+8 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.22
Nodes (13): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, ValidCategoryOption (+5 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.23
Nodes (13): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+5 more)

### Community 56 - "SupplierList.tsx"
Cohesion: 0.11
Nodes (29): queryKeys, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees() (+21 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.15
Nodes (22): NO_CREDIT_NOTES, useCreditNotes(), useVoidCreditNote(), MirrorTableName, OfflineDb, AuditEvent, AuditLevel, ConflictReason (+14 more)

### Community 60 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.18
Nodes (16): InvoicesList, useInvoiceCreditNotes(), useAllInvoices(), useCloseInvoice(), useVoidInvoice(), useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer() (+8 more)

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
Cohesion: 0.11
Nodes (20): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal() (+12 more)

### Community 66 - "search.ts"
Cohesion: 0.14
Nodes (28): SearchHighlight(), SearchHighlightProps, QueryKeyFactory, useBackendFilteredList(), UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex() (+20 more)

### Community 67 - "ProductCatalogTree.tsx"
Cohesion: 0.25
Nodes (12): CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductFormModal(), CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+4 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "registry.ts"
Cohesion: 0.19
Nodes (8): getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, PushContext, PushResult

### Community 72 - "PendingOperationsList.tsx"
Cohesion: 0.28
Nodes (7): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, retryOperation(), EmptyState(), EmptyStateProps

### Community 73 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "invoices.resource.ts"
Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 76 - "networkSignal.ts"
Cohesion: 0.25
Nodes (6): isApiErrorLike(), readServerTime(), Listener, listeners, NetworkObservation, reportNetworkObservation()

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CartLineItem.tsx"
Cohesion: 0.47
Nodes (5): CartLineItem, CartLineItemProps, getCategoryIconInfo(), LineSourceType, CartItem

### Community 79 - "posCalculations.ts"
Cohesion: 0.13
Nodes (19): DiscountPopover(), DiscountPopoverProps, calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculateReturnTotals(), CartLineItemSource, CartTotalsCalculationInput (+11 more)

### Community 83 - "purchasesApi.ts"
Cohesion: 0.47
Nodes (5): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, StockPurchaseInput

### Community 84 - "useCategories.ts"
Cohesion: 0.12
Nodes (25): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, buildCategoryLookup(), NO_CATEGORIES (+17 more)

### Community 119 - "backoff.ts"
Cohesion: 0.40
Nodes (5): RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS, nextAttemptAt(), nextAttemptDelayMs()

### Community 120 - "useInventoryStats.ts"
Cohesion: 0.70
Nodes (3): fetchInventoryStats(), InventoryStats, useInventoryStats()

### Community 121 - "usePrintJobStats.ts"
Cohesion: 0.70
Nodes (3): fetchPrintJobStats(), PrintJobStats, usePrintJobStats()

## Knowledge Gaps
- **379 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+374 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `PaymentPanel.tsx`, `useResponsive.tsx`, `notificationSlice.ts`, `search.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `SyncPanel.tsx`, `router.tsx`, `BillingCounter.tsx`, `SyncProvider.tsx`, `syncSlice.ts`, `ProductTable.tsx`, `providers.tsx`, `authSlice.ts`, `InvoiceDetailDrawer.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `PaymentPanel.tsx`, `notificationSlice.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `formatMoney`, `formatDateTime`, `router.tsx`, `BillingCounter.tsx`, `SupplierDetailDrawer.tsx`, `ProductTable.tsx`, `productsApi.ts`, `LoginForm.tsx`, `EmployeeFormModal.tsx`, `money.ts`, `inventory/types.ts`, `SyncPanel.tsx`, `AmountInput.tsx`, `InvoiceDetailDrawer.tsx`, `useResponsive.tsx`, `ProductCatalogTree.tsx`, `CartLineItem.tsx`, `useCategories.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `PaymentPanel.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `formatDateTime`, `PrintJobList.tsx`, `BillingCounter.tsx`, `SupplierDetailDrawer.tsx`, `ProductTable.tsx`, `EmployeeFormModal.tsx`, `money.ts`, `inventory/types.ts`, `useIsMobile`, `RepairJobList.tsx`, `CatalogPanel.tsx`, `SupplierList.tsx`, `InvoiceDetailDrawer.tsx`, `useResponsive.tsx`, `ProductCatalogTree.tsx`, `CartLineItem.tsx`, `posCalculations.ts`, `useCategories.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _379 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08943089430894309 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12626262626262627 - nodes in this community are weakly interconnected._
- **Should `syncApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07965860597439545 - nodes in this community are weakly interconnected._