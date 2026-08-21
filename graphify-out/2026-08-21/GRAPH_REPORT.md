# Graph Report - frontend (2026-08-21)

## Corpus Check

- 322 files · ~164,619 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1710 nodes · 5217 edges · 109 communities (79 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `00a21282`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- ReportsDashboard.tsx
- notificationSlice.ts
- SettingsPage.tsx
- LoginForm.tsx
- BillingCounter.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- registry.ts
- tablerIcons.ts
- purchasesApi.ts
- useAppSelector
- dependencies
- inventory/types.ts
- CustomerList.tsx
- mockEmployees.ts
- authSlice.ts
- devDependencies
- flush.ts
- RepairFormModal.tsx
- router.tsx
- search.ts
- compilerOptions
- SupplierDetailDrawer.tsx
- offline/index.ts
- PrintJobList.tsx
- EmployeeList.tsx
- InvoicesList.tsx
- ProductTable.tsx
- client.ts
- Backend Sync Requirements Doc
- syncApi.ts
- providers.tsx
- pull.test.ts
- searchFields.ts
- offline/types.ts
- EmployeeDetailDrawer.tsx
- SupplierList.tsx
- syncSlice.ts
- SyncEngine
- formatMoney
- settingsSlice.ts
- useCategories.ts
- useCustomerStats.ts
- CartLineItem.tsx
- ui.ts
- customersApi.ts
- @mantine/form
- react-dom
- @tanstack/react-query
- SyncEngine.ts
- money.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- RepairJobList.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- AppShell.tsx
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- Invoice
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
- useIsMobile

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
10. `ApiClient` - 27 edges

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
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
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

## Communities (109 total, 30 thin omitted)

### Community 0 - "ReportsDashboard.tsx"

Cohesion: 0.23
Nodes (8): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), EMPLOYEE_ROLE_LABELS, ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 1 - "notificationSlice.ts"

Cohesion: 0.07
Nodes (36): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+28 more)

### Community 2 - "SettingsPage.tsx"

Cohesion: 0.12
Nodes (27): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+19 more)

### Community 3 - "LoginForm.tsx"

Cohesion: 0.17
Nodes (15): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+7 more)

### Community 4 - "BillingCounter.tsx"

Cohesion: 0.18
Nodes (17): CompleteSaleInput, BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps (+9 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.18
Nodes (20): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+12 more)

### Community 6 - "cartSlice.ts"

Cohesion: 0.12
Nodes (29): PaymentMethod, useCartCheckout(), useCartTotals(), SplitPaymentDetail, cartSlice, CartState, DiscountType, HeldCart (+21 more)

### Community 7 - "registry.ts"

Cohesion: 0.05
Nodes (100): MutationRequestOptions, queryKeys, cancelInvoice(), completeSale(), BackendPaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord() (+92 more)

### Community 8 - "tablerIcons.ts"

Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 9 - "purchasesApi.ts"

Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 10 - "useAppSelector"

Cohesion: 0.22
Nodes (16): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), Sidebar() (+8 more)

### Community 11 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"

Cohesion: 0.14
Nodes (21): FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput (+13 more)

### Community 13 - "CustomerList.tsx"

Cohesion: 0.18
Nodes (20): CustomerList, fetchCustomers(), CustomerFormContent(), CustomerFormModal(), applyLocalCustomerFilters(), CustomerFilters, CustomerList(), isCustomerFilterActive() (+12 more)

### Community 14 - "mockEmployees.ts"

Cohesion: 0.14
Nodes (9): createEmployee(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee(), EmployeeEarningRecord (+1 more)

### Community 15 - "authSlice.ts"

Cohesion: 0.13
Nodes (26): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+18 more)

### Community 16 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"

Cohesion: 0.09
Nodes (41): OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+33 more)

### Community 18 - "RepairFormModal.tsx"

Cohesion: 0.29
Nodes (14): JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, RepairFormModalProps, STATUSES_REQUIRING_PRICE (+6 more)

### Community 20 - "router.tsx"

Cohesion: 0.10
Nodes (19): SidebarProps, BillingCounter, EmployeeList, PrintJobList, ProductTable, RepairJobList, StandalonePrintView, SupplierList (+11 more)

### Community 21 - "search.ts"

Cohesion: 0.16
Nodes (23): SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges(), IndexedField (+15 more)

### Community 22 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "SupplierDetailDrawer.tsx"

Cohesion: 0.25
Nodes (14): enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesByProduct(), usePurchasesBySupplier(), EnrichedLinkedProduct, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS (+6 more)

### Community 24 - "offline/index.ts"

Cohesion: 0.20
Nodes (14): UNSYNCED_VERSION, MirrorMeta, assignLedgerEntriesToOperation(), pendingDeltaFor(), OutboxFullError, getDeviceId(), createLocalId(), LOCAL_ID_PREFIX (+6 more)

### Community 25 - "PrintJobList.tsx"

Cohesion: 0.21
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS (+6 more)

### Community 26 - "EmployeeList.tsx"

Cohesion: 0.24
Nodes (12): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable() (+4 more)

### Community 27 - "InvoicesList.tsx"

Cohesion: 0.05
Nodes (49): ApiClient, buildParams(), buildSyncHeaders(), BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput (+41 more)

### Community 28 - "ProductTable.tsx"

Cohesion: 0.15
Nodes (19): EmployeeDetailDrawer(), ProductCatalogTree, applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS (+11 more)

### Community 29 - "client.ts"

