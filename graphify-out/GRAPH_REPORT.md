# Graph Report - frontend  (2026-08-27)

## Corpus Check
- 660 files · ~354,133 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2564 nodes · 6847 edges · 151 communities (127 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `347d8c9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useCategories.ts
- dedup-recs.mjs
- workspace-resolver.mjs
- useSupplierProducts.ts
- lib/render-report.mjs
- CustomerList.tsx
- sanitizers/index.mjs
- useAppSelector
- cartSlice.ts
- t
- providers.tsx
- useModuleStats
- gate-investigations.mjs
- SaleDocumentPreviewModal.tsx
- SupplierList.tsx
- store/index.ts
- dependencies
- ConnectivityMonitor.ts
- compilerOptions
- UsersList.tsx
- extract-claims.mjs
- verify-claim.mjs
- scanners/index.mjs
- devDependencies
- router.tsx
- date.ts
- BillingCounter.tsx
- moneyFormUtils.ts
- useDashboardLivePulse.ts
- CreditNoteModal.tsx
- InvoicesList.tsx
- categoryIcons.ts
- CartPanel.tsx
- support-topics.mjs
- ConnectivityMonitor
- lib/reconcile-candidates.mjs
- useLayoutTier
- PrintJobList.tsx
- CatalogPanel.tsx
- vercel.mjs
- investigation-brief.mjs
- creditNotesApi.ts
- repairsApi.ts
- collect-signals.mjs
- settingsSlice.ts
- ThinkingOrb.tsx
- citations.mjs
- route-normalize.mjs
- useEmployees.ts
- ProductTable.tsx
- PaymentPanel.tsx
- scripts/deep-dive.mjs
- Sidebar.tsx
- SyncPanel.tsx
- tablerIcons.ts
- invoicesApi.ts
- LocalStorageStore
- CategoryManagerModal.tsx
- authSlice.ts
- gates/index.mjs
- withRouteShapeWarnings
- constants/index.ts
- purchasesApi.ts
- CLAUDE.md
- collect-sub-agent-outputs.mjs
- merge-signals.mjs
- prepare-investigation-brief.mjs
- middleware-broad-matcher.mjs
- throttle.mjs
- offline/index.ts
- common.ts
- LoginForm.tsx
- useSearchHistory.ts
- client.ts
- hard-gates.mjs
- impact-label.mjs
- scripts
- generate-icon-shards.mjs
- runVercelJson
- rate-limit.mjs
- count-correct.mjs
- Semaphore
- usePayments.ts
- AmountInput.tsx
- scanner-driven.mjs
- ApiClient
- billing/types.ts
- large-static-asset.mjs
- docs-library.json
- formatMoney
- syncNotifications.ts
- framework-support.mjs
- util.mjs
- edge-heavy-import.mjs
- turbo-force-bypass.mjs
- use-cache-date-stamp.mjs
- deploy.sh
- deploy-codex.sh
- select-candidates.mjs
- unoptimized-image.mjs
- undeclared-dep.mjs
- extract-missing.mjs
- ResizeObserverMock
- external-api-slow.mjs
- platform-bot-protection.mjs
- platform-fluid-compute.mjs
- usage-spike-triage.mjs
- package.json
- build-minutes-fanout.mjs
- isr-overrevalidation.mjs
- middleware-heavy.mjs
- observability-events-attribution.mjs
- auto-i18n.ts
- find_waterfall.js
- numberToWords.ts
- audio.ts
- usePrintJobStats.ts
- useRepairStats.ts
- reportsApi.ts
- jest
- jest-environment-jsdom
- useSupplierStats.ts
- cold-start.mjs
- @vitejs/plugin-react
- vitest
- vitestMock.cjs
- cwv-poor.mjs
- merge-dict.mjs
- fix-newlines.mjs
- networkSignal.ts
- eslint-plugin-react-hooks
- eslint
- sync/README.md
- offline/README.md
- postcss-preset-mantine
- postcss-simple-vars
- ts-morph
- @types/react
- typescript-eslint
- wait-and-merge.mjs

## God Nodes (most connected - your core abstractions)
1. `t()` - 173 edges
2. `useIsMobile()` - 91 edges
3. `formatMoney()` - 72 edges
4. `useAppSelector` - 65 edges
5. `verifyClaim()` - 42 edges
6. `useAppDispatch` - 40 edges
7. `queryKeys` - 34 edges
8. `renderReport()` - 33 edges
9. `ApiClient` - 31 edges
10. `extractClaims()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `AppShell()` --indirect_call--> `selectIsAuthenticated()`  [INFERRED]
  src/app/layout/AppShell.tsx → src/store/slices/authSlice.ts
- `Sidebar()` --indirect_call--> `selectUserPermissions()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `Sidebar()` --indirect_call--> `selectUserRole()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `BillingCounter()` --indirect_call--> `selectShopProfile()`  [INFERRED]
  src/features/billing/components/BillingCounter.tsx → src/store/slices/settingsSlice.ts
- `PaymentPanel` --indirect_call--> `selectPrintSettings()`  [INFERRED]
  src/features/billing/components/PaymentPanel.tsx → src/store/slices/settingsSlice.ts

## Import Cycles
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Communities (151 total, 24 thin omitted)

### Community 0 - "useCategories.ts"
Cohesion: 0.14
Nodes (20): createCategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), CategoryManagerModal(), AddSubcategoryPayload, buildCategoryLookup() (+12 more)

