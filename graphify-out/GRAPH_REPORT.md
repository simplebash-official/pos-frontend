# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~175,522 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1797 nodes · 5550 edges · 112 communities (81 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `242373f1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SyncEngine.ts
- notificationSlice.ts
- useAppSelector
- registry.ts
- CreditNoteModal.tsx
- A4InvoicePreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- providers.tsx
- CustomerList.tsx
- router.tsx
- dependencies
- RepairFormModal.tsx
- money.ts
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- creditNotesApi.ts
- billing/types.ts
- InvoiceDetailDrawer.tsx
- compilerOptions
- useResponsive.tsx
- useSyncedMutation.ts
- invoicesApi.ts
- settingsSlice.ts
- common.ts
- SettingsPage.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- LocalStorageStore
- LoginForm.tsx
- AppShell.tsx
- PrintJobList.tsx
- queryKeys.ts
- SyncProvider.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine
- inventory/types.ts
- useInvoiceDocument.ts
- useCategories.ts
- InvoicesList.tsx
- vite-plugin-pwa
- purchases.resource.ts
- supplierProducts.resource.ts
- @mantine/form
- syncApi.ts
- tablerIcons.ts
- PendingOperationsList.tsx
- ProductTable.tsx
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
- useSearchHistory.ts
- products.resource.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- EmployeeList.tsx
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- useIsMobile
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- client.ts
- ProductCatalogTree.tsx
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
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
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

## Communities (112 total, 31 thin omitted)

