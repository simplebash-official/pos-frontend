# Graph Report - frontend (2026-08-19)

## Corpus Check

- 310 files · ~155,444 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1552 nodes · 4685 edges · 97 communities (75 shown, 22 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- Offline Connectivity Monitoring
- Offline Connectivity Monitoring
- Notifications & Storage Keys
- Sync Metadata & Cursors
- Offline Connectivity Monitoring
- Offline Connectivity Monitoring
- ID Mapping & Reference Resolution
- POS Billing Flow (useResponsive)
- POS Cart & Checkout State
- Outbox Queue & Status
- Invoice & Document Printing
- Employee Accounts & Earnings
- Runtime Packages & UI Dependencies
- POS Billing Flow (useCustomers)
- POS Billing Flow (routes)
- Authentication & Access Control
- POS Billing Flow (printLogStore)
- Build & Dev Dependencies
- Product Catalog & Hierarchy
- Supplier Directory & Stock Receipts
- POS Cart & Checkout State
- Supplier Directory & Stock Receipts
- POS Cart & Checkout State
- Outbox Queue & Status
- DOM Module
- Outbox Queue & Status
- POS Billing Flow (router)
- Shop Settings & Profile
- Offline Sync Engine (productsApi)
- Inventory & Products API
- Offline Sync Engine (useProducts)
- Employee Accounts & Earnings
- Authentication & Access Control
- Supplier Directory & Stock Receipts
- Tabler Icon Shards
- Customer Management & Drawers
- Supplier Directory & Stock Receipts
- App Layout & Routing
- index Module
- POS Billing Flow (invoicesApi)
- Billing Chrome & Navigation
- POS Cart & Checkout State
- Employee Accounts & Earnings
- Inventory & Products API
- Supplier Directory & Stock Receipts
- Offline Sync Engine (syncApi)
- Employee Accounts & Earnings
- generate-icon-shards.mjs Module
- MutationRequestOptions Module
- POS Billing Flow (saleHeroPresentation)
- Employee Accounts & Earnings
- Employee Accounts & Earnings
- POS Billing Flow (paymentsApi)
- Billing Chrome & Navigation
- scripts Module
- Billing Catalog & Line Items
- Offline Connectivity Monitoring
- AmountInput Module
- ExpandableCard Module
- Shop Settings & Profile
- useShortcuts Module
- Invoice & Document Printing
- Authentication & Access Control
- package.json Module
- Invoice & Document Printing
- eslint-plugin-react-hooks Module
- @mantine/form Module
- react-dom Module
- @tanstack/react-query Module
- prettier Module
- Build & Dev Dependencies
- typescript-eslint Module
- vite-plugin-pwa Module
- vitest Module
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Invoice & Document Printing
- Community 91
- Invoice & Document Printing
- Invoice & Document Printing

## God Nodes (most connected - your core abstractions)

1. `useIsMobile()` - 75 edges
2. `formatMoney()` - 60 edges
3. `useAppSelector` - 60 edges
4. `useAppDispatch` - 42 edges
5. `useSyncedMutation()` - 31 edges
6. `db` - 30 edges
7. `ConnectivityMonitor` - 28 edges
8. `useEntitySearch()` - 28 edges
9. `flushOutbox()` - 27 edges
10. `ProductTable()` - 22 edges

## Surprising Connections (you probably didn't know these)

- `Deploy Frontend GitHub Actions Workflow` --conceptually_related_to--> `Architecture Overview & Entry Chain` [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `SYNC-15: Collapse Dual id/key Identity` --conceptually_related_to--> `Architecture Overview & Entry Chain` [INFERRED]
  backend-sync-requirements.html → CLAUDE.md
- `SYNC-14: Batch Push Endpoint (Conditional)` --conceptually_related_to--> `Offline & Sync Architecture` [INFERRED]
  backend-sync-requirements.html → CLAUDE.md
- `AGENTS.md Instructions Document` --references--> `Offline & Sync Architecture` [EXTRACTED]
  AGENTS.md → CLAUDE.md
- `AGENTS.md Instructions Document` --references--> `Project Overview (POS System)` [EXTRACTED]
  AGENTS.md → CLAUDE.md

## Import Cycles

- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`

## Hyperedges (group relationships)

- **CI Build and Quality Gate Flow** — github_workflows_deploy_pipeline, claude_commands, claude_project_overview [INFERRED 0.75]
- **Duplicated AI Assistant Instruction Files** — claude_project_overview, agents_md_doc, gemini_md_doc [EXTRACTED 1.00]
- **Backend Requirements Supporting the Four Hard Rules** — claude_offline_sync_four_hard_rules, backend_sync_requirements_stock_authority, backend_sync_requirements_local_id_prefix, backend_sync_requirements_idempotency_key [INFERRED 0.85]

## Communities (97 total, 22 thin omitted)

### Community 0 - "Offline Connectivity Monitoring"

Cohesion: 0.06
Nodes (41): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+33 more)

### Community 1 - "Offline Connectivity Monitoring"

Cohesion: 0.06
Nodes (45): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+37 more)

### Community 2 - "Notifications & Storage Keys"

Cohesion: 0.07
Nodes (41): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+33 more)

### Community 3 - "Sync Metadata & Cursors"

Cohesion: 0.08
Nodes (33): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), resolvePullTargets(), RFC-3339 (+25 more)

### Community 4 - "Offline Connectivity Monitoring"

Cohesion: 0.07
Nodes (43): AGENTS.md Instructions Document, Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On (+35 more)

### Community 5 - "Offline Connectivity Monitoring"

Cohesion: 0.12
Nodes (19): clearLocalData(), ClearLocalDataOptions, forceFullResync(), pruneByRetention(), rowAgeTimestamp(), logError(), logInfo(), logSyncEvent() (+11 more)

### Community 6 - "ID Mapping & Reference Resolution"

Cohesion: 0.10
Nodes (37): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveMapping() (+29 more)

### Community 7 - "POS Billing Flow (useResponsive)"

Cohesion: 0.11
Nodes (27): HeldSalesDrawer(), HeldSalesDrawerProps, fetchEmployeeEarnings(), EmployeeDetailDrawer(), ReceiveStockModal(), enrich(), NO_PURCHASES, useCreatePurchase() (+19 more)

### Community 8 - "POS Cart & Checkout State"

Cohesion: 0.11
Nodes (31): PaymentMethod, CartLineItemProps, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+23 more)

### Community 9 - "Outbox Queue & Status"

Cohesion: 0.11
Nodes (30): StockMovement, readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, db, MirrorTableName, OfflineDb, AuditEvent (+22 more)

### Community 10 - "Invoice & Document Printing"

Cohesion: 0.19
Nodes (23): AppUpdatePrompt(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection() (+15 more)

### Community 11 - "Employee Accounts & Earnings"

Cohesion: 0.11
Nodes (18): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+10 more)

### Community 12 - "Runtime Packages & UI Dependencies"

Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 13 - "POS Billing Flow (useCustomers)"

Cohesion: 0.18
Nodes (22): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList(), CustomerPickerModal() (+14 more)

### Community 14 - "POS Billing Flow (routes)"

Cohesion: 0.11
Nodes (22): RequireAdmin(), RequireAdminProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, Sidebar() (+14 more)

### Community 15 - "Authentication & Access Control"

Cohesion: 0.14
Nodes (23): AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload, LoginResponse (+15 more)

### Community 16 - "POS Billing Flow (printLogStore)"

Cohesion: 0.17
Nodes (19): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult (+11 more)

### Community 17 - "Build & Dev Dependencies"

Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 18 - "Product Catalog & Hierarchy"

Cohesion: 0.15
Nodes (24): ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, SearchHighlight(), SearchHighlightProps, EntitySearchResult, buildSearchIndex(), getMatchRanges() (+16 more)

### Community 19 - "Supplier Directory & Stock Receipts"

Cohesion: 0.16
Nodes (21): ReceiveStockModalProps, useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList(), SupplierPickerModal() (+13 more)

### Community 20 - "POS Cart & Checkout State"

Cohesion: 0.18
Nodes (22): Header(), HeaderProps, completeSale(), BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane (+14 more)

### Community 21 - "Supplier Directory & Stock Receipts"

Cohesion: 0.11
Nodes (20): ProductListParams, ProductsPageData, FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, useValidCategories(), BarcodeSource (+12 more)

### Community 23 - "POS Cart & Checkout State"

Cohesion: 0.17
Nodes (23): CartLineItem, CatalogPanel, CatalogPanelProps, chunk(), DiscountPopover(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS (+15 more)

### Community 24 - "Outbox Queue & Status"

Cohesion: 0.18
Nodes (18): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, MIRROR_TABLE_NAMES, OutboxStatus, assignLedgerEntriesToOperation(), getDeviceId(), createIdempotencyKey() (+10 more)

### Community 25 - "DOM Module"

Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 26 - "Outbox Queue & Status"

Cohesion: 0.14
Nodes (17): toServerRow(), SyncMetaPatch, adoptNewestCursor(), applyChanges(), fullRefresh(), pullResource(), PullSummary, CursorInvalidError (+9 more)

### Community 27 - "POS Billing Flow (router)"

Cohesion: 0.12
Nodes (15): AppShell(), BillingCounter, CustomerList, EmailLoginScreen, PrintJobList, RepairJobList, StandalonePrintView, SupplierList (+7 more)

### Community 28 - "Shop Settings & Profile"

Cohesion: 0.13
Nodes (17): SettingsPage, renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption (+9 more)

### Community 29 - "Offline Sync Engine (productsApi)"

Cohesion: 0.19
Nodes (17): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), updateProduct(), createPurchase(), toLocalRow(), appendStockDelta() (+9 more)

### Community 30 - "Inventory & Products API"

Cohesion: 0.19
Nodes (17): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), NO_CATEGORIES, Category (+9 more)

### Community 31 - "Offline Sync Engine (useProducts)"

Cohesion: 0.19
Nodes (17): ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock(), useCreateProduct(), useDeleteProducts(), useProductMovements(), useUpdateProduct() (+9 more)

### Community 32 - "Employee Accounts & Earnings"

Cohesion: 0.27
Nodes (15): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput (+7 more)

### Community 33 - "Authentication & Access Control"

Cohesion: 0.20
Nodes (13): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+5 more)

### Community 34 - "Supplier Directory & Stock Receipts"

Cohesion: 0.21
Nodes (16): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), EnrichedLinkedSupplier (+8 more)

### Community 35 - "Tabler Icon Shards"

Cohesion: 0.17
Nodes (18): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+10 more)

### Community 36 - "Customer Management & Drawers"

Cohesion: 0.19
Nodes (13): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+5 more)

### Community 37 - "Supplier Directory & Stock Receipts"

Cohesion: 0.21
Nodes (14): ProductPickerModal(), ProductPickerModalProps, useAllProducts(), SupplierFormContent(), GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHistoryInput (+6 more)

### Community 38 - "App Layout & Routing"

Cohesion: 0.15
Nodes (11): App(), AppProviders(), AppProvidersProps, router, container, darkTokens, lightTokens, mantineCssVariableResolver() (+3 more)

### Community 39 - "index Module"

Cohesion: 0.17
Nodes (13): CURRENCY, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, MoneyInput(), MoneyInputProps, fromCents(), parseMoneyToCents() (+5 more)

### Community 40 - "POS Billing Flow (invoicesApi)"

Cohesion: 0.15
Nodes (15): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleInput, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments (+7 more)

### Community 41 - "Billing Chrome & Navigation"

Cohesion: 0.18
Nodes (8): ApiClient, buildParams(), buildSyncHeaders(), BackendPaymentRecord, PaymentListResponseData, PaymentRecord, RecordPaymentInput, ApiResponse

### Community 42 - "POS Cart & Checkout State"

Cohesion: 0.23
Nodes (10): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, PageLoader(), PageLoaderProps, selectIsAuthenticated() (+2 more)

### Community 43 - "Employee Accounts & Earnings"

Cohesion: 0.30
Nodes (10): EmployeeList, EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EmployeeRole, EmployeeFormValues (+2 more)

### Community 44 - "Inventory & Products API"

Cohesion: 0.22
Nodes (11): ProductTable, AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, CATEGORY_COLOR_OPTIONS, useCreateCategory(), useCreateSubcategory() (+3 more)

### Community 45 - "Supplier Directory & Stock Receipts"

Cohesion: 0.26
Nodes (10): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), markDeleted(), DeleteSupplierPayload (+2 more)

### Community 46 - "Offline Sync Engine (syncApi)"

Cohesion: 0.22
Nodes (13): PULL_PAGE_LIMIT, ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus (+5 more)

### Community 47 - "Employee Accounts & Earnings"

Cohesion: 0.35
Nodes (11): deleteEarningRecordsForWork(), BackendPrintJob, calculatePrintEarnings(), createPrintJob(), deletePrintJobs(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob() (+3 more)

### Community 48 - "generate-icon-shards.mjs Module"

Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 49 - "MutationRequestOptions Module"

Cohesion: 0.24
Nodes (10): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+2 more)

### Community 50 - "POS Billing Flow (saleHeroPresentation)"

Cohesion: 0.26
Nodes (9): PAYMENT_METHODS, CompleteSaleResult, PaymentPanelProps, SaleDocumentPreviewModalProps, getSaleHeroPresentation(), SaleHeroPresentation, Invoice, InvoiceDetailDrawerProps (+1 more)

### Community 51 - "Employee Accounts & Earnings"

Cohesion: 0.35
Nodes (10): addEarningRecord(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJob(), deleteRepairs(), RepairListResponseData, toRepairJob() (+2 more)

### Community 52 - "Employee Accounts & Earnings"

Cohesion: 0.25
Nodes (7): queryKeys, ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), EMPLOYEE_ROLE_LABELS, ReportsDashboard(), DailySalesReportSummary

### Community 53 - "POS Billing Flow (paymentsApi)"

Cohesion: 0.31
Nodes (8): InvoicesList, fetchInvoices(), fetchPaymentsForInvoice(), recordPayment(), toPaymentRecord(), InvoiceDetailDrawer(), InvoicesList(), INVOICE_SEARCH_FIELDS

### Community 54 - "Billing Chrome & Navigation"

Cohesion: 0.24
Nodes (7): DiscountPopoverProps, EntityListPage(), EntityListPageProps, PageHeader(), PageHeaderProps, SegmentedToggle(), SegmentedToggleProps

### Community 55 - "scripts Module"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, generate:icons, lint, preview, test (+2 more)

### Community 56 - "Billing Catalog & Line Items"

Cohesion: 0.38
Nodes (8): buildCatalogCategoryFilters(), CatalogCategoryFilter, CategoryIconInfo, DEFAULT_CATEGORY_ICON, resolveCategoryIcon(), TablerIcon, resolveTablerIcon(), TablerIconMap

### Community 57 - "Offline Connectivity Monitoring"

Cohesion: 0.51
Nodes (8): clearConnectivityNotification(), notifyBackOnline(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate(), SyncProvider(), registerSyncResources()

### Community 58 - "AmountInput Module"

Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 59 - "ExpandableCard Module"

Cohesion: 0.27
Nodes (8): ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

### Community 60 - "Shop Settings & Profile"

Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 61 - "useShortcuts Module"

Cohesion: 0.36
Nodes (7): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope, useAppShortcuts()

### Community 62 - "Invoice & Document Printing"

Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 63 - "Authentication & Access Control"

Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 64 - "package.json Module"

Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 65 - "Invoice & Document Printing"

Cohesion: 0.67
Nodes (3): Center Modals Visual Family Pattern, Right-Side Detail & Profile Drawers Pattern, UI Copy for Non-Technical Shop User

## Knowledge Gaps

- **304 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+299 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `POS Billing Flow (useResponsive)` to `Employee Accounts & Earnings`, `Authentication & Access Control`, `Notifications & Storage Keys`, `Offline Connectivity Monitoring`, `Supplier Directory & Stock Receipts`, `Employee Accounts & Earnings`, `Inventory & Products API`, `POS Billing Flow (useCustomers)`, `POS Billing Flow (routes)`, `POS Billing Flow (printLogStore)`, `POS Billing Flow (saleHeroPresentation)`, `Supplier Directory & Stock Receipts`, `POS Cart & Checkout State`, `Supplier Directory & Stock Receipts`, `POS Billing Flow (paymentsApi)`, `POS Cart & Checkout State`, `AmountInput Module`, `Offline Sync Engine (useProducts)`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `Offline Connectivity Monitoring` to `Outbox Queue & Status`, `Offline Connectivity Monitoring`, `ID Mapping & Reference Resolution`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Invoice & Document Printing` to `Offline Connectivity Monitoring`, `Notifications & Storage Keys`, `POS Cart & Checkout State`, `POS Cart & Checkout State`, `POS Billing Flow (routes)`, `Authentication & Access Control`, `POS Billing Flow (printLogStore)`, `POS Billing Flow (saleHeroPresentation)`, `POS Cart & Checkout State`, `Offline Connectivity Monitoring`, `POS Billing Flow (router)`, `Offline Sync Engine (useProducts)`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _304 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Offline Connectivity Monitoring` be split into smaller, more focused modules?**
  _Cohesion score 0.05516431924882629 - nodes in this community are weakly interconnected._
- **Should `Offline Connectivity Monitoring` be split into smaller, more focused modules?**
  _Cohesion score 0.0629800307219662 - nodes in this community are weakly interconnected._
- **Should `Notifications & Storage Keys` be split into smaller, more focused modules?**
  _Cohesion score 0.06734006734006734 - nodes in this community are weakly interconnected._
