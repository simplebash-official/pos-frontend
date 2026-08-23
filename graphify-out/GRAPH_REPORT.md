# Graph Report - frontend  (2026-08-24)

## Corpus Check
- 335 files · ~179,760 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1825 nodes · 5656 edges · 115 communities (84 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8e1fcf7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- offline/types.ts
- notificationSlice.ts
- useAppDispatch
- registry.ts
- CreditNoteModal.tsx
- A4InvoicePreviewModal.tsx
- cartSlice.ts
- customers.resource.ts
- billing/types.ts
- CustomerList.tsx
- router.tsx
- dependencies
- useAppSelector
- tablerIcons.ts
- LoginForm.tsx
- InvoiceDetailDrawer.tsx
- devDependencies
- flush.ts
- idMap.ts
- ProductTable.tsx
- printJobs.resource.ts
- compilerOptions
- authSlice.ts
- useSupplierProducts.ts
- invoicesApi.ts
- settingsSlice.ts
- store/index.ts
- repairs.resource.ts
- client.ts
- Backend Sync Requirements Doc
- print-jobs/types.ts
- searchFields.ts
- CatalogPanel.tsx
- formatMoney
- products.resource.ts
- SyncEngine.ts
- RepairJobList.tsx
- SyncPanel.tsx
- useInvoiceDocument.ts
- common.ts
- ApiClient
- ProductCatalogTree.tsx
- SupplierList.tsx
- BillingCounter.tsx
- @mantine/form
- react-dom
- SyncProvider.tsx
- @tanstack/react-query
- LocalStorageStore
- vite-plugin-pwa
- PrintJobList.tsx
- offline/index.ts
- db
- schema.ts
- PendingOperationsList.tsx
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- creditNotesApi.ts
- eslint-plugin-react-hooks
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useIsMobile
- search.ts
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- categories.resource.ts
- useProductSerials.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- AmountInput.tsx
- Right-Side Detail Drawer Visual Family
- useShortcuts.ts
- PaymentPanel.tsx
- Graphify Knowledge Graph Rules
- Inline Color Scheme Init Script
- useCategories.ts
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
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)
- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (115 total, 31 thin omitted)

### Community 0 - "offline/types.ts"
Cohesion: 0.10
Nodes (19): SyncModuleCardProps, MODULE_STATUS_PRESENTATION, StatusPresentation, ConflictPolicy, ConflictStrategy, LocalApplyHandler, ModuleSyncStatus, ModuleSyncView (+11 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.16
Nodes (17): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+9 more)

### Community 2 - "useAppDispatch"
Cohesion: 0.12
Nodes (31): usePrint(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+23 more)

### Community 3 - "registry.ts"
Cohesion: 0.08
Nodes (21): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, deltaCursors (+13 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.11
Nodes (23): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), CreditNoteModal(), CreditNoteModalProps, ExchangeLine, LineState, SerialUnitState (+15 more)

### Community 5 - "A4InvoicePreviewModal.tsx"
Cohesion: 0.21
Nodes (14): A4InvoicePreviewModal(), A4InvoicePreviewModalProps, StandalonePrintView(), useInvoiceDocument(), recordPrintEvent(), PdfCanvasViewer(), PdfCanvasViewerProps, PdfPageCanvasProps (+6 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.13
Nodes (25): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, CartItem, cartSlice, DiscountType, initialState (+17 more)

### Community 7 - "customers.resource.ts"
Cohesion: 0.17
Nodes (17): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), CustomerFormModalProps, FormContentProps, CustomerPickerModalProps (+9 more)

### Community 8 - "billing/types.ts"
Cohesion: 0.20
Nodes (12): PAYMENT_METHODS, PaymentMethod, CompleteSaleResult, PaymentPanelProps, SaleHeroPresentation, Invoice, InvoiceItem, SplitPaymentDetail (+4 more)