### Community 1 - "dedup-recs.mjs"
Cohesion: 0.08
Nodes (57): affectedFiles(), appliesAlsoEntry(), cacheLifeIntent(), dedupEditTarget(), dedupeRecommendations(), dedupIntent(), firstAffectedFile(), fixShape() (+49 more)

### Community 2 - "workspace-resolver.mjs"
Cohesion: 0.07
Nodes (54): buildPackageLookup(), buildResolver(), DEFAULT_RESOLVE_OPTIONS, detectMonorepoRoot(), escapeRegExp(), expandParts(), expandResolvedSpecifier(), expandPureBarrel() (+46 more)

### Community 3 - "useSupplierProducts.ts"
Cohesion: 0.15
Nodes (25): usePurchasesBySupplier(), fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, SupplierProductListResponseData (+17 more)

### Community 4 - "lib/render-report.mjs"
Cohesion: 0.05
Nodes (85): buildBudgetSummary(), buildChatPreview(), buildExactChatMessage(), buildOptions(), buildPrintCheck(), buildQuestionPayload(), buildQuestionText(), renderBudgetSummaryMarkdown() (+77 more)

### Community 5 - "CustomerList.tsx"
Cohesion: 0.11
Nodes (33): resolveOrCreateCustomer(), createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerFormContent() (+25 more)

### Community 7 - "sanitizers/index.mjs"
Cohesion: 0.11
Nodes (13): applyDollarStrip(), stripDollarLiterals(), metadata, STRING_FIELDS, metadata, STRING_FIELDS, metadata, STRING_FIELDS (+5 more)

### Community 8 - "useAppSelector"
Cohesion: 0.13
Nodes (32): Sidebar(), LowStockNotifier(), notifiedProductIds, useLowStockProducts(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues (+24 more)

### Community 9 - "cartSlice.ts"
Cohesion: 0.12
Nodes (37): useCartCheckout(), LineSourceType, CartItem, cartSlice, DiscountType, initialState, resetCartState(), saveHeldCartsToStorage() (+29 more)

### Community 10 - "t"
Cohesion: 0.07
Nodes (51): MobileSignUpForm(), MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps, HeldSalesDrawer(), HeldSalesDrawerProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps (+43 more)

### Community 11 - "providers.tsx"
Cohesion: 0.12
Nodes (16): App(), AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProviders(), AppProvidersProps, LanguageRemounter(), router, container (+8 more)

### Community 12 - "useModuleStats"
Cohesion: 0.23
Nodes (11): BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), depsChanged(), LiveQueryResult (+3 more)

