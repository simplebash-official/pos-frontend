# Graph Report - frontend (2026-08-19)

## Corpus Check

- 310 files · ~160,687 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1599 nodes · 4891 edges · 102 communities (72 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `72a12a70`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- offline/constants.ts
- useCategories.ts
- offline/types.ts
- tablerIconShards/index.ts
- settings/types.ts
- SyncEngine
- useAppSelector
- flush.ts
- SyncPanel.tsx
- ConnectivityMonitor
- products.resource.ts
- router.tsx
- CustomerList.tsx
- useIsMobile
- outbox.ts
- BillingCounter.tsx
- useSyncedQuery
- dependencies
- EmployeeList.tsx
- SaleDocumentPreviewModal.tsx
- db
- devDependencies
- SyncProvider.tsx
- search.ts
- syncApi.ts
- SupplierDetailDrawer.tsx
- SupplierFormModal.tsx
- compilerOptions
- ProductFormModal.tsx
- SyncEngine.ts
- Backend Requirements — Offline Sync Spec
- useShortcuts.ts
- PrintJobFormModal.tsx
- schema.ts
- useSyncedMutation
- useResponsive.tsx
- LoginForm.tsx
- printJobs.resource.ts
- tables.ts
- backoff.ts
- ProductTable.tsx
- suppliers.resource.ts
- categories.resource.ts
- networkSignal.ts
- useSearchHistory.ts
- EntityListPage.tsx
- generate-icon-shards.mjs
- authSlice.ts
- scripts
- AmountInput.tsx
- client.ts
- RepairJobList.tsx
- Offline-First Dexie Mirror and Outbox Engine
- icons.svg (Social/Doc Icon Sprite Sheet)
- app/App.tsx
- MobileSignUpForm.tsx
- registry.ts
- providers.tsx
- Responsive and Mobile Layout Tiers
- package.json
- Graphify Knowledge Graph Rules
- App Entry, Layout Shell, and Router Architecture
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- @mantine/form
- react-dom
- @tanstack/react-query
- prettier
- typescript-eslint
- vite-plugin-pwa
- vitest
- AGENTS.md Instructions Document
- Integer Cents Money Representation
- Non-Technical Shop User UI Copy Guidelines
- Login Screen (Auth Feature)
- Phone Repair Technician Servicing Device
- Repair/Retail Shop POS Domain
- GEMINI.md Instructions Document
- Deploy Frontend GitHub Actions Workflow
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
- PrintJobList.tsx
- moneyFormUtils.ts
- notificationSlice.ts
- typescript

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 75 edges
2. `formatMoney()` - 60 edges
3. `useAppSelector` - 60 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 38 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `useEntitySearch()` - 28 edges
10. `flushOutbox()` - 27 edges

## Surprising Connections (you probably didn't know these)

- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Rules` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/rules/graphify.md
- `Graphify Knowledge Graph Guidelines in CLAUDE.md` --semantically_similar_to--> `Graphify Knowledge Graph Workflow` [INFERRED] [semantically similar]
  CLAUDE.md → .agents/workflows/graphify.md
- `BillingCounter()` --indirect_call--> `selectShopProfile()` [INFERRED]
  src/features/billing/components/BillingCounter.tsx → src/store/slices/settingsSlice.ts
- `SaleDocumentPreviewModal()` --indirect_call--> `selectPrintSettings()` [INFERRED]
  src/features/billing/components/SaleDocumentPreviewModal.tsx → src/store/slices/settingsSlice.ts
- `CustomerDetailDrawer()` --indirect_call--> `fetchRepairs()` [INFERRED]
  src/features/customers/components/CustomerDetailDrawer.tsx → src/features/repairs/api/repairsApi.ts

## Import Cycles

- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Hyperedges (group relationships)

- **Offline-First Sync and Storage Architecture** — claude_md_offline_sync_engine, claude_md_sync_resource_descriptor, claude_md_connectivity_monitor, claude_md_backend_sync_contract [EXTRACTED 1.00]
- **Responsive and Performant UI Design System** — claude_md_responsive_rules, claude_md_center_modal_standard, claude_md_detail_drawer_standard, claude_md_animation_performance [EXTRACTED 1.00]
- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline [INFERRED 0.75]
- **Backend Requirements Supporting the Four Hard Rules** — backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]
- **Graphify Knowledge Graph Integration** — agents_rules_graphify_rule, agents_workflows_graphify_workflow, claude_md_graphify_guidelines [INFERRED 0.95]

## Communities (102 total, 30 thin omitted)

### Community 0 - "offline/constants.ts"

Cohesion: 0.13
Nodes (17): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS (+9 more)

### Community 1 - "useCategories.ts"

Cohesion: 0.13
Nodes (23): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, buildCategoryLookup(), NO_CATEGORIES, useCategories(), useCategoryIcons() (+15 more)

### Community 2 - "offline/types.ts"

Cohesion: 0.06
Nodes (44): readServerVersion(), toServerRow(), blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta() (+36 more)

### Community 3 - "tablerIconShards/index.ts"

Cohesion: 0.05
Nodes (28): CatalogCategoryFilter, CategoryIconInfo, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, DEFAULT_CATEGORY_ICON, resolveCategoryIcon(), TablerIcon (+20 more)

### Community 4 - "settings/types.ts"

Cohesion: 0.23
Nodes (9): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+1 more)

### Community 5 - "SyncEngine"

Cohesion: 0.15
Nodes (9): AUDIT_LOG_LIMIT, SYNC_LEADER_LOCK, logError(), logInfo(), logSyncEvent(), logWarn(), trimAuditLog(), LeaderElection (+1 more)

### Community 6 - "useAppSelector"

Cohesion: 0.09
Nodes (43): Sidebar(), SidebarProps, NotificationItem(), NotificationPopover(), NotificationPopoverProps, ACCEPTED_TYPES, LogoUpload(), LogoUploadProps (+35 more)

### Community 7 - "flush.ts"

Cohesion: 0.10
Nodes (38): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+30 more)

### Community 8 - "SyncPanel.tsx"

Cohesion: 0.10
Nodes (35): PendingOperationsList(), SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection() (+27 more)

### Community 10 - "products.resource.ts"

Cohesion: 0.21
Nodes (9): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+1 more)

### Community 11 - "router.tsx"

Cohesion: 0.08
Nodes (27): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, BillingCounter, CustomerList, EmailLoginScreen (+19 more)

### Community 12 - "CustomerList.tsx"

Cohesion: 0.07
Nodes (45): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+37 more)

### Community 13 - "useIsMobile"

Cohesion: 0.08
Nodes (59): InvoicesList, CartLineItem, CartLineItemProps, CatalogPanel, CatalogPanelProps, chunk(), DiscountPopover(), DiscountPopoverProps (+51 more)

### Community 14 - "outbox.ts"

Cohesion: 0.26
Nodes (14): MIRROR_TABLE_NAMES, assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey(), createLocalId(), randomUuid(), assertOutboxHasCapacity(), countUnsettled() (+6 more)

### Community 15 - "BillingCounter.tsx"

Cohesion: 0.08
Nodes (56): Header(), HeaderProps, PAYMENT_METHODS, PaymentMethod, BillingCounter(), BillingRegions, BillingRegionsProps, FILL (+48 more)

### Community 16 - "useSyncedQuery"

Cohesion: 0.22
Nodes (13): enrich(), NO_PURCHASES, usePurchasesByProduct(), usePurchasesBySupplier(), EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary, StockPurchase (+5 more)

### Community 17 - "dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 18 - "EmployeeList.tsx"

Cohesion: 0.09
Nodes (24): EmployeeList, ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings (+16 more)

### Community 19 - "SaleDocumentPreviewModal.tsx"

Cohesion: 0.13
Nodes (25): StandalonePrintView, getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModal(), SaleDocumentPreviewModalProps, StandalonePrintView() (+17 more)

### Community 20 - "db"

Cohesion: 0.13
Nodes (19): MutationRequestOptions, BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, fetchPurchases() (+11 more)

### Community 21 - "devDependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 22 - "SyncProvider.tsx"

Cohesion: 0.36
Nodes (11): clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), NOTIFICATION_ID_CONNECTIVITY (+3 more)

### Community 23 - "search.ts"

Cohesion: 0.23
Nodes (15): buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier(), normalizeDigits(), normalizeText(), scoreEntry() (+7 more)

### Community 24 - "syncApi.ts"

Cohesion: 0.23
Nodes (13): PULL_PAGE_LIMIT, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges() (+5 more)

### Community 25 - "SupplierDetailDrawer.tsx"

Cohesion: 0.27
Nodes (12): ProductPickerModal(), useAllProducts(), ReceiveStockModal(), ReceiveStockModalProps, useCreatePurchase(), useLinkProduct(), useProductsForSupplier(), useUnlinkProduct() (+4 more)

### Community 26 - "SupplierFormModal.tsx"

Cohesion: 0.31
Nodes (7): FormContentProps, SupplierFormContent(), SupplierFormModal(), SupplierFormModalProps, DEFAULT_SUGGESTED_TAGS, SupplierInput, UpdateSupplierPayload

### Community 27 - "compilerOptions"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 28 - "ProductFormModal.tsx"

Cohesion: 0.27
Nodes (9): ProductTable, FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, CATEGORY_COLOR_OPTIONS, CreateProductInput, ProductSupplierIntake (+1 more)

### Community 29 - "SyncEngine.ts"

Cohesion: 0.09
Nodes (22): ConnectivitySnapshot, ConnectivityState, PULL_INTERVAL_MS, stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, SyncMetaRecord, FlushCompleteListener (+14 more)

### Community 30 - "Backend Requirements — Offline Sync Spec"

Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "useShortcuts.ts"

Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 32 - "PrintJobFormModal.tsx"

Cohesion: 0.27
Nodes (15): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+7 more)

### Community 33 - "schema.ts"

Cohesion: 0.11
Nodes (31): BarcodeSource, Category, Product, ProductInput, ProductListResponse, StockMovement, StockMovementType, Subcategory (+23 more)

### Community 34 - "useSyncedMutation"

Cohesion: 0.18
Nodes (19): NO_INVOICES, useCancelInvoice(), ProductFormContent(), useSetSupplierLinks(), SupplierList(), NO_SUPPLIERS, useAllSuppliers(), useCreateSupplier() (+11 more)

### Community 35 - "useResponsive.tsx"

Cohesion: 0.14
Nodes (17): AppShell(), ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+9 more)

### Community 36 - "LoginForm.tsx"

Cohesion: 0.18
Nodes (14): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+6 more)

### Community 37 - "printJobs.resource.ts"

Cohesion: 0.17
Nodes (24): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), PrintJobListResponseData (+16 more)

### Community 38 - "tables.ts"

Cohesion: 0.08
Nodes (27): PendingOperationsListProps, STATUS_LABEL, AuditEvent, AuditLevel, ConflictReason, ConflictRecord, IdMapRecord, IdMapStatus (+19 more)

### Community 39 - "backoff.ts"

Cohesion: 0.40
Nodes (5): RETRY_BASE_MS, RETRY_JITTER_RATIO, RETRY_MAX_MS, nextAttemptAt(), nextAttemptDelayMs()

### Community 40 - "ProductTable.tsx"

Cohesion: 0.16
Nodes (17): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+9 more)

### Community 41 - "suppliers.resource.ts"

Cohesion: 0.32
Nodes (8): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), Supplier, suppliersResource

### Community 42 - "categories.resource.ts"

Cohesion: 0.22
Nodes (13): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, ValidCategoryOption (+5 more)

### Community 43 - "networkSignal.ts"

Cohesion: 0.40
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

### Community 44 - "useSearchHistory.ts"

Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 45 - "EntityListPage.tsx"

Cohesion: 0.28
Nodes (6): EntityListPage(), EntityListPageProps, FilterTagChips(), FilterTagChipsProps, PageHeader(), PageHeaderProps

### Community 46 - "generate-icon-shards.mjs"

Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 47 - "authSlice.ts"

Cohesion: 0.12
Nodes (27): RequireAdmin(), RequireAdminProps, AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser (+19 more)

### Community 48 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 50 - "AmountInput.tsx"

Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 51 - "client.ts"

Cohesion: 0.16
Nodes (11): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), readServerTime(), RequestOptions, reportNetworkObservation(), HEADER_DEVICE_ID (+3 more)

### Community 53 - "RepairJobList.tsx"

Cohesion: 0.21
Nodes (13): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), DeleteRepairsPayload (+5 more)

### Community 54 - "Offline-First Dexie Mirror and Outbox Engine"

Cohesion: 0.25
Nodes (8): Backend Sync, Multiplexed Delta, and Idempotency Contract, Connectivity Monitor and Asymmetric Hysteresis, CSS Variable Design Tokens and Dark Mode System, Offline Authentication and Grace Period, Offline-First Dexie Mirror and Outbox Engine, PWA Shell Pre-caching and API Guard Policy, Redux Toolkit State Architecture, Sync Resource Descriptor Protocol

### Community 55 - "icons.svg (Social/Doc Icon Sprite Sheet)"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 56 - "app/App.tsx"

Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 57 - "MobileSignUpForm.tsx"

Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 58 - "registry.ts"

Cohesion: 0.18
Nodes (22): queryKeys, cancelInvoice(), completeSale(), createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer(), createPurchase() (+14 more)

### Community 59 - "providers.tsx"

Cohesion: 0.13
Nodes (16): AppUpdatePrompt(), AppProvidersProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme() (+8 more)

### Community 60 - "Responsive and Mobile Layout Tiers"

Cohesion: 0.50
Nodes (5): Animation Performance and Compositor Rules, Center Modals Standard, Right-Side Detail Drawers Standard, Global Scoped Keyboard Shortcuts, Responsive and Mobile Layout Tiers

### Community 61 - "package.json"

Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 62 - "Graphify Knowledge Graph Rules"

Cohesion: 1.00
Nodes (3): Graphify Knowledge Graph Rules, Graphify Knowledge Graph Workflow, Graphify Knowledge Graph Guidelines in CLAUDE.md

### Community 101 - "PrintJobList.tsx"

Cohesion: 0.26
Nodes (10): PrintJobList, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs(), useUpdatePrintJob(), DeletePrintJobsPayload (+2 more)

### Community 102 - "moneyFormUtils.ts"

Cohesion: 0.19
Nodes (18): CURRENCY, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, MoneyInput(), MoneyInputProps (+10 more)

### Community 103 - "notificationSlice.ts"

Cohesion: 0.11
Nodes (20): STORAGE_KEYS, NotificationItemProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority, AppDispatch, RootState (+12 more)

## Knowledge Gaps

- **327 isolated node(s):** `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments`, `CompleteSalePaymentInput`, `BackendInvoiceItem` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `offline/constants.ts`, `authSlice.ts`, `SyncEngine.ts`, `flush.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `PrintJobFormModal.tsx`, `useCategories.ts`, `useSyncedMutation`, `useResponsive.tsx`, `LoginForm.tsx`, `useAppSelector`, `moneyFormUtils.ts`, `ProductTable.tsx`, `SyncPanel.tsx`, `CustomerList.tsx`, `EntityListPage.tsx`, `BillingCounter.tsx`, `EmployeeList.tsx`, `SaleDocumentPreviewModal.tsx`, `AmountInput.tsx`, `SupplierDetailDrawer.tsx`, `SupplierFormModal.tsx`, `ProductFormModal.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `useResponsive.tsx`, `ProductTable.tsx`, `SyncPanel.tsx`, `router.tsx`, `BillingCounter.tsx`, `authSlice.ts`, `useSyncedQuery`, `SaleDocumentPreviewModal.tsx`, `SyncProvider.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `CompleteSaleItemInput`, `CompleteSaleSplitPaymentInput`, `CompleteSalePricingAdjustments` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `offline/constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13438735177865613 - nodes in this community are weakly interconnected._
- **Should `useCategories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._
- **Should `offline/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058469945355191254 - nodes in this community are weakly interconnected._
