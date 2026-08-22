# Graph Report - frontend  (2026-08-21)

## Corpus Check
- 328 files · ~169,155 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1748 nodes · 5389 edges · 104 communities (74 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28be4245`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InvoicesList.tsx
- notificationSlice.ts
- useAppSelector
- registry.ts
- useSearchHistory.ts
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- useShortcuts.ts
- CustomerList.tsx
- mockEmployees.ts
- dependencies
- inventory/types.ts
- RepairFormModal.tsx
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- syncApi.ts
- tablerIconShards/index.ts
- router.tsx
- searchFields.ts
- compilerOptions
- BillingCounter.tsx
- offline/index.ts
- invoicesApi.ts
- money.ts
- queryKeys.ts
- ProductTable.tsx
- client.ts
- Backend Sync Requirements Doc
- EmployeeList.tsx
- usePrintJobStats.ts
- useResponsive.tsx
- PrintJobList.tsx
- LoginForm.tsx
- providers.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine.ts
- SupplierList.tsx
- settingsSlice.ts
- useCategories.ts
- Invoice
- vite-plugin-pwa
- @mantine/form
- purchasesApi.ts
- categories.resource.ts
- useIsMobile
- ApiClient
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- common.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CatalogPanel.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
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
10. `Invoice` - 28 edges

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

## Communities (104 total, 30 thin omitted)

### Community 0 - "InvoicesList.tsx"
Cohesion: 0.27
Nodes (10): BillingStats, fetchBillingStats(), useBillingStats(), useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive() (+2 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.13
Nodes (20): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+12 more)

### Community 2 - "useAppSelector"
Cohesion: 0.14
Nodes (30): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+22 more)

### Community 3 - "registry.ts"
Cohesion: 0.07
Nodes (27): CursorInvalidError, reclaimInflightOperations(), resetRegistry(), resources, Widget, widgetResource, deltaCursors, deltaPages (+19 more)

### Community 4 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.18
Nodes (20): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, usePrint() (+12 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (34): PaymentMethod, CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+26 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 8 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 9 - "CustomerList.tsx"
Cohesion: 0.10
Nodes (31): CustomerList, resolveOrCreateCustomer(), fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormModal(), CustomerFormModalProps, FormContentProps (+23 more)

### Community 10 - "mockEmployees.ts"
Cohesion: 0.13
Nodes (15): ReportsDashboard, earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees(), INITIAL_EARNINGS, INITIAL_EMPLOYEES (+7 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"
Cohesion: 0.15
Nodes (20): CURRENCY, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories(), BarcodeSource (+12 more)

### Community 13 - "RepairFormModal.tsx"
Cohesion: 0.13
Nodes (33): EmployeeList, JobStatus, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EmployeeRole, SplitType (+25 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.13
Nodes (24): AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse (+16 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.08
Nodes (42): OutboxError, AbandonedReferenceError, BarcodeConflictError, OutboxFullError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord() (+34 more)

### Community 18 - "syncApi.ts"
Cohesion: 0.07
Nodes (62): BackendReturnItem, BackendReturnRecord, fetchReturnById(), fetchReturns(), fetchReturnsForInvoice(), FetchReturnsParams, processReturn(), ProcessReturnInput (+54 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"
Cohesion: 0.06
Nodes (40): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAdmin(), RequireAdminProps, RequireAuth(), RequireAuthProps, AppShell() (+32 more)

### Community 21 - "searchFields.ts"
Cohesion: 0.13
Nodes (30): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch() (+22 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "BillingCounter.tsx"
Cohesion: 0.20
Nodes (18): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+10 more)

### Community 24 - "offline/index.ts"
Cohesion: 0.10
Nodes (30): applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ, getDeviceId() (+22 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.12
Nodes (25): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+17 more)

### Community 26 - "money.ts"
Cohesion: 0.21
Nodes (16): ProductPickerModal(), ProductPickerModalProps, useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase() (+8 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.20
Nodes (14): queryKeys, CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats, useInventoryStats(), fetchRepairStats() (+6 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.18
Nodes (22): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+14 more)

### Community 29 - "client.ts"
Cohesion: 0.05
Nodes (42): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+34 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "EmployeeList.tsx"
Cohesion: 0.12
Nodes (16): createEmployee(), deleteEmployee(), deleteEmployees(), normalizeEmployee(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps (+8 more)

### Community 32 - "usePrintJobStats.ts"
Cohesion: 0.70
Nodes (3): fetchPrintJobStats(), PrintJobStats, usePrintJobStats()

### Community 33 - "useResponsive.tsx"
Cohesion: 0.12
Nodes (18): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+10 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.20
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS (+6 more)

### Community 35 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 36 - "providers.tsx"
Cohesion: 0.09
Nodes (20): App(), AppProviders(), AppProvidersProps, router, container, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme() (+12 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.18
Nodes (15): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+7 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (50): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+42 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.09
Nodes (34): readServerVersion(), toServerRow(), db, blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta() (+26 more)

### Community 40 - "SupplierList.tsx"
Cohesion: 0.12
Nodes (31): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+23 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.13
Nodes (17): SettingsPage, renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption (+9 more)

### Community 42 - "useCategories.ts"
Cohesion: 0.14
Nodes (23): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductCatalogTreeProps (+15 more)

### Community 43 - "Invoice"
Cohesion: 0.10
Nodes (25): InvoicesList, CompleteSaleResult, ProcessReturnItemInput, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, useInvoicePayments(), useRecordPayment() (+17 more)

### Community 51 - "purchasesApi.ts"
Cohesion: 0.24
Nodes (10): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+2 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 55 - "useIsMobile"
Cohesion: 0.11
Nodes (27): PAYMENT_METHODS, CartLineItem, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps (+19 more)

### Community 56 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.10
Nodes (33): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, PendingOperationsList(), PendingOperationsListProps (+25 more)

### Community 60 - "SyncProvider.tsx"
Cohesion: 0.39
Nodes (10): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+2 more)

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

### Community 67 - "common.ts"
Cohesion: 0.13
Nodes (11): ProductListParams, ProductsPageData, StockAdjustmentResult, RepairStats, fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), SupplierProductListParams (+3 more)

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

### Community 78 - "CatalogPanel.tsx"
Cohesion: 0.22
Nodes (16): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+8 more)

## Knowledge Gaps
- **354 isolated node(s):** `target`, `module`, `ES2023`, `DOM`, `vite/client` (+349 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `useResponsive.tsx`, `notificationSlice.ts`, `LoginForm.tsx`, `SaleDocumentPreviewModal.tsx`, `syncSlice.ts`, `SupplierList.tsx`, `CustomerList.tsx`, `mockEmployees.ts`, `useCategories.ts`, `inventory/types.ts`, `RepairFormModal.tsx`, `Invoice`, `router.tsx`, `searchFields.ts`, `BillingCounter.tsx`, `money.ts`, `ProductTable.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `InvoicesList.tsx`, `useResponsive.tsx`, `notificationSlice.ts`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `Invoice`, `SyncProvider.tsx`, `authSlice.ts`, `router.tsx`, `BillingCounter.tsx`, `searchFields.ts`, `useIsMobile`, `offline/index.ts`, `money.ts`, `ProductTable.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `useIsMobile` to `InvoicesList.tsx`, `PrintJobList.tsx`, `SaleDocumentPreviewModal.tsx`, `RepairJobList.tsx`, `CustomerList.tsx`, `mockEmployees.ts`, `useCategories.ts`, `inventory/types.ts`, `Invoice`, `CatalogPanel.tsx`, `RepairFormModal.tsx`, `searchFields.ts`, `BillingCounter.tsx`, `money.ts`, `ProductTable.tsx`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `target`, `module`, `ES2023` to the rest of the system?**
  _354 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.13510520487264674 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07195121951219512 - nodes in this community are weakly interconnected._