### Community 13 - "gate-investigations.mjs"
Cohesion: 0.18
Nodes (15): applyAuthDisqualifier(), AUTH_ROUTE_REGEX, isAuthRoute(), CandidateContractError, candidateLabel(), nonEmptyString(), VALID_SCOPES, validateCandidate() (+7 more)

### Community 14 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.12
Nodes (26): StandalonePrintView, CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, SaleDocumentPreviewModal, DocumentPreviewSubject, SaleDocumentPreviewModal() (+18 more)

### Community 15 - "SupplierList.tsx"
Cohesion: 0.11
Nodes (30): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), FormContentProps, SupplierFormContent() (+22 more)

### Community 16 - "store/index.ts"
Cohesion: 0.13
Nodes (15): DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN, createReduxColorSchemeManager(), reduxColorSchemeManager, toAppScheme(), toMantineScheme(), AppDispatch (+7 more)

### Community 17 - "dependencies"
Cohesion: 0.05
Nodes (37): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/hooks, @mantine/modals (+29 more)

### Community 18 - "ConnectivityMonitor.ts"
Cohesion: 0.23
Nodes (11): env, probeClient, probeHealth(), ProbeResult, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME, HEALTH_PROBE_BACKOFF_MS, HEALTH_PROBE_INTERVAL_ONLINE_MS (+3 more)

### Community 19 - "compilerOptions"
Cohesion: 0.06
Nodes (33): .agents, .claude, dist, DOM, ES2023, .github, graphify-out, node_modules (+25 more)

### Community 20 - "UsersList.tsx"
Cohesion: 0.14
Nodes (25): RequireAdmin(), RequireAdminProps, UsersList, USER_ROLE_LABELS, USER_ROLES, UserRole, createUser(), deleteUser() (+17 more)

### Community 21 - "extract-claims.mjs"
Cohesion: 0.09
Nodes (54): asArray(), cacheRecommendationFiles(), extractClaims(), isCacheCandidate(), mentionsAuthSensitiveParallelization(), mentionsCachedNotFoundOr404(), mentionsCacheLifeCdnHeaderClaim(), mentionsCacheLifetimeChange() (+46 more)

### Community 22 - "verify-claim.mjs"
Cohesion: 0.06
Nodes (85): findRecContradictions(), asArray(), buildScriptHasMigrationSideEffect(), cacheInvalidationFileCache, cacheLifeNeedsContentFreshnessProof(), cleanHeaderValue(), compilePattern(), configContainsTag() (+77 more)

### Community 23 - "scanners/index.mjs"
Cohesion: 0.11
Nodes (18): isApplicable(), metadata, scan(), isApplicable(), metadata, scan(), scanners, metadata (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, glob, globals, identity-obj-proxy, devDependencies (+23 more)

### Community 25 - "router.tsx"
Cohesion: 0.09
Nodes (30): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, HeldSalesDrawer, KeyboardShortcutsModal, ROUTE_TITLES, BILLING_HEADER_HEIGHT (+22 more)

### Community 26 - "date.ts"
Cohesion: 0.12
Nodes (24): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+16 more)

### Community 27 - "BillingCounter.tsx"
Cohesion: 0.19
Nodes (21): Header(), HeaderProps, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+13 more)

### Community 28 - "moneyFormUtils.ts"
Cohesion: 0.16
Nodes (23): CURRENCY, RawDashboardEntities, useAllEmployees(), PrintJobFormModal(), PrintJobFormModalProps, PrintJob, BackendRepair, RepairFormModal() (+15 more)

### Community 29 - "useDashboardLivePulse.ts"
Cohesion: 0.17
Nodes (16): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, DashboardPage(), computeDashboardData(), INITIAL_DASHBOARD_DATA, useDashboardLivePulse(), ActivityEvent (+8 more)

### Community 30 - "CreditNoteModal.tsx"
Cohesion: 0.12
Nodes (19): BackendCreditNoteItem, CreateCreditNoteItemInput, CreditNoteItemCondition, CreditNoteItemDisposition, CreditNoteModalProps, ExchangeLine, LineState, TODO: this override is Admin-only, but the copy at line ~434 tells the (+11 more)

