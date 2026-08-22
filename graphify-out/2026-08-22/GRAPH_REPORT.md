# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~176,159 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1798 nodes · 5569 edges · 115 communities (85 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76bcce0e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pull.ts
- notificationSlice.ts
- useAppSelector
- registry.ts
- CreditNoteModal.tsx
- A4InvoicePreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- InvoiceDetailDrawer.tsx
- searchFields.ts
- router.tsx
- dependencies
- RepairFormModal.tsx
- money.ts
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- products.resource.ts
- SupplierList.tsx
- InvoicesList.tsx
- compilerOptions
- SettingsPage.tsx
- db
- invoicesApi.ts
- settingsSlice.ts
- queryKeys.ts
- providers.tsx
- client.ts
- Backend Sync Requirements Doc
- EmployeeList.tsx
- LoginForm.tsx
- useIsMobile
- PrintJobList.tsx
- billing/types.ts
- SyncProvider.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine.ts
- inventory/types.ts
- AppShell.tsx
- useSyncData.ts
- suppliers.resource.ts
- vite-plugin-pwa
- purchases.resource.ts
- supplierProducts.resource.ts
- @mantine/form
- syncApi.ts
- ExpandableCard.tsx
- tablerIcons.ts
- DataTable.tsx
- ProductTable.tsx
- useShortcuts.ts
- useCategories.ts
- CatalogPanel.tsx
- LogoUpload.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- BillingCounter.tsx
- CustomerList.tsx
- useProductSerials.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- mockEmployees.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- CartLineItem.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- ApiClient
- CategoryManagerModal.tsx
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
1. `useIsMobile()` - 76 edges
2. `useAppSelector` - 66 edges
3. `formatMoney()` - 61 edges
4. `useSyncedMutation()` - 48 edges
5. `db` - 44 edges
6. `useAppDispatch` - 42 edges
7. `queryKeys` - 35 edges
8. `useSyncedQuery()` - 33 edges
9. `ConnectivityMonitor` - 30 edges
10. `flushOutbox()` - 29 edges

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
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
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

## Communities (115 total, 30 thin omitted)

### Community 0 - "pull.ts"
Cohesion: 0.12
Nodes (22): toServerRow(), blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), SyncMetaPatch, logWarn(), adoptNewestCursor() (+14 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.06
Nodes (44): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+36 more)

### Community 2 - "useAppSelector"
Cohesion: 0.20
Nodes (20): AppUpdatePrompt(), HeldCartCatchupNotifier(), BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection() (+12 more)

### Community 3 - "registry.ts"
Cohesion: 0.09
Nodes (23): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, mockStatus() (+15 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.09
Nodes (32): BackendCreditNote, BackendCreditNoteExchangeItem, BackendCreditNoteItem, CreateCreditNoteExchangeItemInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+24 more)

