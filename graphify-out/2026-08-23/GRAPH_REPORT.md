# Graph Report - frontend  (2026-08-22)

## Corpus Check
- 335 files · ~178,170 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1820 nodes · 5631 edges · 115 communities (85 shown, 30 thin omitted)
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
- PrintJobList.tsx
- router.tsx
- dependencies
- AppShell.tsx
- SyncEngine
- searchFields.ts
- SearchHistoryInput.tsx
- devDependencies
- flush.ts
- creditNotes.resource.ts
- ProductTable.tsx
- providers.tsx
- compilerOptions
- authSlice.ts
- submit.ts
- invoicesApi.ts
- settingsSlice.ts
- client.ts
- products.resource.ts
- offline/constants.ts
- Backend Sync Requirements Doc
- db
- LoginForm.tsx
- useIsMobile
- RepairFormModal.tsx
- inventory/types.ts
- repairs.resource.ts
- SyncEngine.ts
- syncSlice.ts
- @mantine/form
- SegmentedToggle.tsx
- SupplierList.tsx
- useSyncData.ts
- suppliers.resource.ts
- vite-plugin-pwa
- SyncPanel.tsx
- supplierProducts.resource.ts
- idMap.ts
- syncApi.ts
- outbox.test.ts
- RepairJobList.tsx
- printJobs.resource.ts
- SyncModuleCard.tsx
- PendingOperationsList.tsx
- categories.resource.ts
- CatalogPanel.tsx
- EmployeeList.tsx
- build-and-deploy Job
- generate-icon-shards.mjs
- schema.ts
- ExpandableCard.tsx
- App Entry Chain
- Animation Performance Rules
- Offline & Sync Architecture
- scripts
- BillingCounter.tsx
- search.ts
- SyncStatusBadge.tsx
- Redux Toolkit Store (src/store/)
- Center Modal Visual Family
- icons.svg (Social/Doc Icon Sprite Sheet)
- sync/index.ts
- MobileSignUpForm.tsx
- invoices.resource.ts
- package.json
- Right-Side Detail Drawer Visual Family
- PaymentPanel.tsx
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
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
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

## Communities (115 total, 30 thin omitted)

### Community 0 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 1 - "constants/index.ts"
Cohesion: 0.09
Nodes (27): HeaderProps, STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, NotificationItem(), NotificationItemProps, NotificationPopover() (+19 more)

### Community 2 - "useAppSelector"
Cohesion: 0.14
Nodes (29): ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues (+21 more)

### Community 3 - "registry.ts"
Cohesion: 0.12
Nodes (20): readServerVersion(), stripMirrorMeta(), UNSYNCED_VERSION, MirrorMeta, LOCAL_ID_PREFIX, defineOperation(), getReferringResources(), resources (+12 more)

### Community 4 - "CreditNoteModal.tsx"
Cohesion: 0.07
Nodes (38): BackendCreditNote, BackendCreditNoteExchangeItem, BackendCreditNoteItem, CreateCreditNoteExchangeItemInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+30 more)

### Community 5 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.08
Nodes (35): CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, A4InvoicePreviewModal(), A4InvoicePreviewModalProps, DocumentPreviewSubject, SaleDocumentPreviewModal() (+27 more)

### Community 6 - "cartSlice.ts"
Cohesion: 0.11
Nodes (31): PaymentMethod, useCartCheckout(), useCartSound(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+23 more)

### Community 7 - "CustomerList.tsx"
Cohesion: 0.13
Nodes (26): fetchAllCustomers(), fetchCustomers(), CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormModal(), CustomerFormModalProps, FormContentProps, applyLocalCustomerFilters() (+18 more)

### Community 8 - "InvoiceDetailDrawer.tsx"
Cohesion: 0.14
Nodes (24): InvoicesList, fetchBillingStats(), useBillingStats(), useInvoiceCreditNotes(), NO_INVOICES, useAllInvoices(), useCloseInvoice(), useCompleteSale() (+16 more)

### Community 9 - "PrintJobList.tsx"
Cohesion: 0.17
Nodes (16): applyLocalPrintJobFilters(), isPrintJobFilterActive(), PrintJobFilters, PrintJobList(), NO_PRINT_JOBS, useAllPrintJobs(), useCreatePrintJob(), useDeletePrintJobs() (+8 more)