### Community 31 - "InvoicesList.tsx"
Cohesion: 0.18
Nodes (17): fetchInvoices(), useAllInvoices(), CreditNoteModal, InvoiceDetailDrawer(), InvoiceDetailDrawerProps, SaleDocumentPreviewModal, sectionLabelStyle, applyLocalInvoiceFilters() (+9 more)

### Community 32 - "categoryIcons.ts"
Cohesion: 0.31
Nodes (8): CatalogCategoryFilter, CategoryIconInfo, CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, TablerIcon, Category, TablerIconComponent, TablerIconMap

### Community 33 - "CartPanel.tsx"
Cohesion: 0.14
Nodes (16): CartLineItem, CartLineItemProps, CartPanelProps, EmployeeList(), ConfirmDialog(), ConfirmDialogProps, DataTable(), DataTableProps (+8 more)

### Community 34 - "support-topics.mjs"
Cohesion: 0.13
Nodes (26): citationApplies(), HERE, KNOWN_CANDIDATE_KINDS, loadSupportTopics(), matchesCandidateKind(), matchesCandidateMetrics(), matchesCandidateRoutePatterns(), matchesFrameworks() (+18 more)

### Community 36 - "lib/reconcile-candidates.mjs"
Cohesion: 0.26
Nodes (24): arrayAt(), deploymentRegressionDecision(), dropWithObservation(), formatInteger(), formatMs(), formatPct(), isrOverrevalidationDecision(), numberAt() (+16 more)

### Community 37 - "useLayoutTier"
Cohesion: 0.19
Nodes (11): AppShell(), BillingPageSkeleton(), FILL, useLayoutTier(), activeScopes, handleKeyDown(), isInputFocused(), parseCombo() (+3 more)

### Community 38 - "PrintJobList.tsx"
Cohesion: 0.17
Nodes (21): BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchAllPrintJobs(), fetchPrintJobs(), FetchPrintJobsParams, PrintJobListResponseData (+13 more)

### Community 39 - "CatalogPanel.tsx"
Cohesion: 0.10
Nodes (40): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, buildCatalogCategoryFilters(), getCategoryIconInfo() (+32 more)

### Community 40 - "vercel.mjs"
Cohesion: 0.14
Nodes (24): aggregateServicesByName(), baselineStack(), checkAuth(), checkCliVersion(), detectNextCacheComponents(), detectStack(), exec, extractBillingPlan() (+16 more)

### Community 41 - "investigation-brief.mjs"
Cohesion: 0.19
Nodes (23): absoluteBriefPath(), briefRoots(), buildBrief(), cachePolicyGuidance(), capBriefFiles(), closestAncestorLayoutFiles(), isCatchAllPlaceholder(), isDynamicPlaceholder() (+15 more)

### Community 42 - "creditNotesApi.ts"
Cohesion: 0.13
Nodes (23): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+15 more)

### Community 43 - "repairsApi.ts"
Cohesion: 0.17
Nodes (18): calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchAllRepairs(), FetchRepairsParams, RepairListResponseData, toRepairJob(), updateRepairJobRaw() (+10 more)

### Community 44 - "collect-signals.mjs"
Cohesion: 0.17
Nodes (21): defaultNormalize(), normalizeColdStart(), normalizerFor(), QUERIES, TIME_WINDOW, checkObservabilityPlusConfiguration(), classifyObservabilityPlusConfiguration(), getProjectConfig() (+13 more)

### Community 45 - "settingsSlice.ts"
Cohesion: 0.15
Nodes (16): renderSection(), SettingsPage(), DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings (+8 more)

### Community 46 - "ThinkingOrb.tsx"
Cohesion: 0.15
Nodes (22): clampNormalizeData(), create3DRotation(), DEFAULT_LABELS, Dot, drawDots(), drawLines(), fibonacciSphere(), fract() (+14 more)

### Community 47 - "citations.mjs"
Cohesion: 0.17
Nodes (19): compareVersion(), HERE, isKnownUrl(), LIBRARY_PATH, libraryForStack(), loadLibrary(), lookupSkillRule(), lookupUrl() (+11 more)