### Community 9 - "CustomerList.tsx"
Cohesion: 0.22
Nodes (16): fetchCustomers(), CustomerDetailDrawer(), applyLocalCustomerFilters(), CustomerFilters, CustomerList(), isCustomerFilterActive(), CustomerPickerModal(), PRESET_CUSTOMER_TAGS (+8 more)

### Community 10 - "router.tsx"
Cohesion: 0.08
Nodes (20): App(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, ProductTable (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "useAppSelector"
Cohesion: 0.08
Nodes (37): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), ROUTE_TITLES (+29 more)

### Community 13 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 14 - "LoginForm.tsx"
Cohesion: 0.17
Nodes (16): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+8 more)

### Community 15 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.18
Nodes (18): InvoicesList, DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, useInvoiceCreditNotes(), useCloseInvoice(), useVoidInvoice(), useInvoicePayments() (+10 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.13
Nodes (35): ConflictReason, OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), createIdempotencyKey(), isLocalId(), ApiErrorLike (+27 more)

### Community 18 - "idMap.ts"
Cohesion: 0.13
Nodes (12): AbandonedReferenceError, BarcodeConflictError, CursorInvalidError, OutboxFullError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), resolveValue() (+4 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.15
Nodes (31): useCreditNotes(), useVoidCreditNote(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS (+23 more)

### Community 21 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.13
Nodes (23): RequireAdmin(), RequireAdminProps, AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser (+15 more)

### Community 24 - "useSupplierProducts.ts"
Cohesion: 0.21
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+8 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (26): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+18 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): STORAGE_KEYS, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 27 - "store/index.ts"
Cohesion: 0.14
Nodes (14): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch (+6 more)

### Community 28 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 29 - "client.ts"
Cohesion: 0.05
Nodes (45): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+37 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "print-jobs/types.ts"
Cohesion: 0.41
Nodes (10): JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, RepairFormModalProps, RepairJob, RepairJobInput (+2 more)

### Community 32 - "searchFields.ts"
Cohesion: 0.16
Nodes (17): SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, SearchHistoryInput, SearchHistoryInputProps (+9 more)

### Community 33 - "CatalogPanel.tsx"
Cohesion: 0.25
Nodes (13): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+5 more)

### Community 34 - "formatMoney"
Cohesion: 0.13
Nodes (30): JOB_STATUS, JOB_STATUS_LABELS, CURRENCY, CartLineItem, DiscountPopover(), DiscountPopoverProps, EmployeeFormModal(), EmployeeFormModalProps (+22 more)

### Community 35 - "products.resource.ts"
Cohesion: 0.09
Nodes (32): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+24 more)

### Community 36 - "SyncEngine.ts"
Cohesion: 0.09
Nodes (35): PULL_INTERVAL_MS, pruneByRetention(), rowAgeTimestamp(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor() (+27 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.09
Nodes (31): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS, getInvoiceStatusMeta(), getOverdueMeta() (+23 more)

### Community 38 - "SyncPanel.tsx"
Cohesion: 0.10
Nodes (30): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge(), SyncStatusBadgeProps (+22 more)

### Community 39 - "useInvoiceDocument.ts"
Cohesion: 0.27
Nodes (9): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, useCreditNoteDocument(), UseCreditNoteDocumentResult, UseInvoiceDocumentResult, ResolvedId (+1 more)

### Community 40 - "common.ts"
Cohesion: 0.19
Nodes (12): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+4 more)

### Community 41 - "ApiClient"
Cohesion: 0.07
Nodes (33): ApiClient, buildParams(), buildSyncHeaders(), BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats() (+25 more)

### Community 42 - "ProductCatalogTree.tsx"
Cohesion: 0.29
Nodes (10): CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon() (+2 more)

### Community 43 - "SupplierList.tsx"
Cohesion: 0.12
Nodes (30): useSetSupplierLinks(), createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps (+22 more)

### Community 44 - "BillingCounter.tsx"
Cohesion: 0.12
Nodes (27): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+19 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 51 - "PrintJobList.tsx"
Cohesion: 0.25
Nodes (12): JOB_STATUS_COLORS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob() (+4 more)

### Community 52 - "offline/index.ts"
Cohesion: 0.20
Nodes (16): MIRROR_TABLE_NAMES, assignLedgerEntriesToOperation(), pendingDeltaFor(), getDeviceId(), mintLocalId(), createLocalId(), LOCAL_ID_PREFIX, randomUuid() (+8 more)

### Community 53 - "db"
Cohesion: 0.13
Nodes (29): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, createPurchase(), toLocalRow() (+21 more)

### Community 54 - "schema.ts"
Cohesion: 0.18
Nodes (21): NO_CREDIT_NOTES, Category, StockMovement, StockPurchase, MirrorTableName, OfflineDb, AuditEvent, ConflictRecord (+13 more)

### Community 55 - "PendingOperationsList.tsx"
Cohesion: 0.28
Nodes (7): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, retryOperation(), EmptyState(), EmptyStateProps

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.13
Nodes (25): queryKeys, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings() (+17 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "creditNotesApi.ts"
Cohesion: 0.15
Nodes (22): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+14 more)

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
Nodes (20): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), BillingPageSkeleton(), FILL (+12 more)

