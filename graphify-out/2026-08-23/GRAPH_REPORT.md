# Graph Report - frontend  (2026-08-23)

## Corpus Check
- 335 files · ~179,534 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1826 nodes · 5647 edges · 110 communities (80 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9b4922eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ConnectivityMonitor
- notificationSlice.ts
- useAppSelector
- registry.ts
- InvoiceDetailDrawer.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- PaymentPanel.tsx
- BillingCounter.tsx
- router.tsx
- dependencies
- providers.tsx
- SyncEngine
- tablerIcons.ts
- useSupplierProducts.ts
- devDependencies
- flush.ts
- SyncEngine.ts
- useIsMobile
- Sidebar.tsx
- compilerOptions
- authSlice.ts
- customers.resource.ts
- invoicesApi.ts
- settingsSlice.ts
- common.ts
- printJobs.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- pull.ts
- syncApi.ts
- CatalogPanel.tsx
- RepairJobList.tsx
- products.resource.ts
- useSearchHistory.ts
- SupplierList.tsx
- syncSlice.ts
- maintenance.ts
- AppShell.tsx
- client.ts
- stockLedger.ts
- suppliers.resource.ts
- formatMoney
- @mantine/hooks
- react
- SyncProvider.tsx
- react-router-dom
- postcss-simple-vars
- repairs.resource.ts
- outbox.ts
- db
- inventory/types.ts
- schema.ts
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- creditNotesApi.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- AmountInput.tsx
- searchFields.ts
- inventory/index.ts
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
- prettier
- typescript
- typescript-eslint
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
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)
- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (110 total, 30 thin omitted)

### Community 0 - "ConnectivityMonitor"
Cohesion: 0.20
Nodes (3): ConnectivityMonitor, ConnectivityListener, ConnectivityState

### Community 1 - "notificationSlice.ts"
Cohesion: 0.10
Nodes (24): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+16 more)

### Community 2 - "useAppSelector"
Cohesion: 0.14
Nodes (29): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+21 more)

### Community 3 - "registry.ts"
Cohesion: 0.08
Nodes (34): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+26 more)