### Community 48 - "route-normalize.mjs"
Cohesion: 0.21
Nodes (18): candidateKey(), canonicalizeBranchPrefix(), canonicalizeRoute(), decodeSegmentToken(), dedupeCandidates(), firstRouteSegment(), isBase64FlagState(), isDynamicPlaceholder() (+10 more)

### Community 49 - "useEmployees.ts"
Cohesion: 0.18
Nodes (15): createEmployee(), deleteEmployee(), deleteEmployees(), EmployeeListParams, fetchEmployees(), updateEmployee(), DeleteEmployeePayload, DeleteEmployeesPayload (+7 more)

### Community 50 - "ProductTable.tsx"
Cohesion: 0.07
Nodes (56): adjustStock(), createProduct(), deleteProducts(), fetchLowStockProducts(), fetchProductById(), fetchProductMovements(), fetchProducts(), ProductListParams (+48 more)

### Community 51 - "PaymentPanel.tsx"
Cohesion: 0.10
Nodes (29): PAYMENT_METHODS, DiscountPopover(), DiscountPopoverProps, PaymentPanel, PaymentPanelProps, useCartCustomer(), getSaleHeroPresentation(), SaleHeroPresentation (+21 more)

### Community 52 - "scripts/deep-dive.mjs"
Cohesion: 0.17
Nodes (17): escapeODataString(), mergeIntoEvidence(), odataEq(), SCANNER_KINDS, simplify(), SPEC_GENERATORS, specsForCandidate(), readProjectJson() (+9 more)

### Community 53 - "Sidebar.tsx"
Cohesion: 0.18
Nodes (14): RequirePermission(), RequirePermissionProps, SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, Permission (+6 more)

### Community 54 - "SyncPanel.tsx"
Cohesion: 0.16
Nodes (16): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+8 more)

### Community 55 - "tablerIcons.ts"
Cohesion: 0.17
Nodes (18): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+10 more)

### Community 56 - "invoicesApi.ts"
Cohesion: 0.11
Nodes (29): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+21 more)

### Community 57 - "LocalStorageStore"
Cohesion: 0.16
Nodes (6): InvoiceItem, getPrintCountForInvoice(), getPrintLogsForInvoice(), PrintLogEntry, printLogStore, LocalStorageStore

### Community 58 - "CategoryManagerModal.tsx"
Cohesion: 0.17
Nodes (13): createSubcategory(), AddSubcategoryRow(), CategoryManagerModalProps, CategoryManagerModal, useCreateSubcategory(), ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps (+5 more)

### Community 59 - "authSlice.ts"
Cohesion: 0.19
Nodes (15): AuthInitializer(), STORAGE_KEYS, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse (+7 more)

### Community 60 - "gates/index.mjs"
Cohesion: 0.16
Nodes (16): GATE_VERSION, gates, MAX_CODE_CANDIDATES, metadata, HERE, main(), REFS, renderCandidates() (+8 more)

### Community 61 - "withRouteShapeWarnings"
Cohesion: 0.14
Nodes (17): extractErrors(), extractFromStatusRows(), gate(), metadata, extractErrorRatesByRoute(), extractFunctionRoutes(), gate(), metadata (+9 more)

### Community 62 - "constants/index.ts"
Cohesion: 0.34
Nodes (9): JobStatus, EmployeeLogin, EmployeeRole, SplitType, UpdatePrintJobPayload, PrintJobInput, RepairJobInput, AssignmentInfo (+1 more)

### Community 63 - "purchasesApi.ts"
Cohesion: 0.26
Nodes (10): fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, PurchaseListResponseData, EnrichedStockPurchase, PurchaseProductSummary, PurchaseSupplierSummary (+2 more)

### Community 64 - "CLAUDE.md"
Cohesion: 0.12
Nodes (15): Animation performance, API client conventions, Architecture, Center modals — one visual family, Commands, Dashboard KPI cards, graphify, Keyboard shortcuts (+7 more)

### Community 65 - "collect-sub-agent-outputs.mjs"
Cohesion: 0.24
Nodes (16): collectInputFiles(), escapeRegExp(), extractFenceBlocks(), extractJsonValue(), findBalancedJsonSpans(), inferCandidateRefFromFile(), isRecordObject(), log() (+8 more)

