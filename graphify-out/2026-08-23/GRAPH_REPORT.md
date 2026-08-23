# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~178,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1822 nodes · 5624 edges · 111 communities (80 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0dc9cfa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppShell.tsx
- notificationSlice.ts
- useAppSelector
- registry.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- GlobalQuickSearchModal.tsx
- PrintJobList.tsx
- router.tsx
- dependencies
- BillingCounter.tsx
- maintenance.ts
- SupplierList.tsx
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
- settingsSlice.ts
- LocalStorageStore
- products.resource.ts
- client.ts
- Backend Sync Requirements Doc
- mirror.ts
- LoginForm.tsx
- RepairFormModal.tsx
- inventory/types.ts
- repairs.resource.ts
- useSyncedQuery
- syncSlice.ts
- @mantine/form
- AmountInput.tsx
- queryKeys.ts
- suppliers.resource.ts
- vite-plugin-pwa
- common.ts
- SyncProvider.tsx
- SyncEngine.ts
- RepairJobList.tsx
- printJobs.resource.ts
- idMap.ts
- resources/index.ts
- categories.resource.ts
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- InvoiceDetailDrawer.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useIsMobile
- search.ts
- ProductCatalogTree.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CartLineItem.tsx
- formatMoney
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- purchases.resource.ts
- useSyncedMutation
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
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
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

## Communities (111 total, 31 thin omitted)

### Community 0 - "AppShell.tsx"
Cohesion: 0.17
Nodes (13): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Sidebar(), SidebarProps (+5 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.09
Nodes (29): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+21 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (32): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+24 more)

### Community 3 - "registry.ts"
Cohesion: 0.06
Nodes (43): PULL_PAGE_LIMIT, getAllSyncMeta(), seedSyncMeta(), resolvePullTargets(), RFC-3339, EnqueueInput, reclaimInflightOperations(), getReferringResources() (+35 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.10
Nodes (28): BackendCreditNoteItem, CreateCreditNoteItemInput, CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, useCreateCreditNote(), Invoice, InvoiceItem (+20 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.10
Nodes (34): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+26 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.12
Nodes (29): PaymentMethod, useCartCheckout(), useCartTotals(), SplitPaymentDetail, cartSlice, CartState, DiscountType, HeldCart (+21 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.15
Nodes (26): fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+18 more)

### Community 8 - "GlobalQuickSearchModal.tsx"
Cohesion: 0.18
Nodes (14): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, EntitySearchResult, getMatchRanges(), SearchTerm (+6 more)

### Community 9 - "PrintJobList.tsx"
Cohesion: 0.20
Nodes (15): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+7 more)

### Community 10 - "router.tsx"
Cohesion: 0.11
Nodes (20): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, BillingCounter, CustomerList, PrintJobList, RepairJobList (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "BillingCounter.tsx"
Cohesion: 0.13
Nodes (31): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+23 more)

### Community 13 - "maintenance.ts"
Cohesion: 0.10
Nodes (16): STORAGE_QUOTA_WARN_RATIO, ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES, AuditLevel (+8 more)

### Community 14 - "SupplierList.tsx"
Cohesion: 0.13
Nodes (25): SupplierList, SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters (+17 more)

### Community 15 - "SearchHistoryInput.tsx"
Cohesion: 0.22
Nodes (14): SearchHistoryInput, SearchHistoryInputProps, getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory() (+6 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.13
Nodes (34): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), rewriteReferences(), isLocalId(), ApiErrorLike, classifyFailure() (+26 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.15
Nodes (22): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+14 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.12
Nodes (25): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+17 more)

### Community 21 - "providers.tsx"
Cohesion: 0.10
Nodes (19): App(), HeldCartCatchupNotifier(), AppProviders(), AppProvidersProps, AuthInitializer(), router, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.12
Nodes (27): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+19 more)

### Community 24 - "customers.resource.ts"
Cohesion: 0.21
Nodes (11): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse, CustomerTagsResponse (+3 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.15
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+16 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 28 - "products.resource.ts"
Cohesion: 0.11
Nodes (19): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+11 more)

### Community 29 - "client.ts"
Cohesion: 0.06
Nodes (36): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+28 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "mirror.ts"
Cohesion: 0.12
Nodes (24): readServerVersion(), stripMirrorMeta(), toServerRow(), UNSYNCED_VERSION, blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta() (+16 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.21
Nodes (13): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+5 more)

### Community 34 - "RepairFormModal.tsx"
Cohesion: 0.16
Nodes (26): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+18 more)

### Community 35 - "inventory/types.ts"
Cohesion: 0.18
Nodes (16): FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput, ProductListResponse (+8 more)

### Community 36 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 37 - "useSyncedQuery"
Cohesion: 0.27
Nodes (14): useCreditNotes(), ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES (+6 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.05
Nodes (54): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+46 more)

