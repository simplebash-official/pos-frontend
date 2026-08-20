# Graph Report - frontend (2026-08-20)

## Corpus Check

- 309 files · ~161,543 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1653 nodes · 4962 edges · 108 communities (78 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `fb484f30`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- NotificationPopover.tsx
- notificationSlice.ts
- useAppSelector
- themeSlice.ts
- PrintJobList.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- offline/types.ts
- common.ts
- SyncEngine.ts
- dependencies
- useIsMobile
- searchFields.ts
- mockEmployees.ts
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
- pull.test.ts
- AppShell.tsx
- invoicesApi.ts
- useSupplierProducts.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- ProductFormModal.tsx
- SettingsNav.tsx
- registry.ts
- useSyncData.ts
- RepairJobList.tsx
- BillingCounter.tsx
- useSyncedMutation
- app/App.tsx
- ApiClient
- ui.ts
- settingsSlice.ts
- syncApi.ts
- inventory/types.ts
- CatalogPanel.tsx
- LogoUpload.tsx
- @mantine/form
- ProductTable.tsx
- printJobs.resource.ts
- react-dom
- @tanstack/react-query
- suppliers.resource.ts
- providers.tsx
- RepairFormModal.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- customers.resource.ts
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- HeldCartCatchupNotifier.tsx
- vite-plugin-pwa
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

- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
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

## Communities (108 total, 30 thin omitted)

### Community 0 - "NotificationPopover.tsx"

Cohesion: 0.27
Nodes (9): NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, formatRelativeTime() (+1 more)

### Community 1 - "notificationSlice.ts"

Cohesion: 0.23
Nodes (10): STORAGE_KEYS, AppDispatch, RootState, listenerMiddleware, initialState, notificationSlice, selectAllNotifications(), selectNotificationsByCategory() (+2 more)

### Community 2 - "useAppSelector"

Cohesion: 0.20
Nodes (23): usePrint(), NotificationPopover(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection() (+15 more)

### Community 3 - "themeSlice.ts"

Cohesion: 0.21
Nodes (9): createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), store, ColorScheme, initialState, themeSlice (+1 more)

### Community 4 - "PrintJobList.tsx"

Cohesion: 0.24
Nodes (11): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+3 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.07
Nodes (37): InvoicesList, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult (+29 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.10
Nodes (35): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, PaymentPanel, useCartCheckout(), useCartTotals(), getSaleHeroPresentation(), SaleHeroPresentation (+27 more)

### Community 7 - "CustomerList.tsx"

Cohesion: 0.20
Nodes (20): CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal(), CustomerPickerModalProps, PRESET_CUSTOMER_TAGS, NO_CUSTOMERS (+12 more)

### Community 8 - "offline/types.ts"

Cohesion: 0.10
Nodes (20): SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, reclaimInflightOperations(), Widget, widgetResource, ConflictPolicy (+12 more)

### Community 9 - "common.ts"

Cohesion: 0.12
Nodes (20): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, fetchPurchases() (+12 more)

### Community 10 - "SyncEngine.ts"

Cohesion: 0.10
Nodes (22): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, AuditLevel, logError() (+14 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "useIsMobile"

Cohesion: 0.07
Nodes (40): fetchInvoices(), DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+32 more)

### Community 13 - "searchFields.ts"

Cohesion: 0.10
Nodes (36): ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, SupplierFormModal(), DEFAULT_SUGGESTED_TAGS, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult (+28 more)

### Community 14 - "mockEmployees.ts"

Cohesion: 0.24
Nodes (10): earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, EmployeeEarningRecord, EmployeeInput (+2 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.10
Nodes (33): EmailLoginScreen, UserRole, getMeApi(), loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm() (+25 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.09
Nodes (40): OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+32 more)

### Community 18 - "PrintJobFormModal.tsx"

Cohesion: 0.32
Nodes (13): JobStatus, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput, PrintJobType, RepairFormModalProps (+5 more)

### Community 19 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"

Cohesion: 0.09
Nodes (18): BillingCounter, CustomerList, EmployeeList, PrintJobList, ProductTable, RepairJobList, ReportsDashboard, SettingsPage (+10 more)

### Community 21 - "products.resource.ts"

Cohesion: 0.15
Nodes (13): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+5 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "syncSlice.ts"

Cohesion: 0.07
Nodes (35): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge(), SyncStatusBadgeProps (+27 more)

### Community 24 - "offline/index.ts"

Cohesion: 0.15
Nodes (21): UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ (+13 more)

### Community 25 - "pull.test.ts"

Cohesion: 0.09
Nodes (30): readServerVersion(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta() (+22 more)

### Community 26 - "AppShell.tsx"

Cohesion: 0.10
Nodes (24): RequireAdmin(), RequireAdminProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Sidebar() (+16 more)

### Community 27 - "invoicesApi.ts"

Cohesion: 0.16
Nodes (14): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+6 more)

### Community 28 - "useSupplierProducts.ts"

Cohesion: 0.21
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+8 more)

### Community 29 - "offline/constants.ts"

Cohesion: 0.06
Nodes (39): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+31 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "ProductFormModal.tsx"

Cohesion: 0.39
Nodes (8): CURRENCY, FormContentProps, ProductFormModalProps, SupplierIntakeRow, CreateProductInput, Product, UpdateProductInput, UpdateProductPayload

### Community 32 - "SettingsNav.tsx"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 33 - "registry.ts"

Cohesion: 0.23
Nodes (17): queryKeys, cancelInvoice(), completeSale(), createPurchase(), db, defineOperation(), defineSyncResource(), registerSyncResource() (+9 more)

### Community 34 - "useSyncData.ts"

Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 35 - "RepairJobList.tsx"

Cohesion: 0.25
Nodes (11): RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload, UpdateRepairPayload (+3 more)

### Community 36 - "BillingCounter.tsx"

Cohesion: 0.10
Nodes (34): Header(), HeaderProps, CompleteSaleInput, CompleteSaleResult, A4InvoicePreviewModalProps, BillingCounter(), BillingRegions, BillingRegionsProps (+26 more)

### Community 37 - "useSyncedMutation"

Cohesion: 0.14
Nodes (25): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), EMPLOYEE_ROLE_LABELS, useSetSupplierLinks(), SupplierList(), NO_SUPPLIERS (+17 more)

### Community 38 - "app/App.tsx"

Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 39 - "ApiClient"

Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 40 - "ui.ts"

Cohesion: 0.50
Nodes (3): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN

### Community 41 - "settingsSlice.ts"

Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "syncApi.ts"

Cohesion: 0.21
Nodes (12): PULL_PAGE_LIMIT, ApiEnvelope, fetchNewestCursors(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus (+4 more)

### Community 43 - "inventory/types.ts"

Cohesion: 0.14
Nodes (22): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), BarcodeSource, Category (+14 more)

### Community 44 - "CatalogPanel.tsx"

Cohesion: 0.09
Nodes (42): CartLineItem, CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext() (+34 more)

### Community 45 - "LogoUpload.tsx"

Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 48 - "ProductTable.tsx"

Cohesion: 0.15
Nodes (29): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useAllProducts(), useCreateProduct(), useDeleteProducts(), useProductMovements() (+21 more)

### Community 49 - "printJobs.resource.ts"

Cohesion: 0.19
Nodes (24): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData (+16 more)

### Community 53 - "suppliers.resource.ts"

Cohesion: 0.23
Nodes (13): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+5 more)