### Community 66 - "merge-signals.mjs"
Cohesion: 0.23
Nodes (16): annotateCodebaseScan(), annotateFinding(), assertObject(), bestRouteSummary(), buildRouteMetricIndex(), exists(), formatRouteSignal(), hasTraffic() (+8 more)

### Community 67 - "prepare-investigation-brief.mjs"
Cohesion: 0.24
Nodes (15): citationSubset(), inferFrameworkPlaybook(), inferPlaybook(), candidateRefFor(), buildFanoutPlan(), buildManifest(), candidateFamilyKey(), HERE (+7 more)

### Community 68 - "middleware-broad-matcher.mjs"
Cohesion: 0.29
Nodes (6): isApplicable(), metadata, scan(), isApplicable(), metadata, scan()

### Community 69 - "throttle.mjs"
Cohesion: 0.17
Nodes (10): getMetricSemaphore, getMetricThrottle(), isRateLimited(), parsePositiveIntEnv(), resolveConcurrency(), resolveRateLimit(), retryOnRateLimit(), SemaphoreAbortError (+2 more)

### Community 70 - "offline/index.ts"
Cohesion: 0.16
Nodes (10): ConnectivityListener, ConnectivitySnapshot, ConnectivityState, OFFLINE_DB_NAME, STORAGE_QUOTA_WARN_RATIO, requestPersistentStorage(), StorageEstimate, db (+2 more)

### Community 71 - "common.ts"
Cohesion: 0.22
Nodes (7): fetchEmployeeEarnings(), useEmployeeEarnings(), EmployeeEarningRecord, InventoryStats, ApiResponse, PaginatedResponse, SelectOption

### Community 72 - "LoginForm.tsx"
Cohesion: 0.17
Nodes (16): EmailLoginScreen, loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView (+8 more)

### Community 73 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 74 - "client.ts"
Cohesion: 0.21
Nodes (12): buildParams(), isApiErrorLike(), MUTATING_METHODS, readServerTime(), RequestOptions, getDeviceId(), reportNetworkObservation(), HEADER_DEVICE_ID (+4 more)

### Community 75 - "hard-gates.mjs"
Cohesion: 0.33
Nodes (9): applyHardGates(), FLAGS_ENDPOINT, flagsEndpointReason(), isFlagsEndpointCandidate(), isWorkflowRuntimeEndpointCandidate(), normalizeRoute(), VERCEL_FLAGS_PACKAGES, WORKFLOW_ENDPOINT_PREFIXES (+1 more)

### Community 76 - "impact-label.mjs"
Cohesion: 0.38
Nodes (10): computeImpactLabel(), cwvIssue(), formatCwvIssue(), formatInteger(), joinEnglish(), parseSigNumber(), round1(), round2() (+2 more)

### Community 77 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, generate:icons, lint, preview, test (+4 more)

### Community 78 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 79 - "runVercelJson"
Cohesion: 0.27
Nodes (11): isDailyQuotaExceeded(), categorizeError(), getContract(), getMetricsSchema(), getTeamInfo(), getUsage(), hasObservabilityPlus(), queryMetric() (+3 more)

### Community 80 - "rate-limit.mjs"
Cohesion: 0.36
Nodes (7): apply(), collectText(), matchConcurrency(), matchProviders(), metadata, PROVIDER_LIMITS, PROVIDER_RE

### Community 81 - "count-correct.mjs"
Cohesion: 0.27
Nodes (8): apply(), COUNT_CLAIM_TYPES, metadata, rewriteCount(), apply(), metadata, STRIP_DIRECTIVES, escapeRegex()

### Community 83 - "usePayments.ts"
Cohesion: 0.30
Nodes (10): BackendPaymentRecord, fetchInvoicePayments(), PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, RecordPaymentPayload (+2 more)

### Community 84 - "AmountInput.tsx"
Cohesion: 0.24
Nodes (8): AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput, DiscountInputProps

