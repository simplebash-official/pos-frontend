# Graph Report - frontend  (2026-08-20)

## Corpus Check
- 309 files · ~161,555 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1653 nodes · 4949 edges · 120 communities (87 shown, 33 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dcac6387`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- syncSlice.ts
- providers.tsx
- useAppSelector
- EmployeeList.tsx
- InvoicesList.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- offline/types.ts
- common.ts
- pull.test.ts
- dependencies
- useIsMobile
- search.ts
- LocalStorageStore
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobList.tsx
- tablerIconShards/index.ts
- ConnectivityMonitor
- products.resource.ts
- compilerOptions
- ConnectivitySnapshot
- offline/index.ts
- syncMeta.ts
- router.tsx
- invoicesApi.ts
- supplierProducts.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- formatMoney
- LoginForm.tsx
- registry.ts
- useSyncData.ts
- RepairJobList.tsx
- BillingCounter.tsx
- SupplierList.tsx
- SyncEngine
- client.ts
- ReportsDashboard.tsx
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
- RepairFormModal.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- notificationSlice.ts
- SyncEngine.ts
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- AppShell.tsx
- saleHeroPresentation.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- customers.resource.ts
- Right-Side Detail Drawer Visual Family
- ApiClient
- Header.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- invoices.resource.ts
- SettingsNav.tsx
- AmountInput.tsx
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
- LogoUpload.tsx

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
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

## Communities (120 total, 33 thin omitted)

### Community 0 - "syncSlice.ts"
Cohesion: 0.07
Nodes (33): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, SyncSettingsSection(), SyncStatusBadge(), SyncStatusBadgeProps, MODULE_STATUS_PRESENTATION (+25 more)

### Community 1 - "providers.tsx"
Cohesion: 0.10
Nodes (20): AppProvidersProps, AuthInitializer(), createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch, RootState (+12 more)

### Community 2 - "useAppSelector"
Cohesion: 0.19
Nodes (23): AppUpdatePrompt(), usePrint(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection() (+15 more)

### Community 3 - "EmployeeList.tsx"
Cohesion: 0.16
Nodes (21): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES (+13 more)

### Community 4 - "InvoicesList.tsx"
Cohesion: 0.18
Nodes (13): InvoicesList, useAllInvoices(), useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer(), InvoicesList(), ConfirmDialog(), ConfirmDialogProps (+5 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.13
Nodes (25): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, getPrintCountForInvoice() (+17 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.12
Nodes (27): PaymentMethod, CartLineItemProps, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+19 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.13
Nodes (32): CustomerList, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal(), CustomerPickerModalProps (+24 more)

### Community 8 - "offline/types.ts"
Cohesion: 0.18
Nodes (11): MirroredRow, ConflictPolicy, ConflictStrategy, LocalApplyHandler, LocalApplyResult, LocalContext, PullContext, PullSpec (+3 more)

### Community 9 - "common.ts"
Cohesion: 0.21
Nodes (13): createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+5 more)

### Community 10 - "pull.test.ts"
Cohesion: 0.14
Nodes (18): readServerVersion(), toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary (+10 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "useIsMobile"
Cohesion: 0.10
Nodes (34): KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps (+26 more)

### Community 13 - "search.ts"
Cohesion: 0.17
Nodes (21): SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges(), IndexedField, isWordChar(), MatchRange (+13 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.15
Nodes (22): USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData (+14 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+30 more)

### Community 18 - "PrintJobList.tsx"
Cohesion: 0.16
Nodes (22): PrintJobList, JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, BackendPrintJob, PrintJobFormModalProps (+14 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 21 - "products.resource.ts"
Cohesion: 0.16
Nodes (12): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+4 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "ConnectivitySnapshot"
Cohesion: 0.25
Nodes (5): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, SyncEngineState, SyncState

### Community 24 - "offline/index.ts"
Cohesion: 0.18
Nodes (18): UNSYNCED_VERSION, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ (+10 more)

### Community 25 - "syncMeta.ts"
Cohesion: 0.13
Nodes (20): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+12 more)

### Community 26 - "router.tsx"
Cohesion: 0.08
Nodes (30): App(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), AppProviders() (+22 more)

### Community 27 - "invoicesApi.ts"
Cohesion: 0.16
Nodes (14): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+6 more)

### Community 28 - "supplierProducts.resource.ts"
Cohesion: 0.35
Nodes (9): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), markDeleted() (+1 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.11
Nodes (22): env, probeClient, probeHealth(), ProbeResult, AUDIT_LOG_LIMIT, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS (+14 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "formatMoney"
Cohesion: 0.14
Nodes (18): fetchInvoices(), CartLineItem, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, CustomerDetailDrawer(), CustomerDetailDrawerProps (+10 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.18
Nodes (14): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+6 more)

### Community 33 - "registry.ts"
Cohesion: 0.17
Nodes (16): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, db, defineOperation() (+8 more)

### Community 34 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 35 - "RepairJobList.tsx"
Cohesion: 0.32
Nodes (9): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload (+1 more)

### Community 36 - "BillingCounter.tsx"
Cohesion: 0.20
Nodes (19): BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS (+11 more)

### Community 37 - "SupplierList.tsx"
Cohesion: 0.17
Nodes (20): SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS, useAllSuppliers() (+12 more)

### Community 38 - "SyncEngine"
Cohesion: 0.25
Nodes (3): SyncEngine, countByStatus(), countUnsettledForResource()

### Community 39 - "client.ts"
Cohesion: 0.15
Nodes (12): isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners, NetworkObservation, observeNetwork(), reportNetworkObservation() (+4 more)

### Community 40 - "ReportsDashboard.tsx"
Cohesion: 0.16
Nodes (11): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, EntityListPage(), EntityListPageProps, FilterTagChips() (+3 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.14
Nodes (16): SettingsPage, STORAGE_KEYS, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings (+8 more)

### Community 42 - "syncApi.ts"
Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 43 - "categories.resource.ts"
Cohesion: 0.21
Nodes (14): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), Category, CategoryInput (+6 more)

### Community 44 - "CatalogPanel.tsx"
Cohesion: 0.12
Nodes (31): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), CatalogCategoryFilter (+23 more)

### Community 45 - "Invoice"
Cohesion: 0.13
Nodes (15): CompleteSaleInput, CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, NO_INVOICES, useCancelInvoice(), useCompleteSale() (+7 more)

### Community 46 - "outbox.ts"
Cohesion: 0.13
Nodes (14): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxOp, OutboxStatus, OutboxFullError, discardOperation(), reclaimInflightOperations() (+6 more)

### Community 48 - "ProductTable.tsx"
Cohesion: 0.09
Nodes (41): CURRENCY, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, ProductTable(), useValidCategories() (+33 more)

### Community 49 - "repairs.resource.ts"
Cohesion: 0.31
Nodes (13): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), RepairListResponseData (+5 more)

### Community 52 - "printJobs.resource.ts"
Cohesion: 0.38
Nodes (11): deleteEarningRecordsForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob(), updatePrintJobRaw() (+3 more)

### Community 53 - "suppliers.resource.ts"
Cohesion: 0.29
Nodes (8): queryKeys, createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), suppliersResource

### Community 55 - "audio.ts"
Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

### Community 56 - "RepairFormModal.tsx"
Cohesion: 0.17
Nodes (21): EmployeeFormModal(), RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJob, RepairJobInput, UpdateRepairPayload, MoneyInput() (+13 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.17
Nodes (17): StockMovement, MIRROR_TABLE_NAMES, MirrorTableName, OfflineDb, AuditEvent, AuditLevel, ConflictReason, ConflictRecord (+9 more)

### Community 60 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

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

### Community 65 - "notificationSlice.ts"
Cohesion: 0.16
Nodes (16): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+8 more)

### Community 66 - "SyncEngine.ts"
Cohesion: 0.15
Nodes (19): formatBytes(), SyncPanel(), clearLocalData(), ClearLocalDataOptions, estimateStorage(), exportDiagnostics(), forceFullResync(), pruneByRetention() (+11 more)

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
Cohesion: 0.11
Nodes (19): RequireAdmin(), RequireAdminProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Sidebar() (+11 more)

### Community 73 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "invoices.resource.ts"
Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 76 - "customers.resource.ts"
Cohesion: 0.27
Nodes (9): MutationRequestOptions, createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), customersResource (+1 more)

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 79 - "Header.tsx"
Cohesion: 0.36
Nodes (8): Header(), HeaderProps, BillingCounter(), useCartSound(), useHeldCarts(), selectAuthUser(), selectHeldCarts(), selectSoundEnabled()

### Community 83 - "invoices.resource.ts"
Cohesion: 0.44
Nodes (7): cancelInvoice(), completeSale(), markPending(), toLocalRow(), appendStockDelta(), invoicesResource, purchasesResource

### Community 84 - "SettingsNav.tsx"
Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 85 - "AmountInput.tsx"
Cohesion: 0.25
Nodes (7): AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 89 - "backoff.ts"
Cohesion: 0.40
Nodes (5): RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS, nextAttemptAt(), nextAttemptDelayMs()

### Community 119 - "LogoUpload.tsx"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

## Knowledge Gaps
- **337 isolated node(s):** `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps`, `CustomerDetailDrawerProps`, `RepairListResponseData` (+332 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `notificationSlice.ts`, `syncSlice.ts`, `EmployeeList.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `InvoicesList.tsx`, `AppShell.tsx`, `CustomerList.tsx`, `SupplierList.tsx`, `ReportsDashboard.tsx`, `CatalogPanel.tsx`, `Header.tsx`, `ProductTable.tsx`, `PrintJobList.tsx`, `AmountInput.tsx`, `RepairFormModal.tsx`, `formatMoney`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `syncSlice.ts`, `notificationSlice.ts`, `SyncEngine.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `AppShell.tsx`, `Header.tsx`, `ProductTable.tsx`, `authSlice.ts`, `router.tsx`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `providers.tsx`, `SyncEngine.ts`, `client.ts`, `authSlice.ts`, `flush.ts`, `ConnectivitySnapshot`, `offline/index.ts`, `offline/constants.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps` to the rest of the system?**
  _337 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `syncSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06547619047619048 - nodes in this community are weakly interconnected._
- **Should `providers.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10098522167487685 - nodes in this community are weakly interconnected._
- **Should `SaleDocumentPreviewModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._