### Community 54 - "providers.tsx"

Cohesion: 0.18
Nodes (9): AppUpdatePrompt(), AppProvidersProps, AuthInitializer(), darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars, CONTAINER_SIZES (+1 more)

### Community 56 - "RepairFormModal.tsx"

Cohesion: 0.18
Nodes (20): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, RepairFormModal(), STATUSES_REQUIRING_PRICE, MoneyInput(), MoneyInputProps (+12 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.13
Nodes (23): StockMovement, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictReason (+15 more)

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

Cohesion: 0.20
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

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

### Community 83 - "HeldCartCatchupNotifier.tsx"

Cohesion: 0.20
Nodes (12): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), PageLoader(), PageLoaderProps (+4 more)

## Knowledge Gaps

- **337 isolated node(s):** `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps`, `CustomerDetailDrawerProps`, `SyncDrawerProps` (+332 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `NotificationPopover.tsx`, `useAppSelector`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `CatalogPanel.tsx`, `searchFields.ts`, `authSlice.ts`, `ProductTable.tsx`, `PrintJobFormModal.tsx`, `syncSlice.ts`, `RepairFormModal.tsx`, `AppShell.tsx`, `ProductFormModal.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `NotificationPopover.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `ProductTable.tsx`, `HeldCartCatchupNotifier.tsx`, `providers.tsx`, `syncSlice.ts`, `AppShell.tsx`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `SyncEngine.ts`, `authSlice.ts`, `flush.ts`, `providers.tsx`, `syncSlice.ts`, `offline/index.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps` to the rest of the system?**
  _337 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SaleDocumentPreviewModal.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06810035842293907 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10359408033826638 - nodes in this community are weakly interconnected._
- **Should `offline/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
