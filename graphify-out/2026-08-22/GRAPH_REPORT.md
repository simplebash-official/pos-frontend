# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 333 files · ~174,609 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1797 nodes · 5562 edges · 121 communities (90 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a210983`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- db
- notificationSlice.ts
- SettingsPage.tsx
- registry.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- printJobs.resource.ts
- useSyncData.ts
- CustomerList.tsx
- router.tsx
- dependencies
- inventory/types.ts
- RepairFormModal.tsx
- repairs.resource.ts
- authSlice.ts
- devDependencies
- flush.ts
- creditNotesApi.ts
- tablerIconShards/index.ts
- roles.ts
- search.ts
- compilerOptions
- BillingCounter.tsx
- outbox.ts
- invoicesApi.ts
- searchFields.ts
- queryKeys.ts
- ProductTable.tsx
- client.ts
- Backend Sync Requirements Doc
- mockEmployees.ts
- RequireAuth.tsx
- useResponsive.tsx
- PrintJobList.tsx
- LoginForm.tsx
- useAppSelector
- RepairJobList.tsx
- syncSlice.ts
- SyncEngine.ts
- SupplierList.tsx
- settingsSlice.ts
- useSyncedMutation
- InvoiceDetailDrawer.tsx
- vite-plugin-pwa
- resources/index.ts
- supplierProducts.resource.ts
- SyncStatusBadge.tsx
- syncApi.ts
- @mantine/form
- tablerIcons.ts
- formatDateTime
- useIsMobile
- EmployeeList.tsx
- categories.resource.ts
- CatalogPanel.tsx
- SyncPanel.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- formatMoney
- useSearchHistory.ts
- products.resource.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- PrintJobFormModal.tsx
- invoiceStatus.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- customers.resource.ts
- Right-Side Detail Drawer Visual Family
- InvoicesList.tsx
- AmountInput.tsx
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- ApiClient
- inventory/index.ts
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
- SyncModuleCard.tsx
- app/App.tsx

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
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
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

## Communities (121 total, 31 thin omitted)

### Community 0 - "db"
Cohesion: 0.16
Nodes (20): toServerRow(), db, blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch (+12 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.08
Nodes (31): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopoverProps, AppNotification (+23 more)

### Community 2 - "SettingsPage.tsx"
Cohesion: 0.11
Nodes (29): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+21 more)

