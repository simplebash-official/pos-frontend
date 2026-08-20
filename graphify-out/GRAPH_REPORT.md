# Graph Report - frontend  (2026-08-20)

## Corpus Check
- 309 files · ~161,003 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1650 nodes · 4770 edges · 114 communities (83 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4dd356f2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- syncSlice.ts
- notificationSlice.ts
- useAppDispatch
- EmployeeList.tsx
- BillingCounter.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- registry.ts
- syncApi.ts
- SyncEngine.ts
- dependencies
- useResponsive.tsx
- useEntitySearch
- useSyncedMutation
- idMap.ts
- devDependencies
- flush.ts
- PrintJobFormModal.tsx
- tablerIconShards/index.ts
- router.tsx
- products.resource.ts
- compilerOptions
- AppShell.tsx
- offline/index.ts
- ConnectivityMonitor.ts
- authSlice.ts
- invoicesApi.ts
- useSupplierProducts.ts
- ConnectivityMonitor
- Backend Sync Requirements Doc
- formatMoney
- LoginForm.tsx
- resources/index.ts
- useIsMobile
- EmployeeFormModal.tsx
- healthProbe.ts
- useShortcuts.ts
- SyncEngine
- client.ts
- networkSignal.ts
- settingsSlice.ts
- useCategories.ts
- CategoryManagerModal.tsx
- PrintJobList.tsx
- common.ts
- repairs.resource.ts
- offline/constants.ts
- LocalStorageStore
- printJobs.resource.ts
- suppliers.resource.ts
- InvoicesList.tsx
- CatalogPanel.tsx
- maintenance.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- tables.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- RepairJobList.tsx
- AmountInput.tsx
- searchFields.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- app/App.tsx
- schema.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- useAppSelector
- Right-Side Detail Drawer Visual Family
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- prettier
- typescript
- typescript-eslint
- vite-plugin-pwa
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
1. `useIsMobile()` - 66 edges
2. `useAppSelector` - 54 edges
3. `formatMoney()` - 51 edges
4. `db` - 38 edges
5. `useAppDispatch` - 37 edges
6. `useSyncedMutation()` - 35 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 26 edges
9. `useEntitySearch()` - 25 edges
10. `fetchResourceDelta()` - 23 edges

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
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
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

## Communities (114 total, 31 thin omitted)

### Community 0 - "syncSlice.ts"
Cohesion: 0.05
Nodes (52): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+44 more)

### Community 1 - "notificationSlice.ts"
Cohesion: 0.06
Nodes (44): STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps (+36 more)

### Community 2 - "useAppDispatch"
Cohesion: 0.12
Nodes (30): AuthInitializer(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+22 more)

### Community 3 - "EmployeeList.tsx"
Cohesion: 0.11
Nodes (26): queryKeys, createEmployee(), deleteEarningRecordsForWork(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+18 more)