Cohesion: 0.05
Nodes (44): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+36 more)

### Community 30 - "Backend Sync Requirements Doc"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "syncApi.ts"

Cohesion: 0.11
Nodes (26): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+18 more)

### Community 32 - "providers.tsx"

Cohesion: 0.12
Nodes (17): App(), AppProviders(), AppProvidersProps, AuthInitializer(), router, container, createReduxColorSchemeManager(), reduxColorSchemeManager (+9 more)

### Community 33 - "pull.test.ts"

Cohesion: 0.13
Nodes (18): readServerVersion(), toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary (+10 more)

### Community 34 - "searchFields.ts"

Cohesion: 0.24
Nodes (10): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, CUSTOMER_SEARCH_FIELDS, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, PRODUCT_SEARCH_FIELDS (+2 more)

### Community 35 - "offline/types.ts"

Cohesion: 0.12
Nodes (13): reclaimInflightOperations(), Widget, widgetResource, ConflictPolicy, ConflictStrategy, LocalApplyHandler, LocalApplyResult, LocalContext (+5 more)

### Community 36 - "EmployeeDetailDrawer.tsx"

Cohesion: 0.43
Nodes (4): DetailDrawer(), DetailDrawerProps, PhoneDisplay(), PhoneDisplayProps

### Community 37 - "SupplierList.tsx"

Cohesion: 0.16
Nodes (23): EnrichedLinkedSupplier, useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive() (+15 more)

### Community 38 - "syncSlice.ts"

Cohesion: 0.05
Nodes (54): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+46 more)

### Community 39 - "SyncEngine"

Cohesion: 0.28
Nodes (3): logError(), SyncEngine, countByStatus()

### Community 40 - "formatMoney"

Cohesion: 0.14
Nodes (17): PAYMENT_METHODS, DiscountPopover(), DiscountPopoverProps, PaymentPanel, getSaleHeroPresentation(), SaleHeroPresentation, AmountInput, AmountInputProps (+9 more)

### Community 41 - "settingsSlice.ts"

Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "useCategories.ts"

Cohesion: 0.15
Nodes (25): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTreeProps, ProductHierarchy (+17 more)

### Community 43 - "useCustomerStats.ts"

Cohesion: 0.70
Nodes (3): CustomerStats, fetchCustomerStats(), useCustomerStats()

### Community 44 - "CartLineItem.tsx"

Cohesion: 0.27
Nodes (8): CartLineItem, CartLineItemProps, getCategoryIconInfo(), LineSourceType, HEIGHT_MAP, QuantityInput(), QuantityInputProps, CartItem

### Community 45 - "ui.ts"

Cohesion: 0.50
Nodes (3): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN

### Community 46 - "customersApi.ts"

Cohesion: 0.18
Nodes (12): resolveOrCreateCustomer(), CustomerDetailDrawerProps, CustomerFormModalProps, FormContentProps, CustomerPickerModalProps, Customer, CustomerInput, CustomerListParams (+4 more)

### Community 53 - "SyncEngine.ts"

Cohesion: 0.13
Nodes (18): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, AuditLevel, logInfo() (+10 more)

### Community 56 - "money.ts"

Cohesion: 0.18
Nodes (20): CURRENCY, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, RepairFormModal(), MoneyInput() (+12 more)

### Community 57 - "build-and-deploy Job"

Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"

Cohesion: 0.13
Nodes (24): PaymentRecord, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictReason (+16 more)

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

### Community 67 - "RepairJobList.tsx"

Cohesion: 0.28
Nodes (11): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+3 more)

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

Cohesion: 0.15
Nodes (13): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+5 more)

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

Cohesion: 0.14
Nodes (22): Header(), HeaderProps, BillingCounter(), CartPanel, CartPanelProps, CatalogPanel, CatalogPanelProps, chunk() (+14 more)

### Community 79 - "Invoice"

Cohesion: 0.16
Nodes (13): InvoicesList, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), Invoice (+5 more)

### Community 84 - "useShortcuts.ts"

Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 121 - "useIsMobile"

Cohesion: 0.17
Nodes (20): ProductFormContent(), ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, SupplierFormContent(), SupplierPickerModal() (+12 more)

## Knowledge Gaps

- **346 isolated node(s):** `RFC-3339`, `RFC-3339`, `DailySalesReportSummary`, `PageHeaderProps`, `NotificationPopoverProps` (+341 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `LoginForm.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `useAppSelector`, `inventory/types.ts`, `CustomerList.tsx`, `RepairFormModal.tsx`, `router.tsx`, `SupplierDetailDrawer.tsx`, `ProductTable.tsx`, `EmployeeDetailDrawer.tsx`, `SupplierList.tsx`, `syncSlice.ts`, `formatMoney`, `useCategories.ts`, `CartLineItem.tsx`, `money.ts`, `AppShell.tsx`, `CatalogPanel.tsx`, `Invoice`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `client.ts` to `offline/index.ts`, `flush.ts`, `SyncEngine.ts`, `authSlice.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `SettingsPage.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `AppShell.tsx`, `formatMoney`, `syncSlice.ts`, `CatalogPanel.tsx`, `authSlice.ts`, `SyncProvider.tsx`, `router.tsx`, `search.ts`, `SupplierDetailDrawer.tsx`, `InvoicesList.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `RFC-3339`, `RFC-3339`, `DailySalesReportSummary` to the rest of the system?**
  _346 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07428571428571429 - nodes in this community are weakly interconnected._
- **Should `SettingsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12233285917496443 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