### Community 3 - "registry.ts"
Cohesion: 0.10
Nodes (21): discardOperation(), reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource (+13 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.20
Nodes (15): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), CreditNoteModal(), CreditNoteModalProps, ExchangeLine, LineState, SerialUnitState (+7 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.09
Nodes (37): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, DocumentPreviewSubject, SaleDocumentPreviewModal() (+29 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (30): BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps, TABS, useCartCheckout(), useCartItems(), useCartTotals(), cartSlice (+22 more)

### Community 7 - "printJobs.resource.ts"
Cohesion: 0.29
Nodes (15): addEarningRecord(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams (+7 more)

### Community 8 - "useSyncData.ts"
Cohesion: 0.26
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys(), useOpenConflicts() (+2 more)

### Community 9 - "CustomerList.tsx"
Cohesion: 0.16
Nodes (23): fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+15 more)

### Community 10 - "router.tsx"
Cohesion: 0.09
Nodes (20): BillingCounter, CustomerList, EmailLoginScreen, ProductTable, RepairJobList, StandalonePrintView, SupplierList, NAV_CATEGORIES (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "inventory/types.ts"
Cohesion: 0.12
Nodes (25): ProductsPageData, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow (+17 more)

### Community 13 - "RepairFormModal.tsx"
Cohesion: 0.16
Nodes (24): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, ProductFormContent(), RepairFormModal(), RepairFormModalProps (+16 more)

### Community 14 - "repairs.resource.ts"
Cohesion: 0.33
Nodes (13): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams, RepairListResponseData (+5 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.19
Nodes (17): getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse, cacheSession(), clearCachedSession() (+9 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.11
Nodes (36): ConflictReason, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), resolveMapping(), resolveValue() (+28 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.16
Nodes (21): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+13 more)

### Community 20 - "roles.ts"
Cohesion: 0.26
Nodes (9): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, UserSession, RoleGuard(), RoleGuardProps (+1 more)

### Community 21 - "search.ts"
Cohesion: 0.18
Nodes (19): UseBackendFilteredListResult, EntitySearchResult, buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier(), normalizeDigits() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "BillingCounter.tsx"
Cohesion: 0.21
Nodes (17): PAYMENT_METHODS, PaymentMethod, BillingRegionsProps, FILL, BillingPane, CatalogMode, PaymentPanel, PaymentPanelHandle (+9 more)

### Community 24 - "outbox.ts"
Cohesion: 0.17
Nodes (19): MIRROR_TABLE_NAMES, OutboxError, assignLedgerEntriesToOperation(), getDeviceId(), mintLocalId(), createIdempotencyKey(), createLocalId(), LOCAL_ID_PREFIX (+11 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+16 more)

### Community 26 - "searchFields.ts"
Cohesion: 0.15
Nodes (20): CustomerPickerModal(), CustomerPickerModalProps, useCreateCustomer(), SupplierPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight() (+12 more)

### Community 27 - "queryKeys.ts"
Cohesion: 0.14
Nodes (22): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats() (+14 more)

### Community 28 - "ProductTable.tsx"
Cohesion: 0.15
Nodes (24): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct() (+16 more)

### Community 29 - "client.ts"
Cohesion: 0.05
Nodes (41): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+33 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "mockEmployees.ts"
Cohesion: 0.09
Nodes (17): EmployeeList, ReportsDashboard, createEmployee(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees() (+9 more)

### Community 32 - "RequireAuth.tsx"
Cohesion: 0.27
Nodes (9): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, PageLoader(), PageLoaderProps, selectIsAuthenticated(), selectIsAuthInitialized() (+1 more)

### Community 33 - "useResponsive.tsx"
Cohesion: 0.13
Nodes (18): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, BillingRegions, KeyboardShortcutsModal() (+10 more)

### Community 34 - "PrintJobList.tsx"
Cohesion: 0.19
Nodes (15): PrintJobList, JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList() (+7 more)

### Community 35 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 36 - "useAppSelector"
Cohesion: 0.12
Nodes (26): AppUpdatePrompt(), HeldCartCatchupNotifier(), Header(), HeaderProps, Sidebar(), SidebarProps, AppProvidersProps, AuthInitializer() (+18 more)

### Community 37 - "RepairJobList.tsx"
Cohesion: 0.21
Nodes (14): applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs() (+6 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.14
Nodes (11): SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectModuleView(), selectModuleViews, selectResourceHasNeverSynced(), selectResourceIsSyncing() (+3 more)

### Community 39 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (16): pruneByRetention(), getAllSyncMeta(), AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), LeaderElection (+8 more)

### Community 40 - "SupplierList.tsx"
Cohesion: 0.13
Nodes (27): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), FormContentProps, SupplierFormModal() (+19 more)

### Community 41 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "useSyncedMutation"
Cohesion: 0.25
Nodes (15): useVoidCreditNote(), AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, NO_CATEGORIES, useCategories(), useCategoryIcons() (+7 more)

### Community 43 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.20
Nodes (13): InvoicesList, useInvoiceCreditNotes(), NO_INVOICES, useCloseInvoice(), useVoidInvoice(), useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer() (+5 more)

### Community 45 - "resources/index.ts"
Cohesion: 0.15
Nodes (23): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, createPurchase() (+15 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.29
Nodes (11): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+3 more)

### Community 47 - "SyncStatusBadge.tsx"
Cohesion: 0.19
Nodes (12): SyncStatusBadge(), SyncStatusBadgeProps, ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip() (+4 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.13
Nodes (15): AbandonedReferenceError, CursorInvalidError, OutboxFullError, ApiEnvelope, fetchNewestCursors(), fetchResourceSnapshotPage(), fetchSyncChanges(), readChanges() (+7 more)

### Community 50 - "tablerIcons.ts"
Cohesion: 0.20
Nodes (17): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+9 more)

### Community 51 - "formatDateTime"
Cohesion: 0.17
Nodes (12): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncSettingsSection(), OutboxStatus (+4 more)

### Community 52 - "useIsMobile"
Cohesion: 0.15
Nodes (24): ProductPickerModal(), ProductPickerModalProps, buildCategoryLookup(), useCategoryLookup(), useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, enrich() (+16 more)

### Community 53 - "EmployeeList.tsx"
Cohesion: 0.16
Nodes (15): deleteEmployee(), deleteEmployees(), updateEmployee(), EmployeeList(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable() (+7 more)

### Community 54 - "categories.resource.ts"
Cohesion: 0.22
Nodes (13): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, defineOperation() (+5 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.25
Nodes (13): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+5 more)

### Community 56 - "SyncPanel.tsx"
Cohesion: 0.29
Nodes (11): formatBytes(), SyncPanel(), clearLocalData(), ClearLocalDataOptions, estimateStorage(), exportDiagnostics(), forceFullResync(), rowAgeTimestamp() (+3 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.10
Nodes (32): NO_CREDIT_NOTES, useCreditNotes(), ConnectivitySnapshot, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorTableName, OfflineDb (+24 more)

### Community 60 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

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
Cohesion: 0.21
Nodes (12): CURRENCY, CartLineItem, CartLineItemProps, CartPanel, CartPanelProps, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer() (+4 more)

### Community 66 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 67 - "products.resource.ts"
Cohesion: 0.12
Nodes (17): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, updateProduct(), SerialNumberPickerModal() (+9 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "PrintJobFormModal.tsx"
Cohesion: 0.36
Nodes (10): JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, UpdatePrintJobPayload, PrintJobFormValues (+2 more)

### Community 72 - "invoiceStatus.ts"
Cohesion: 0.17
Nodes (9): CREDIT_NOTE_FLAG_META, CREDIT_NOTE_STATUS_META, InvoiceStatusMeta, ITEM_CONDITION_META, ITEM_CONDITION_OPTIONS, ITEM_DISPOSITION_META, ITEM_DISPOSITION_OPTIONS, RETURN_REASON_OPTIONS (+1 more)

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
Nodes (12): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse, CustomerTagsResponse (+4 more)

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "InvoicesList.tsx"
Cohesion: 0.29
Nodes (10): useAllInvoices(), applyLocalInvoiceFilters(), InvoiceFilters, InvoicesList(), isInvoiceFilterActive(), STATUS_FILTER_OPTIONS, getInvoiceStatusMeta(), getOverdueMeta() (+2 more)

### Community 79 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 83 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 84 - "inventory/index.ts"
Cohesion: 0.44
Nodes (6): CatalogCategoryFilter, CategoryIconInfo, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon(), TablerIcon

### Community 119 - "SyncModuleCard.tsx"
Cohesion: 0.31
Nodes (7): SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, ModuleSyncView, ExpandableCard(), OverallSyncStatus

### Community 120 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

## Knowledge Gaps
- **365 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+360 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `inventory/types.ts`, `RepairFormModal.tsx`, `BillingCounter.tsx`, `searchFields.ts`, `ProductTable.tsx`, `mockEmployees.ts`, `useResponsive.tsx`, `LoginForm.tsx`, `useAppSelector`, `SupplierList.tsx`, `useSyncedMutation`, `InvoiceDetailDrawer.tsx`, `SyncStatusBadge.tsx`, `formatDateTime`, `formatMoney`, `products.resource.ts`, `PrintJobFormModal.tsx`, `AmountInput.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `RequireAuth.tsx`, `useResponsive.tsx`, `notificationSlice.ts`, `SettingsPage.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoiceDetailDrawer.tsx`, `SyncProvider.tsx`, `SyncStatusBadge.tsx`, `InvoicesList.tsx`, `roles.ts`, `search.ts`, `BillingCounter.tsx`, `SyncPanel.tsx`, `ProductTable.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `queryKeys` connect `queryKeys.ts` to `printJobs.resource.ts`, `CustomerList.tsx`, `RepairFormModal.tsx`, `repairs.resource.ts`, `creditNotesApi.ts`, `invoicesApi.ts`, `searchFields.ts`, `ProductTable.tsx`, `mockEmployees.ts`, `PrintJobList.tsx`, `RepairJobList.tsx`, `SupplierList.tsx`, `resources/index.ts`, `supplierProducts.resource.ts`, `EmployeeList.tsx`, `categories.resource.ts`, `CatalogPanel.tsx`, `products.resource.ts`, `PrintJobFormModal.tsx`, `customers.resource.ts`, `InvoicesList.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _365 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07729468599033816 - nodes in this community are weakly interconnected._
- **Should `SettingsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1141025641025641 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10114942528735632 - nodes in this community are weakly interconnected._