### Community 0 - "SyncEngine.ts"
Cohesion: 0.14
Nodes (20): pruneByRetention(), toServerRow(), AuditLevel, logError(), logInfo(), logSyncEvent(), logWarn(), trimAuditLog() (+12 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.11
Nodes (22): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification (+14 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (30): AppUpdatePrompt(), HeldCartCatchupNotifier(), Sidebar(), SidebarProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), NotificationPopover() (+22 more)

### Community 3 - "registry.ts"
Cohesion: 0.08
Nodes (28): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, deltaCursors (+20 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.11
Nodes (23): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), CreditNoteModal(), ExchangeLine, LineState, SerialUnitState, CREDIT_NOTE_FLAG_META (+15 more)

### Community 5 - "A4InvoicePreviewModal.tsx"
Cohesion: 0.16
Nodes (17): A4InvoicePreviewModal(), StandalonePrintView(), usePrint(), recordPrintEvent(), PdfCanvasViewer(), PdfCanvasViewerProps, PdfPageCanvasProps, activeScopes (+9 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (36): BillingCounter(), BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, PaymentPanel, useCartCheckout(), useCartCustomer() (+28 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.31
Nodes (14): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+6 more)

### Community 8 - "providers.tsx"
Cohesion: 0.09
Nodes (20): App(), AppProviders(), AppProvidersProps, router, container, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme() (+12 more)

### Community 9 - "CustomerList.tsx"
Cohesion: 0.05
Nodes (73): SupplierList, createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawer() (+65 more)

### Community 10 - "router.tsx"
Cohesion: 0.07
Nodes (31): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppShell(), BillingCounter, CustomerList, EmployeeList (+23 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "RepairFormModal.tsx"
Cohesion: 0.23
Nodes (17): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+9 more)

### Community 13 - "money.ts"
Cohesion: 0.17
Nodes (20): CURRENCY, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, RepairFormModal(), MoneyInput() (+12 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.31
Nodes (14): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams (+6 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.12
Nodes (27): RequireAdmin(), RequireAdminProps, AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser (+19 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (42): OutboxError, AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId() (+34 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.16
Nodes (22): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+14 more)

### Community 20 - "billing/types.ts"
Cohesion: 0.17
Nodes (12): A4InvoicePreviewModalProps, PaymentPanelProps, NO_INVOICES, Invoice, InvoiceItem, getPrintCountForInvoice(), PrintLogEntry, printLogStore (+4 more)

### Community 21 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.18
Nodes (17): DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, useCloseInvoice(), useVoidInvoice(), useInvoicePayments(), useRecordPayment(), getSaleHeroPresentation() (+9 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "useResponsive.tsx"
Cohesion: 0.19
Nodes (11): BillingRegions, BillingPageSkeleton(), FILL, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue, LayoutTierProvider() (+3 more)

### Community 24 - "useSyncedMutation.ts"
Cohesion: 0.24
Nodes (13): MIRROR_TABLE_NAMES, assignLedgerEntriesToOperation(), getDeviceId(), createLocalId(), LOCAL_ID_PREFIX, randomUuid(), assertOutboxHasCapacity(), countUnsettled() (+5 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (25): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+17 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "common.ts"
Cohesion: 0.12
Nodes (23): BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats (+15 more)

### Community 28 - "SettingsPage.tsx"
Cohesion: 0.26
Nodes (10): SettingsPage, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS (+2 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.06
Nodes (31): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, observeNetwork(), ConnectivityListener, AUDIT_LOG_LIMIT (+23 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+4 more)

### Community 33 - "AppShell.tsx"
Cohesion: 0.16
Nodes (14): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps, KeyboardShortcutsModal() (+6 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.18
Nodes (14): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+6 more)

### Community 35 - "queryKeys.ts"
Cohesion: 0.24
Nodes (13): queryKeys, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, defineSyncResource() (+5 more)

### Community 36 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.20
Nodes (15): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+7 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (49): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+41 more)

### Community 39 - "SyncEngine"
Cohesion: 0.15
Nodes (14): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+6 more)

### Community 40 - "inventory/types.ts"
Cohesion: 0.15
Nodes (17): FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories(), BarcodeSource, CreateProductInput (+9 more)

### Community 41 - "useInvoiceDocument.ts"
Cohesion: 0.30
Nodes (9): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, useCreditNoteDocument(), UseCreditNoteDocumentResult, useInvoiceDocument(), UseInvoiceDocumentResult (+1 more)

### Community 42 - "useCategories.ts"
Cohesion: 0.11
Nodes (24): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCreateCategory(), useCreateSubcategory() (+16 more)

### Community 43 - "InvoicesList.tsx"
Cohesion: 0.26
Nodes (11): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS, getInvoiceStatusMeta(), getOverdueMeta() (+3 more)

### Community 45 - "purchases.resource.ts"
Cohesion: 0.20
Nodes (14): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary (+6 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.26
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+4 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.22
Nodes (13): PULL_PAGE_LIMIT, ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus (+5 more)

### Community 50 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 51 - "PendingOperationsList.tsx"
Cohesion: 0.27
Nodes (8): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, discardOperation(), retryOperation(), EmptyState(), EmptyStateProps

### Community 52 - "ProductTable.tsx"
Cohesion: 0.07
Nodes (70): NO_CREDIT_NOTES, useCreditNotes(), useInvoiceCreditNotes(), useVoidCreditNote(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable() (+62 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.40
Nodes (7): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), categoriesResource

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.18
Nodes (18): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+10 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.09
Nodes (34): resolveOrCreateCustomer(), StockMovement, ConnectivitySnapshot, ConnectivityState, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, db (+26 more)

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
Cohesion: 0.32
Nodes (9): PAYMENT_METHODS, PaymentMethod, BillingRegionsProps, FILL, BillingPane, CatalogMode, PaymentPanelHandle, SegmentedToggle() (+1 more)

### Community 66 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 67 - "products.resource.ts"
Cohesion: 0.12
Nodes (17): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+9 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "EmployeeList.tsx"
Cohesion: 0.15
Nodes (21): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees() (+13 more)

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

### Community 79 - "useIsMobile"
Cohesion: 0.14
Nodes (20): CartLineItem, CartLineItemProps, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps (+12 more)

### Community 83 - "client.ts"
Cohesion: 0.17
Nodes (10): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, Listener, listeners (+2 more)

### Community 84 - "ProductCatalogTree.tsx"
Cohesion: 0.24
Nodes (13): buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+5 more)

## Knowledge Gaps
- **366 isolated node(s):** `BackendCreditNoteExchangeItem`, `CreditNoteListResponseData`, `FetchCreditNotesParams`, `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput` (+361 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `SyncEngine.ts`, `providers.tsx`, `authSlice.ts`, `flush.ts`, `schema.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `BillingCounter.tsx`, `AppShell.tsx`, `notificationSlice.ts`, `CreditNoteModal.tsx`, `A4InvoicePreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `SyncProvider.tsx`, `CustomerList.tsx`, `router.tsx`, `InvoicesList.tsx`, `authSlice.ts`, `ProductTable.tsx`, `InvoiceDetailDrawer.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `useAppSelector`, `CreditNoteModal.tsx`, `A4InvoicePreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `RepairFormModal.tsx`, `money.ts`, `InvoiceDetailDrawer.tsx`, `useResponsive.tsx`, `LoginForm.tsx`, `AppShell.tsx`, `syncSlice.ts`, `inventory/types.ts`, `useCategories.ts`, `ProductTable.tsx`, `CatalogPanel.tsx`, `BillingCounter.tsx`, `products.resource.ts`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `BackendCreditNoteExchangeItem`, `CreditNoteListResponseData`, `FetchCreditNotesParams` to the rest of the system?**
  _366 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SyncEngine.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14193548387096774 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11174242424242424 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.13067552602436322 - nodes in this community are weakly interconnected._