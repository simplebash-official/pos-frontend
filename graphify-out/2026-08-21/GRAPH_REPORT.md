# Graph Report - frontend (2026-08-21)

## Corpus Check

- 322 files · ~164,557 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1710 nodes · 5187 edges · 108 communities (78 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `4501cfb4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ReportsDashboard.tsx
- notificationSlice.ts
- useAppSelector
- LoginForm.tsx
- Header.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- registry.ts
- syncApi.ts
- useSyncedQuery
- AppShell.tsx
- dependencies
- inventory/types.ts
- CustomerList.tsx
- mockEmployees.ts
- authSlice.ts
- devDependencies
- flush.ts
- RepairFormModal.tsx
- tablerIconShards/index.ts
- router.tsx
- compilerOptions
- outbox.ts
- PrintJobList.tsx
- Sidebar.tsx
- InvoicesList.tsx
- ProductTable.tsx
- client.ts
- Backend Sync Requirements Doc
- offline/types.ts
- providers.tsx
- products.resource.ts
- useSyncData.ts
- BillingCounter.tsx
- SupplierList.tsx
- syncSlice.ts
- formatMoney
- settingsSlice.ts
- useSyncedMutation
- categories.resource.ts
- repairs.resource.ts
- @mantine/form
- SettingsNav.tsx
- react-dom
- @tanstack/react-query
- printJobs.resource.ts
- SyncEngine.ts
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
- EmployeeList.tsx
- RepairJobList.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- useIsMobile
- suppliers.resource.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- InvoiceDetailDrawer.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- useShortcuts.ts
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
- SupplierDetailDrawer.tsx

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 72 edges
2. `useAppSelector` - 62 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 39 edges
7. `queryKeys` - 32 edges
8. `ConnectivityMonitor` - 30 edges
9. `useSyncedQuery()` - 30 edges
10. `ProductTable()` - 27 edges

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

## Communities (108 total, 30 thin omitted)

### Community 0 - "ReportsDashboard.tsx"

Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 1 - "notificationSlice.ts"

Cohesion: 0.07
Nodes (39): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+31 more)

### Community 2 - "useAppSelector"

Cohesion: 0.19
Nodes (23): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+15 more)

### Community 3 - "LoginForm.tsx"

Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 4 - "Header.tsx"

Cohesion: 0.26
Nodes (10): Header(), HeaderProps, BillingCounter(), HeldSalesDrawer(), HeldSalesDrawerProps, useCartSound(), useHeldCarts(), selectAuthUser() (+2 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.16
Nodes (22): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+14 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.11
Nodes (32): BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, PaymentPanel, useCartCheckout(), useCartItems(), useCartTotals() (+24 more)

### Community 7 - "registry.ts"

Cohesion: 0.17
Nodes (19): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), createPurchase(), db (+11 more)

### Community 8 - "syncApi.ts"

Cohesion: 0.21
Nodes (12): PULL_PAGE_LIMIT, ApiEnvelope, fetchNewestCursors(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus (+4 more)

### Community 9 - "useSyncedQuery"

Cohesion: 0.18
Nodes (17): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES (+9 more)

### Community 10 - "AppShell.tsx"

Cohesion: 0.27
Nodes (8): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"

Cohesion: 0.11
Nodes (27): ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories() (+19 more)

### Community 13 - "CustomerList.tsx"

Cohesion: 0.05
Nodes (70): CustomerList, fetchInvoices(), resolveOrCreateCustomer(), fetchCustomers(), fetchCustomerStats(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent() (+62 more)

### Community 14 - "mockEmployees.ts"

Cohesion: 0.15
Nodes (8): createEmployee(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee(), LocalStorageStore

### Community 15 - "authSlice.ts"

Cohesion: 0.13
Nodes (26): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+18 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.10
Nodes (37): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+29 more)

### Community 18 - "RepairFormModal.tsx"

Cohesion: 0.19
Nodes (19): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+11 more)

### Community 19 - "tablerIconShards/index.ts"

Cohesion: 0.06
Nodes (13): EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved, shardKeyList(), started (+5 more)

### Community 20 - "router.tsx"

Cohesion: 0.07
Nodes (31): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), BillingCounter, EmailLoginScreen (+23 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 24 - "outbox.ts"

Cohesion: 0.16
Nodes (20): UNSYNCED_VERSION, MirrorMeta, OutboxError, assignLedgerEntriesToOperation(), pendingDeltaFor(), OutboxFullError, getDeviceId(), createIdempotencyKey() (+12 more)

### Community 25 - "PrintJobList.tsx"

Cohesion: 0.29
Nodes (11): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+3 more)

### Community 26 - "Sidebar.tsx"

Cohesion: 0.21
Nodes (9): Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, LowStockNotifier(), notifiedProductIds (+1 more)

### Community 27 - "InvoicesList.tsx"

Cohesion: 0.05
Nodes (49): ApiClient, buildParams(), buildSyncHeaders(), queryKeys, BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment (+41 more)

### Community 28 - "ProductTable.tsx"

Cohesion: 0.15
Nodes (20): EmployeeDetailDrawer(), ProductCatalogTree, applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS (+12 more)

### Community 29 - "client.ts"

Cohesion: 0.05
Nodes (43): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+35 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "offline/types.ts"

Cohesion: 0.07
Nodes (34): readServerVersion(), toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+26 more)

### Community 32 - "providers.tsx"

Cohesion: 0.12
Nodes (17): App(), AppProviders(), AppProvidersProps, AuthInitializer(), router, container, createReduxColorSchemeManager(), reduxColorSchemeManager (+9 more)

### Community 33 - "products.resource.ts"

Cohesion: 0.17
Nodes (22): cancelInvoice(), completeSale(), createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), adjustStock() (+14 more)

### Community 34 - "useSyncData.ts"

Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 36 - "BillingCounter.tsx"

Cohesion: 0.13
Nodes (23): PAYMENT_METHODS, PaymentMethod, CompleteSaleInput, A4InvoicePreviewModalProps, BillingRegions, BillingRegionsProps, FILL, BillingPane (+15 more)

### Community 37 - "SupplierList.tsx"

Cohesion: 0.28
Nodes (13): applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier(), useDeleteSupplier() (+5 more)

### Community 38 - "syncSlice.ts"

Cohesion: 0.06
Nodes (44): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+36 more)

### Community 40 - "formatMoney"

Cohesion: 0.11
Nodes (21): CartLineItem, CartLineItemProps, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps, useCartCustomer(), LineSourceType (+13 more)

### Community 41 - "settingsSlice.ts"

Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 42 - "useSyncedMutation"

Cohesion: 0.14
Nodes (29): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps (+21 more)

### Community 43 - "categories.resource.ts"

Cohesion: 0.22
Nodes (13): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, ValidCategoryOption (+5 more)

### Community 45 - "repairs.resource.ts"

Cohesion: 0.30
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 48 - "SettingsNav.tsx"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 52 - "printJobs.resource.ts"

Cohesion: 0.26
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 53 - "SyncEngine.ts"

Cohesion: 0.09
Nodes (30): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, getAllSyncMeta(), AuditLevel (+22 more)

### Community 55 - "supplierProducts.resource.ts"

Cohesion: 0.26
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProduct (+4 more)

### Community 56 - "money.ts"

Cohesion: 0.21
Nodes (17): CURRENCY, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, RepairFormModal(), MoneyInput(), MoneyInputProps (+9 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.13
Nodes (23): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord (+15 more)

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

### Community 65 - "EmployeeList.tsx"

Cohesion: 0.14
Nodes (18): EmployeeList, deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeDetailDrawerProps, EmployeeList(), EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord (+10 more)

### Community 67 - "RepairJobList.tsx"

Cohesion: 0.26
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

### Community 71 - "useIsMobile"

Cohesion: 0.21
Nodes (12): SupplierPickerModal(), SupplierPickerModalProps, SearchHistoryInput, SearchHistoryInputProps, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue (+4 more)

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

### Community 77 - "Right-Side Detail Drawer Visual Family"

Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "CatalogPanel.tsx"

Cohesion: 0.26
Nodes (12): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+4 more)

### Community 79 - "InvoiceDetailDrawer.tsx"

Cohesion: 0.43
Nodes (5): InvoicesList, NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer()

### Community 84 - "useShortcuts.ts"

Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 121 - "SupplierDetailDrawer.tsx"

Cohesion: 0.18
Nodes (19): useAllProducts(), EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useProductsForSupplier(), useSetSupplierLinks() (+11 more)

## Knowledge Gaps

- **351 isolated node(s):** `CustomerFilters`, `ProductFilters`, `SupplierFilters`, `DailySalesReportSummary`, `NotificationPopoverProps` (+346 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `Header.tsx`, `BillingCounter.tsx`, `cartSlice.ts`, `SaleDocumentPreviewModal.tsx`, `formatMoney`, `syncSlice.ts`, `AppShell.tsx`, `useSyncedQuery`, `CustomerList.tsx`, `SyncProvider.tsx`, `authSlice.ts`, `router.tsx`, `Sidebar.tsx`, `InvoicesList.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `LoginForm.tsx`, `Header.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `useSyncedQuery`, `AppShell.tsx`, `inventory/types.ts`, `CustomerList.tsx`, `RepairFormModal.tsx`, `Sidebar.tsx`, `ProductTable.tsx`, `BillingCounter.tsx`, `syncSlice.ts`, `formatMoney`, `useSyncedMutation`, `money.ts`, `EmployeeList.tsx`, `InvoiceDetailDrawer.tsx`, `SupplierDetailDrawer.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `LocalStorageStore` connect `mockEmployees.ts` to `EmployeeList.tsx`, `SaleDocumentPreviewModal.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `CustomerFilters`, `ProductFilters`, `SupplierFilters` to the rest of the system?**
  _351 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06638714185883997 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10668563300142248 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
