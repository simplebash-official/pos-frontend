# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~178,699 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1822 nodes · 5635 edges · 113 communities (83 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `244c3653`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BillingCounter.tsx
- notificationSlice.ts
- useAppSelector
- registry.ts
- InvoiceDetailDrawer.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- EmployeeDetailDrawer.tsx
- PrintJobList.tsx
- router.tsx
- dependencies
- useIsMobile
- SyncEngine
- searchFields.ts
- useSearchHistory.ts
- devDependencies
- flush.ts
- creditNotesApi.ts
- ProductTable.tsx
- useAppDispatch
- compilerOptions
- authSlice.ts
- products.resource.ts
- invoicesApi.ts
- settingsSlice.ts
- client.ts
- productsApi.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- SyncEngine.ts
- auth/index.ts
- money.ts
- PrintJobFormModal.tsx
- inventory/types.ts
- repairs.resource.ts
- SupplierDetailDrawer.tsx
- syncSlice.ts
- @mantine/form
- AmountInput.tsx
- queryKeys.ts
- useSyncData.ts
- suppliers.resource.ts
- vite-plugin-pwa
- tablerIcons.ts
- supplierProducts.resource.ts
- SyncProvider.tsx
- syncApi.ts
- SupplierList.tsx
- RepairJobList.tsx
- printJobs.resource.ts
- offline/index.ts
- db
- categories.resource.ts
- CatalogPanel.tsx
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- useShortcuts.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- useResponsive.tsx
- search.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- posCalculations.ts
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
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
3. `formatMoney()` - 64 edges
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
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)
- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (113 total, 30 thin omitted)

### Community 0 - "BillingCounter.tsx"
Cohesion: 0.15
Nodes (23): PAYMENT_METHODS, PaymentMethod, CompleteSaleInput, A4InvoicePreviewModalProps, BillingRegions, BillingRegionsProps, FILL, BillingPane (+15 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.08
Nodes (32): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+24 more)

### Community 2 - "useAppSelector"
Cohesion: 0.12
Nodes (29): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+21 more)

### Community 3 - "registry.ts"
Cohesion: 0.09
Nodes (25): reclaimInflightOperations(), defineOperation(), getReferringResources(), getResourceRanks(), getResourcesInDependencyOrder(), registerSyncResource(), resetRegistry(), resources (+17 more)

### Community 4 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.07
Nodes (47): USER_ROLE_LABELS, USER_ROLES, BackendCreditNoteItem, CreateCreditNoteItemInput, NO_CREDIT_NOTES, useCreateCreditNote(), useInvoiceCreditNotes(), useVoidCreditNote() (+39 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.13
Nodes (28): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+20 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.12
Nodes (28): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, CartItem, cartSlice, DiscountType, initialState (+20 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.13
Nodes (28): fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+20 more)

### Community 8 - "EmployeeDetailDrawer.tsx"
Cohesion: 0.24
Nodes (7): EmployeeDetailDrawerProps, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, DetailDrawer(), DetailDrawerProps, PhoneDisplay(), PhoneDisplayProps

### Community 9 - "PrintJobList.tsx"
Cohesion: 0.26
Nodes (12): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+4 more)

### Community 10 - "router.tsx"
Cohesion: 0.08
Nodes (20): App(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "useIsMobile"
Cohesion: 0.19
Nodes (19): Header(), HeaderProps, BillingCounter(), BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, CartLineItem (+11 more)

### Community 13 - "SyncEngine"
Cohesion: 0.14
Nodes (9): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection (+1 more)

### Community 14 - "searchFields.ts"
Cohesion: 0.16
Nodes (16): SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, SearchHistoryInput, SearchHistoryInputProps (+8 more)

### Community 15 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.09
Nodes (52): MIRROR_TABLE_NAMES, OutboxError, assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), abandonMapping(), DROP_ELEMENT (+44 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.16
Nodes (22): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+14 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.17
Nodes (19): useCreditNotes(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+11 more)

### Community 21 - "useAppDispatch"
Cohesion: 0.09
Nodes (30): AppUpdatePrompt(), HeldCartCatchupNotifier(), RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, AppProvidersProps, AuthInitializer() (+22 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.10
Nodes (31): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, UserRole, getMeApi(), AuthUser, LoginPayload (+23 more)

### Community 24 - "products.resource.ts"
Cohesion: 0.15
Nodes (23): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), adjustStock(), createProduct(), deleteProducts() (+15 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+16 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "client.ts"
Cohesion: 0.09
Nodes (24): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), MutationRequestOptions, readServerTime(), RequestOptions, BillingStats (+16 more)

### Community 28 - "productsApi.ts"
Cohesion: 0.17
Nodes (8): fetchProductSerials(), ProductListParams, ProductsPageData, SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), ProductSerialStatus, PaginatedResponse

