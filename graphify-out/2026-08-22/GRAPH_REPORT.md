# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~176,124 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1799 nodes · 5576 edges · 114 communities (81 shown, 33 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd0761b9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- db
- notificationSlice.ts
- useAppSelector
- registry.ts
- InvoiceDetailDrawer.tsx
- useIsMobile
- cartSlice.ts
- printJobs.resource.ts
- themeSlice.ts
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
- tablerIconShards/index.ts
- SupplierList.tsx
- SupplierDetailDrawer.tsx
- compilerOptions
- SyncEngine.ts
- useSyncedMutation.ts
- invoicesApi.ts
- settingsSlice.ts
- common.ts
- providers.tsx
- offline/constants.ts
- Backend Sync Requirements Doc
- LocalStorageStore
- LoginForm.tsx
- useResponsive.tsx
- PrintJobList.tsx
- payments.resource.ts
- SyncProvider.tsx
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine
- inventory/types.ts
- HeldCartCatchupNotifier.tsx
- useSyncData.ts
- suppliers.resource.ts
- vite-plugin-pwa
- purchasesApi.ts
- supplierProducts.resource.ts
- @mantine/form
- syncApi.ts
- idMap.ts
- tablerIcons.ts
- app/App.tsx
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
- formatMoney
- CustomerList.tsx
- productsApi.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- EmployeeList.tsx
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- AmountInput.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- client.ts
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
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
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

## Communities (114 total, 33 thin omitted)

