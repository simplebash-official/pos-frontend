# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 335 files · ~178,134 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1820 nodes · 5626 edges · 102 communities (72 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea565084`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tablerIcons.ts
- constants/index.ts
- useAppSelector
- registry.ts
- CreditNoteModal.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- CustomerList.tsx
- InvoiceDetailDrawer.tsx
- formatDateTime
- router.tsx
- dependencies
- customersApi.ts
- SyncEngine.ts
- searchFields.ts
- useSearchHistory.ts
- devDependencies
- flush.ts
- creditNotesApi.ts
- ProductTable.tsx
- providers.tsx
- compilerOptions
- authSlice.ts
- offline/index.ts
- invoicesApi.ts
- settingsSlice.ts
- common.ts
- products.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- payments.resource.ts
- LoginForm.tsx
- useIsMobile
- RepairJobList.tsx
- syncSlice.ts
- @mantine/form
- SupplierList.tsx
- useSyncData.ts
- customers.resource.ts
- vite-plugin-pwa
- supplierProducts.resource.ts
- syncApi.ts
- db
- CatalogPanel.tsx
- mockEmployees.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- BillingCounter.tsx
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
- client.ts
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
3. `formatMoney()` - 62 edges
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
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)
- **Center Modal Visual Family (ProductFormModal, ConfirmDialog, A4InvoicePreviewModal)** — claude_center_modal_pattern, claude_productformmodal_component, claude_confirmdialog_component, claude_a4invoicepreviewmodal_component [EXTRACTED 1.00]
- **Right-Side Detail Drawer Family (ProductTable, SupplierDetailDrawer, EmployeeDetailDrawer)** — claude_detail_drawer_pattern, claude_producttable_component, claude_supplierdetaildrawer_component, claude_employeedetaildrawer_component [EXTRACTED 1.00]
- **Offline Sync Four Hard Rules (apiClient bypass ban, Dexie source of truth, delta ledger, no locally-invented identity)** — claude_offline_sync_architecture, claude_apiclient, claude_dexie_schema, claude_stockledger, claude_localid_module [INFERRED 0.85]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow [INFERRED 0.95]

## Communities (102 total, 30 thin omitted)

### Community 0 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 1 - "constants/index.ts"
Cohesion: 0.09
Nodes (28): HeaderProps, STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover() (+20 more)

### Community 2 - "useAppSelector"
Cohesion: 0.13
Nodes (32): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+24 more)

