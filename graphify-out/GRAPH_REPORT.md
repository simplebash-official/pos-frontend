# Graph Report - frontend  (2026-08-21)

## Corpus Check
- 326 files · ~168,066 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1740 nodes · 5334 edges · 105 communities (75 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d09115af`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ReportsDashboard.tsx
- notificationSlice.ts
- SettingsPage.tsx
- common.ts
- formatMoney
- A4InvoicePreviewModal.tsx
- cartSlice.ts
- registry.ts
- tablerIcons.ts
- client.ts
- useAppDispatch
- dependencies
- inventory/types.ts
- RepairFormModal.tsx
- InvoiceDetailDrawer.tsx
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobFormModal.tsx
- invoicesApi.ts
- search.ts
- compilerOptions
- useSyncedQuery
- outbox.ts
- PrintJobList.tsx
- purchasesApi.ts
- useModuleStats
- ProductTable.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- useCategories.ts
- useInventoryStats.ts
- pull.test.ts
- InvoicesList.tsx
- router.tsx
- SupplierList.tsx
- syncSlice.ts
- SyncEngine.ts
- AmountInput.tsx
- settingsSlice.ts
- CategoryManagerModal.tsx
- useIsMobile
- CustomerList.tsx
- useSyncData.ts
- ExpandableCard.tsx
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
- useResponsive.tsx
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
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
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

## Communities (105 total, 30 thin omitted)

### Community 0 - "ReportsDashboard.tsx"
Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 1 - "notificationSlice.ts"
Cohesion: 0.06
Nodes (43): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification (+35 more)

### Community 2 - "SettingsPage.tsx"
Cohesion: 0.09
Nodes (34): DiscountPopoverProps, ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+26 more)

### Community 3 - "common.ts"
Cohesion: 0.14
Nodes (14): MutationRequestOptions, BackendPaymentRecord, recordPayment(), toPaymentRecord(), BillingStats, fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier() (+6 more)

### Community 4 - "formatMoney"
Cohesion: 0.10
Nodes (35): PAYMENT_METHODS, PaymentMethod, CompleteSaleInput, CompleteSaleResult, A4InvoicePreviewModalProps, BillingRegions, BillingRegionsProps, FILL (+27 more)

### Community 5 - "A4InvoicePreviewModal.tsx"
Cohesion: 0.19
Nodes (15): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+7 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (33): BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, useCartCheckout(), useCartItems(), SplitPaymentDetail, cartSlice (+25 more)

### Community 7 - "registry.ts"
Cohesion: 0.07
Nodes (90): queryKeys, cancelInvoice(), completeSale(), RecordPaymentInput, createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer() (+82 more)

### Community 8 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 9 - "client.ts"
Cohesion: 0.23
Nodes (7): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation()

### Community 10 - "useAppDispatch"
Cohesion: 0.09
Nodes (32): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, SidebarProps, AppProvidersProps (+24 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"
Cohesion: 0.10
Nodes (23): ProductListParams, ProductsPageData, ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormModalProps, SupplierIntakeRow, BarcodeSource (+15 more)

### Community 13 - "RepairFormModal.tsx"
Cohesion: 0.19
Nodes (18): CURRENCY, ProductFormContent(), useValidCategories(), RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJob, MoneyInput() (+10 more)

### Community 14 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.13
Nodes (12): InvoicesList, PaymentRecord, NO_PAYMENTS, useInvoicePayments(), useRecordPayment(), useInvoiceReturns(), getPrintCountForInvoice(), getPrintLogsForInvoice() (+4 more)

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
Cohesion: 0.24
Nodes (15): JobStatus, SplitType, BackendPrintJob, PrintJobFormModalProps, NO_PRINT_JOBS, PrintJob, PrintJobInput, PrintJobType (+7 more)

### Community 20 - "invoicesApi.ts"
Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+7 more)

### Community 21 - "search.ts"
Cohesion: 0.15
Nodes (25): SearchHighlight(), SearchHighlightProps, useBackendFilteredList(), UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges() (+17 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "useSyncedQuery"
Cohesion: 0.14
Nodes (24): useReturns(), ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), enrich(), NO_PURCHASES, useCreatePurchase() (+16 more)

### Community 24 - "outbox.ts"
Cohesion: 0.08
Nodes (36): stripMirrorMeta(), UNSYNCED_VERSION, MIRROR_TABLE_NAMES, MirrorMeta, assignLedgerEntriesToOperation(), pendingDeltaFor(), OutboxFullError, getDeviceId() (+28 more)

### Community 25 - "PrintJobList.tsx"
Cohesion: 0.23
Nodes (12): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), useAllPrintJobs() (+4 more)

### Community 26 - "purchasesApi.ts"
Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 27 - "useModuleStats"
Cohesion: 0.16
Nodes (16): fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchPrintJobStats(), PrintJobStats, usePrintJobStats() (+8 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.15
Nodes (22): fetchProducts(), ProductCatalogTree, applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS (+14 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.05
Nodes (40): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation (+32 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "useCategories.ts"
Cohesion: 0.29
Nodes (7): buildCategoryLookup(), NO_CATEGORIES, CategoryInput, AddSubcategoryPayload, DeleteCategoryPayload, RemoveSubcategoryPayload, UpdateCategoryPayload

### Community 32 - "useInventoryStats.ts"
Cohesion: 0.70
Nodes (3): fetchInventoryStats(), InventoryStats, useInventoryStats()

### Community 33 - "pull.test.ts"
Cohesion: 0.09
Nodes (34): readServerVersion(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta() (+26 more)

### Community 34 - "InvoicesList.tsx"
Cohesion: 0.15
Nodes (17): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult (+9 more)

### Community 36 - "router.tsx"
Cohesion: 0.10
Nodes (16): App(), AppProviders(), BillingCounter, CustomerList, PrintJobList, ProductTable, RepairJobList, router (+8 more)

### Community 37 - "SupplierList.tsx"
Cohesion: 0.12
Nodes (29): SupplierList, ReceiveStockModalProps, useSetSupplierLinks(), fetchSuppliers(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps (+21 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.08
Nodes (32): SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, STORAGE_QUOTA_WARN_RATIO (+24 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.13
Nodes (13): PULL_INTERVAL_MS, AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection, pruneConfirmedLedgerEntries() (+5 more)

### Community 40 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 41 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "CategoryManagerModal.tsx"
Cohesion: 0.19
Nodes (16): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductFormModal(), CATEGORY_COLOR_OPTIONS (+8 more)

### Community 44 - "useIsMobile"
Cohesion: 0.15
Nodes (25): Header(), HeaderProps, Sidebar(), BillingCounter(), CartLineItem, CartPanel, CartPanelProps, HeldSalesDrawer() (+17 more)

### Community 46 - "CustomerList.tsx"
Cohesion: 0.10
Nodes (33): fetchInvoices(), fetchAllCustomers(), fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps (+25 more)

### Community 50 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 54 - "ExpandableCard.tsx"
Cohesion: 0.27
Nodes (8): ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.13
Nodes (26): EmployeeList, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS (+18 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.11
Nodes (28): NO_INVOICES, useCancelInvoice(), NO_RETURNS, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb (+20 more)

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

### Community 66 - "returnsApi.ts"
Cohesion: 0.19
Nodes (14): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+6 more)

### Community 67 - "RepairJobList.tsx"
Cohesion: 0.21
Nodes (14): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+6 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "useResponsive.tsx"
Cohesion: 0.11
Nodes (24): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+16 more)

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
- **353 isolated node(s):** `BackendReturnItem`, `ReturnListResponseData`, `FetchReturnsParams`, `NO_RETURNS`, `SaleHeroPresentation` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `InvoicesList.tsx`, `formatMoney`, `A4InvoicePreviewModal.tsx`, `SupplierList.tsx`, `useResponsive.tsx`, `AmountInput.tsx`, `useAppDispatch`, `CategoryManagerModal.tsx`, `inventory/types.ts`, `RepairFormModal.tsx`, `CustomerList.tsx`, `authSlice.ts`, `InvoiceDetailDrawer.tsx`, `PrintJobFormModal.tsx`, `useSyncedQuery`, `EmployeeList.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useIsMobile` to `notificationSlice.ts`, `SettingsPage.tsx`, `formatMoney`, `A4InvoicePreviewModal.tsx`, `cartSlice.ts`, `useResponsive.tsx`, `syncSlice.ts`, `useAppDispatch`, `SyncProvider.tsx`, `authSlice.ts`, `search.ts`, `useSyncedQuery`, `ProductTable.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `ReportsDashboard.tsx`, `SettingsPage.tsx`, `InvoicesList.tsx`, `RepairJobList.tsx`, `SupplierList.tsx`, `cartSlice.ts`, `useIsMobile`, `inventory/types.ts`, `CustomerList.tsx`, `CatalogPanel.tsx`, `RepairFormModal.tsx`, `InvoiceDetailDrawer.tsx`, `PrintJobFormModal.tsx`, `useSyncedQuery`, `EmployeeList.tsx`, `PrintJobList.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `BackendReturnItem`, `ReturnListResponseData`, `FetchReturnsParams` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06110102843315184 - nodes in this community are weakly interconnected._
- **Should `SettingsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08865248226950355 - nodes in this community are weakly interconnected._
- **Should `common.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._