### Community 85 - "scanner-driven.mjs"
Cohesion: 0.36
Nodes (8): candidateForGroup(), gate(), groupFindings(), metadata, observedCacheHitRate(), questionFor(), SCANNER_GATES, uniqueStrings()

### Community 87 - "billing/types.ts"
Cohesion: 0.38
Nodes (5): PaymentMethod, CreditNote, SplitPaymentDetail, CartState, HeldCart

### Community 88 - "large-static-asset.mjs"
Cohesion: 0.36
Nodes (7): formatBytes(), metadata, scan(), shouldSkip(), SKIP_EXTENSIONS, SKIP_PATH_PREFIXES, walk()

### Community 89 - "docs-library.json"
Cohesion: 0.25
Nodes (7): applicableFrameworksSyntax, lastVerified, ruleSkillRefs, $schema, schemaVersion, urls, version

### Community 90 - "formatMoney"
Cohesion: 0.09
Nodes (34): queryKeys, PERMISSIONS, CustomerDetailDrawer(), CustomerDetailDrawerProps, EmployeeDetailDrawer(), EmployeeDetailDrawerProps, EmployeeFormModal(), EmployeeFormModalProps (+26 more)

### Community 91 - "syncNotifications.ts"
Cohesion: 0.36
Nodes (4): notifyBackOnline(), notifySyncComplete(), notifyWentOffline(), showOrUpdate()

### Community 92 - "framework-support.mjs"
Cohesion: 0.43
Nodes (6): classifyFrameworkSupport(), CORE_SUPPORTED_FRAMEWORKS, frameworkLabel(), LABELS, LIMITED_FRAMEWORKS, normalizeFramework()

### Community 93 - "util.mjs"
Cohesion: 0.19
Nodes (12): apply(), metadata, apply(), metadata, MODE_PATTERNS, countMatches(), findRepeated(), metadata (+4 more)

### Community 94 - "edge-heavy-import.mjs"
Cohesion: 0.48
Nodes (6): extractSpecifiers(), HEAVY_PATTERNS, isEdgeRuntimeFile(), isMiddleware(), metadata, scan()

### Community 95 - "turbo-force-bypass.mjs"
Cohesion: 0.48
Nodes (6): detectBuildCacheDisabled(), lineOfMatch(), metadata, safeScripts(), scan(), truncate()

### Community 96 - "use-cache-date-stamp.mjs"
Cohesion: 0.48
Nodes (6): classifySubtype(), collectRanges(), findMatchingParen(), isInsideAnyRange(), metadata, scan()

### Community 99 - "select-candidates.mjs"
Cohesion: 0.36
Nodes (8): candidateIdentity(), DEFAULT_KIND_CAPS, DIVERSITY_ELIGIBILITY, durationMsFromSignal(), isDiversityEligible(), numberFromEvidence(), numberFromSignal(), selectLaunchCandidates()

### Community 100 - "unoptimized-image.mjs"
Cohesion: 0.53
Nodes (5): isJsxLike(), isNextConfig(), metadata, scan(), snippet()

### Community 101 - "undeclared-dep.mjs"
Cohesion: 0.47
Nodes (5): apply(), extractCodeBlocks(), metadata, NODE_BUILTINS, pkgRoot()

### Community 102 - "extract-missing.mjs"
Cohesion: 0.33
Nodes (4): existingExtracted, files, foundStrings, newStrings

### Community 104 - "external-api-slow.mjs"
Cohesion: 0.60
Nodes (4): extractCallCounts(), extractExternalApis(), gate(), metadata

### Community 105 - "platform-bot-protection.mjs"
Cohesion: 0.60
Nodes (4): computeBotShare(), gate(), metadata, totalRequestsFromSignals()

### Community 106 - "platform-fluid-compute.mjs"
Cohesion: 0.60
Nodes (4): extractHighColdRoutes(), extractSlowHotRoutes(), gate(), metadata

### Community 107 - "usage-spike-triage.mjs"
Cohesion: 0.60
Nodes (4): aggregateSkuStats(), dayTotal(), gate(), metadata