### Community 10 - "router.tsx"
Cohesion: 0.09
Nodes (20): AppShell(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, PrintJobList, ProductTable, RepairJobList (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.06
Nodes (31): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/hooks, @mantine/modals, @mantine/notifications (+23 more)

### Community 12 - "AppShell.tsx"
Cohesion: 0.10
Nodes (27): GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAuth(), RequireAuthProps, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT (+19 more)

### Community 13 - "SyncEngine"
Cohesion: 0.21
Nodes (7): AuditLevel, logError(), logInfo(), logSyncEvent(), logWarn(), trimAuditLog(), SyncEngine

### Community 14 - "searchFields.ts"
Cohesion: 0.24
Nodes (10): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, CUSTOMER_SEARCH_FIELDS, EMPLOYEE_SEARCH_FIELDS, INVOICE_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, PRODUCT_SEARCH_FIELDS (+2 more)

### Community 15 - "SearchHistoryInput.tsx"
Cohesion: 0.22
Nodes (14): SearchHistoryInput, SearchHistoryInputProps, getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory() (+6 more)

### Community 16 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint (+21 more)

### Community 17 - "flush.ts"
Cohesion: 0.14
Nodes (33): OutboxError, resolveMapping(), isLocalId(), ApiErrorLike, classifyFailure(), commitSuccess(), conflictReasonFor(), FailureClass (+25 more)

### Community 18 - "creditNotes.resource.ts"
Cohesion: 0.40
Nodes (9): createCreditNote(), CreateCreditNoteInput, fetchCreditNotes(), toCreditNote(), voidCreditNote(), markPending(), CreateCreditNotePayload, creditNotesResource (+1 more)

### Community 20 - "ProductTable.tsx"
Cohesion: 0.06
Nodes (69): NO_CREDIT_NOTES, useCreditNotes(), useVoidCreditNote(), FormContentProps, ProductFormModalProps, applyLocalProductFilters(), isProductFilterActive(), ProductFilters (+61 more)

### Community 21 - "providers.tsx"
Cohesion: 0.10
Nodes (19): App(), AppUpdatePrompt(), AppProviders(), AppProvidersProps, AuthInitializer(), router, container, createReduxColorSchemeManager() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dist, DOM, ES2023, graphify-out, node_modules, src, vite/client, compilerOptions (+20 more)

### Community 23 - "authSlice.ts"
Cohesion: 0.12
Nodes (27): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, getMeApi(), AuthUser, LoginPayload (+19 more)

### Community 24 - "submit.ts"
Cohesion: 0.19
Nodes (15): MIRROR_TABLE_NAMES, applyLedgerToProducts(), assignLedgerEntriesToOperation(), pendingDeltaFor(), pendingDeltasByProduct(), pruneConfirmedLedgerEntries(), StockDeltaInput, UNASSIGNED_OUTBOX_SEQ (+7 more)

### Community 25 - "invoicesApi.ts"
Cohesion: 0.12
Nodes (29): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+21 more)

### Community 26 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 27 - "client.ts"
Cohesion: 0.06
Nodes (47): ApiClient, buildParams(), buildSyncHeaders(), isApiErrorLike(), MutationRequestOptions, readServerTime(), RequestOptions, queryKeys (+39 more)

### Community 28 - "products.resource.ts"
Cohesion: 0.16
Nodes (22): createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer(), adjustStock(), createProduct(), deleteProducts(), fetchProducts() (+14 more)

### Community 29 - "offline/constants.ts"
Cohesion: 0.05
Nodes (45): env, clearConnectivityNotification(), notifyBackOnline(), notifySaleWarnings(), notifySyncComplete(), notifySyncProblems(), notifyWentOffline(), showOrUpdate() (+37 more)

### Community 30 - "Backend Sync Requirements Doc"
Cohesion: 0.10
Nodes (21): Acceptance Criteria Checklist, SYNC-14: Batch Push Endpoint (Conditional), SYNC-02: Unfiltered Collection List Endpoints, SYNC-10: Conditional Writes (If-Match / VERSION_CONFLICT), SYNC-12: X-Device-Id on Every Request, Backend Requirements — Offline Sync Spec, Error Codes the Client Acts On, SYNC-11: Health Endpoint & Server Clock (+13 more)

### Community 31 - "db"
Cohesion: 0.12
Nodes (22): toServerRow(), db, blankMeta(), getSyncMeta(), invalidateCursor(), patchSyncMeta(), SyncMetaPatch, adoptNewestCursor() (+14 more)

### Community 32 - "LoginForm.tsx"
Cohesion: 0.24
Nodes (11): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+3 more)

### Community 33 - "useIsMobile"
Cohesion: 0.10
Nodes (35): CURRENCY, CartLineItem, CartLineItemProps, DiscountPopover(), HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+27 more)

### Community 34 - "RepairFormModal.tsx"
Cohesion: 0.24
Nodes (18): JOB_STATUS, JOB_STATUS_LABELS, JobStatus, SplitType, PrintJobFormModalProps, PrintJob, PrintJobInput, RepairFormModalProps (+10 more)

### Community 35 - "inventory/types.ts"
Cohesion: 0.14
Nodes (17): ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, BarcodeSource, Category, ProductInput, ProductListResponse, ProductSupplierIntake (+9 more)

