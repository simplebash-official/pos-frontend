# Graph Report - frontend  (2026-08-20)

## Corpus Check
- 309 files · ~161,530 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1653 nodes · 4967 edges · 111 communities (81 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20f603d7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EmployeeFormModal.tsx
- notificationSlice.ts
- useAppSelector
- LoginForm.tsx
- useResponsive.tsx
- SaleDocumentPreviewModal.tsx
- cartSlice.ts
- formatMoney
- offline/types.ts
- common.ts
- SyncEngine.ts
- dependencies
- SupplierDetailDrawer.tsx
- searchFields.ts
- EmployeeList.tsx
- authSlice.ts
- devDependencies
- flush.ts
- PrintJobList.tsx
- tablerIconShards/index.ts
- router.tsx
- products.resource.ts
- compilerOptions
- payments.resource.ts
- PendingOperationsList.tsx
- Header.tsx
- Sidebar.tsx
- invoicesApi.ts
- employees/types.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- Invoice
- ReportsDashboard.tsx
- registry.ts
- RepairJobList.tsx
- BillingCounter.tsx
- useIsMobile
- syncSlice.ts
- ApiClient
- SyncEngine
- settingsSlice.ts
- syncApi.ts
- inventory/types.ts
- CatalogPanel.tsx
- printJobs.resource.ts
- AppShell.tsx
- @mantine/form
- ProductTable.tsx
- repairs.resource.ts
- react-dom
- @tanstack/react-query
- suppliers.resource.ts
- providers.tsx
- CartLineItem.tsx
- money.ts
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- SyncProvider.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- customers.resource.ts
- AmountInput.tsx
- useSearchHistory.ts
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- useShortcuts.ts
- Right-Side Detail Drawer Visual Family
- audio.ts
- Graphify Knowledge Graph Rules
- eslint-plugin-react-hooks
- Inline Color Scheme Init Script
- vite-plugin-pwa
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
1. `useIsMobile()` - 74 edges
2. `useAppSelector` - 60 edges
3. `formatMoney()` - 59 edges
4. `useSyncedMutation()` - 44 edges
5. `useAppDispatch` - 42 edges
6. `db` - 38 edges
7. `ConnectivityMonitor` - 30 edges
8. `useSyncedQuery()` - 30 edges
9. `flushOutbox()` - 27 edges
10. `fetchResourceDelta()` - 27 edges

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
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
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

## Communities (111 total, 30 thin omitted)

### Community 0 - "EmployeeFormModal.tsx"
Cohesion: 0.36
Nodes (8): EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, EmployeeFormValues, fromEmployee(), toEmployeeInput()

### Community 1 - "notificationSlice.ts"
Cohesion: 0.09
Nodes (29): STORAGE_KEYS, NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory (+21 more)

### Community 2 - "useAppSelector"
Cohesion: 0.12
Nodes (33): AppUpdatePrompt(), usePrint(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues (+25 more)

### Community 3 - "LoginForm.tsx"
Cohesion: 0.22
Nodes (12): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+4 more)

### Community 4 - "useResponsive.tsx"
Cohesion: 0.21
Nodes (10): BillingPageSkeleton(), FILL, below(), LayoutTier, LayoutTierContext, LayoutTierContextValue, LayoutTierProvider(), MEDIA_QUERY_OPTIONS (+2 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.20
Nodes (17): getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), SaleDocumentPreviewModal(), StandalonePrintView(), useInvoiceDocument(), UseInvoiceDocumentResult, getPrintLogsForInvoice() (+9 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (28): CartLineItemProps, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState, DiscountType (+20 more)

### Community 7 - "formatMoney"
Cohesion: 0.11
Nodes (35): fetchInvoices(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, CustomerList() (+27 more)

### Community 8 - "offline/types.ts"
Cohesion: 0.06
Nodes (38): blankMeta(), getAllSyncMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), seedSyncMeta(), SyncMetaPatch, resolvePullTargets() (+30 more)

### Community 9 - "common.ts"
Cohesion: 0.15
Nodes (17): MutationRequestOptions, fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+9 more)

### Community 10 - "SyncEngine.ts"
Cohesion: 0.10
Nodes (26): ClearLocalDataOptions, pruneByRetention(), rowAgeTimestamp(), StorageEstimate, readServerVersion(), toServerRow(), MIRROR_TABLE_NAMES, AuditLevel (+18 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "SupplierDetailDrawer.tsx"
Cohesion: 0.16
Nodes (22): ReceiveStockModal(), enrich(), NO_PURCHASES, useCreatePurchase(), usePurchasesByProduct(), usePurchasesBySupplier(), EnrichedLinkedProduct, EnrichedLinkedSupplier (+14 more)

### Community 13 - "searchFields.ts"
Cohesion: 0.11
Nodes (34): ProductCatalogTreeProps, ProductPickerModal(), ProductPickerModalProps, useAllProducts(), SupplierFormContent(), GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult (+26 more)

### Community 14 - "EmployeeList.tsx"
Cohesion: 0.15
Nodes (12): createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, INITIAL_EARNINGS, INITIAL_EMPLOYEES, normalizeEmployee() (+4 more)

### Community 15 - "authSlice.ts"
Cohesion: 0.12
Nodes (27): RequireAdmin(), RequireAdminProps, Sidebar(), USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser (+19 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.08
Nodes (50): ConflictReason, OutboxError, assignLedgerEntriesToOperation(), AbandonedReferenceError, UnresolvedReferenceError, getDeviceId(), abandonMapping(), DROP_ELEMENT (+42 more)

### Community 18 - "PrintJobList.tsx"
Cohesion: 0.19
Nodes (19): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, BackendPrintJob, PrintJobFormModalProps, PrintJobList(), NO_PRINT_JOBS (+11 more)

### Community 19 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 20 - "router.tsx"
Cohesion: 0.09
Nodes (23): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, BillingCounter, CustomerList, EmailLoginScreen, EmployeeList (+15 more)

### Community 21 - "products.resource.ts"
Cohesion: 0.17
Nodes (12): adjustStock(), createProduct(), deleteProducts(), fetchProducts(), ProductListParams, ProductsPageData, updateProduct(), StockAdjustmentResult (+4 more)

### Community 22 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, ES2023, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly (+16 more)

### Community 23 - "payments.resource.ts"
Cohesion: 0.38
Nodes (7): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, RecordPaymentPayload

### Community 24 - "PendingOperationsList.tsx"
Cohesion: 0.27
Nodes (8): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxStatus, discardOperation(), retryOperation(), EmptyState(), EmptyStateProps

### Community 25 - "Header.tsx"
Cohesion: 0.36
Nodes (8): Header(), HeaderProps, BillingCounter(), useCartSound(), useHeldCarts(), selectAuthUser(), selectHeldCarts(), selectSoundEnabled()

### Community 26 - "Sidebar.tsx"
Cohesion: 0.24
Nodes (7): SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, SegmentedToggle(), SegmentedToggleProps

### Community 27 - "invoicesApi.ts"
Cohesion: 0.16
Nodes (14): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, CompleteSaleItemInput, CompleteSalePaymentInput, CompleteSalePricingAdjustments, CompleteSaleResponseData (+6 more)

### Community 28 - "employees/types.ts"
Cohesion: 0.43
Nodes (5): EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, EmployeeRole, SplitType, AssignmentInfo

### Community 29 - "offline/constants.ts"
Cohesion: 0.05
Nodes (43): isApiErrorLike(), readServerTime(), RequestOptions, env, ConnectivityMonitor, probeClient, probeHealth(), ProbeResult (+35 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "Invoice"
Cohesion: 0.10
Nodes (24): InvoicesList, CompleteSaleInput, CompleteSaleResult, A4InvoicePreviewModalProps, PaymentPanelProps, SaleDocumentPreviewModalProps, NO_INVOICES, useAllInvoices() (+16 more)

### Community 32 - "ReportsDashboard.tsx"
Cohesion: 0.23
Nodes (7): ReportsDashboard, fetchAllEmployeeEarnings, fetchEmployees(), ReportsDashboard(), DailySalesReportSummary, PageHeader(), PageHeaderProps

### Community 33 - "registry.ts"
Cohesion: 0.19
Nodes (21): queryKeys, cancelInvoice(), completeSale(), createPurchase(), linkSupplierProduct(), setLinksForSupplier(), unlinkSupplierProduct(), toLocalRow() (+13 more)

### Community 35 - "RepairJobList.tsx"
Cohesion: 0.20
Nodes (14): RepairJobList, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob(), useDeleteRepairs(), useUpdateRepairJob(), RepairJobInput (+6 more)

### Community 36 - "BillingCounter.tsx"
Cohesion: 0.19
Nodes (20): PAYMENT_METHODS, PaymentMethod, BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+12 more)

### Community 37 - "useIsMobile"
Cohesion: 0.10
Nodes (32): ProductFormContent(), ReceiveStockModalProps, useSetSupplierLinks(), SupplierDetailDrawerProps, FormContentProps, SupplierFormModal(), SupplierFormModalProps, SupplierList() (+24 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.07
Nodes (40): SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes(), SyncPanel(), SyncSettingsSection(), SyncStatusBadge() (+32 more)

### Community 39 - "ApiClient"
Cohesion: 0.36
Nodes (3): ApiClient, buildParams(), buildSyncHeaders()

### Community 40 - "SyncEngine"
Cohesion: 0.24
Nodes (4): SyncEngine, countByStatus(), countUnsettled(), countUnsettledForResource()

### Community 41 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (15): SettingsPage, DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile (+7 more)

### Community 42 - "syncApi.ts"
Cohesion: 0.31
Nodes (10): ApiEnvelope, fetchResourceDelta(), fetchResourceSnapshotPage(), fetchSyncChanges(), isCursorInvalid(), readChanges(), ResourceSyncStatus, SyncChangesEnvelope (+2 more)

### Community 43 - "inventory/types.ts"
Cohesion: 0.14
Nodes (22): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), BarcodeSource, Category (+14 more)

### Community 44 - "CatalogPanel.tsx"
Cohesion: 0.12
Nodes (32): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), CatalogCategoryFilter (+24 more)

### Community 45 - "printJobs.resource.ts"
Cohesion: 0.35
Nodes (12): addEarningRecord(), updateEarningRecordForWork(), calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), PrintJobListResponseData, toPrintJob() (+4 more)

### Community 46 - "AppShell.tsx"
Cohesion: 0.21
Nodes (10): ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal() (+2 more)

### Community 48 - "ProductTable.tsx"
Cohesion: 0.19
Nodes (18): FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, ProductTable(), NO_MOVEMENTS, NO_PRODUCTS, useAdjustStock() (+10 more)

### Community 49 - "repairs.resource.ts"
Cohesion: 0.34
Nodes (12): deleteEarningRecordsForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs(), RepairListResponseData, toRepairJob() (+4 more)

### Community 53 - "suppliers.resource.ts"
Cohesion: 0.30
Nodes (9): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), markDeleted(), markPending() (+1 more)

