# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~179,612 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1825 nodes · 5646 edges · 111 communities (81 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c93fc85b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ConnectivityMonitor
- notificationSlice.ts
- useAppSelector
- registry.ts
- CreditNoteModal.tsx
- A4InvoicePreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- BillingCounter.tsx
- client.ts
- router.tsx
- dependencies
- providers.tsx
- SyncEngine.ts
- tablerIcons.ts
- InvoiceDetailDrawer.tsx
- devDependencies
- flush.ts
- LocalStorageStore
- ProductTable.tsx
- PrintJobList.tsx
- compilerOptions
- authSlice.ts
- customers.resource.ts
- invoicesApi.ts
- settingsSlice.ts
- AppShell.tsx
- printJobs.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- pull.ts
- searchFields.ts
- CatalogPanel.tsx
- RepairJobList.tsx
- products.resource.ts
- syncMeta.ts
- InvoicesList.tsx
- syncSlice.ts
- useInvoiceDocument.ts
- ApiResponse
- useModuleStats
- ProductCatalogTree.tsx
- SupplierList.tsx
- money.ts
- @mantine/form
- react-dom
- SyncProvider.tsx
- @tanstack/react-query
- useShortcuts.ts
- vite-plugin-pwa
- useBillingStats.ts
- idMap.ts
- db
- categories.resource.ts
- PendingOperationsList.tsx
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- eslint-plugin-react-hooks
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useIsMobile
- search.ts
- categoryIcons.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- posCalculations.ts
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
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
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

## Communities (111 total, 30 thin omitted)

### Community 0 - "ConnectivityMonitor"
Cohesion: 0.16
Nodes (6): ConnectivityMonitor, ConnectivityListener, ConnectivitySnapshot, ConnectivityState, SyncEngineState, SyncState

### Community 1 - "notificationSlice.ts"
Cohesion: 0.06
Nodes (44): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+36 more)

### Community 2 - "useAppSelector"
Cohesion: 0.14
Nodes (29): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+21 more)

### Community 3 - "registry.ts"
Cohesion: 0.09
Nodes (25): pendingDeltaFor(), EnqueueInput, reclaimInflightOperations(), SyncedQueryResult, registerSyncResource(), resetRegistry(), resources, Widget (+17 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.11
Nodes (24): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), InvoiceItem, CreditNoteModal(), CreditNoteModalProps, ExchangeLine, LineState (+16 more)

### Community 5 - "A4InvoicePreviewModal.tsx"
Cohesion: 0.21
Nodes (14): A4InvoicePreviewModal(), A4InvoicePreviewModalProps, StandalonePrintView(), useInvoiceDocument(), recordPrintEvent(), PdfCanvasViewer(), PdfCanvasViewerProps, PdfPageCanvasProps (+6 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.09
Nodes (41): Header(), HeaderProps, BillingCounter(), BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, CartLineItemProps (+33 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.16
Nodes (24): CustomerDetailDrawer(), CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters(), CustomerFilters, CustomerList() (+16 more)

### Community 8 - "BillingCounter.tsx"
Cohesion: 0.19
Nodes (19): PAYMENT_METHODS, PaymentMethod, BillingRegionsProps, FILL, BillingPane, CatalogMode, PaymentPanelHandle, PaymentPanelProps (+11 more)

### Community 9 - "client.ts"
Cohesion: 0.12
Nodes (15): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners (+7 more)

### Community 10 - "router.tsx"
Cohesion: 0.08
Nodes (21): AppShell(), BillingCounter, CustomerList, EmployeeList, PrintJobList, ProductTable, RepairJobList, ReportsDashboard (+13 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "providers.tsx"
Cohesion: 0.11
Nodes (15): App(), AppUpdatePrompt(), AppProviders(), AppProvidersProps, AuthInitializer(), router, LowStockNotifier(), notifiedProductIds (+7 more)

### Community 13 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (14): pruneByRetention(), rowAgeTimestamp(), AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection (+6 more)

### Community 14 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 15 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.20
Nodes (15): InvoicesList, DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, useInvoiceCreditNotes(), useCloseInvoice(), useVoidInvoice(), useInvoicePayments() (+7 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.13
Nodes (34): ConflictReason, OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), rewriteReferences(), isLocalId(), ApiErrorLike (+26 more)

### Community 18 - "LocalStorageStore"
Cohesion: 0.18
Nodes (5): getPrintCountForInvoice(), getPrintLogsForInvoice(), PrintLogEntry, printLogStore, LocalStorageStore

### Community 20 - "ProductTable.tsx"
Cohesion: 0.12
Nodes (36): useCreditNotes(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+28 more)

### Community 21 - "PrintJobList.tsx"
Cohesion: 0.18
Nodes (15): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+7 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.08
Nodes (39): RequireAdmin(), RequireAdminProps, EmailLoginScreen, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), loginApi() (+31 more)

### Community 24 - "customers.resource.ts"
Cohesion: 0.14
Nodes (18): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+10 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (25): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+17 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "AppShell.tsx"
Cohesion: 0.09
Nodes (27): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT (+19 more)

### Community 28 - "printJobs.resource.ts"
Cohesion: 0.16
Nodes (28): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs() (+20 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.09
Nodes (27): env, probeClient, probeHealth(), ProbeResult, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS (+19 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "pull.ts"
Cohesion: 0.13
Nodes (18): toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary, BarcodeConflictError (+10 more)

### Community 32 - "searchFields.ts"
Cohesion: 0.19
Nodes (13): SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHistoryInput, SearchHistoryInputProps, useAppShortcuts(), CUSTOMER_SEARCH_FIELDS (+5 more)

### Community 33 - "CatalogPanel.tsx"
Cohesion: 0.16
Nodes (18): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+10 more)

### Community 34 - "RepairJobList.tsx"
Cohesion: 0.16
Nodes (24): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobInput, RepairFormModalProps, STATUSES_REQUIRING_PRICE (+16 more)

### Community 35 - "products.resource.ts"
Cohesion: 0.08
Nodes (36): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+28 more)

### Community 36 - "syncMeta.ts"
Cohesion: 0.25
Nodes (12): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+4 more)

### Community 37 - "InvoicesList.tsx"
Cohesion: 0.17
Nodes (15): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS, getInvoiceStatusMeta(), getOverdueMeta() (+7 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.05
Nodes (55): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+47 more)

### Community 39 - "useInvoiceDocument.ts"
Cohesion: 0.27
Nodes (9): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, useCreditNoteDocument(), UseCreditNoteDocumentResult, UseInvoiceDocumentResult, ResolvedId (+1 more)

### Community 40 - "ApiResponse"
Cohesion: 0.24
Nodes (10): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+2 more)