### Community 36 - "repairs.resource.ts"
Cohesion: 0.27
Nodes (16): addEarningRecord(), deleteEarningRecordsForWork(), updateEarningRecordForWork(), BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchRepairs() (+8 more)

### Community 37 - "SyncEngine.ts"
Cohesion: 0.16
Nodes (13): pruneByRetention(), rowAgeTimestamp(), getAllSyncMeta(), seedSyncMeta(), LeaderElection, resolvePullTargets(), RFC-3339, FlushCompleteListener (+5 more)

### Community 38 - "syncSlice.ts"
Cohesion: 0.13
Nodes (12): PULL_INTERVAL_MS, SyncedQueryResult, deriveModuleStatus(), initialState, selectHasBlockingProblem, selectIsOffline(), selectModuleView(), selectModuleViews (+4 more)

### Community 40 - "SegmentedToggle.tsx"
Cohesion: 0.17
Nodes (11): DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput (+3 more)

### Community 41 - "SupplierList.tsx"
Cohesion: 0.28
Nodes (9): SupplierFilters, ConfirmDialog(), ConfirmDialogProps, Column, DataTable(), DataTableProps, getAvatarColor(), getInitials() (+1 more)

### Community 42 - "useSyncData.ts"
Cohesion: 0.23
Nodes (10): depsChanged(), LiveQueryResult, useLiveQuery(), ResolvedId, NO_CONFLICTS, NO_KEYS, NO_OPERATIONS, useConflictedKeys() (+2 more)

### Community 43 - "suppliers.resource.ts"
Cohesion: 0.36
Nodes (7): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), suppliersResource

### Community 45 - "SyncPanel.tsx"
Cohesion: 0.28
Nodes (12): formatBytes(), SyncPanel(), clearLocalData(), ClearLocalDataOptions, estimateStorage(), exportDiagnostics(), forceFullResync(), StorageEstimate (+4 more)

### Community 46 - "supplierProducts.resource.ts"
Cohesion: 0.26
Nodes (12): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, unlinkSupplierProduct(), SupplierProduct (+4 more)

### Community 47 - "idMap.ts"
Cohesion: 0.17
Nodes (12): AbandonedReferenceError, UnresolvedReferenceError, abandonMapping(), DROP_ELEMENT, isRecord(), loadIdMap(), mintLocalId(), resolveValue() (+4 more)

### Community 48 - "syncApi.ts"
Cohesion: 0.19
Nodes (17): PULL_PAGE_LIMIT, defineSyncResource(), productSerialsResource, stockMovementsResource, ApiEnvelope, fetchNewestCursors(), fetchResourceDelta(), fetchResourceSnapshot() (+9 more)

### Community 49 - "outbox.test.ts"
Cohesion: 0.15
Nodes (9): reclaimInflightOperations(), registerSyncResource(), resetRegistry(), Widget, widgetResource, mockStatus(), RFC-3339, AnySyncResource (+1 more)

### Community 50 - "RepairJobList.tsx"
Cohesion: 0.25
Nodes (12): JOB_STATUS_COLORS, applyLocalRepairFilters(), isRepairFilterActive(), RepairFilters, RepairJobList(), NO_REPAIRS, useAllRepairs(), useCreateRepairJob() (+4 more)

### Community 51 - "printJobs.resource.ts"
Cohesion: 0.35
Nodes (12): BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData, toPrintJob() (+4 more)

### Community 52 - "SyncModuleCard.tsx"
Cohesion: 0.24
Nodes (9): SyncModuleCard(), SyncModuleCardProps, MODULE_STATUS_PRESENTATION, OVERALL_STATUS_PRESENTATION, StatusPresentation, ModuleSyncStatus, ModuleSyncView, ExpandableCard() (+1 more)

### Community 53 - "PendingOperationsList.tsx"
Cohesion: 0.27
Nodes (8): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, OutboxOp, OutboxStatus, retryOperation(), EmptyState(), EmptyStateProps

### Community 54 - "categories.resource.ts"
Cohesion: 0.24
Nodes (12): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryInput, AddSubcategoryPayload (+4 more)

### Community 55 - "CatalogPanel.tsx"
Cohesion: 0.20
Nodes (16): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+8 more)

### Community 56 - "EmployeeList.tsx"
Cohesion: 0.11
Nodes (29): ReportsDashboard, createEmployee(), deleteEmployee(), deleteEmployees(), earningsStore, employeesStore, fetchAllEmployeeEarnings, fetchEmployeeEarnings() (+21 more)

### Community 57 - "build-and-deploy Job"
Cohesion: 0.24
Nodes (11): build-and-deploy Job, Build Step (npm run build), DEPLOY_PATH Environment Variable, Deploy dist/ via rsync, Lint Step (npm run lint), Type Check Step (npm run type-check), npm run build, npm run format (+3 more)