### Community 54 - "providers.tsx"
Cohesion: 0.09
Nodes (21): App(), HeldCartCatchupNotifier(), AppShell(), AppProviders(), AppProvidersProps, AuthInitializer(), router, DEFAULT_PAGINATION (+13 more)

### Community 55 - "CartLineItem.tsx"
Cohesion: 0.24
Nodes (8): CartLineItem, DiscountPopover(), DiscountPopoverProps, getCategoryIconInfo(), AmountInput, HEIGHT_MAP, QuantityInput(), QuantityInputProps

### Community 56 - "money.ts"
Cohesion: 0.22
Nodes (16): CURRENCY, RepairFormModal(), RepairFormModalProps, STATUSES_REQUIRING_PRICE, RepairJob, MoneyInput(), MoneyInputProps, fromCents() (+8 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 59 - "schema.ts"
Cohesion: 0.09
Nodes (35): StockMovement, UNSYNCED_VERSION, MirrorTableName, OfflineDb, AuditEvent, ConflictRecord, IdMapRecord, IdMapStatus (+27 more)

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

### Community 65 - "customers.resource.ts"
Cohesion: 0.24
Nodes (10): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerListParams, CustomerListResponse (+2 more)

### Community 66 - "AmountInput.tsx"
Cohesion: 0.25
Nodes (7): AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 67 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

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

### Community 76 - "useShortcuts.ts"
Cohesion: 0.38
Nodes (6): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope

### Community 77 - "Right-Side Detail Drawer Visual Family"
Cohesion: 0.50
Nodes (4): Right-Side Detail Drawer Visual Family, EmployeeDetailDrawer.tsx, ProductTable.tsx (Item Specifications Drawer), SupplierDetailDrawer.tsx

### Community 78 - "audio.ts"
Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

## Knowledge Gaps
- **336 isolated node(s):** `ROUTE_TITLES`, `EmployeeRole`, `PhoneDisplayProps`, `NotificationPopoverProps`, `NotificationActor` (+331 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `EmployeeFormModal.tsx`, `notificationSlice.ts`, `LoginForm.tsx`, `useResponsive.tsx`, `SaleDocumentPreviewModal.tsx`, `formatMoney`, `SupplierDetailDrawer.tsx`, `searchFields.ts`, `authSlice.ts`, `PrintJobList.tsx`, `Header.tsx`, `Sidebar.tsx`, `Invoice`, `BillingCounter.tsx`, `syncSlice.ts`, `CatalogPanel.tsx`, `AppShell.tsx`, `ProductTable.tsx`, `CartLineItem.tsx`, `money.ts`, `AmountInput.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `notificationSlice.ts`, `BillingCounter.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `SupplierDetailDrawer.tsx`, `AppShell.tsx`, `authSlice.ts`, `ProductTable.tsx`, `router.tsx`, `providers.tsx`, `Header.tsx`, `Sidebar.tsx`, `SyncProvider.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `offline/constants.ts` to `SyncEngine.ts`, `authSlice.ts`, `flush.ts`, `providers.tsx`, `schema.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `ROUTE_TITLES`, `EmployeeRole`, `PhoneDisplayProps` to the rest of the system?**
  _336 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `notificationSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08943089430894309 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.1211840888066605 - nodes in this community are weakly interconnected._
- **Should `cartSlice.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11174242424242424 - nodes in this community are weakly interconnected._