# Graph Report - frontend (2026-08-20)

## Corpus Check

- 309 files · ~161,535 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1654 nodes · 4967 edges · 116 communities (85 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `7e3aaba0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- sync/index.ts
- notificationSlice.ts
- hooks.ts
- EmployeeList.tsx
- PrintJobList.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- registry.ts
- common.ts
- SyncEngine.ts
- dependencies
- useIsMobile
- searchFields.ts
- LocalStorageStore
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobFormModal.tsx
- tablerIconShards/index.ts
- router.tsx
- products.resource.ts
- compilerOptions
- syncSlice.ts
- offline/index.ts
- syncMeta.ts
- useAppSelector
- invoicesApi.ts
- supplierProducts.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- formatMoney
- LoginForm.tsx
- db
- useSyncData.ts
- RepairFormModal.tsx
- BillingCounter.tsx
- SupplierList.tsx
- SyncEngine
- client.ts
- EntityListPage.tsx
- settingsSlice.ts
- syncApi.ts
- categories.resource.ts
- CatalogPanel.tsx
- Invoice
- outbox.ts
- @mantine/form
- ProductTable.tsx
- repairs.resource.ts
- react-dom
- @tanstack/react-query
- printJobs.resource.ts
- suppliers.resource.ts
- vite-plugin-pwa
- audio.ts
- moneyFormUtils.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useAppDispatch
- SyncPanel.tsx
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- AppShell.tsx
- PaymentPanel.tsx
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- providers.tsx
- Right-Side Detail Drawer Visual Family
- ExpandableCard.tsx
- SyncStatusBadge.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- useShortcuts.ts
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

1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 60 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 38 edges
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
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
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

## Communities (116 total, 31 thin omitted)

### Community 0 - "sync/index.ts"

Cohesion: 0.18
Nodes (11): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, SyncSettingsSection(), MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation (+3 more)

### Community 1 - "notificationSlice.ts"

Cohesion: 0.13
Nodes (18): STORAGE_KEYS, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), RootState, store, listenerMiddleware (+10 more)

### Community 2 - "hooks.ts"

Cohesion: 0.12
Nodes (27): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+19 more)

### Community 3 - "EmployeeList.tsx"

Cohesion: 0.16
Nodes (20): earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, EmployeeDetailDrawer() (+12 more)

### Community 4 - "PrintJobList.tsx"

Cohesion: 0.19
Nodes (14): PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload, UpdatePrintJobPayload (+6 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.13
Nodes (25): InvoicesList, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult (+17 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.11
Nodes (30): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+22 more)

### Community 7 - "CustomerList.tsx"

Cohesion: 0.12
Nodes (30): fetchAllCustomers(), fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps (+22 more)

### Community 8 - "registry.ts"

Cohesion: 0.08
Nodes (29): reclaimInflightOperations(), getReferringResources(), getResourceRanks(), getResourcesInDependencyOrder(), registerSyncResource(), resetRegistry(), resources, Widget (+21 more)

### Community 9 - "common.ts"

Cohesion: 0.16
Nodes (15): MutationRequestOptions, BackendPaymentRecord, recordPayment(), toPaymentRecord(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams (+7 more)

### Community 10 - "SyncEngine.ts"

Cohesion: 0.14
Nodes (21): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, readServerVersion(), toServerRow(), logError(), logInfo(), logSyncEvent(), logWarn() (+13 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "useIsMobile"

Cohesion: 0.14
Nodes (26): ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase() (+18 more)

### Community 13 - "searchFields.ts"

Cohesion: 0.13
Nodes (28): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges() (+20 more)

### Community 14 - "LocalStorageStore"

Cohesion: 0.16
Nodes (7): createEmployee(), deleteEmployee(), deleteEmployees(), normalizeEmployee(), updateEmployee(), EmployeeList(), LocalStorageStore

### Community 15 - "authSlice.ts"

Cohesion: 0.16
Nodes (21): AuthInitializer(), UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse (+13 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.10
Nodes (36): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+28 more)

### Community 18 - "PrintJobFormModal.tsx"

Cohesion: 0.28
Nodes (11): SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput, PrintJobType, SegmentedToggle(), SegmentedToggleProps (+3 more)

### Community 19 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"

Cohesion: 0.08
Nodes (22): AppShell(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, ProductTable, RepairJobList (+14 more)

### Community 21 - "products.resource.ts"

Cohesion: 0.15
Nodes (12): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+4 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "syncSlice.ts"

Cohesion: 0.13
Nodes (13): SyncMetaRecord, SyncEngineState, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectModuleView(), selectModuleViews (+5 more)

### Community 24 - "offline/index.ts"

Cohesion: 0.20
Nodes (17): UNSYNCED_VERSION, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ, getDeviceId() (+9 more)

### Community 25 - "syncMeta.ts"

Cohesion: 0.18
Nodes (15): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+7 more)

### Community 26 - "useAppSelector"

Cohesion: 0.09
Nodes (32): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAdmin(), RequireAdminProps, RequireAuth(), RequireAuthProps, Sidebar() (+24 more)

### Community 27 - "invoicesApi.ts"

Cohesion: 0.16
Nodes (14): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+6 more)

### Community 28 - "supplierProducts.resource.ts"

Cohesion: 0.27
Nodes (11): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+3 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.07
Nodes (32): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation (+24 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "formatMoney"

Cohesion: 0.11
Nodes (21): CartLineItem, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, useAllInvoices(), getCategoryIconInfo(), InvoicesList() (+13 more)

### Community 32 - "LoginForm.tsx"

Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 33 - "db"

Cohesion: 0.19
Nodes (23): queryKeys, cancelInvoice(), completeSale(), fetchInvoices(), RecordPaymentInput, createCustomer(), deleteCustomer(), deleteCustomers() (+15 more)

### Community 34 - "useSyncData.ts"

Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 35 - "RepairFormModal.tsx"

Cohesion: 0.20
Nodes (17): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJobList(), NO_REPAIRS (+9 more)

### Community 36 - "BillingCounter.tsx"

Cohesion: 0.19
Nodes (20): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+12 more)

### Community 37 - "SupplierList.tsx"

Cohesion: 0.14
Nodes (25): EnrichedLinkedSupplier, SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps (+17 more)

### Community 39 - "client.ts"

Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 40 - "EntityListPage.tsx"

Cohesion: 0.28
Nodes (6): EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, PageHeader(), PageHeaderProps

### Community 41 - "settingsSlice.ts"

Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "syncApi.ts"

Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 43 - "categories.resource.ts"

Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 44 - "CatalogPanel.tsx"

Cohesion: 0.10
Nodes (35): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), CatalogCategoryFilter (+27 more)

### Community 45 - "Invoice"

Cohesion: 0.13
Nodes (15): CompleteSaleInput, CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, NO_INVOICES, useCancelInvoice(), useCompleteSale() (+7 more)

### Community 46 - "outbox.ts"

Cohesion: 0.15
Nodes (14): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, OutboxOp, OutboxStatus, OutboxFullError, claimReadyOperations() (+6 more)

### Community 48 - "ProductTable.tsx"

Cohesion: 0.12
Nodes (33): CURRENCY, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, ProductTable(), useValidCategories() (+25 more)

### Community 49 - "repairs.resource.ts"

Cohesion: 0.32
Nodes (12): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), RepairListResponseData, toRepairJob() (+4 more)

### Community 52 - "printJobs.resource.ts"

Cohesion: 0.38
Nodes (11): deleteEarningRecordsForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob(), updatePrintJobRaw() (+3 more)

### Community 53 - "suppliers.resource.ts"

Cohesion: 0.30
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), markDeleted(), markPending() (+1 more)

### Community 55 - "audio.ts"

Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

### Community 56 - "moneyFormUtils.ts"

Cohesion: 0.24
Nodes (14): EmployeeFormModal(), RepairFormModal(), MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents(), toCents(), fromEmployee() (+6 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"

Cohesion: 0.15
Nodes (21): PaymentRecord, StockMovement, Subcategory, StockPurchase, SupplierProduct, MirrorTableName, OfflineDb, AuditEvent (+13 more)

### Community 60 - "SyncProvider.tsx"

Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

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

### Community 65 - "useAppDispatch"

Cohesion: 0.24
Nodes (11): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+3 more)

### Community 66 - "SyncPanel.tsx"

Cohesion: 0.27
Nodes (12): formatBytes(), SyncPanel(), clearLocalData(), ClearLocalDataOptions, estimateStorage(), exportDiagnostics(), forceFullResync(), pruneByRetention() (+4 more)

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

### Community 71 - "AppShell.tsx"

Cohesion: 0.27
Nodes (8): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS

### Community 72 - "PaymentPanel.tsx"

Cohesion: 0.36
Nodes (7): PAYMENT_METHODS, PaymentMethod, PaymentPanel, getSaleHeroPresentation(), SaleHeroPresentation, HeldCart, selectPrintSettings()

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

Cohesion: 0.13
Nodes (12): App(), AppUpdatePrompt(), AppProviders(), AppProvidersProps, router, container, darkTokens, lightTokens (+4 more)

### Community 77 - "Right-Side Detail Drawer Visual Family"

Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "ExpandableCard.tsx"

Cohesion: 0.31
Nodes (7): ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 79 - "SyncStatusBadge.tsx"

Cohesion: 0.43
Nodes (6): SyncStatusBadge(), SyncStatusBadgeProps, selectIsOfflineSession(), selectConnectivity(), selectOverallSyncStatus, selectSyncTotals()

### Community 83 - "useShortcuts.ts"

Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

## Knowledge Gaps

- **336 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+331 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `sync/index.ts`, `EmployeeList.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `PrintJobFormModal.tsx`, `useAppSelector`, `formatMoney`, `LoginForm.tsx`, `RepairFormModal.tsx`, `BillingCounter.tsx`, `SupplierList.tsx`, `EntityListPage.tsx`, `CatalogPanel.tsx`, `ProductTable.tsx`, `moneyFormUtils.ts`, `useAppDispatch`, `AppShell.tsx`, `PaymentPanel.tsx`, `SyncStatusBadge.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `useAppDispatch`, `hooks.ts`, `SyncPanel.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `AppShell.tsx`, `PaymentPanel.tsx`, `providers.tsx`, `useIsMobile`, `SyncStatusBadge.tsx`, `ProductTable.tsx`, `router.tsx`, `syncSlice.ts`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `EmployeeList.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `PrintJobList.tsx`, `CustomerList.tsx`, `PaymentPanel.tsx`, `RepairFormModal.tsx`, `SupplierList.tsx`, `CatalogPanel.tsx`, `useIsMobile`, `LocalStorageStore`, `searchFields.ts`, `ProductTable.tsx`, `PrintJobFormModal.tsx`, `moneyFormUtils.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _336 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1282051282051282 - nodes in this community are weakly interconnected._
- **Should `hooks.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12010796221322537 - nodes in this community are weakly interconnected._
- **Should `SaleDocumentPreviewModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13360323886639677 - nodes in this community are weakly interconnected._