### Community 58 - "generate-icon-shards.mjs"
Cohesion: 0.17
Nodes (9): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total (+1 more)

### Community 59 - "schema.ts"
Cohesion: 0.15
Nodes (25): BackendPaymentRecord, PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, StockMovement, MirrorTableName (+17 more)

### Community 60 - "ExpandableCard.tsx"
Cohesion: 0.31
Nodes (7): ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip(), InteractiveTooltipProps

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
Cohesion: 0.22
Nodes (18): Header(), BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar() (+10 more)

### Community 66 - "search.ts"
Cohesion: 0.20
Nodes (18): UseBackendFilteredListResult, useEntitySearch(), buildSearchIndex(), IndexedField, isWordChar(), MatchRange, matchTier(), normalizeDigits() (+10 more)

### Community 67 - "SyncStatusBadge.tsx"
Cohesion: 0.43
Nodes (6): SyncStatusBadge(), SyncStatusBadgeProps, selectIsOfflineSession(), selectConnectivity(), selectOverallSyncStatus, selectSyncTotals()

### Community 68 - "Redux Toolkit Store (src/store/)"
Cohesion: 0.22
Nodes (9): initializeAuth (Offline Auth Grace Period), authSlice (login/loginSuccess cacheSession), cartSlice.ts, Dexie Schema (src/offline/db/schema.ts), money.ts (Integer-Cents Money Handling), Redux Toolkit Store (src/store/), SyncProvider, syncSlice.ts (Read-Only Mirror) (+1 more)

### Community 69 - "Center Modal Visual Family"
Cohesion: 0.29
Nodes (7): A4InvoicePreviewModal.tsx, Center Modal Visual Family, ConfirmDialog.tsx, KeyboardShortcutsModal.tsx, ProductFormModal.tsx, UI Copy — Plain Language Rule, useAppShortcuts (Global Keyboard Shortcut Engine)

### Community 70 - "icons.svg (Social/Doc Icon Sprite Sheet)"
Cohesion: 0.43
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, icons.svg (Social/Doc Icon Sprite Sheet), Social/Community Icon, X (Twitter) Icon

### Community 71 - "sync/index.ts"
Cohesion: 0.47
Nodes (3): SyncDrawer(), SyncDrawerProps, SyncSettingsSection()

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

### Community 79 - "PaymentPanel.tsx"
Cohesion: 0.12
Nodes (23): PAYMENT_METHODS, PaymentPanel, getSaleHeroPresentation(), SaleHeroPresentation, calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculatePaymentState() (+15 more)

### Community 84 - "useCategories.ts"
Cohesion: 0.19
Nodes (20): AddSubcategoryRow(), CategoryItem(), CategoryManagerModal(), CategoryManagerModalProps, ProductPickerModal(), ProductPickerModalProps, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON (+12 more)

## Knowledge Gaps
- **377 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+372 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `useAppSelector` to `constants/index.ts`, `BillingCounter.tsx`, `SyncStatusBadge.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `cartSlice.ts`, `syncSlice.ts`, `InvoiceDetailDrawer.tsx`, `search.ts`, `router.tsx`, `AppShell.tsx`, `SyncPanel.tsx`, `PaymentPanel.tsx`, `ProductTable.tsx`, `providers.tsx`, `authSlice.ts`, `offline/constants.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `useIsMobile` to `LoginForm.tsx`, `BillingCounter.tsx`, `constants/index.ts`, `RepairFormModal.tsx`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `SyncStatusBadge.tsx`, `CustomerList.tsx`, `InvoiceDetailDrawer.tsx`, `sync/index.ts`, `SegmentedToggle.tsx`, `AppShell.tsx`, `PaymentPanel.tsx`, `SearchHistoryInput.tsx`, `useCategories.ts`, `ProductTable.tsx`, `EmployeeList.tsx`, `client.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `formatMoney()` connect `useIsMobile` to `BillingCounter.tsx`, `RepairFormModal.tsx`, `inventory/types.ts`, `CreditNoteModal.tsx`, `SaleDocumentPreviewModal.tsx`, `CustomerList.tsx`, `SegmentedToggle.tsx`, `InvoiceDetailDrawer.tsx`, `PrintJobList.tsx`, `searchFields.ts`, `PaymentPanel.tsx`, `RepairJobList.tsx`, `useCategories.ts`, `ProductTable.tsx`, `CatalogPanel.tsx`, `EmployeeList.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _377 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `constants/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08826945412311266 - nodes in this community are weakly interconnected._
- **Should `useAppSelector` be split into smaller, more focused modules?**
  _Cohesion score 0.14390243902439023 - nodes in this community are weakly interconnected._
- **Should `registry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._