### Community 0 - "db"
Cohesion: 0.10
Nodes (28): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, toServerRow(), db, blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta() (+20 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.15
Nodes (18): NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, formatRelativeTime() (+10 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (32): Sidebar(), SidebarProps, NotificationPopover(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection() (+24 more)

### Community 3 - "registry.ts"
Cohesion: 0.09
Nodes (23): reclaimInflightOperations(), defineOperation(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource (+15 more)

### Community 4 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.05
Nodes (63): USER_ROLE_LABELS, USER_ROLES, BackendCreditNote, BackendCreditNoteExchangeItem, BackendCreditNoteItem, CreateCreditNoteExchangeItemInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput (+55 more)

### Community 5 - "useIsMobile"
Cohesion: 0.13
Nodes (29): StandalonePrintView, CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal() (+21 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (30): AppUpdatePrompt(), PaymentMethod, useCartCheckout(), useCartTotals(), SplitPaymentDetail, cartSlice, CartState, DiscountType (+22 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.33
Nodes (13): addEarningRecord(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+5 more)

### Community 8 - "themeSlice.ts"
Cohesion: 0.21
Nodes (9): createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), store, ColorScheme, initialState, themeSlice (+1 more)

### Community 9 - "searchFields.ts"
Cohesion: 0.10
Nodes (35): SupplierList, SupplierFormContent(), SupplierPickerModal(), SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight() (+27 more)

### Community 10 - "router.tsx"
Cohesion: 0.10
Nodes (20): RequireAdmin(), RequireAdminProps, BillingCounter, CustomerList, EmailLoginScreen, InvoicesList, ProductTable, NAV_CATEGORIES (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "RepairFormModal.tsx"
Cohesion: 0.17
Nodes (22): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps (+14 more)

### Community 13 - "money.ts"
Cohesion: 0.21
Nodes (18): CURRENCY, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), RepairFormModal(), MoneyInput() (+10 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.15
Nodes (19): UserRole, STORAGE_KEYS, AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, UserSession (+11 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.14
Nodes (35): OutboxError, abandonMapping(), loadIdMap(), resolveMapping(), createIdempotencyKey(), isLocalId(), ApiErrorLike, classifyFailure() (+27 more)

### Community 18 - "products.resource.ts"
Cohesion: 0.13
Nodes (28): createCreditNote(), CreateCreditNoteInput, fetchCreditNotes(), createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer() (+20 more)

### Community 20 - "SupplierList.tsx"
Cohesion: 0.18
Nodes (20): useVoidCreditNote(), useSetSupplierLinks(), applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), NO_SUPPLIERS, useAllSuppliers() (+12 more)

### Community 21 - "SupplierDetailDrawer.tsx"
Cohesion: 0.16
Nodes (19): EnrichedLinkedProduct, EnrichedLinkedSupplier, NO_LINKED_PRODUCTS, NO_LINKED_SUPPLIERS, useLinkProduct(), useProductsForSupplier(), useSuppliersForProduct(), useUnlinkProduct() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "SyncEngine.ts"
Cohesion: 0.14
Nodes (19): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES (+11 more)

### Community 24 - "useSyncedMutation.ts"
Cohesion: 0.27
Nodes (11): assignLedgerEntriesToOperation(), getDeviceId(), mintLocalId(), createLocalId(), LOCAL_ID_PREFIX, randomUuid(), assertOutboxHasCapacity(), EnqueueInput (+3 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+16 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 27 - "common.ts"
Cohesion: 0.14
Nodes (19): BillingStats, fetchBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats, useInventoryStats() (+11 more)

### Community 28 - "providers.tsx"
Cohesion: 0.13
Nodes (15): AppProvidersProps, AuthInitializer(), getMeApi(), LowStockNotifier(), notifiedProductIds, useLowStockProducts(), initializeAuth, isNetworkError() (+7 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.07
Nodes (31): env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation (+23 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 33 - "useResponsive.tsx"
Cohesion: 0.10
Nodes (26): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), HeaderProps (+18 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.21
Nodes (14): PrintJobList, fetchPrintJobStats(), applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs() (+6 more)

### Community 35 - "payments.resource.ts"
Cohesion: 0.40
Nodes (8): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, paymentsResource, RecordPaymentPayload

### Community 36 - "SyncProvider.tsx"
Cohesion: 0.47
Nodes (9): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider() (+1 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.23
Nodes (13): RepairJobList, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob() (+5 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (49): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+41 more)

### Community 40 - "inventory/types.ts"
Cohesion: 0.18
Nodes (16): FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, BarcodeSource, CreateProductInput, Product, ProductInput (+8 more)

### Community 41 - "HeldCartCatchupNotifier.tsx"
Cohesion: 0.16
Nodes (13): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN (+5 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.22
Nodes (11): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+3 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.28
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), DeleteSupplierPayload, DeleteSuppliersPayload (+1 more)

### Community 45 - "purchasesApi.ts"
Cohesion: 0.24
Nodes (10): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+2 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.24
Nodes (13): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProduct (+5 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.18
Nodes (20): queryKeys, createPurchase(), defineSyncResource(), productSerialsResource, purchasesResource, stockMovementsResource, ApiEnvelope, fetchNewestCursors() (+12 more)

### Community 49 - "idMap.ts"
Cohesion: 0.21
Nodes (9): AbandonedReferenceError, UnresolvedReferenceError, DROP_ELEMENT, isRecord(), resolveValue(), rewriteNode(), RewriteOutcome, rewriteReferences() (+1 more)

### Community 50 - "tablerIcons.ts"
Cohesion: 0.20
Nodes (17): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+9 more)

### Community 51 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 52 - "ProductTable.tsx"
Cohesion: 0.18
Nodes (21): useCreditNotes(), applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+13 more)

### Community 53 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 54 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.21
Nodes (15): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+7 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.09
Nodes (34): StockMovement, ConnectivitySnapshot, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorTableName, OfflineDb, AuditEvent (+26 more)

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

### Community 65 - "formatMoney"
Cohesion: 0.10
Nodes (37): PAYMENT_METHODS, CompleteSaleInput, A4InvoicePreviewModalProps, BillingCounter(), BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+29 more)

### Community 66 - "CustomerList.tsx"
Cohesion: 0.08
Nodes (43): fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+35 more)

### Community 67 - "productsApi.ts"
Cohesion: 0.17
Nodes (8): fetchProductSerials(), ProductListParams, ProductsPageData, SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), StockAdjustmentResult, ProductSerialStatus

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
Cohesion: 0.11
Nodes (26): EmployeeList, ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+18 more)

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

### Community 79 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 83 - "client.ts"
Cohesion: 0.15
Nodes (12): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+4 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.14
Nodes (26): CatalogCategoryFilter, CategoryIconInfo, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductCatalogTreeProps (+18 more)

## Knowledge Gaps
- **365 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+360 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `formatMoney`, `useResponsive.tsx`, `notificationSlice.ts`, `InvoiceDetailDrawer.tsx`, `useIsMobile`, `cartSlice.ts`, `syncSlice.ts`, `SyncProvider.tsx`, `HeldCartCatchupNotifier.tsx`, `router.tsx`, `searchFields.ts`, `authSlice.ts`, `ProductTable.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `useResponsive.tsx`, `useAppSelector`, `CustomerList.tsx`, `formatMoney`, `productsApi.ts`, `InvoiceDetailDrawer.tsx`, `EmployeeList.tsx`, `inventory/types.ts`, `notificationSlice.ts`, `searchFields.ts`, `syncSlice.ts`, `RepairFormModal.tsx`, `money.ts`, `AmountInput.tsx`, `useCategories.ts`, `ProductTable.tsx`, `SupplierDetailDrawer.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `useResponsive.tsx`, `CustomerList.tsx`, `PrintJobList.tsx`, `InvoiceDetailDrawer.tsx`, `useIsMobile`, `RepairJobList.tsx`, `EmployeeList.tsx`, `inventory/types.ts`, `searchFields.ts`, `RepairFormModal.tsx`, `money.ts`, `useCategories.ts`, `ProductTable.tsx`, `SupplierDetailDrawer.tsx`, `CatalogPanel.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _365 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `db` be split into smaller, more focused modules?**
  _Cohesion score 0.09988385598141696 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1452991452991453 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12828282828282828 - nodes in this community are weakly interconnected._