### Community 5 - "A4InvoicePreviewModal.tsx"
Cohesion: 0.14
Nodes (21): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), StandalonePrintView(), useCreditNoteDocument(), UseCreditNoteDocumentResult (+13 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.12
Nodes (27): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, CartItem, cartSlice, DiscountType, HeldCart (+19 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.31
Nodes (14): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+6 more)

### Community 8 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.15
Nodes (20): DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, useInvoiceCreditNotes(), NO_INVOICES, useCloseInvoice(), useVoidInvoice(), useInvoicePayments() (+12 more)

### Community 9 - "searchFields.ts"
Cohesion: 0.12
Nodes (31): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch() (+23 more)

### Community 10 - "router.tsx"
Cohesion: 0.10
Nodes (17): App(), AppProviders(), BillingCounter, CustomerList, EmployeeList, PrintJobList, RepairJobList, ReportsDashboard (+9 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "RepairFormModal.tsx"
Cohesion: 0.23
Nodes (17): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+9 more)

### Community 13 - "money.ts"
Cohesion: 0.24
Nodes (12): CURRENCY, ProductFormContent(), RepairFormModal(), MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents(), toCents() (+4 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.31
Nodes (14): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams (+6 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.12
Nodes (27): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+19 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (43): OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+35 more)

### Community 18 - "products.resource.ts"
Cohesion: 0.19
Nodes (19): createCreditNote(), CreateCreditNoteInput, fetchCreditNotes(), toCreditNote(), voidCreditNote(), adjustStock(), createProduct(), deleteProducts() (+11 more)

### Community 20 - "SupplierList.tsx"
Cohesion: 0.16
Nodes (24): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters (+16 more)

### Community 21 - "InvoicesList.tsx"
Cohesion: 0.14
Nodes (16): InvoicesList, useBillingStats(), useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS (+8 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "SettingsPage.tsx"
Cohesion: 0.18
Nodes (14): AppShell(), BillingRegions, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage() (+6 more)

### Community 24 - "db"
Cohesion: 0.12
Nodes (25): NO_CREDIT_NOTES, useCreditNotes(), useVoidCreditNote(), readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, db, MIRROR_TABLE_NAMES (+17 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (25): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+17 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.15
Nodes (19): queryKeys, BillingStats, fetchBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats (+11 more)

### Community 28 - "providers.tsx"
Cohesion: 0.22
Nodes (8): AppProvidersProps, AuthInitializer(), darkTokens, lightTokens, mantineCssVariableResolver(), semanticVars, CONTAINER_SIZES, mantineTheme

### Community 29 - "client.ts"
Cohesion: 0.06
Nodes (40): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+32 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "EmployeeList.tsx"
Cohesion: 0.26
Nodes (12): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS, EmployeeInput, EmployeeRole, SegmentedToggle() (+4 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.21
Nodes (13): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+5 more)

### Community 33 - "useIsMobile"
Cohesion: 0.12
Nodes (24): HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, CustomerFormContent(), CustomerPickerModal(), fetchEmployeeEarnings() (+16 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.25
Nodes (13): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+5 more)

### Community 35 - "billing/types.ts"
Cohesion: 0.26
Nodes (12): PAYMENT_METHODS, PaymentMethod, A4InvoicePreviewModalProps, PaymentPanel, PaymentPanelProps, getSaleHeroPresentation(), SaleHeroPresentation, Invoice (+4 more)

### Community 36 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.26
Nodes (12): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+4 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.08
Nodes (38): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+30 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.10
Nodes (21): AUDIT_LOG_LIMIT, pruneByRetention(), rowAgeTimestamp(), getAllSyncMeta(), seedSyncMeta(), AuditLevel, logError(), logInfo() (+13 more)

### Community 40 - "inventory/types.ts"
Cohesion: 0.11
Nodes (22): ProductListParams, ProductsPageData, FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput (+14 more)

### Community 41 - "AppShell.tsx"
Cohesion: 0.10
Nodes (26): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH (+18 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.26
Nodes (10): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), markDeleted(), DeleteSupplierPayload (+2 more)

### Community 45 - "purchases.resource.ts"
Cohesion: 0.23
Nodes (12): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary (+4 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.35
Nodes (9): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), toLocalRow() (+1 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.14
Nodes (25): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, PULL_PAGE_LIMIT, defineSyncResource() (+17 more)

### Community 49 - "ExpandableCard.tsx"
Cohesion: 0.27
Nodes (8): ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 50 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 51 - "DataTable.tsx"
Cohesion: 0.32
Nodes (6): ConfirmDialog(), ConfirmDialogProps, Column, DataTable(), DataTableProps, getSkeletonWidthPercent()

### Community 52 - "ProductTable.tsx"
Cohesion: 0.11
Nodes (38): ProductPickerModal(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useInventoryStats(), NO_MOVEMENTS, NO_PRODUCTS (+30 more)

### Community 53 - "useShortcuts.ts"
Cohesion: 0.36
Nodes (7): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope, useAppShortcuts()

### Community 54 - "useCategories.ts"
Cohesion: 0.20
Nodes (15): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), buildCategoryLookup(), NO_CATEGORIES (+7 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.24
Nodes (15): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+7 more)

### Community 56 - "LogoUpload.tsx"
Cohesion: 0.50
Nodes (3): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.14
Nodes (24): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord (+16 more)

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

### Community 65 - "BillingCounter.tsx"
Cohesion: 0.15
Nodes (24): Header(), HeaderProps, CompleteSaleInput, BillingCounter(), BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+16 more)

### Community 66 - "CustomerList.tsx"
Cohesion: 0.10
Nodes (38): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawer(), CustomerDetailDrawerProps (+30 more)

### Community 67 - "useProductSerials.ts"
Cohesion: 0.43
Nodes (5): fetchProductSerials(), SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), ProductSerialStatus

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "mockEmployees.ts"
Cohesion: 0.12
Nodes (14): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees(), INITIAL_EARNINGS (+6 more)

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

### Community 79 - "CartLineItem.tsx"
Cohesion: 0.13
Nodes (15): CartLineItem, DiscountPopover(), DiscountPopoverProps, getCategoryIconInfo(), AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP (+7 more)

### Community 83 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 84 - "CategoryManagerModal.tsx"
Cohesion: 0.15
Nodes (21): ProductTable, CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree (+13 more)

## Knowledge Gaps
- **368 isolated node(s):** `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments`, `CompleteSalePaymentInput`, `BackendInvoiceItem` (+363 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `BillingCounter.tsx`, `notificationSlice.ts`, `billing/types.ts`, `CreditNoteModal.tsx`, `A4InvoicePreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoiceDetailDrawer.tsx`, `AppShell.tsx`, `SyncProvider.tsx`, `searchFields.ts`, `authSlice.ts`, `ProductTable.tsx`, `InvoicesList.tsx`, `SettingsPage.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `CreditNoteModal.tsx`, `A4InvoicePreviewModal.tsx`, `InvoiceDetailDrawer.tsx`, `RepairFormModal.tsx`, `money.ts`, `SupplierList.tsx`, `EmployeeList.tsx`, `LoginForm.tsx`, `billing/types.ts`, `syncSlice.ts`, `inventory/types.ts`, `AppShell.tsx`, `ProductTable.tsx`, `BillingCounter.tsx`, `CustomerList.tsx`, `useProductSerials.ts`, `CartLineItem.tsx`, `CategoryManagerModal.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `client.ts` to `db`, `flush.ts`, `authSlice.ts`, `SyncEngine.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments` to the rest of the system?**
  _368 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pull.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11895161290322581 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06078316773816481 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._