# Graph Report - frontend  (2026-08-21)

## Corpus Check
- 328 files · ~169,145 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1744 nodes · 5385 edges · 112 communities (81 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `87e50eb1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SyncEngine.ts
- notificationSlice.ts
- useAppSelector
- registry.ts
- BillingCounter.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- useSyncData.ts
- CustomerList.tsx
- SegmentedToggle.tsx
- dependencies
- formatMoney
- RepairFormModal.tsx
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- products.resource.ts
- tablerIconShards/index.ts
- RequireAuth.tsx
- searchFields.ts
- compilerOptions
- Header.tsx
- outbox.ts
- invoicesApi.ts
- useIsMobile
- common.ts
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- EmployeeList.tsx
- returns.resource.ts
- AppShell.tsx
- PrintJobList.tsx
- LoginForm.tsx
- router.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine
- audio.ts
- settingsSlice.ts
- CategoryManagerModal.tsx
- InvoicesList.tsx
- customers.resource.ts
- SettingsNav.tsx
- @mantine/form
- SupplierList.tsx
- purchasesApi.ts
- syncApi.ts
- useCategories.ts
- AmountInput.tsx
- client.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- providers.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useSupplierProducts.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- LogoUpload.tsx
- payments.resource.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- LocalStorageStore
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
- useShortcuts.ts

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 64 edges
3. `formatMoney()` - 61 edges
4. `useSyncedMutation()` - 46 edges
5. `useAppDispatch` - 44 edges
6. `db` - 43 edges
7. `useSyncedQuery()` - 33 edges
8. `queryKeys` - 33 edges
9. `ConnectivityMonitor` - 30 edges
10. `ApiClient` - 28 edges

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
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
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

## Communities (112 total, 31 thin omitted)

### Community 0 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (27): toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+19 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.06
Nodes (44): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+36 more)

### Community 2 - "useAppSelector"
Cohesion: 0.21
Nodes (21): AppUpdatePrompt(), usePrint(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection() (+13 more)

### Community 3 - "registry.ts"
Cohesion: 0.09
Nodes (25): db, reclaimInflightOperations(), defineOperation(), defineSyncResource(), getReferringResources(), getResourceRanks(), getResourcesInDependencyOrder(), resetRegistry() (+17 more)

### Community 4 - "BillingCounter.tsx"
Cohesion: 0.11
Nodes (27): PAYMENT_METHODS, PaymentMethod, CompleteSaleInput, CompleteSaleResult, A4InvoicePreviewModalProps, BillingRegions, BillingRegionsProps, FILL (+19 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.18
Nodes (19): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, getPrintCountForInvoice() (+11 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (29): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+21 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.26
Nodes (17): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs() (+9 more)

### Community 8 - "useSyncData.ts"
Cohesion: 0.21
Nodes (12): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, useResolvedId(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS (+4 more)

### Community 9 - "CustomerList.tsx"
Cohesion: 0.16
Nodes (25): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters(), CustomerFilters, CustomerList() (+17 more)

### Community 10 - "SegmentedToggle.tsx"
Cohesion: 0.22
Nodes (11): DiscountPopoverProps, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, SegmentedToggle(), SegmentedToggleProps (+3 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "formatMoney"
Cohesion: 0.13
Nodes (22): CURRENCY, CartLineItem, DiscountPopover(), HeldSalesDrawer(), HeldSalesDrawerProps, getCategoryIconInfo(), CustomerFormContent(), FormContentProps (+14 more)

### Community 13 - "RepairFormModal.tsx"
Cohesion: 0.20
Nodes (22): JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, RepairFormModal(), RepairFormModalProps (+14 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (12): BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), FetchRepairsParams, RepairListResponseData, toRepairJob(), updateRepairJobRaw() (+4 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.15
Nodes (22): AuthInitializer(), UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse (+14 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (39): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+31 more)

### Community 18 - "products.resource.ts"
Cohesion: 0.11
Nodes (26): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), createSupplier() (+18 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "RequireAuth.tsx"
Cohesion: 0.25
Nodes (8): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, PageLoader(), PageLoaderProps, selectIsAuthInitialized(), selectIsAuthLoading()

### Community 21 - "searchFields.ts"
Cohesion: 0.12
Nodes (30): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch() (+22 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "Header.tsx"
Cohesion: 0.16
Nodes (18): Header(), HeaderProps, BillingCounter(), BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, CartPanel (+10 more)

### Community 24 - "outbox.ts"
Cohesion: 0.18
Nodes (16): ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, assignLedgerEntriesToOperation(), OutboxFullError, getDeviceId(), createIdempotencyKey() (+8 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.17
Nodes (19): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+11 more)

### Community 26 - "useIsMobile"
Cohesion: 0.11
Nodes (33): fetchEmployeeEarnings(), EmployeeDetailDrawer(), ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich() (+25 more)

### Community 27 - "common.ts"
Cohesion: 0.12
Nodes (24): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats() (+16 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.25
Nodes (16): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useCategoryLookup(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+8 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.06
Nodes (36): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation (+28 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "EmployeeList.tsx"
Cohesion: 0.11
Nodes (26): ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees() (+18 more)

### Community 32 - "returns.resource.ts"
Cohesion: 0.26
Nodes (13): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+5 more)

### Community 33 - "AppShell.tsx"
Cohesion: 0.10
Nodes (23): RequireAdmin(), RequireAdminProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Sidebar() (+15 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.23
Nodes (13): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS (+5 more)

### Community 35 - "LoginForm.tsx"
Cohesion: 0.24
Nodes (11): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+3 more)

### Community 36 - "router.tsx"
Cohesion: 0.07
Nodes (24): App(), AppShell(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList (+16 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.29
Nodes (11): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+3 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.05
Nodes (54): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+46 more)

### Community 39 - "SyncEngine"
Cohesion: 0.14
Nodes (10): AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection, SyncEngine, describeError() (+2 more)

### Community 40 - "audio.ts"
Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

### Community 41 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "CategoryManagerModal.tsx"
Cohesion: 0.14
Nodes (22): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductCatalogTreeProps (+14 more)

### Community 43 - "InvoicesList.tsx"
Cohesion: 0.12
Nodes (24): InvoicesList, ProcessReturnItemInput, useAllInvoices(), useInvoicePayments(), useRecordPayment(), NO_RETURNS, useInvoiceReturns(), useProcessReturn() (+16 more)

### Community 46 - "customers.resource.ts"
Cohesion: 0.20
Nodes (12): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+4 more)

### Community 47 - "SettingsNav.tsx"
Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 50 - "SupplierList.tsx"
Cohesion: 0.14
Nodes (22): useSetSupplierLinks(), fetchSuppliers(), SupplierListParams, SupplierDetailDrawerProps, FormContentProps, SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive() (+14 more)

### Community 51 - "purchasesApi.ts"
Cohesion: 0.22
Nodes (11): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary (+3 more)

### Community 52 - "syncApi.ts"
Cohesion: 0.22
Nodes (13): PULL_PAGE_LIMIT, stockMovementsResource, ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges() (+5 more)

### Community 54 - "useCategories.ts"
Cohesion: 0.13
Nodes (24): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), buildCategoryLookup(), NO_CATEGORIES (+16 more)

### Community 55 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 56 - "client.ts"
Cohesion: 0.23
Nodes (7): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation()

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.10
Nodes (31): StockMovement, readServerVersion(), UNSYNCED_VERSION, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord (+23 more)

### Community 60 - "providers.tsx"
Cohesion: 0.13
Nodes (22): HeldCartCatchupNotifier(), AppProvidersProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings() (+14 more)

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

### Community 67 - "useSupplierProducts.ts"
Cohesion: 0.19
Nodes (18): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+10 more)

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
Cohesion: 0.40
Nodes (8): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, paymentsResource, RecordPaymentPayload

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
Cohesion: 0.29
Nodes (9): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), resolveOrCreateCustomer() (+1 more)

### Community 120 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

## Knowledge Gaps
- **351 isolated node(s):** `ProductFilters`, `UseBackendFilteredListResult`, `PullSummary`, `Widget`, `NotificationPopoverProps` (+346 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `SyncEngine.ts`, `flush.ts`, `schema.ts`, `authSlice.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `AppShell.tsx`, `notificationSlice.ts`, `LoginForm.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `syncSlice.ts`, `CustomerList.tsx`, `SegmentedToggle.tsx`, `CategoryManagerModal.tsx`, `formatMoney`, `InvoicesList.tsx`, `RepairFormModal.tsx`, `AmountInput.tsx`, `Header.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `AppShell.tsx`, `notificationSlice.ts`, `router.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoicesList.tsx`, `ProductTable.tsx`, `authSlice.ts`, `RequireAuth.tsx`, `searchFields.ts`, `Header.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `ProductFilters`, `UseBackendFilteredListResult`, `PullSummary` to the rest of the system?**
  _351 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SyncEngine.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11746031746031746 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06078316773816481 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08858858858858859 - nodes in this community are weakly interconnected._