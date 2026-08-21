# Graph Report - frontend (2026-08-21)

## Corpus Check

- 328 files · ~169,190 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1745 nodes · 5386 edges · 124 communities (91 shown, 33 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `af87011d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- pull.ts
- notificationSlice.ts
- useAppSelector
- registry.ts
- PaymentPanel.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- schema.ts
- tablerIcons.ts
- CustomerList.tsx
- store/index.ts
- dependencies
- inventory/types.ts
- formatMoney
- mockEmployees.ts
- authSlice.ts
- devDependencies
- flush.ts
- products.resource.ts
- RequireAuth.tsx
- search.ts
- compilerOptions
- BillingCounter.tsx
- outbox.ts
- invoicesApi.ts
- useIsMobile
- ApiClient
- ProductTable.tsx
- ConnectivityMonitor
- Backend Sync Requirements Doc
- SupplierList.tsx
- returns.resource.ts
- offline/constants.ts
- PrintJobList.tsx
- LoginForm.tsx
- router.tsx
- useSyncedMutation
- syncSlice.ts
- SyncEngine.ts
- Sidebar.tsx
- settingsSlice.ts
- CategoryManagerModal.tsx
- ReturnModal.tsx
- AppShell.tsx
- useSearchHistory.ts
- customers.resource.ts
- SettingsPage.tsx
- InvoicesList.tsx
- SupplierFormModal.tsx
- offline/index.ts
- mirror.ts
- syncApi.ts
- useSupplierProducts.ts
- useCategories.ts
- AmountInput.tsx
- client.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- tables.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- app/App.tsx
- suppliers.resource.ts
- supplierProducts.resource.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- LogoUpload.tsx
- payments.resource.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- providers.tsx
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- LocalStorageStore
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- CartLineItem.tsx
- useShortcuts.ts
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
- backoff.ts
- navigation.ts
- queryKeys.ts
- @mantine/hooks

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 64 edges
3. `formatMoney()` - 61 edges
4. `useSyncedMutation()` - 46 edges
5. `useAppDispatch` - 44 edges
6. `db` - 43 edges
7. `queryKeys` - 33 edges
8. `useSyncedQuery()` - 33 edges
9. `ConnectivityMonitor` - 30 edges
10. `ApiClient` - 28 edges

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

- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
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

## Communities (124 total, 33 thin omitted)

### Community 0 - "pull.ts"

Cohesion: 0.13
Nodes (21): toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, adoptNewestCursor() (+13 more)

### Community 1 - "notificationSlice.ts"

Cohesion: 0.17
Nodes (16): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+8 more)

### Community 2 - "useAppSelector"

Cohesion: 0.22
Nodes (20): HeldCartCatchupNotifier(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection(), PrintingFormValues (+12 more)

### Community 3 - "registry.ts"

Cohesion: 0.09
Nodes (24): MirroredRow, reclaimInflightOperations(), getReferringResources(), getResourceRanks(), getResourcesInDependencyOrder(), resetRegistry(), resources, Widget (+16 more)

### Community 4 - "PaymentPanel.tsx"

Cohesion: 0.25
Nodes (9): PAYMENT_METHODS, CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, SaleHeroPresentation, Invoice, InvoiceItem, SplitPaymentDetail (+1 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.15
Nodes (21): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult (+13 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.11
Nodes (30): PaymentMethod, PaymentPanel, useCartCheckout(), useCartTotals(), cartSlice, CartState, CompletedSaleData, DiscountType (+22 more)

### Community 7 - "schema.ts"

Cohesion: 0.09
Nodes (53): JobStatus, addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), SplitType, BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw() (+45 more)

### Community 8 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 9 - "CustomerList.tsx"

Cohesion: 0.16
Nodes (25): CustomerDetailDrawer(), CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters(), CustomerFilters, CustomerList() (+17 more)

### Community 10 - "store/index.ts"

Cohesion: 0.12
Nodes (16): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme() (+8 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"

Cohesion: 0.13
Nodes (24): ProductsPageData, ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories() (+16 more)

### Community 13 - "formatMoney"

Cohesion: 0.15
Nodes (26): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, CURRENCY, DiscountPopover(), DiscountPopoverProps, fetchEmployees(), ProductFormContent() (+18 more)

### Community 14 - "mockEmployees.ts"

Cohesion: 0.13
Nodes (21): createEmployee(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+13 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.16
Nodes (21): AuthInitializer(), UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse (+13 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+30 more)

### Community 18 - "products.resource.ts"

Cohesion: 0.15
Nodes (14): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, updateProduct(), markPending(), appendStockDelta() (+6 more)

### Community 20 - "RequireAuth.tsx"

Cohesion: 0.21
Nodes (11): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppRoute, ROUTE_PATHS, PageLoader(), PageLoaderProps (+3 more)

### Community 21 - "search.ts"

Cohesion: 0.15
Nodes (24): SupplierPickerModalProps, SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges() (+16 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "BillingCounter.tsx"

Cohesion: 0.12
Nodes (28): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+20 more)

### Community 24 - "outbox.ts"

Cohesion: 0.25
Nodes (13): MIRROR_TABLE_NAMES, assignLedgerEntriesToOperation(), OutboxFullError, getDeviceId(), createIdempotencyKey(), createLocalId(), randomUuid(), assertOutboxHasCapacity() (+5 more)

### Community 25 - "invoicesApi.ts"

Cohesion: 0.17
Nodes (19): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+11 more)

### Community 26 - "useIsMobile"

Cohesion: 0.13
Nodes (26): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps (+18 more)

### Community 27 - "ApiClient"

Cohesion: 0.07
Nodes (33): ApiClient, buildParams(), buildSyncHeaders(), BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats() (+25 more)

### Community 28 - "ProductTable.tsx"

Cohesion: 0.27
Nodes (14): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+6 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "SupplierList.tsx"

Cohesion: 0.17
Nodes (18): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), SupplierFilters, ConfirmDialog(), ConfirmDialogProps, Column (+10 more)

### Community 32 - "returns.resource.ts"

Cohesion: 0.26
Nodes (14): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+6 more)

### Community 33 - "offline/constants.ts"

Cohesion: 0.12
Nodes (20): env, probeClient, probeHealth(), ProbeResult, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS, HEALTH_PROBE_INTERVAL_ONLINE_MS (+12 more)

### Community 34 - "PrintJobList.tsx"

Cohesion: 0.14
Nodes (19): PrintJobList, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+11 more)

### Community 35 - "LoginForm.tsx"

Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 36 - "router.tsx"

Cohesion: 0.13
Nodes (14): BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, RepairJobList, ReportsDashboard, StandalonePrintView, SupplierList (+6 more)

### Community 37 - "useSyncedMutation"

Cohesion: 0.32
Nodes (11): applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierList(), NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier(), useDeleteSuppliers() (+3 more)

### Community 38 - "syncSlice.ts"

Cohesion: 0.07
Nodes (43): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+35 more)

### Community 39 - "SyncEngine.ts"

Cohesion: 0.09
Nodes (24): AUDIT_LOG_LIMIT, STORAGE_QUOTA_WARN_RATIO, SYNC_LEADER_LOCK, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate (+16 more)

### Community 40 - "Sidebar.tsx"

Cohesion: 0.20
Nodes (11): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, USER_ROLE_LABELS, USER_ROLES, LowStockNotifier(), notifiedProductIds (+3 more)

### Community 41 - "settingsSlice.ts"

Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "CategoryManagerModal.tsx"

Cohesion: 0.17
Nodes (18): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps (+10 more)

### Community 43 - "ReturnModal.tsx"

Cohesion: 0.15
Nodes (17): InvoicesList, ProcessReturnItemInput, NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), NO_RETURNS, useInvoiceReturns(), useProcessReturn() (+9 more)

### Community 44 - "AppShell.tsx"

Cohesion: 0.18
Nodes (11): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer(), HeldSalesDrawerProps (+3 more)

### Community 45 - "useSearchHistory.ts"

Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 46 - "customers.resource.ts"

Cohesion: 0.25
Nodes (10): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+2 more)

### Community 47 - "SettingsPage.tsx"

Cohesion: 0.32
Nodes (9): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS, SettingsSectionId (+1 more)

### Community 48 - "InvoicesList.tsx"

Cohesion: 0.22
Nodes (10): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), MetricCardDef, MetricCardRow(), MetricCardRowProps (+2 more)

### Community 49 - "SupplierFormModal.tsx"

Cohesion: 0.31
Nodes (8): SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, DEFAULT_SUGGESTED_TAGS, Supplier, SupplierInput, UpdateSupplierPayload

### Community 50 - "offline/index.ts"

Cohesion: 0.16
Nodes (13): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, SyncMetaRecord, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+5 more)

### Community 51 - "mirror.ts"

Cohesion: 0.15
Nodes (17): resolveOrCreateCustomer(), createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary (+9 more)

### Community 52 - "syncApi.ts"

Cohesion: 0.21
Nodes (15): defineSyncResource(), stockMovementsResource, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshot(), fetchResourceSnapshotPage(), fetchSyncChanges() (+7 more)

### Community 53 - "useSupplierProducts.ts"

Cohesion: 0.29
Nodes (9): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useSetSupplierLinks(), useUnlinkProduct(), SupplierProduct (+1 more)

### Community 54 - "useCategories.ts"

Cohesion: 0.21
Nodes (15): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), buildCategoryLookup(), NO_CATEGORIES (+7 more)

### Community 55 - "AmountInput.tsx"

Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 56 - "client.ts"

Cohesion: 0.15
Nodes (12): isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners, NetworkObservation, observeNetwork(), reportNetworkObservation() (+4 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "tables.ts"

Cohesion: 0.11
Nodes (23): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OfflineDb, AuditEvent, AuditLevel, ConflictReason, ConflictRecord (+15 more)

### Community 60 - "SyncProvider.tsx"

Cohesion: 0.53
Nodes (8): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider()

### Community 61 - "App Entry Chain"

Cohesion: 0.20
Nodes (10): Deploy Frontend Workflow, paths-ignore Trigger Filter, AppShell.tsx, cssVariablesResolver.ts Design Tokens, App Entry Chain, Feature Module Pattern (components/, types.ts, index.ts barrel), graphify Knowledge Graph Integration, @/* Path Alias (+2 more)

### Community 62 - "Animation Performance Rules"

Cohesion: 0.29
Nodes (10): AmountInput.tsx, Animation Performance Rules, BillingRegions.tsx, CartLineItem.tsx, CartPanel.tsx, CatalogPanel.tsx, LayoutTierProvider, Responsive & Mobile UI Layout Tiers (+2 more)

### Community 63 - "Offline & Sync Architecture"

Cohesion: 0.27
Nodes (10): ApiClient (src/api/client.ts), AppUpdatePrompt.tsx, Backend Sync Contract (Rust/Axum), ConnectivityMonitor, isBillingBoundaryChange Render-Time State Adjustment, localId.ts (Provisional local_ IDs), Offline & Sync Architecture, Durable Outbox Pattern (+2 more)

### Community 64 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 65 - "app/App.tsx"

Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 66 - "suppliers.resource.ts"

Cohesion: 0.23
Nodes (11): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), registerSyncResource(), registerSyncResources() (+3 more)

### Community 67 - "supplierProducts.resource.ts"

Cohesion: 0.24
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), markDeleted() (+4 more)

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

### Community 72 - "payments.resource.ts"

Cohesion: 0.35
Nodes (9): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), paymentsResource, RecordPaymentPayload (+1 more)

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

Cohesion: 0.21
Nodes (8): AppUpdatePrompt(), AppProvidersProps, darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars, CONTAINER_SIZES, mantineTheme

### Community 77 - "Right-Side Detail Drawer Visual Family"

Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CatalogPanel.tsx"

Cohesion: 0.27
Nodes (13): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+5 more)

### Community 83 - "CartLineItem.tsx"

Cohesion: 0.27
Nodes (8): CartLineItem, CartLineItemProps, getCategoryIconInfo(), LineSourceType, HEIGHT_MAP, QuantityInput(), QuantityInputProps, CartItem

### Community 84 - "useShortcuts.ts"

Cohesion: 0.36
Nodes (7): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope, useAppShortcuts()

### Community 120 - "backoff.ts"

Cohesion: 0.40
Nodes (5): RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS, nextAttemptAt(), nextAttemptDelayMs()

### Community 121 - "navigation.ts"

Cohesion: 0.40
Nodes (4): NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig

## Knowledge Gaps

- **351 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+346 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `PaymentPanel.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `inventory/types.ts`, `formatMoney`, `mockEmployees.ts`, `search.ts`, `BillingCounter.tsx`, `ProductTable.tsx`, `PrintJobList.tsx`, `LoginForm.tsx`, `syncSlice.ts`, `Sidebar.tsx`, `CategoryManagerModal.tsx`, `ReturnModal.tsx`, `AppShell.tsx`, `SupplierFormModal.tsx`, `AmountInput.tsx`, `CartLineItem.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `PaymentPanel.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `Sidebar.tsx`, `ReturnModal.tsx`, `providers.tsx`, `AppShell.tsx`, `SyncProvider.tsx`, `InvoicesList.tsx`, `RequireAuth.tsx`, `search.ts`, `BillingCounter.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `offline/constants.ts`, `SyncEngine.ts`, `authSlice.ts`, `flush.ts`, `offline/index.ts`, `client.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _351 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pull.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._
- **Should `SaleDocumentPreviewModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14962121212121213 - nodes in this community are weakly interconnected._
