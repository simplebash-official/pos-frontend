# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~176,333 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1798 nodes · 5566 edges · 113 communities (83 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b666a91a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SyncEngine.ts
- notificationSlice.ts
- useAppDispatch
- registry.ts
- CreditNoteModal.tsx
- InvoiceDetailDrawer.tsx
- cartSlice.ts
- printJobs.resource.ts
- searchFields.ts
- InvoicesList.tsx
- useAppSelector
- dependencies
- money.ts
- syncSlice.ts
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- products.resource.ts
- tablerIconShards/index.ts
- SupplierList.tsx
- ReportsDashboard.tsx
- compilerOptions
- billing/types.ts
- offline/index.ts
- invoicesApi.ts
- settingsSlice.ts
- queryKeys.ts
- router.tsx
- client.ts
- Backend Sync Requirements Doc
- EmployeeList.tsx
- LoginForm.tsx
- useIsMobile
- PrintJobList.tsx
- useSearchHistory.ts
- SyncProvider.tsx
- RepairJobList.tsx
- SyncPanel.tsx
- @mantine/form
- inventory/types.ts
- PrintJobFormModal.tsx
- ExpandableCard.tsx
- suppliers.resource.ts
- vite-plugin-pwa
- purchasesApi.ts
- supplierProducts.resource.ts
- app/App.tsx
- syncApi.ts
- providers.tsx
- payments.resource.ts
- useLayoutTier
- ProductTable.tsx
- useShortcuts.ts
- categories.resource.ts
- CatalogPanel.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- BillingCounter.tsx
- formatMoney
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
- useCategories.ts
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

## Communities (113 total, 30 thin omitted)

### Community 0 - "SyncEngine.ts"
Cohesion: 0.08
Nodes (35): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, pruneByRetention(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor() (+27 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.11
Nodes (23): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+15 more)

### Community 2 - "useAppDispatch"
Cohesion: 0.13
Nodes (27): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+19 more)

