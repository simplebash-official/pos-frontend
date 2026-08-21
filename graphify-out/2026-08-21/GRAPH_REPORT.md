# Graph Report - frontend (2026-08-21)

## Corpus Check

- 326 files · ~168,066 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1740 nodes · 5332 edges · 111 communities (80 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `efcb2ac7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ReportsDashboard.tsx
- notificationSlice.ts
- useAppSelector
- supplierProductsApi.ts
- formatMoney
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- registry.ts
- tablerIcons.ts
- client.ts
- providers.tsx
- dependencies
- common.ts
- money.ts
- mockEmployees.ts
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobFormModal.tsx
- invoicesApi.ts
- search.ts
- compilerOptions
- SupplierDetailDrawer.tsx
- outbox.ts
- PrintJobList.tsx
- purchasesApi.ts
- ApiResponse
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- useCategories.ts
- ConnectivityMonitor
- SyncPanel.tsx
- searchFields.ts
- InvoicesList.tsx
- router.tsx
- SupplierList.tsx
- offline/types.ts
- SyncEngine.ts
- formatDateTime
- settingsSlice.ts
- inventory/index.ts
- ReturnModal.tsx
- useIsMobile
- ConnectivitySnapshot
- CustomerList.tsx
- backoff.ts
- useCustomerStats.ts
- usePrintJobStats.ts
- offline/index.ts
- networkSignal.ts
- CategoryManagerModal.tsx
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- returnsApi.ts
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
6. `db` - 41 edges
7. `useSyncedQuery()` - 33 edges
8. `queryKeys` - 33 edges
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
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

### Community 0 - "ReportsDashboard.tsx"

Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 1 - "notificationSlice.ts"

Cohesion: 0.06
Nodes (43): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification (+35 more)

### Community 2 - "useAppSelector"

Cohesion: 0.13
Nodes (32): Sidebar(), NotificationPopover(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues (+24 more)

### Community 3 - "supplierProductsApi.ts"

Cohesion: 0.60
Nodes (4): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), SupplierProductListParams

### Community 4 - "formatMoney"

Cohesion: 0.08
Nodes (42): PAYMENT_METHODS, PaymentMethod, CompleteSaleInput, BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+34 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.09
Nodes (37): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, CompleteSaleResult, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModal() (+29 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.12
Nodes (27): AppUpdatePrompt(), useCartCheckout(), useCartTotals(), SplitPaymentDetail, cartSlice, CartState, DiscountType, HeldCart (+19 more)

### Community 7 - "registry.ts"

Cohesion: 0.06
Nodes (98): queryKeys, cancelInvoice(), completeSale(), RecordPaymentInput, createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer() (+90 more)

### Community 8 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (18): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+10 more)

### Community 9 - "client.ts"

Cohesion: 0.14
Nodes (12): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), MutationRequestOptions, readServerTime(), RequestOptions, BackendPaymentRecord (+4 more)

### Community 10 - "providers.tsx"

Cohesion: 0.08
Nodes (30): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, SidebarProps, AppProvidersProps, AuthInitializer() (+22 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "common.ts"

Cohesion: 0.10
Nodes (26): ProductListParams, ProductsPageData, ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource (+18 more)

### Community 13 - "money.ts"

Cohesion: 0.24
Nodes (15): CURRENCY, ProductFormContent(), RepairFormModal(), STATUSES_REQUIRING_PRICE, MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents() (+7 more)

### Community 14 - "mockEmployees.ts"

Cohesion: 0.13
Nodes (12): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+4 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.08
Nodes (37): RequireAdmin(), RequireAdminProps, EmailLoginScreen, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), loginApi() (+29 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+30 more)

### Community 18 - "PrintJobFormModal.tsx"

Cohesion: 0.29
Nodes (14): JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput, PrintJobType (+6 more)

### Community 20 - "invoicesApi.ts"

Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+7 more)

### Community 21 - "search.ts"

Cohesion: 0.16
Nodes (23): SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges(), IndexedField (+15 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "SupplierDetailDrawer.tsx"

Cohesion: 0.15
Nodes (21): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useProductsForSupplier(), useUnlinkProduct(), SupplierProduct (+13 more)

### Community 24 - "outbox.ts"

Cohesion: 0.12
Nodes (25): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, OutboxStatus, assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey() (+17 more)

### Community 25 - "PrintJobList.tsx"

Cohesion: 0.18
Nodes (15): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+7 more)

### Community 26 - "purchasesApi.ts"

Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 27 - "ApiResponse"

Cohesion: 0.18
Nodes (15): BillingStats, fetchBillingStats(), useBillingStats(), fetchInventoryStats(), InventoryStats, useInventoryStats(), fetchRepairStats(), RepairStats (+7 more)

### Community 28 - "ProductTable.tsx"

Cohesion: 0.13
Nodes (29): useReturns(), fetchProducts(), ProductPickerModal(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS (+21 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.10
Nodes (23): env, probeClient, probeHealth(), ProbeResult, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEADER_DEVICE_ID, HEADER_IDEMPOTENCY_KEY (+15 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "useCategories.ts"

Cohesion: 0.19
Nodes (12): CategoryManagerModal(), buildCategoryLookup(), NO_CATEGORIES, useCreateCategory(), useDeleteCategory(), useDeleteSubcategory(), useValidCategories(), CategoryInput (+4 more)

### Community 33 - "SyncPanel.tsx"

Cohesion: 0.18
Nodes (18): formatBytes(), SyncPanel(), STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, estimateStorage(), exportDiagnostics(), forceFullResync() (+10 more)

### Community 34 - "searchFields.ts"

Cohesion: 0.21
Nodes (11): ProductPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHistoryInput, SearchHistoryInputProps, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS (+3 more)

### Community 35 - "InvoicesList.tsx"

Cohesion: 0.24
Nodes (11): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), Column, DataTable(), DataTableProps (+3 more)

### Community 36 - "router.tsx"

Cohesion: 0.10
Nodes (16): App(), AppProviders(), BillingCounter, CustomerList, PrintJobList, ProductTable, RepairJobList, router (+8 more)

### Community 37 - "SupplierList.tsx"

Cohesion: 0.17
Nodes (22): SupplierList, useSetSupplierLinks(), fetchSuppliers(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), SupplierPickerModal() (+14 more)

### Community 38 - "offline/types.ts"

Cohesion: 0.07
Nodes (28): SyncModuleCard(), SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, PULL_INTERVAL_MS, ConflictPolicy, ConflictStrategy (+20 more)

### Community 39 - "SyncEngine.ts"

Cohesion: 0.08
Nodes (33): readServerVersion(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta() (+25 more)

### Community 40 - "formatDateTime"

Cohesion: 0.29
Nodes (7): fetchInvoices(), CustomerDetailDrawer(), CustomerDetailDrawerProps, ProductCatalogTree, DetailDrawer(), DetailDrawerProps, formatDateTime()

### Community 41 - "settingsSlice.ts"

Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "inventory/index.ts"

Cohesion: 0.35
Nodes (8): CatalogCategoryFilter, CategoryIconInfo, ProductFormModal(), CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon(), TablerIcon, resolveTablerIcon()

### Community 43 - "ReturnModal.tsx"

Cohesion: 0.24
Nodes (8): useProcessReturn(), ItemReturnState, REASON_OPTIONS, ReturnModal(), ReturnModalProps, HEIGHT_MAP, QuantityInput(), QuantityInputProps

### Community 44 - "useIsMobile"

Cohesion: 0.09
Nodes (34): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+26 more)

### Community 45 - "ConnectivitySnapshot"

Cohesion: 0.25
Nodes (5): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, SyncEngineState, SyncState

### Community 46 - "CustomerList.tsx"

Cohesion: 0.12
Nodes (29): fetchAllCustomers(), fetchCustomers(), CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters(), CustomerFilters (+21 more)

### Community 47 - "backoff.ts"

Cohesion: 0.40
Nodes (5): RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS, nextAttemptAt(), nextAttemptDelayMs()

### Community 48 - "useCustomerStats.ts"

Cohesion: 0.70
Nodes (3): CustomerStats, fetchCustomerStats(), useCustomerStats()

### Community 49 - "usePrintJobStats.ts"

Cohesion: 0.70
Nodes (3): fetchPrintJobStats(), PrintJobStats, usePrintJobStats()

### Community 50 - "offline/index.ts"

Cohesion: 0.13
Nodes (18): stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, pendingDeltaFor(), OutboxFullError, LOCAL_ID_PREFIX, depsChanged(), LiveQueryResult (+10 more)

### Community 51 - "networkSignal.ts"

Cohesion: 0.40
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

### Community 54 - "CategoryManagerModal.tsx"

Cohesion: 0.18
Nodes (13): AddSubcategoryRow(), CategoryItem(), CategoryManagerModalProps, useCreateSubcategory(), useUpdateCategory(), ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps (+5 more)

### Community 56 - "EmployeeList.tsx"

Cohesion: 0.21
Nodes (14): EmployeeList, fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS (+6 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.11
Nodes (28): InvoicesList, PaymentRecord, NO_INVOICES, useCancelInvoice(), NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), NO_RETURNS (+20 more)

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

### Community 66 - "returnsApi.ts"

Cohesion: 0.17
Nodes (14): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+6 more)

### Community 67 - "RepairJobList.tsx"

Cohesion: 0.21
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS (+6 more)

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

Cohesion: 0.22
Nodes (16): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+8 more)

## Knowledge Gaps

- **354 isolated node(s):** `BackendReturnItem`, `BackendReturnRecord`, `ReturnListResponseData`, `FetchReturnsParams`, `DailySalesReportSummary` (+349 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `formatMoney`, `SaleDocumentPreviewModal.tsx`, `providers.tsx`, `common.ts`, `money.ts`, `authSlice.ts`, `PrintJobFormModal.tsx`, `SupplierDetailDrawer.tsx`, `ProductTable.tsx`, `useCategories.ts`, `searchFields.ts`, `SupplierList.tsx`, `formatDateTime`, `inventory/index.ts`, `ReturnModal.tsx`, `CustomerList.tsx`, `CategoryManagerModal.tsx`, `EmployeeList.tsx`, `schema.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `SyncEngine.ts`, `ConnectivitySnapshot`, `authSlice.ts`, `flush.ts`, `offline/index.ts`, `offline/constants.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `SyncPanel.tsx`, `InvoicesList.tsx`, `formatMoney`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `providers.tsx`, `ReturnModal.tsx`, `useIsMobile`, `SyncProvider.tsx`, `authSlice.ts`, `offline/index.ts`, `search.ts`, `ProductTable.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `BackendReturnItem`, `BackendReturnRecord`, `ReturnListResponseData` to the rest of the system?**
  _354 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06110102843315184 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12790697674418605 - nodes in this community are weakly interconnected._
- **Should `formatMoney` be split into smaller, more focused modules?**
  _Cohesion score 0.07878787878787878 - nodes in this community are weakly interconnected._
