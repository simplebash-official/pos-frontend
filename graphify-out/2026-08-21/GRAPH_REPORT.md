# Graph Report - frontend (2026-08-21)

## Corpus Check

- 327 files · ~168,736 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1743 nodes · 5361 edges · 116 communities (86 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `653affaf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ReportsDashboard.tsx
- notificationSlice.ts
- useAppSelector
- offline/types.ts
- formatMoney
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- registry.ts
- tablerIcons.ts
- CustomerList.tsx
- providers.tsx
- dependencies
- common.ts
- moneyFormUtils.ts
- EmployeeList.tsx
- authSlice.ts
- devDependencies
- flush.ts
- RepairFormModal.tsx
- HeldCartCatchupNotifier.tsx
- search.ts
- compilerOptions
- BillingCounter.tsx
- outbox.ts
- PrintJobList.tsx
- useSyncedQuery
- client.ts
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- InvoicesList.tsx
- returnsApi.ts
- SyncPanel.tsx
- searchFields.ts
- LoginForm.tsx
- router.tsx
- SupplierList.tsx
- syncSlice.ts
- SyncEngine.ts
- Sidebar.tsx
- settingsSlice.ts
- ProductCatalogTree.tsx
- billing/types.ts
- useIsMobile
- SearchHistoryInput.tsx
- customersApi.ts
- SettingsNav.tsx
- formatDateTime
- SupplierFormModal.tsx
- useSyncData.ts
- purchasesApi.ts
- SyncModuleCard.tsx
- useSupplierProducts.ts
- useCategories.ts
- AmountInput.tsx
- ExpandableCard.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- app/App.tsx
- SyncStatusBadge.tsx
- RepairJobList.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- LogoUpload.tsx
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
6. `db` - 42 edges
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

## Communities (116 total, 30 thin omitted)

### Community 0 - "ReportsDashboard.tsx"

Cohesion: 0.36
Nodes (5): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary

### Community 1 - "notificationSlice.ts"

Cohesion: 0.17
Nodes (16): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+8 more)

### Community 2 - "useAppSelector"

Cohesion: 0.19
Nodes (23): AppUpdatePrompt(), usePrint(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection() (+15 more)

### Community 3 - "offline/types.ts"

Cohesion: 0.07
Nodes (30): blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, CursorInvalidError, reclaimInflightOperations() (+22 more)

### Community 4 - "formatMoney"

Cohesion: 0.18
Nodes (16): CURRENCY, PAYMENT_METHODS, CartLineItem, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps, PaymentPanel (+8 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.11
Nodes (30): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, StandalonePrintView() (+22 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.10
Nodes (34): PaymentMethod, CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+26 more)

### Community 7 - "registry.ts"

Cohesion: 0.06
Nodes (91): MutationRequestOptions, queryKeys, cancelInvoice(), completeSale(), createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer() (+83 more)

### Community 8 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 9 - "CustomerList.tsx"

Cohesion: 0.20
Nodes (15): CustomerList, CustomerFormModal(), applyLocalCustomerFilters(), CustomerFilters, CustomerList(), isCustomerFilterActive(), PRESET_CUSTOMER_TAGS, NO_CUSTOMERS (+7 more)

### Community 10 - "providers.tsx"

Cohesion: 0.09
Nodes (21): AppProvidersProps, AuthInitializer(), STORAGE_KEYS, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch (+13 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "common.ts"

Cohesion: 0.12
Nodes (22): ProductListParams, ProductsPageData, FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product (+14 more)

### Community 13 - "moneyFormUtils.ts"

Cohesion: 0.20
Nodes (18): EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), RepairFormModal(), MoneyInput(), MoneyInputProps (+10 more)

### Community 14 - "EmployeeList.tsx"

Cohesion: 0.11
Nodes (18): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES (+10 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.15
Nodes (22): USER_ROLE_LABELS, UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse (+14 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.09
Nodes (39): AbandonedReferenceError, BarcodeConflictError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+31 more)

### Community 18 - "RepairFormModal.tsx"

Cohesion: 0.21
Nodes (19): JOB_STATUS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob (+11 more)

### Community 20 - "HeldCartCatchupNotifier.tsx"

Cohesion: 0.16
Nodes (13): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN (+5 more)

### Community 21 - "search.ts"

Cohesion: 0.16
Nodes (23): SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges(), IndexedField (+15 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "BillingCounter.tsx"

Cohesion: 0.21
Nodes (15): CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+7 more)

### Community 24 - "outbox.ts"

Cohesion: 0.17
Nodes (19): UNSYNCED_VERSION, MIRROR_TABLE_NAMES, MirrorMeta, assignLedgerEntriesToOperation(), pendingDeltaFor(), OutboxFullError, getDeviceId(), createIdempotencyKey() (+11 more)

### Community 25 - "PrintJobList.tsx"

Cohesion: 0.25
Nodes (12): JOB_STATUS_COLORS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob() (+4 more)

### Community 26 - "useSyncedQuery"

Cohesion: 0.23
Nodes (16): useReturns(), ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES (+8 more)

### Community 27 - "client.ts"

Cohesion: 0.05
Nodes (52): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, BackendInvoice, BackendInvoiceItem (+44 more)

### Community 28 - "ProductTable.tsx"

Cohesion: 0.16
Nodes (20): fetchProducts(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useCategoryIcons(), useCategoryLookup(), NO_MOVEMENTS (+12 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.07
Nodes (31): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation (+23 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "InvoicesList.tsx"

Cohesion: 0.20
Nodes (13): fetchInvoices(), useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), ConfirmDialog(), ConfirmDialogProps (+5 more)

### Community 32 - "returnsApi.ts"

Cohesion: 0.19
Nodes (14): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+6 more)

### Community 33 - "SyncPanel.tsx"

Cohesion: 0.24
Nodes (12): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, formatBytes(), SyncPanel(), SyncSettingsSection(), MAX_CLOCK_SKEW_MS, estimateStorage() (+4 more)

### Community 34 - "searchFields.ts"

Cohesion: 0.27
Nodes (9): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, CUSTOMER_SEARCH_FIELDS, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, PRODUCT_SEARCH_FIELDS (+1 more)

### Community 35 - "LoginForm.tsx"

Cohesion: 0.22
Nodes (12): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+4 more)

### Community 36 - "router.tsx"

Cohesion: 0.13
Nodes (12): BillingCounter, EmployeeList, InvoicesList, PrintJobList, RepairJobList, SupplierList, BillingPageSkeleton(), FILL (+4 more)

### Community 37 - "SupplierList.tsx"

Cohesion: 0.18
Nodes (20): useSetSupplierLinks(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, NO_SUPPLIERS (+12 more)

### Community 38 - "syncSlice.ts"

Cohesion: 0.13
Nodes (12): PULL_INTERVAL_MS, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectIsOffline(), selectModuleView(), selectModuleViews (+4 more)

### Community 39 - "SyncEngine.ts"

Cohesion: 0.08
Nodes (35): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, readServerVersion(), toServerRow() (+27 more)

### Community 40 - "Sidebar.tsx"

Cohesion: 0.14
Nodes (17): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+9 more)

### Community 41 - "settingsSlice.ts"

Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "ProductCatalogTree.tsx"

Cohesion: 0.22
Nodes (14): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductFormModal() (+6 more)

### Community 43 - "billing/types.ts"

Cohesion: 0.16
Nodes (17): PaymentPanelProps, useInvoicePayments(), useRecordPayment(), useInvoiceReturns(), useProcessReturn(), Invoice, InvoiceItem, InvoiceDetailDrawer() (+9 more)

### Community 44 - "useIsMobile"

Cohesion: 0.12
Nodes (25): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+17 more)

### Community 45 - "SearchHistoryInput.tsx"

Cohesion: 0.22
Nodes (14): SearchHistoryInput, SearchHistoryInputProps, getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory() (+6 more)

### Community 46 - "customersApi.ts"

Cohesion: 0.14
Nodes (16): resolveOrCreateCustomer(), fetchAllCustomers(), fetchCustomers(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModalProps, FormContentProps, CustomerPickerModalProps (+8 more)

### Community 47 - "SettingsNav.tsx"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 48 - "formatDateTime"

Cohesion: 0.24
Nodes (7): CustomerDetailDrawer(), DetailDrawer(), DetailDrawerProps, MetricCardDef, MetricCardRow(), MetricCardRowProps, formatDateTime()

### Community 49 - "SupplierFormModal.tsx"

Cohesion: 0.31
Nodes (8): SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, DEFAULT_SUGGESTED_TAGS, Supplier, SupplierInput, UpdateSupplierPayload

### Community 50 - "useSyncData.ts"

Cohesion: 0.22
Nodes (11): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+3 more)

### Community 51 - "purchasesApi.ts"

Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 52 - "SyncModuleCard.tsx"

Cohesion: 0.24
Nodes (9): SyncModuleCard(), SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, ModuleSyncStatus, ModuleSyncView, ExpandableCard() (+1 more)

### Community 53 - "useSupplierProducts.ts"

Cohesion: 0.29
Nodes (8): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, SupplierProduct, SupplierProductInput, SetLinksPayload, UnlinkPayload

### Community 54 - "useCategories.ts"

Cohesion: 0.16
Nodes (18): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCreateCategory() (+10 more)

### Community 55 - "AmountInput.tsx"

Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 56 - "ExpandableCard.tsx"

Cohesion: 0.31
Nodes (7): ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.09
Nodes (33): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_INVOICES, useCancelInvoice(), NO_PAYMENTS (+25 more)

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

### Community 65 - "app/App.tsx"

Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 66 - "SyncStatusBadge.tsx"

Cohesion: 0.43
Nodes (6): SyncStatusBadge(), SyncStatusBadgeProps, selectIsOfflineSession(), selectConnectivity(), selectOverallSyncStatus, selectSyncTotals()

### Community 67 - "RepairJobList.tsx"

Cohesion: 0.22
Nodes (13): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+5 more)

### Community 68 - "Redux Toolkit Store (src/store/)"

Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"

Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "LogoUpload.tsx"

Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

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

Cohesion: 0.24
Nodes (12): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+4 more)

## Knowledge Gaps

- **355 isolated node(s):** `A4InvoicePreviewModalProps`, `SaleDocumentPreviewModalProps`, `UseInvoiceDocumentResult`, `ResolvedId`, `PdfCanvasViewerProps` (+350 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `formatMoney`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `common.ts`, `moneyFormUtils.ts`, `EmployeeList.tsx`, `RepairFormModal.tsx`, `BillingCounter.tsx`, `useSyncedQuery`, `ProductTable.tsx`, `SyncPanel.tsx`, `LoginForm.tsx`, `SupplierList.tsx`, `Sidebar.tsx`, `ProductCatalogTree.tsx`, `billing/types.ts`, `SearchHistoryInput.tsx`, `customersApi.ts`, `formatDateTime`, `SupplierFormModal.tsx`, `useCategories.ts`, `AmountInput.tsx`, `SyncStatusBadge.tsx`, `CatalogPanel.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `SyncPanel.tsx`, `SyncStatusBadge.tsx`, `formatMoney`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `Sidebar.tsx`, `billing/types.ts`, `useIsMobile`, `SyncProvider.tsx`, `authSlice.ts`, `HeldCartCatchupNotifier.tsx`, `search.ts`, `BillingCounter.tsx`, `useSyncedQuery`, `ProductTable.tsx`, `InvoicesList.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `ReportsDashboard.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `common.ts`, `moneyFormUtils.ts`, `EmployeeList.tsx`, `RepairFormModal.tsx`, `BillingCounter.tsx`, `PrintJobList.tsx`, `useSyncedQuery`, `ProductTable.tsx`, `InvoicesList.tsx`, `searchFields.ts`, `ProductCatalogTree.tsx`, `billing/types.ts`, `useIsMobile`, `customersApi.ts`, `formatDateTime`, `SupplierFormModal.tsx`, `RepairJobList.tsx`, `CatalogPanel.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `A4InvoicePreviewModalProps`, `SaleDocumentPreviewModalProps`, `UseInvoiceDocumentResult` to the rest of the system?**
  _355 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `SaleDocumentPreviewModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10975609756097561 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._