### Community 4 - "BillingCounter.tsx"
Cohesion: 0.17
Nodes (20): PAYMENT_METHODS, PaymentMethod, BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+12 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.13
Nodes (22): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModalProps, StandalonePrintView(), useInvoiceDocument() (+14 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (30): CartLineItemProps, useCartCheckout(), useCartTotals(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+22 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.10
Nodes (37): fetchInvoices(), createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawer() (+29 more)

### Community 8 - "registry.ts"
Cohesion: 0.10
Nodes (22): reclaimInflightOperations(), getReferringResources(), registerSyncResource(), resetRegistry(), resources, Widget, widgetResource, RFC-3339 (+14 more)

### Community 9 - "syncApi.ts"
Cohesion: 0.11
Nodes (24): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+16 more)

### Community 10 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (23): toServerRow(), AuditEvent, AuditLevel, SyncMetaRecord, logError(), logInfo(), logSyncEvent(), logWarn() (+15 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "useResponsive.tsx"
Cohesion: 0.15
Nodes (14): HeaderProps, BillingCounter(), HeldSalesDrawer(), HeldSalesDrawerProps, useCartSound(), useHeldCarts(), below(), LayoutTier (+6 more)

### Community 13 - "useEntitySearch"
Cohesion: 0.14
Nodes (26): ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, SearchHighlight(), SearchHighlightProps, EntitySearchResult, useEntitySearch(), buildSearchIndex() (+18 more)

### Community 14 - "useSyncedMutation"
Cohesion: 0.20
Nodes (18): useSetSupplierLinks(), FormContentProps, SupplierFormContent(), SupplierFormModal(), SupplierFormModalProps, SupplierList(), DEFAULT_SUGGESTED_TAGS, NO_SUPPLIERS (+10 more)

### Community 15 - "idMap.ts"
Cohesion: 0.16
Nodes (12): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.13
Nodes (25): ApiErrorLike, classifyFailure(), commitSuccess(), conflictReasonFor(), FailureClass, flushOutbox(), FlushSummary, handleConflict() (+17 more)

### Community 18 - "PrintJobFormModal.tsx"
Cohesion: 0.22
Nodes (20): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, EmployeeRole, SplitType, PrintJobFormModalProps, PrintJob (+12 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"
Cohesion: 0.10
Nodes (21): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, BillingCounter, CustomerList, EmployeeList, ReportsDashboard (+13 more)

### Community 21 - "products.resource.ts"
Cohesion: 0.10
Nodes (29): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), FormContentProps (+21 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "AppShell.tsx"
Cohesion: 0.10
Nodes (19): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Header(), Sidebar() (+11 more)

### Community 24 - "offline/index.ts"
Cohesion: 0.19
Nodes (17): applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ, OutboxFullError, getDeviceId() (+9 more)

### Community 25 - "ConnectivityMonitor.ts"
Cohesion: 0.18
Nodes (9): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, DEGRADED_LATENCY_MS, HEALTH_PROBE_BACKOFF_MS, HEALTH_PROBE_INTERVAL_ONLINE_MS, OFFLINE_FAILURE_THRESHOLD, ONLINE_SETTLE_MS (+1 more)

### Community 26 - "authSlice.ts"
Cohesion: 0.12
Nodes (25): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), LoginPayload, LoginResponse (+17 more)

### Community 27 - "invoicesApi.ts"
Cohesion: 0.10
Nodes (27): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, cancelInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+19 more)

### Community 28 - "useSupplierProducts.ts"
Cohesion: 0.21
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedProduct (+8 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "formatMoney"
Cohesion: 0.16
Nodes (15): CURRENCY, DiscountPopover(), DiscountPopoverProps, ProductFormContent(), MoneyInput(), MoneyInputProps, HEIGHT_MAP, QuantityInput() (+7 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.17
Nodes (15): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+7 more)

### Community 33 - "resources/index.ts"
Cohesion: 0.21
Nodes (15): createPurchase(), toLocalRow(), appendStockDelta(), defineOperation(), defineSyncResource(), purchasesResource, pushOptions(), stockMovementsResource (+7 more)

### Community 34 - "useIsMobile"
Cohesion: 0.15
Nodes (29): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useAllProducts(), useCreateProduct(), useDeleteProducts(), useLowStockProducts() (+21 more)

### Community 35 - "EmployeeFormModal.tsx"
Cohesion: 0.31
Nodes (8): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EmployeeFormValues, fromEmployee(), toEmployeeInput()

### Community 36 - "healthProbe.ts"
Cohesion: 0.29
Nodes (6): env, probeClient, probeHealth(), ProbeResult, HEADER_SERVER_TIME, HEALTH_PROBE_TIMEOUT_MS

### Community 37 - "useShortcuts.ts"
Cohesion: 0.36
Nodes (7): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope, useAppShortcuts()

### Community 38 - "SyncEngine"
Cohesion: 0.27
Nodes (3): SyncEngine, countByStatus(), countUnsettledForResource()

### Community 39 - "client.ts"
Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 40 - "networkSignal.ts"
Cohesion: 0.33
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

### Community 41 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 43 - "useCategories.ts"
Cohesion: 0.19
Nodes (16): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), buildCategoryLookup(), NO_CATEGORIES (+8 more)

### Community 44 - "CategoryManagerModal.tsx"
Cohesion: 0.17
Nodes (19): ProductTable, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductFormModal(), ProductPickerModal(), ProductPickerModalProps (+11 more)

### Community 45 - "PrintJobList.tsx"
Cohesion: 0.40
Nodes (7): PrintJobList, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob()

### Community 48 - "common.ts"
Cohesion: 0.16
Nodes (15): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, enrich(), NO_PURCHASES, EnrichedStockPurchase (+7 more)

### Community 49 - "repairs.resource.ts"
Cohesion: 0.29
Nodes (12): BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), RepairListResponseData, toRepairJob(), updateRepairJobRaw(), creditCommission() (+4 more)