### Community 41 - "useModuleStats"
Cohesion: 0.15
Nodes (17): CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats, useInventoryStats(), fetchPrintJobStats(), PrintJobStats (+9 more)

### Community 42 - "ProductCatalogTree.tsx"
Cohesion: 0.31
Nodes (8): ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, SearchHighlight(), SearchHighlightProps, EntitySearchResult, getMatchRanges(), SearchTerm

### Community 43 - "SupplierList.tsx"
Cohesion: 0.12
Nodes (32): useVoidCreditNote(), useSetSupplierLinks(), createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier() (+24 more)

### Community 44 - "money.ts"
Cohesion: 0.17
Nodes (23): CURRENCY, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, PrintJobFormModalProps, PrintJob (+15 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 49 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 51 - "useBillingStats.ts"
Cohesion: 0.70
Nodes (3): BillingStats, fetchBillingStats(), useBillingStats()

### Community 52 - "idMap.ts"
Cohesion: 0.14
Nodes (19): assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), DROP_ELEMENT, isRecord(), mintLocalId(), resolveValue() (+11 more)

### Community 53 - "db"
Cohesion: 0.11
Nodes (36): MutationRequestOptions, BackendPaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), createPurchase(), fetchSupplierProducts(), getLinksForProduct() (+28 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.36
Nodes (8): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), Category, categoriesResource

### Community 55 - "PendingOperationsList.tsx"
Cohesion: 0.27
Nodes (8): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, discardOperation(), retryOperation(), EmptyState(), EmptyStateProps

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.12
Nodes (26): queryKeys, CustomerDetailDrawerProps, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+18 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.09
Nodes (41): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+33 more)

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
Nodes (28): CartLineItem, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+20 more)

### Community 66 - "search.ts"
Cohesion: 0.18
Nodes (23): QueryKeyFactory, useBackendFilteredList(), UseBackendFilteredListResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange (+15 more)

### Community 67 - "categoryIcons.ts"
Cohesion: 0.43
Nodes (6): CatalogCategoryFilter, CategoryIconInfo, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, TablerIcon, TablerIconMap

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
Cohesion: 0.14
Nodes (20): PaymentPanel, calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculatePaymentState(), calculateQuickTenderSuggestions(), calculateReturnTotals(), CartLineItemSource (+12 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.15
Nodes (23): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, resolveCategoryIcon(), buildCategoryLookup() (+15 more)

## Knowledge Gaps
- **380 isolated node(s):** `DocumentPreviewSubject`, `SaleDocumentPreviewModalProps`, `PrintedPageImage`, `NotificationPopoverProps`, `NotificationActor` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `CreditNoteModal.tsx`, `A4InvoicePreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `BillingCounter.tsx`, `InvoiceDetailDrawer.tsx`, `ProductTable.tsx`, `authSlice.ts`, `AppShell.tsx`, `searchFields.ts`, `CatalogPanel.tsx`, `RepairJobList.tsx`, `products.resource.ts`, `syncSlice.ts`, `SupplierList.tsx`, `money.ts`, `EmployeeList.tsx`, `posCalculations.ts`, `useCategories.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `search.ts`, `CreditNoteModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `BillingCounter.tsx`, `router.tsx`, `providers.tsx`, `posCalculations.ts`, `InvoiceDetailDrawer.tsx`, `SyncProvider.tsx`, `ProductTable.tsx`, `authSlice.ts`, `AppShell.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `SyncEngine` connect `SyncEngine.ts` to `registry.ts`, `CreditNoteModal.tsx`, `InvoicesList.tsx`, `syncSlice.ts`, `BillingCounter.tsx`, `SyncProvider.tsx`, `idMap.ts`, `PendingOperationsList.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `DocumentPreviewSubject`, `SaleDocumentPreviewModalProps`, `PrintedPageImage` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06078316773816481 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.14390243902439023 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09243697478991597 - nodes in this community are weakly interconnected._