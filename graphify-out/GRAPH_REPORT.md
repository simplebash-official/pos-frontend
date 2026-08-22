# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~175,522 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1798 nodes · 5571 edges · 114 communities (83 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a210983`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- db
- providers.tsx
- SettingsPage.tsx
- registry.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- SupplierList.tsx
- CustomerList.tsx
- router.tsx
- dependencies
- idMap.ts
- formatMoney
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- creditNotesApi.ts
- tablerIconShards/index.ts
- billing/types.ts
- search.ts
- compilerOptions
- useIsMobile
- useSyncedMutation.ts
- invoicesApi.ts
- searchFields.ts
- queryKeys.ts
- schema.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- LocalStorageStore
- useAppDispatch
- AppShell.tsx
- PrintJobList.tsx
- payments.resource.ts
- ReportsDashboard.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine.ts
- suppliers.resource.ts
- useProductSerials.ts
- useCategories.ts
- InvoiceDetailDrawer.tsx
- vite-plugin-pwa
- toLocalRow
- supplierProducts.resource.ts
- @mantine/hooks
- syncApi.ts
- tablerIcons.ts
- PendingOperationsList.tsx
- ProductTable.tsx
- EmployeeList.tsx
- categories.resource.ts
- CatalogPanel.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- tables.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- SegmentedToggle.tsx
- useSearchHistory.ts
- useProducts.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- mockEmployees.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- customers.resource.ts
- Right-Side Detail Drawer Visual Family
- AmountInput.tsx
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
10. `Invoice` - 29 edges

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
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
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

## Communities (114 total, 31 thin omitted)

### Community 0 - "db"
Cohesion: 0.15
Nodes (20): toServerRow(), db, blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+12 more)

### Community 1 - "providers.tsx"
Cohesion: 0.07
Nodes (36): AppUpdatePrompt(), AppProvidersProps, STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification, NotificationActor (+28 more)

### Community 2 - "SettingsPage.tsx"
Cohesion: 0.07
Nodes (46): SettingsPage, ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+38 more)