### Community 50 - "offline/constants.ts"
Cohesion: 0.19
Nodes (12): AUDIT_LOG_LIMIT, MAX_CLOCK_SKEW_MS, MAX_PUSH_ATTEMPTS, OFFLINE_DB_NAME, OUTBOX_CAPACITY, PULL_PAGE_LIMIT, RETRY_BASE_MS, RETRY_JITTER_RATIO (+4 more)

### Community 51 - "LocalStorageStore"
Cohesion: 0.23
Nodes (3): addEarningRecord(), updateEarningRecordForWork(), LocalStorageStore

### Community 52 - "printJobs.resource.ts"
Cohesion: 0.26
Nodes (14): BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob(), updatePrintJobRaw() (+6 more)

### Community 53 - "suppliers.resource.ts"
Cohesion: 0.18
Nodes (14): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), markDeleted(), readServerVersion() (+6 more)

### Community 54 - "InvoicesList.tsx"
Cohesion: 0.27
Nodes (9): InvoicesList, SaleDocumentPreviewModal(), useAllInvoices(), useInvoicePayments(), useRecordPayment(), InvoiceDetailDrawer(), InvoiceDetailDrawerProps, InvoicesList() (+1 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.18
Nodes (17): CartLineItem, CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext() (+9 more)

### Community 56 - "maintenance.ts"
Cohesion: 0.20
Nodes (12): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, estimateStorage(), exportDiagnostics(), forceFullResync(), pruneByRetention(), rowAgeTimestamp() (+4 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "tables.ts"
Cohesion: 0.12
Nodes (19): AuthUser, PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, ConflictReason, IdMapRecord, IdMapStatus, OutboxError (+11 more)

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

### Community 65 - "RepairJobList.tsx"
Cohesion: 0.19
Nodes (13): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), ConfirmDialog() (+5 more)

### Community 66 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 67 - "searchFields.ts"
Cohesion: 0.27
Nodes (9): fetchRepairs(), GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, EMPLOYEE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, PRODUCT_SEARCH_FIELDS, REPAIR_JOB_SEARCH_FIELDS (+1 more)

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 72 - "schema.ts"
Cohesion: 0.24
Nodes (12): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, db, MirrorTableName (+4 more)

### Community 73 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 74 - "invoices.resource.ts"
Cohesion: 0.40
Nodes (5): invoices.resource.ts, products.resource.ts, stockLedger.ts (Local Delta Ledger), syncNotifications.ts, SyncResource Descriptor Pattern

### Community 75 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 76 - "useAppSelector"
Cohesion: 0.19
Nodes (13): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProvidersProps, LowStockNotifier(), notifiedProductIds, useAppSelector, selectIsAuthenticated(), darkTokens (+5 more)

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

## Knowledge Gaps
- **343 isolated node(s):** `FILL`, `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps`, `KeyboardShortcutsModalProps` (+338 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `syncSlice.ts`, `notificationSlice.ts`, `useIsMobile`, `useAppDispatch`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `useResponsive.tsx`, `router.tsx`, `AppShell.tsx`, `authSlice.ts`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `notificationSlice.ts`, `syncSlice.ts`, `EmployeeList.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `EmployeeFormModal.tsx`, `CustomerList.tsx`, `AmountInput.tsx`, `useResponsive.tsx`, `CategoryManagerModal.tsx`, `useSyncedMutation`, `PrintJobFormModal.tsx`, `CatalogPanel.tsx`, `products.resource.ts`, `AppShell.tsx`, `InvoicesList.tsx`, `formatMoney`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `RepairJobList.tsx`, `useIsMobile`, `EmployeeList.tsx`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `searchFields.ts`, `CustomerList.tsx`, `useResponsive.tsx`, `useEntitySearch`, `CategoryManagerModal.tsx`, `PrintJobList.tsx`, `useSyncedMutation`, `PrintJobFormModal.tsx`, `products.resource.ts`, `InvoicesList.tsx`, `CatalogPanel.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `FILL`, `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS` to the rest of the system?**
  _343 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `syncSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05289193302891933 - nodes in this community are weakly interconnected._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06019871420222092 - nodes in this community are weakly interconnected._
- **Should `useAppDispatch` be split into smaller, more focused modules?**
  _Cohesion score 0.11951219512195121 - nodes in this community are weakly interconnected._