### Community 3 - "registry.ts"
Cohesion: 0.08
Nodes (27): getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, deltaCursors, deltaPages (+19 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.08
Nodes (34): BackendCreditNote, BackendCreditNoteExchangeItem, BackendCreditNoteItem, CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData (+26 more)

### Community 5 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.10
Nodes (38): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+30 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.12
Nodes (27): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, CartItem, cartSlice, DiscountType, HeldCart (+19 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.31
Nodes (14): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+6 more)

### Community 8 - "searchFields.ts"
Cohesion: 0.12
Nodes (31): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch() (+23 more)

### Community 9 - "InvoicesList.tsx"
Cohesion: 0.13
Nodes (19): useBillingStats(), useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS, getInvoiceStatusMeta() (+11 more)

### Community 10 - "useAppSelector"
Cohesion: 0.10
Nodes (34): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAdmin(), RequireAdminProps, RequireAuth(), RequireAuthProps (+26 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "money.ts"
Cohesion: 0.23
Nodes (13): CURRENCY, ProductFormContent(), RepairFormModal(), MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents(), toCents() (+5 more)

### Community 13 - "syncSlice.ts"
Cohesion: 0.12
Nodes (14): ConnectivitySnapshot, PULL_INTERVAL_MS, SyncEngineState, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectModuleView() (+6 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.31
Nodes (14): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams (+6 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.15
Nodes (21): UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession (+13 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.09
Nodes (45): OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+37 more)

### Community 18 - "products.resource.ts"
Cohesion: 0.18
Nodes (21): createCreditNote(), fetchCreditNotes(), toCreditNote(), voidCreditNote(), adjustStock(), createProduct(), deleteProducts(), fetchProducts() (+13 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "SupplierList.tsx"
Cohesion: 0.14
Nodes (25): useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters (+17 more)

### Community 21 - "ReportsDashboard.tsx"
Cohesion: 0.25
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "billing/types.ts"
Cohesion: 0.21
Nodes (14): PAYMENT_METHODS, PaymentMethod, A4InvoicePreviewModalProps, PaymentPanel, PaymentPanelProps, getSaleHeroPresentation(), SaleHeroPresentation, Invoice (+6 more)

### Community 24 - "offline/index.ts"
Cohesion: 0.14
Nodes (20): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct() (+12 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+16 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.13
Nodes (17): SettingsPage, renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption (+9 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.15
Nodes (19): queryKeys, BillingStats, fetchBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats (+11 more)

### Community 28 - "router.tsx"
Cohesion: 0.14
Nodes (12): BillingCounter, CustomerList, EmployeeList, InvoicesList, PrintJobList, RepairJobList, StandalonePrintView, SupplierList (+4 more)

### Community 29 - "client.ts"
Cohesion: 0.06
Nodes (36): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+28 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "EmployeeList.tsx"
Cohesion: 0.26
Nodes (12): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EMPLOYEE_ROLE_LABELS, EmployeeInput, EmployeeRole, SegmentedToggle() (+4 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.17
Nodes (15): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+7 more)

### Community 33 - "useIsMobile"
Cohesion: 0.10
Nodes (33): HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS, fetchEmployeeEarnings(), EmployeeDetailDrawer(), ProductPickerModal() (+25 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.27
Nodes (12): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+4 more)

### Community 35 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 36 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.17
Nodes (21): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, RepairFormModalProps, STATUSES_REQUIRING_PRICE, applyLocalRepairFilters(), isRepairFilterActive() (+13 more)

### Community 38 - "SyncPanel.tsx"
Cohesion: 0.09
Nodes (38): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+30 more)

### Community 40 - "inventory/types.ts"
Cohesion: 0.09
Nodes (26): fetchProductSerials(), ProductListParams, ProductsPageData, FormContentProps, ProductFormModalProps, SupplierIntakeRow, SerialNumberPickerModal(), SerialNumberPickerModalProps (+18 more)

### Community 41 - "PrintJobFormModal.tsx"
Cohesion: 0.42
Nodes (8): SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, UpdatePrintJobPayload, PrintJobFormValues, AssignmentInfo, CustomerRef

### Community 42 - "ExpandableCard.tsx"
Cohesion: 0.27
Nodes (8): ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 45 - "purchasesApi.ts"
Cohesion: 0.27
Nodes (9): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+1 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.27
Nodes (11): MutationRequestOptions, fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct() (+3 more)

### Community 47 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 48 - "syncApi.ts"
Cohesion: 0.19
Nodes (17): PULL_PAGE_LIMIT, defineSyncResource(), productSerialsResource, stockMovementsResource, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshot() (+9 more)

### Community 49 - "providers.tsx"
Cohesion: 0.11
Nodes (17): AppProvidersProps, AuthInitializer(), createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), store, ColorScheme (+9 more)

### Community 50 - "payments.resource.ts"
Cohesion: 0.40
Nodes (8): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, paymentsResource, RecordPaymentPayload

### Community 51 - "useLayoutTier"
Cohesion: 0.40
Nodes (4): BillingRegions, BillingPageSkeleton(), FILL, useLayoutTier()

### Community 52 - "ProductTable.tsx"
Cohesion: 0.14
Nodes (26): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useInventoryStats(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+18 more)

### Community 53 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 54 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.23
Nodes (14): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+6 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.10
Nodes (33): NO_CREDIT_NOTES, useCreditNotes(), useVoidCreditNote(), db, MirrorTableName, OfflineDb, AuditEvent, AuditLevel (+25 more)

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

### Community 66 - "formatMoney"
Cohesion: 0.10
Nodes (39): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawer(), CustomerDetailDrawerProps (+31 more)

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
Cohesion: 0.13
Nodes (11): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+3 more)

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

### Community 84 - "useCategories.ts"
Cohesion: 0.14
Nodes (26): ProductTable, CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree (+18 more)

## Knowledge Gaps
- **369 isolated node(s):** `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments`, `CompleteSalePaymentInput`, `BackendInvoiceItem` (+364 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `BillingCounter.tsx`, `notificationSlice.ts`, `useAppDispatch`, `CreditNoteModal.tsx`, `InvoiceDetailDrawer.tsx`, `cartSlice.ts`, `SyncPanel.tsx`, `SyncProvider.tsx`, `useIsMobile`, `searchFields.ts`, `InvoicesList.tsx`, `syncSlice.ts`, `authSlice.ts`, `ProductTable.tsx`, `billing/types.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `db` connect `schema.ts` to `SyncEngine.ts`, `registry.ts`, `InvoiceDetailDrawer.tsx`, `printJobs.resource.ts`, `repairs.resource.ts`, `authSlice.ts`, `flush.ts`, `products.resource.ts`, `SupplierList.tsx`, `offline/index.ts`, `invoicesApi.ts`, `queryKeys.ts`, `useIsMobile`, `PrintJobList.tsx`, `RepairJobList.tsx`, `SyncPanel.tsx`, `suppliers.resource.ts`, `supplierProducts.resource.ts`, `syncApi.ts`, `payments.resource.ts`, `ProductTable.tsx`, `categories.resource.ts`, `formatMoney`, `useCategories.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `BillingCounter.tsx`, `formatMoney`, `notificationSlice.ts`, `CreditNoteModal.tsx`, `InvoiceDetailDrawer.tsx`, `RepairJobList.tsx`, `SyncPanel.tsx`, `inventory/types.ts`, `PrintJobFormModal.tsx`, `useAppSelector`, `money.ts`, `CartLineItem.tsx`, `useCategories.ts`, `ProductTable.tsx`, `SupplierList.tsx`, `billing/types.ts`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments` to the rest of the system?**
  _369 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SyncEngine.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08415300546448087 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11051693404634581 - nodes in this community are weakly interconnected._
- **Should `useAppDispatch` be split into smaller, more focused modules?**
  _Cohesion score 0.1337126600284495 - nodes in this community are weakly interconnected._