### Community 3 - "registry.ts"
Cohesion: 0.11
Nodes (20): reclaimInflightOperations(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, RFC-3339, AnySyncResource (+12 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.12
Nodes (22): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), CreditNoteModal(), ExchangeLine, LineState, SerialUnitState, CREDIT_NOTE_FLAG_META (+14 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.13
Nodes (27): StandalonePrintView, CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal() (+19 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (34): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), getSaleHeroPresentation(), SaleHeroPresentation, LineSourceType, SplitPaymentDetail (+26 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.35
Nodes (12): BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData, toPrintJob() (+4 more)

### Community 8 - "SupplierList.tsx"
Cohesion: 0.33
Nodes (13): useSetSupplierLinks(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier() (+5 more)

### Community 9 - "CustomerList.tsx"
Cohesion: 0.14
Nodes (26): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters(), CustomerFilters (+18 more)

### Community 10 - "router.tsx"
Cohesion: 0.06
Nodes (28): App(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList (+20 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "idMap.ts"
Cohesion: 0.18
Nodes (10): AbandonedReferenceError, OutboxFullError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), resolveValue(), rewriteNode(), RewriteOutcome (+2 more)

### Community 13 - "formatMoney"
Cohesion: 0.23
Nodes (16): CURRENCY, ProductFormContent(), RepairFormModal(), STATUSES_REQUIRING_PRICE, MoneyInput(), MoneyInputProps, formatMoney(), fromCents() (+8 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.27
Nodes (16): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs() (+8 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.12
Nodes (28): RequireAdmin(), RequireAdminProps, AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser (+20 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.14
Nodes (32): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), createIdempotencyKey(), isLocalId(), ApiErrorLike, classifyFailure() (+24 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.14
Nodes (23): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+15 more)

### Community 20 - "billing/types.ts"
Cohesion: 0.18
Nodes (11): CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, Invoice, InvoiceItem, PrintLogEntry, CreditNoteModalProps, InvoiceDetailDrawerProps (+3 more)

### Community 21 - "search.ts"
Cohesion: 0.18
Nodes (19): UseBackendFilteredListResult, EntitySearchResult, buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier(), normalizeDigits() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "useIsMobile"
Cohesion: 0.12
Nodes (38): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+30 more)

### Community 24 - "useSyncedMutation.ts"
Cohesion: 0.22
Nodes (13): assignLedgerEntriesToOperation(), getDeviceId(), mintLocalId(), createLocalId(), LOCAL_ID_PREFIX, randomUuid(), assertOutboxHasCapacity(), EnqueueInput (+5 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.15
Nodes (23): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+15 more)

### Community 26 - "searchFields.ts"
Cohesion: 0.15
Nodes (19): SupplierList, CustomerPickerModalProps, SupplierPickerModal(), SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight() (+11 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.15
Nodes (18): queryKeys, BillingStats, CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats, useInventoryStats() (+10 more)

### Community 28 - "schema.ts"
Cohesion: 0.16
Nodes (17): StockMovement, EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, SupplierProduct, MirrorTableName, OfflineDb (+9 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.05
Nodes (44): env, clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate() (+36 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "LocalStorageStore"
Cohesion: 0.20
Nodes (3): createEmployee(), normalizeEmployee(), LocalStorageStore

### Community 32 - "useAppDispatch"
Cohesion: 0.12
Nodes (27): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, Sidebar(), SidebarProps, NAV_CATEGORIES (+19 more)

### Community 33 - "AppShell.tsx"
Cohesion: 0.12
Nodes (19): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+11 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.17
Nodes (21): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, fetchPrintJobStats(), PrintJobFormModalProps, applyLocalPrintJobFilters(), isPrintJobFilterActive() (+13 more)

### Community 35 - "payments.resource.ts"
Cohesion: 0.40
Nodes (8): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, paymentsResource, RecordPaymentPayload

### Community 36 - "ReportsDashboard.tsx"
Cohesion: 0.43
Nodes (5): fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), PageHeader(), PageHeaderProps

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.19
Nodes (19): SplitType, fetchRepairStats(), RepairFormModalProps, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS (+11 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (49): SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncStatusBadge(), SyncStatusBadgeProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION (+41 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.09
Nodes (27): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), MIRROR_TABLE_NAMES, getAllSyncMeta(), logError() (+19 more)

### Community 40 - "suppliers.resource.ts"
Cohesion: 0.15
Nodes (19): Subcategory, createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps (+11 more)

### Community 41 - "useProductSerials.ts"
Cohesion: 0.43
Nodes (5): fetchProductSerials(), SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), ProductSerialStatus

### Community 42 - "useCategories.ts"
Cohesion: 0.15
Nodes (21): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, buildCategoryLookup(), NO_CATEGORIES (+13 more)

### Community 43 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.14
Nodes (24): fetchBillingStats(), useBillingStats(), useInvoiceCreditNotes(), NO_INVOICES, useAllInvoices(), useCloseInvoice(), useVoidInvoice(), useInvoicePayments() (+16 more)

### Community 45 - "toLocalRow"
Cohesion: 0.20
Nodes (14): MutationRequestOptions, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary (+6 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.31
Nodes (10): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+2 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.18
Nodes (18): PULL_PAGE_LIMIT, defineSyncResource(), productSerialsResource, stockMovementsResource, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshot() (+10 more)

### Community 50 - "tablerIcons.ts"
Cohesion: 0.20
Nodes (17): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+9 more)

### Community 51 - "PendingOperationsList.tsx"
Cohesion: 0.25
Nodes (9): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxOp, OutboxStatus, discardOperation(), retryOperation(), EmptyState() (+1 more)

### Community 52 - "ProductTable.tsx"
Cohesion: 0.16
Nodes (26): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useAdjustStock(), useAllProducts(), useCreateProduct(), useDeleteProducts() (+18 more)

### Community 53 - "EmployeeList.tsx"
Cohesion: 0.14
Nodes (16): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), Column (+8 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.33
Nodes (9): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, categoriesResource (+1 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.25
Nodes (12): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+4 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "tables.ts"
Cohesion: 0.16
Nodes (16): ConnectivitySnapshot, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, AuditLevel, ConflictReason, IdMapRecord, IdMapStatus (+8 more)

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

### Community 65 - "SegmentedToggle.tsx"
Cohesion: 0.40
Nodes (4): DiscountPopover(), DiscountPopoverProps, SegmentedToggle(), SegmentedToggleProps

### Community 66 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 67 - "useProducts.ts"
Cohesion: 0.09
Nodes (34): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+26 more)

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
Cohesion: 0.17
Nodes (17): earningsStore, employeesStore, fetchEmployeeEarnings(), INITIAL_EARNINGS, INITIAL_EMPLOYEES, EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal() (+9 more)

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
Cohesion: 0.20
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 79 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 83 - "client.ts"
Cohesion: 0.23
Nodes (7): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation()

### Community 84 - "ProductCatalogTree.tsx"
Cohesion: 0.28
Nodes (11): CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon() (+3 more)

## Knowledge Gaps
- **365 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+360 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useIsMobile` to `useAppDispatch`, `providers.tsx`, `AppShell.tsx`, `SettingsPage.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoiceDetailDrawer.tsx`, `authSlice.ts`, `ProductTable.tsx`, `search.ts`, `offline/constants.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `providers.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `router.tsx`, `formatMoney`, `searchFields.ts`, `useAppDispatch`, `AppShell.tsx`, `PrintJobList.tsx`, `syncSlice.ts`, `suppliers.resource.ts`, `useProductSerials.ts`, `useCategories.ts`, `InvoiceDetailDrawer.tsx`, `ProductTable.tsx`, `useProducts.ts`, `mockEmployees.ts`, `AmountInput.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `useIsMobile`, `searchFields.ts`, `PrintJobList.tsx`, `ReportsDashboard.tsx`, `RepairJobList.tsx`, `suppliers.resource.ts`, `useCategories.ts`, `InvoiceDetailDrawer.tsx`, `ProductTable.tsx`, `EmployeeList.tsx`, `CatalogPanel.tsx`, `SegmentedToggle.tsx`, `useProducts.ts`, `mockEmployees.ts`, `ProductCatalogTree.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _365 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `providers.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06676342525399129 - nodes in this community are weakly interconnected._
- **Should `SettingsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06696428571428571 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._