### Community 3 - "registry.ts"
Cohesion: 0.07
Nodes (40): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets(), RFC-3339 (+32 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.12
Nodes (23): BackendCreditNoteItem, CreateCreditNoteItemInput, useCreateCreditNote(), CreditNoteModal(), ExchangeLine, LineState, SerialUnitState, CREDIT_NOTE_FLAG_META (+15 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.11
Nodes (30): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), DocumentPreviewSubject, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps (+22 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.10
Nodes (35): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), useCartSound(), useCartTotals(), SaleHeroPresentation, LineSourceType (+27 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.24
Nodes (14): CustomerDetailDrawer(), CustomerFormModal(), applyLocalCustomerFilters(), CustomerFilters, CustomerList(), isCustomerFilterActive(), PRESET_CUSTOMER_TAGS, NO_CUSTOMERS (+6 more)

### Community 8 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.12
Nodes (27): InvoicesList, fetchBillingStats(), A4InvoicePreviewModalProps, PaymentPanelProps, useBillingStats(), useInvoiceCreditNotes(), NO_INVOICES, useAllInvoices() (+19 more)

### Community 9 - "formatDateTime"
Cohesion: 0.18
Nodes (10): CustomerDetailDrawerProps, fetchEmployeeEarnings(), EmployeeDetailDrawer(), EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, DetailDrawer(), DetailDrawerProps, MetricCardDef (+2 more)

### Community 10 - "router.tsx"
Cohesion: 0.08
Nodes (31): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT (+23 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "customersApi.ts"
Cohesion: 0.24
Nodes (9): fetchAllCustomers(), fetchCustomers(), CustomerFormModalProps, FormContentProps, Customer, CustomerInput, CustomerListParams, CustomerListResponse (+1 more)

### Community 13 - "SyncEngine.ts"
Cohesion: 0.12
Nodes (22): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, toServerRow(), patchSyncMeta(), AuditLevel, logError(), logInfo(), logSyncEvent() (+14 more)

### Community 14 - "searchFields.ts"
Cohesion: 0.20
Nodes (12): CustomerPickerModalProps, GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHistoryInput, SearchHistoryInputProps, CUSTOMER_SEARCH_FIELDS, EMPLOYEE_SEARCH_FIELDS (+4 more)

### Community 15 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.09
Nodes (53): MIRROR_TABLE_NAMES, ConflictReason, OutboxError, assignLedgerEntriesToOperation(), getDeviceId(), abandonMapping(), DROP_ELEMENT, isRecord() (+45 more)

### Community 18 - "creditNotesApi.ts"
Cohesion: 0.15
Nodes (22): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+14 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.07
Nodes (69): NO_CREDIT_NOTES, useCreditNotes(), useVoidCreditNote(), FormContentProps, ProductFormModalProps, applyLocalProductFilters(), isProductFilterActive(), ProductFilters (+61 more)

### Community 21 - "providers.tsx"
Cohesion: 0.10
Nodes (20): App(), AppProviders(), AppProvidersProps, AuthInitializer(), router, LowStockNotifier(), notifiedProductIds, useLowStockProducts() (+12 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.09
Nodes (33): RequireAdmin(), RequireAdminProps, Sidebar(), SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig (+25 more)

### Community 24 - "offline/index.ts"
Cohesion: 0.11
Nodes (15): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, applyLedgerToProducts(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries() (+7 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.14
Nodes (24): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleItemInput, CompleteSalePaymentInput (+16 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "common.ts"
Cohesion: 0.13
Nodes (22): BillingStats, CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats(), InventoryStats, useInventoryStats(), fetchPrintJobStats() (+14 more)

### Community 28 - "products.resource.ts"
Cohesion: 0.12
Nodes (17): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), fetchProductSerials(), ProductListParams, ProductsPageData, updateProduct() (+9 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.06
Nodes (43): env, clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate() (+35 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "payments.resource.ts"
Cohesion: 0.40
Nodes (8): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, paymentsResource, RecordPaymentPayload

### Community 32 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 33 - "useIsMobile"
Cohesion: 0.12
Nodes (26): Header(), CartLineItem, CartPanel, CartPanelProps, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+18 more)

### Community 34 - "RepairJobList.tsx"
Cohesion: 0.05
Nodes (94): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, CURRENCY, addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork() (+86 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.06
Nodes (51): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection() (+43 more)

### Community 41 - "SupplierList.tsx"
Cohesion: 0.21
Nodes (14): SupplierFilters, ConfirmDialog(), ConfirmDialogProps, Column, DataTable(), DataTableProps, MetricCardRow(), PageHeader() (+6 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.22
Nodes (11): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+3 more)

### Community 43 - "customers.resource.ts"
Cohesion: 0.17
Nodes (18): createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer(), createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers() (+10 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.25
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProductInput (+4 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.18
Nodes (20): queryKeys, createPurchase(), PULL_PAGE_LIMIT, defineSyncResource(), productSerialsResource, purchasesResource, stockMovementsResource, ApiEnvelope (+12 more)

### Community 54 - "db"
Cohesion: 0.13
Nodes (25): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), buildCategoryLookup(), NO_CATEGORIES (+17 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.20
Nodes (16): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+8 more)

### Community 56 - "mockEmployees.ts"
Cohesion: 0.11
Nodes (16): ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployees() (+8 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.15
Nodes (22): StockMovement, PendingOperationsListProps, STATUS_LABEL, MirrorTableName, OfflineDb, AuditEvent, ConflictRecord, CreditNote (+14 more)

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
Cohesion: 0.14
Nodes (22): CompleteSaleInput, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+14 more)

### Community 66 - "search.ts"
Cohesion: 0.16
Nodes (23): SearchHighlight(), SearchHighlightProps, UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), getMatchRanges(), IndexedField (+15 more)

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
Cohesion: 0.08
Nodes (29): DiscountPopover(), DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP (+21 more)

### Community 83 - "client.ts"
Cohesion: 0.12
Nodes (16): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), MutationRequestOptions, readServerTime(), RequestOptions, fetchPurchases() (+8 more)

### Community 84 - "CategoryManagerModal.tsx"
Cohesion: 0.16
Nodes (21): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, ProductPickerModal() (+13 more)

## Knowledge Gaps
- **377 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+372 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `BillingCounter.tsx`, `constants/index.ts`, `useIsMobile`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoiceDetailDrawer.tsx`, `search.ts`, `router.tsx`, `ProductTable.tsx`, `providers.tsx`, `authSlice.ts`, `offline/constants.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `constants/index.ts`, `BillingCounter.tsx`, `RepairJobList.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `InvoiceDetailDrawer.tsx`, `formatDateTime`, `syncSlice.ts`, `customersApi.ts`, `searchFields.ts`, `posCalculations.ts`, `CategoryManagerModal.tsx`, `ProductTable.tsx`, `authSlice.ts`, `products.resource.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `useIsMobile` to `BillingCounter.tsx`, `RepairJobList.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `CustomerList.tsx`, `InvoiceDetailDrawer.tsx`, `formatDateTime`, `SupplierList.tsx`, `customersApi.ts`, `searchFields.ts`, `posCalculations.ts`, `CategoryManagerModal.tsx`, `ProductTable.tsx`, `CatalogPanel.tsx`, `mockEmployees.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _377 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `constants/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08527131782945736 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.12626262626262627 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06708595387840671 - nodes in this community are weakly interconnected._