### Community 40 - "AmountInput.tsx"
Cohesion: 0.25
Nodes (7): AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 41 - "queryKeys.ts"
Cohesion: 0.23
Nodes (15): queryKeys, fetchBillingStats(), useBillingStats(), fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), useInventoryStats(), fetchPrintJobStats() (+7 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 46 - "common.ts"
Cohesion: 0.10
Nodes (21): ApiClient, buildParams(), buildSyncHeaders(), BillingStats, CustomerStats, InventoryStats, PrintJobStats, RepairStats (+13 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 48 - "SyncEngine.ts"
Cohesion: 0.17
Nodes (14): ConnectivitySnapshot, db, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ (+6 more)

### Community 50 - "RepairJobList.tsx"
Cohesion: 0.27
Nodes (12): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+4 more)

### Community 51 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 52 - "idMap.ts"
Cohesion: 0.14
Nodes (19): assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), DROP_ELEMENT, isRecord(), mintLocalId(), resolveValue() (+11 more)

### Community 53 - "resources/index.ts"
Cohesion: 0.25
Nodes (13): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, defineSyncResource(), paymentsResource (+5 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.40
Nodes (7): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), categoriesResource

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.10
Nodes (28): EmployeeList, ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+20 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.12
Nodes (26): NO_CREDIT_NOTES, StockMovement, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent (+18 more)

### Community 60 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.16
Nodes (21): InvoicesList, useInvoiceCreditNotes(), NO_INVOICES, useAllInvoices(), useCloseInvoice(), useCompleteSale(), useVoidInvoice(), useInvoicePayments() (+13 more)

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
Cohesion: 0.11
Nodes (20): HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, EmployeeDetailDrawer(), SupplierFormContent(), BillingPageSkeleton() (+12 more)

### Community 66 - "search.ts"
Cohesion: 0.18
Nodes (23): QueryKeyFactory, useBackendFilteredList(), UseBackendFilteredListResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange (+15 more)

### Community 67 - "ProductCatalogTree.tsx"
Cohesion: 0.22
Nodes (14): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductFormModal() (+6 more)

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

### Community 78 - "CartLineItem.tsx"
Cohesion: 0.27
Nodes (8): CartLineItem, CartLineItemProps, getCategoryIconInfo(), LineSourceType, HEIGHT_MAP, QuantityInput(), QuantityInputProps, CartItem

### Community 79 - "formatMoney"
Cohesion: 0.09
Nodes (36): CURRENCY, PAYMENT_METHODS, DiscountPopover(), DiscountPopoverProps, PaymentPanel, getSaleHeroPresentation(), SaleHeroPresentation, EmployeeFormModal() (+28 more)

### Community 83 - "purchases.resource.ts"
Cohesion: 0.20
Nodes (14): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary (+6 more)

### Community 84 - "useSyncedMutation"
Cohesion: 0.16
Nodes (22): useVoidCreditNote(), AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories() (+14 more)

## Knowledge Gaps
- **380 isolated node(s):** `CustomerFilters`, `ProductFilters`, `InvoiceFilters`, `STATUS_FILTER_OPTIONS`, `PrintJobFilters` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `AppShell.tsx`, `notificationSlice.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `BillingCounter.tsx`, `SupplierList.tsx`, `SearchHistoryInput.tsx`, `ProductTable.tsx`, `products.resource.ts`, `LoginForm.tsx`, `RepairFormModal.tsx`, `inventory/types.ts`, `useSyncedQuery`, `syncSlice.ts`, `AmountInput.tsx`, `EmployeeList.tsx`, `InvoiceDetailDrawer.tsx`, `ProductCatalogTree.tsx`, `CartLineItem.tsx`, `formatMoney`, `useSyncedMutation`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `AppShell.tsx`, `notificationSlice.ts`, `search.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `useSyncedQuery`, `router.tsx`, `BillingCounter.tsx`, `formatMoney`, `SyncProvider.tsx`, `ProductTable.tsx`, `providers.tsx`, `authSlice.ts`, `InvoiceDetailDrawer.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `useIsMobile`, `RepairFormModal.tsx`, `ProductCatalogTree.tsx`, `inventory/types.ts`, `SaleDocumentPreviewModal.tsx`, `useSyncedQuery`, `CustomerList.tsx`, `CreditNoteModal.tsx`, `PrintJobList.tsx`, `GlobalQuickSearchModal.tsx`, `BillingCounter.tsx`, `CartLineItem.tsx`, `SupplierList.tsx`, `RepairJobList.tsx`, `ProductTable.tsx`, `EmployeeList.tsx`, `InvoiceDetailDrawer.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `CustomerFilters`, `ProductFilters`, `InvoiceFilters` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08748615725359911 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12626262626262627 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06429070580013976 - nodes in this community are weakly interconnected._