### Community 66 - "search.ts"
Cohesion: 0.18
Nodes (23): QueryKeyFactory, useBackendFilteredList(), UseBackendFilteredListResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange (+15 more)

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
Cohesion: 0.22
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), markPending(), readServerVersion() (+4 more)

### Community 72 - "useProductSerials.ts"
Cohesion: 0.43
Nodes (5): fetchProductSerials(), SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), ProductSerialStatus

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

### Community 78 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 79 - "PaymentPanel.tsx"
Cohesion: 0.15
Nodes (20): PaymentPanel, getSaleHeroPresentation(), calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculatePaymentState(), calculateQuickTenderSuggestions(), calculateReturnTotals() (+12 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.15
Nodes (22): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, buildCategoryLookup(), NO_CATEGORIES (+14 more)

## Knowledge Gaps
- **380 isolated node(s):** `NotificationPopoverProps`, `NotificationActor`, `NotificationPriority`, `ThemeState`, `RequireAdminProps` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `CreditNoteModal.tsx`, `A4InvoicePreviewModal.tsx`, `CustomerList.tsx`, `useAppSelector`, `LoginForm.tsx`, `InvoiceDetailDrawer.tsx`, `ProductTable.tsx`, `searchFields.ts`, `formatMoney`, `products.resource.ts`, `SyncPanel.tsx`, `SupplierList.tsx`, `BillingCounter.tsx`, `EmployeeList.tsx`, `useProductSerials.ts`, `AmountInput.tsx`, `PaymentPanel.tsx`, `useCategories.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `useAppDispatch`, `search.ts`, `CreditNoteModal.tsx`, `cartSlice.ts`, `SyncPanel.tsx`, `BillingCounter.tsx`, `InvoiceDetailDrawer.tsx`, `PaymentPanel.tsx`, `SyncProvider.tsx`, `ProductTable.tsx`, `authSlice.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `SyncEngine` connect `SyncEngine.ts` to `CreditNoteModal.tsx`, `RepairJobList.tsx`, `SyncPanel.tsx`, `CustomerList.tsx`, `SupplierList.tsx`, `BillingCounter.tsx`, `SyncProvider.tsx`, `PrintJobList.tsx`, `ProductTable.tsx`, `offline/index.ts`, `PendingOperationsList.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `NotificationPopoverProps`, `NotificationActor`, `NotificationPriority` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09852216748768473 - nodes in this community are weakly interconnected._
- **Should `useAppDispatch` be split into smaller, more focused modules?**
  _Cohesion score 0.11839323467230443 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08266129032258064 - nodes in this community are weakly interconnected._