### Community 4 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.07
Nodes (43): BackendCreditNoteItem, CreateCreditNoteItemInput, NO_CREDIT_NOTES, useCreateCreditNote(), useCreditNotes(), useInvoiceCreditNotes(), useVoidCreditNote(), useAllInvoices() (+35 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.07
Nodes (39): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, DocumentPreviewSubject, SaleDocumentPreviewModal() (+31 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (30): PaymentMethod, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState, DiscountType (+22 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.11
Nodes (27): applyLocalCustomerFilters(), CustomerFilters, CustomerList(), isCustomerFilterActive(), CustomerPickerModal(), CustomerPickerModalProps, useAllCustomers(), useCreateCustomer() (+19 more)

### Community 8 - "PaymentPanel.tsx"
Cohesion: 0.22
Nodes (12): PAYMENT_METHODS, CompleteSaleResult, PaymentPanel, PaymentPanelProps, getSaleHeroPresentation(), SaleHeroPresentation, Invoice, InvoiceItem (+4 more)

### Community 9 - "BillingCounter.tsx"
Cohesion: 0.18
Nodes (21): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+13 more)

### Community 10 - "router.tsx"
Cohesion: 0.08
Nodes (22): AppShell(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList, PrintJobList, RepairJobList (+14 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "providers.tsx"
Cohesion: 0.10
Nodes (18): App(), AppUpdatePrompt(), AppProviders(), AppProvidersProps, AuthInitializer(), router, container, createReduxColorSchemeManager() (+10 more)

### Community 13 - "SyncEngine"
Cohesion: 0.20
Nodes (7): AUDIT_LOG_LIMIT, AuditLevel, logError(), logInfo(), logSyncEvent(), trimAuditLog(), SyncEngine

### Community 14 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (18): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+10 more)

### Community 15 - "useSupplierProducts.ts"
Cohesion: 0.16
Nodes (18): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedSupplier (+10 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), resolveMapping(), resolveValue() (+30 more)

### Community 18 - "SyncEngine.ts"
Cohesion: 0.13
Nodes (13): ConnectivitySnapshot, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, SyncMetaRecord, LeaderElection, FlushCompleteListener (+5 more)

### Community 20 - "useIsMobile"
Cohesion: 0.09
Nodes (45): CustomerDetailDrawer(), EmployeeDetailDrawer(), ProductFormModal(), ProductPickerModal(), ProductPickerModalProps, applyLocalProductFilters(), isProductFilterActive(), ProductFilters (+37 more)

### Community 21 - "Sidebar.tsx"
Cohesion: 0.10
Nodes (24): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, Sidebar(), SidebarProps, NAV_CATEGORIES (+16 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.13
Nodes (26): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+18 more)

### Community 24 - "customers.resource.ts"
Cohesion: 0.14
Nodes (21): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawerProps, CustomerFormModal() (+13 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.13
Nodes (26): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+18 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 27 - "common.ts"
Cohesion: 0.19
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 28 - "printJobs.resource.ts"
Cohesion: 0.31
Nodes (14): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+6 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.09
Nodes (26): env, probeClient, probeHealth(), ProbeResult, Listener, listeners, NetworkObservation, observeNetwork() (+18 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "pull.ts"
Cohesion: 0.15
Nodes (16): toServerRow(), logWarn(), adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary, BarcodeConflictError (+8 more)

### Community 32 - "syncApi.ts"
Cohesion: 0.23
Nodes (13): PULL_PAGE_LIMIT, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges() (+5 more)

### Community 33 - "CatalogPanel.tsx"
Cohesion: 0.24
Nodes (15): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+7 more)

### Community 34 - "RepairJobList.tsx"
Cohesion: 0.10
Nodes (46): queryKeys, JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, CustomerFormContent(), EmployeeRole, SplitType (+38 more)

### Community 35 - "products.resource.ts"
Cohesion: 0.11
Nodes (21): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+13 more)

### Community 36 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 37 - "SupplierList.tsx"
Cohesion: 0.23
Nodes (15): SupplierList, applyLocalSupplierFilters(), isSupplierFilterActive(), SupplierFilters, SupplierList(), SupplierPickerModal(), SupplierPickerModalProps, NO_SUPPLIERS (+7 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.05
Nodes (54): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection() (+46 more)

### Community 39 - "maintenance.ts"
Cohesion: 0.21
Nodes (10): STORAGE_QUOTA_WARN_RATIO, clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), StorageEstimate, MIRROR_TABLE_NAMES (+2 more)

### Community 40 - "AppShell.tsx"
Cohesion: 0.27
Nodes (8): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS

### Community 41 - "client.ts"
Cohesion: 0.07
Nodes (36): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, BillingStats, fetchBillingStats() (+28 more)

### Community 42 - "stockLedger.ts"
Cohesion: 0.33
Nodes (6): applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.19
Nodes (15): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), SupplierDetailDrawerProps, FormContentProps (+7 more)

### Community 44 - "formatMoney"
Cohesion: 0.16
Nodes (22): CURRENCY, DiscountPopover(), DiscountPopoverProps, HeldSalesDrawer(), HeldSalesDrawerProps, EmployeeFormModal(), ProductFormContent(), SupplierIntakeRow (+14 more)

### Community 47 - "SyncProvider.tsx"
Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 51 - "repairs.resource.ts"
Cohesion: 0.31
Nodes (14): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), FetchRepairsParams (+6 more)

### Community 52 - "outbox.ts"
Cohesion: 0.22
Nodes (16): OutboxError, assignLedgerEntriesToOperation(), getDeviceId(), mintLocalId(), createIdempotencyKey(), createLocalId(), LOCAL_ID_PREFIX, randomUuid() (+8 more)

### Community 53 - "db"
Cohesion: 0.18
Nodes (20): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, createPurchase() (+12 more)

### Community 54 - "inventory/types.ts"
Cohesion: 0.17
Nodes (16): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), BarcodeSource, ProductInput (+8 more)

### Community 55 - "schema.ts"
Cohesion: 0.10
Nodes (33): ProductCatalogTreeProps, Category, Product, StockMovement, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+25 more)

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.12
Nodes (24): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings(), fetchEmployees() (+16 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "creditNotesApi.ts"
Cohesion: 0.16
Nodes (21): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+13 more)

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

### Community 65 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 66 - "searchFields.ts"
Cohesion: 0.10
Nodes (36): ProductCatalogTree, ProductHierarchy, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, QueryKeyFactory (+28 more)

### Community 67 - "inventory/index.ts"
Cohesion: 0.23
Nodes (12): ProductTable, CartLineItem, CartLineItemProps, CatalogCategoryFilter, CategoryIconInfo, getCategoryIconInfo(), CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+4 more)

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
Cohesion: 0.15
Nodes (17): calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculateReturnTotals(), CartLineItemSource, CartTotalsCalculationInput, CartTotalsResult, DiscountType (+9 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.17
Nodes (16): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCreateCategory(), useCreateSubcategory() (+8 more)

## Knowledge Gaps
- **380 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `searchFields.ts`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `AppShell.tsx`, `BillingCounter.tsx`, `router.tsx`, `PaymentPanel.tsx`, `providers.tsx`, `SyncProvider.tsx`, `useIsMobile`, `Sidebar.tsx`, `authSlice.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `notificationSlice.ts`, `InvoiceDetailDrawer.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `PaymentPanel.tsx`, `BillingCounter.tsx`, `router.tsx`, `Sidebar.tsx`, `customers.resource.ts`, `common.ts`, `RepairJobList.tsx`, `products.resource.ts`, `SupplierList.tsx`, `syncSlice.ts`, `AppShell.tsx`, `formatMoney`, `AmountInput.tsx`, `inventory/index.ts`, `useCategories.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `formatMoney` to `CatalogPanel.tsx`, `RepairJobList.tsx`, `inventory/index.ts`, `searchFields.ts`, `SaleDocumentPreviewModal.tsx`, `InvoiceDetailDrawer.tsx`, `CustomerList.tsx`, `PaymentPanel.tsx`, `BillingCounter.tsx`, `posCalculations.ts`, `useIsMobile`, `customers.resource.ts`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.14390243902439023 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08080808080808081 - nodes in this community are weakly interconnected._