### Community 29 - "offline/constants.ts"
Cohesion: 0.07
Nodes (29): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, observeNetwork(), ConnectivityListener, ConnectivityState (+21 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "SyncEngine.ts"
Cohesion: 0.09
Nodes (34): ConnectivitySnapshot, PULL_INTERVAL_MS, toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta() (+26 more)

### Community 32 - "auth/index.ts"
Cohesion: 0.32
Nodes (7): AuthLayout(), AuthLayoutProps, EmailLoginScreen(), MobileAuthContainer(), MobileAuthView, MobileSplashScreen(), MobileSplashScreenProps

### Community 33 - "money.ts"
Cohesion: 0.14
Nodes (26): CURRENCY, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), ProductFormModal(), SupplierIntakeRow (+18 more)

### Community 34 - "PrintJobFormModal.tsx"
Cohesion: 0.31
Nodes (13): JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, RepairFormModalProps, RepairJob (+5 more)

### Community 35 - "inventory/types.ts"
Cohesion: 0.13
Nodes (21): FormContentProps, ProductFormModalProps, BarcodeSource, CreateProductInput, Product, ProductInput, ProductListResponse, ProductSupplierIntake (+13 more)

### Community 36 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 37 - "SupplierDetailDrawer.tsx"
Cohesion: 0.18
Nodes (18): useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesBySupplier(), EnrichedStockPurchase (+10 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (52): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection() (+44 more)

### Community 40 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 41 - "queryKeys.ts"
Cohesion: 0.23
Nodes (15): queryKeys, fetchBillingStats(), useBillingStats(), fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), useInventoryStats(), fetchPrintJobStats() (+7 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.22
Nodes (11): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+3 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.18
Nodes (16): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), FormContentProps, SupplierFormModal() (+8 more)

### Community 45 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.27
Nodes (11): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+3 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.19
Nodes (17): PULL_PAGE_LIMIT, defineSyncResource(), productSerialsResource, stockMovementsResource, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshot() (+9 more)

### Community 49 - "SupplierList.tsx"
Cohesion: 0.25
Nodes (15): SupplierList, useSetSupplierLinks(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), SupplierPickerModal(), NO_SUPPLIERS (+7 more)

### Community 50 - "RepairJobList.tsx"
Cohesion: 0.21
Nodes (14): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS (+6 more)

### Community 51 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 52 - "offline/index.ts"
Cohesion: 0.16
Nodes (13): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+5 more)

### Community 53 - "db"
Cohesion: 0.36
Nodes (9): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, db, paymentsResource (+1 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.28
Nodes (11): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+3 more)

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.08
Nodes (27): ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings() (+19 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.15
Nodes (22): StockMovement, PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictReason, ConflictRecord (+14 more)

### Community 60 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

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

### Community 65 - "useResponsive.tsx"
Cohesion: 0.14
Nodes (17): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+9 more)

### Community 66 - "search.ts"
Cohesion: 0.18
Nodes (20): UseBackendFilteredListResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchSequenceTier(), matchTier() (+12 more)

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

### Community 79 - "posCalculations.ts"
Cohesion: 0.12
Nodes (22): DiscountPopover(), DiscountPopoverProps, PaymentPanel, calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculatePaymentState(), calculateQuickTenderSuggestions() (+14 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.13
Nodes (29): buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, getCategoryIconInfo(), AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps (+21 more)

## Knowledge Gaps
- **378 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+373 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `BillingCounter.tsx`, `useResponsive.tsx`, `notificationSlice.ts`, `search.ts`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `useIsMobile`, `posCalculations.ts`, `SyncProvider.tsx`, `ProductTable.tsx`, `useAppDispatch`, `authSlice.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `BillingCounter.tsx`, `notificationSlice.ts`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `EmployeeDetailDrawer.tsx`, `searchFields.ts`, `ProductTable.tsx`, `useAppDispatch`, `productsApi.ts`, `auth/index.ts`, `money.ts`, `PrintJobFormModal.tsx`, `SupplierDetailDrawer.tsx`, `syncSlice.ts`, `AmountInput.tsx`, `suppliers.resource.ts`, `SupplierList.tsx`, `useResponsive.tsx`, `posCalculations.ts`, `useCategories.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `useIsMobile` to `BillingCounter.tsx`, `money.ts`, `PrintJobFormModal.tsx`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `SupplierDetailDrawer.tsx`, `CustomerList.tsx`, `EmployeeDetailDrawer.tsx`, `PrintJobList.tsx`, `suppliers.resource.ts`, `searchFields.ts`, `posCalculations.ts`, `RepairJobList.tsx`, `useCategories.ts`, `ProductTable.tsx`, `CatalogPanel.tsx`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _378 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BillingCounter.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14516129032258066 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07678075855689177 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12435897435897436 - nodes in this community are weakly interconnected._