### Community 108 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 109 - "build-minutes-fanout.mjs"
Cohesion: 0.67
Nodes (3): gate(), metadata, unique()

### Community 110 - "isr-overrevalidation.mjs"
Cohesion: 0.67
Nodes (3): extractRows(), gate(), metadata

### Community 111 - "middleware-heavy.mjs"
Cohesion: 0.67
Nodes (3): gate(), metadata, sumRows()

### Community 112 - "observability-events-attribution.mjs"
Cohesion: 0.67
Nodes (3): gate(), metadata, sumBilled()

### Community 113 - "auto-i18n.ts"
Cohesion: 0.40
Nodes (4): extractedMap, project, stringsExtracted, TARGET_ATTRIBUTES

### Community 116 - "audio.ts"
Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

### Community 117 - "usePrintJobStats.ts"
Cohesion: 0.70
Nodes (3): fetchPrintJobStats(), PrintJobStats, usePrintJobStats()

### Community 118 - "useRepairStats.ts"
Cohesion: 0.70
Nodes (3): fetchRepairStats(), RepairStats, useRepairStats()

### Community 119 - "reportsApi.ts"
Cohesion: 0.50
Nodes (3): DailySalesReportSummary, EmployeeCommissionsReportResponse, EmployeePerformanceEntry

### Community 122 - "useSupplierStats.ts"
Cohesion: 0.70
Nodes (3): fetchSupplierStats(), SupplierStats, useSupplierStats()

### Community 123 - "cold-start.mjs"
Cohesion: 0.67
Nodes (3): extractColdStarts(), gate(), metadata

### Community 136 - "cwv-poor.mjs"
Cohesion: 0.48
Nodes (6): byRoute(), gate(), metadata, ratioOverThreshold(), round2(), sumRows()

### Community 138 - "merge-dict.mjs"
Cohesion: 0.50
Nodes (3): extracted, merged, outDict

### Community 140 - "networkSignal.ts"
Cohesion: 0.40
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

## Knowledge Gaps
- **520 isolated node(s):** `Project`, `Commands`, `Responsive & mobile UI`, `Animation performance`, `UI copy — write for a non-technical shop user` (+515 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `useCategories.ts`, `useSupplierProducts.ts`, `CustomerList.tsx`, `useAppSelector`, `providers.tsx`, `SaleDocumentPreviewModal.tsx`, `SupplierList.tsx`, `UsersList.tsx`, `router.tsx`, `date.ts`, `BillingCounter.tsx`, `moneyFormUtils.ts`, `CreditNoteModal.tsx`, `InvoicesList.tsx`, `CartPanel.tsx`, `PrintJobList.tsx`, `CatalogPanel.tsx`, `repairsApi.ts`, `settingsSlice.ts`, `ProductTable.tsx`, `PaymentPanel.tsx`, `Sidebar.tsx`, `SyncPanel.tsx`, `tablerIcons.ts`, `CategoryManagerModal.tsx`, `LoginForm.tsx`, `formatMoney`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `gates` connect `gates/index.mjs` to `support-topics.mjs`, `lib/render-report.mjs`, `gate-investigations.mjs`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `t` to `useCategories.ts`, `useSupplierProducts.ts`, `CustomerList.tsx`, `useAppSelector`, `SaleDocumentPreviewModal.tsx`, `SupplierList.tsx`, `UsersList.tsx`, `date.ts`, `BillingCounter.tsx`, `moneyFormUtils.ts`, `CreditNoteModal.tsx`, `InvoicesList.tsx`, `CartPanel.tsx`, `CatalogPanel.tsx`, `ProductTable.tsx`, `PaymentPanel.tsx`, `Sidebar.tsx`, `SyncPanel.tsx`, `CategoryManagerModal.tsx`, `LoginForm.tsx`, `AmountInput.tsx`, `formatMoney`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `Project`, `Commands`, `Responsive & mobile UI` to the rest of the system?**
  _520 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useCategories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._
- **Should `dedup-recs.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07796610169491526 - nodes in this community are weakly interconnected._
- **Should `workspace-resolver.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07330827067669173 - nodes in this community are weakly interconnected._