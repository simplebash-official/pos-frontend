# Graph Report - frontend (2026-08-20)

## Corpus Check

- 318 files · ~163,664 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1683 nodes · 5070 edges · 119 communities (87 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `a9e4bcdb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- EmployeeList.tsx
- notificationSlice.ts
- useAppSelector
- LoginForm.tsx
- useResponsive.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- formatMoney
- pull.test.ts
- purchasesApi.ts
- SyncEngine.ts
- dependencies
- ProductTable.tsx
- useEntitySearch
- LocalStorageStore
- authSlice.ts
- devDependencies
- flush.ts
- RepairFormModal.tsx
- tablerIconShards/index.ts
- router.tsx
- products.resource.ts
- compilerOptions
- common.ts
- submit.ts
- RepairJobList.tsx
- Sidebar.tsx
- invoicesApi.ts
- useIsMobile
- offline/constants.ts
- Backend Sync Requirements Doc
- offline/types.ts
- ReportsDashboard.tsx
- registry.ts
- useSyncData.ts
- ConnectivityMonitor
- BillingCounter.tsx
- useSyncedMutation
- syncSlice.ts
- ApiClient
- PaymentPanel.tsx
- settings/types.ts
- syncApi.ts
- categories.resource.ts
- useCategories.ts
- repairs.resource.ts
- AppShell.tsx
- @mantine/form
- SettingsNav.tsx
- LogoUpload.tsx
- react-dom
- @tanstack/react-query
- printJobs.resource.ts
- SyncEngine
- providers.tsx
- supplierProducts.resource.ts
- money.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- customers.resource.ts
- AmountInput.tsx
- idMap.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- EntityListPage.tsx
- suppliers.resource.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- networkSignal.ts
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- InvoiceDetailDrawer.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- ConnectivitySnapshot
- useShortcuts.ts
- vite-plugin-pwa
- prettier
- typescript
- typescript-eslint
- backoff.ts
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

1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 62 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 39 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `flushOutbox()` - 27 edges
10. `fetchResourceDelta()` - 27 edges

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

## Communities (119 total, 32 thin omitted)

### Community 0 - "EmployeeList.tsx"

Cohesion: 0.13
Nodes (25): EmployeeList, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS (+17 more)

### Community 1 - "notificationSlice.ts"

Cohesion: 0.09
Nodes (31): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+23 more)

### Community 2 - "useAppSelector"

Cohesion: 0.17
Nodes (25): BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection(), PrintingFormValues, PrintingSection() (+17 more)

### Community 3 - "LoginForm.tsx"

Cohesion: 0.17
Nodes (15): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+7 more)

### Community 4 - "useResponsive.tsx"

Cohesion: 0.16
Nodes (12): HeldSalesDrawer(), HeldSalesDrawerProps, BillingPageSkeleton(), FILL, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue (+4 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.16
Nodes (22): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+14 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.12
Nodes (28): useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState, DiscountType, initialState (+20 more)

### Community 7 - "formatMoney"

Cohesion: 0.12
Nodes (34): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal() (+26 more)

### Community 8 - "pull.test.ts"

Cohesion: 0.11
Nodes (23): readServerVersion(), toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), SyncMetaPatch, adoptNewestCursor() (+15 more)

### Community 9 - "purchasesApi.ts"

Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 10 - "SyncEngine.ts"

Cohesion: 0.12
Nodes (20): AUDIT_LOG_LIMIT, STORAGE_QUOTA_WARN_RATIO, SYNC_LEADER_LOCK, clearLocalData(), ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate (+12 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "ProductTable.tsx"

Cohesion: 0.10
Nodes (38): FormContentProps, ProductFormModalProps, SupplierIntakeRow, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+30 more)

### Community 13 - "useEntitySearch"

Cohesion: 0.16
Nodes (23): SearchHighlight(), SearchHighlightProps, UseBackendSearchResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges(), IndexedField (+15 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.13
Nodes (24): AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse (+16 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.14
Nodes (30): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), isLocalId(), ApiErrorLike, classifyFailure(), commitSuccess() (+22 more)

### Community 18 - "RepairFormModal.tsx"

Cohesion: 0.21
Nodes (18): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+10 more)

### Community 19 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"

Cohesion: 0.08
Nodes (25): App(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), AppProviders() (+17 more)

### Community 21 - "products.resource.ts"

Cohesion: 0.21
Nodes (9): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+1 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "common.ts"

Cohesion: 0.18
Nodes (15): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), fetchPrintJobStats(), PrintJobStats, usePrintJobStats(), fetchRepairStats() (+7 more)

### Community 24 - "submit.ts"

Cohesion: 0.37
Nodes (9): assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), createLocalId(), randomUuid(), assertOutboxHasCapacity(), enqueueOperation(), submitOperation() (+1 more)

### Community 25 - "RepairJobList.tsx"

Cohesion: 0.10
Nodes (31): RepairJobList, fetchInvoices(), useAllInvoices(), InvoicesList(), PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob() (+23 more)

### Community 26 - "Sidebar.tsx"

Cohesion: 0.14
Nodes (16): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+8 more)

### Community 27 - "invoicesApi.ts"

Cohesion: 0.13
Nodes (21): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+13 more)

### Community 28 - "useIsMobile"

Cohesion: 0.24
Nodes (17): ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase() (+9 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.14
Nodes (21): RequestOptions, env, probeClient, probeHealth(), ProbeResult, DEGRADED_LATENCY_MS, HEADER_DEVICE_ID, HEADER_IDEMPOTENCY_KEY (+13 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "offline/types.ts"

Cohesion: 0.08
Nodes (27): getAllSyncMeta(), seedSyncMeta(), resolvePullTargets(), RFC-3339, EnqueueInput, reclaimInflightOperations(), getReferringResources(), getResourcesInDependencyOrder() (+19 more)

### Community 32 - "ReportsDashboard.tsx"

Cohesion: 0.36
Nodes (5): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary

### Community 33 - "registry.ts"

Cohesion: 0.22
Nodes (14): RecordPaymentInput, createPurchase(), db, defineOperation(), defineSyncResource(), registerSyncResource(), resources, paymentsResource (+6 more)

### Community 34 - "useSyncData.ts"

Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 36 - "BillingCounter.tsx"

Cohesion: 0.15
Nodes (27): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+19 more)

### Community 37 - "useSyncedMutation"

Cohesion: 0.13
Nodes (26): useCancelInvoice(), useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal() (+18 more)

### Community 38 - "syncSlice.ts"

Cohesion: 0.06
Nodes (52): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+44 more)

### Community 39 - "ApiClient"

Cohesion: 0.19
Nodes (8): ApiClient, buildParams(), buildSyncHeaders(), MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), toPaymentRecord()

### Community 40 - "PaymentPanel.tsx"

Cohesion: 0.19
Nodes (11): PAYMENT_METHODS, PaymentMethod, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, SaleHeroPresentation, Invoice, InvoiceItem (+3 more)

### Community 41 - "settings/types.ts"

Cohesion: 0.19
Nodes (11): SettingsPage, renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption (+3 more)

### Community 42 - "syncApi.ts"

Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 43 - "categories.resource.ts"

Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 44 - "useCategories.ts"

Cohesion: 0.12
Nodes (29): ProductTable, buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps (+21 more)

### Community 45 - "repairs.resource.ts"

Cohesion: 0.29
Nodes (13): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 46 - "AppShell.tsx"

Cohesion: 0.27
Nodes (8): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS

### Community 48 - "SettingsNav.tsx"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 49 - "LogoUpload.tsx"

Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 52 - "printJobs.resource.ts"

Cohesion: 0.28
Nodes (14): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+6 more)

### Community 53 - "SyncEngine"

Cohesion: 0.27
Nodes (3): SyncEngine, countByStatus(), countUnsettledForResource()

### Community 54 - "providers.tsx"

Cohesion: 0.10
Nodes (20): AppUpdatePrompt(), AppProvidersProps, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch, RootState (+12 more)

### Community 55 - "supplierProducts.resource.ts"

Cohesion: 0.31
Nodes (10): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), markDeleted() (+2 more)

### Community 56 - "money.ts"

Cohesion: 0.27
Nodes (13): CURRENCY, ProductFormContent(), RepairFormModal(), MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents(), toCents() (+5 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.13
Nodes (24): UNSYNCED_VERSION, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord, IdMapRecord, IdMapStatus (+16 more)

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

### Community 65 - "customers.resource.ts"

Cohesion: 0.24
Nodes (10): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+2 more)

### Community 66 - "AmountInput.tsx"

Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 67 - "idMap.ts"

Cohesion: 0.19
Nodes (10): AbandonedReferenceError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), mintLocalId(), resolveValue(), rewriteNode(), RewriteOutcome (+2 more)

### Community 68 - "Redux Toolkit Store (src/store/)"

Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"

Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "EntityListPage.tsx"

Cohesion: 0.21
Nodes (8): DiscountPopover(), DiscountPopoverProps, EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, SegmentedToggle(), SegmentedToggleProps

### Community 72 - "suppliers.resource.ts"

Cohesion: 0.36
Nodes (7): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), suppliersResource

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

Cohesion: 0.20
Nodes (7): isApiErrorLike(), readServerTime(), Listener, listeners, NetworkObservation, observeNetwork(), reportNetworkObservation()

### Community 77 - "Right-Side Detail Drawer Visual Family"

Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CatalogPanel.tsx"

Cohesion: 0.15
Nodes (18): CartLineItem, CartLineItemProps, CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS (+10 more)

### Community 79 - "InvoiceDetailDrawer.tsx"

Cohesion: 0.43
Nodes (5): InvoicesList, NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer()

### Community 83 - "ConnectivitySnapshot"

Cohesion: 0.25
Nodes (5): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, SyncEngineState, SyncState

### Community 84 - "useShortcuts.ts"

Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 89 - "backoff.ts"

Cohesion: 0.40
Nodes (5): RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS, nextAttemptAt(), nextAttemptDelayMs()

## Knowledge Gaps

- **347 isolated node(s):** `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments`, `CompleteSalePaymentInput`, `BackendInvoiceItem` (+342 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `EmployeeList.tsx`, `notificationSlice.ts`, `LoginForm.tsx`, `useResponsive.tsx`, `SaleDocumentPreviewModal.tsx`, `formatMoney`, `ProductTable.tsx`, `RepairFormModal.tsx`, `Sidebar.tsx`, `BillingCounter.tsx`, `useSyncedMutation`, `syncSlice.ts`, `PaymentPanel.tsx`, `useCategories.ts`, `AppShell.tsx`, `money.ts`, `AmountInput.tsx`, `EntityListPage.tsx`, `CatalogPanel.tsx`, `InvoiceDetailDrawer.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `PaymentPanel.tsx`, `ProductTable.tsx`, `useIsMobile`, `AppShell.tsx`, `authSlice.ts`, `useEntitySearch`, `router.tsx`, `providers.tsx`, `RepairJobList.tsx`, `Sidebar.tsx`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `EmployeeList.tsx`, `ReportsDashboard.tsx`, `BillingCounter.tsx`, `useResponsive.tsx`, `SaleDocumentPreviewModal.tsx`, `EntityListPage.tsx`, `PaymentPanel.tsx`, `useSyncedMutation`, `useCategories.ts`, `ProductTable.tsx`, `CatalogPanel.tsx`, `InvoiceDetailDrawer.tsx`, `RepairFormModal.tsx`, `money.ts`, `RepairJobList.tsx`, `useIsMobile`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments` to the rest of the system?**
  _347 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EmployeeList.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1319073083778966 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09024390243902439 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11553030303030302 - nodes in this community are weakly interconnected._
