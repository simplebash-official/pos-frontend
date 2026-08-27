# Graph Report - frontend  (2026-08-27)

## Corpus Check
- 643 files · ~328,332 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2518 nodes · 6609 edges · 145 communities (125 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `004bdca2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- common.ts
- dedup-recs.mjs
- workspace-resolver.mjs
- useSupplierProducts.ts
- lib/render-report.mjs
- CustomerList.tsx
- tablerIconShards/index.ts
- sanitizers/index.mjs
- useAppSelector
- cartSlice.ts
- useDashboardLivePulse.ts
- providers.tsx
- queryKeys.ts
- gate-investigations.mjs
- SaleDocumentPreviewModal.tsx
- SupplierList.tsx
- useIsMobile
- dependencies
- ConnectivityMonitor.ts
- compilerOptions
- UsersList.tsx
- extract-claims.mjs
- verify-claim.mjs
- lineOf
- devDependencies
- router.tsx
- constants/index.ts
- BillingCounter.tsx
- money.ts
- inventory/types.ts
- CreditNoteModal.tsx
- InvoicesList.tsx
- CatalogPanel.tsx
- DataTable.tsx
- support-topics.mjs
- ConnectivityMonitor
- lib/reconcile-candidates.mjs
- AppShell.tsx
- PrintJobList.tsx
- search.ts
- vercel.mjs
- investigation-brief.mjs
- creditNotesApi.ts
- RepairJobList.tsx
- collect-signals.mjs
- settingsSlice.ts
- ThinkingOrb.tsx
- citations.mjs
- route-normalize.mjs
- useEmployees.ts
- ProductTable.tsx
- posCalculations.ts
- scripts/deep-dive.mjs
- usePermissions.ts
- formatDateTime
- verifyClaim
- invoicesApi.ts
- LocalStorageStore
- SyncStatusBadge.tsx
- authSlice.ts
- gates/index.mjs
- withRouteShapeWarnings
- employees/types.ts
- SupplierDetailDrawer.tsx
- verify-and-regen.mjs
- collect-sub-agent-outputs.mjs
- merge-signals.mjs
- prepare-investigation-brief.mjs
- scanners/index.mjs
- throttle.mjs
- offline/index.ts
- verifyNextCacheComponentsRouteChainFile
- LoginForm.tsx
- date.ts
- client.ts
- hard-gates.mjs
- grade-recommendation.mjs
- scripts
- generate-icon-shards.mjs
- runVercelJson
- uncached-route.mjs
- count-correct.mjs
- Semaphore
- usePayments.ts
- SegmentedToggle.tsx
- scanner-driven.mjs
- verifyNextCacheLifetimeFreshnessSupported
- readClaimFile
- large-static-asset.mjs
- docs-library.json
- EmployeeList.tsx
- syncNotifications.ts
- framework-support.mjs
- cache-components-suspense-dedupe.mjs
- edge-heavy-import.mjs
- turbo-force-bypass.mjs
- use-cache-date-stamp.mjs
- deploy.sh
- deploy-codex.sh
- select-candidates.mjs
- unoptimized-image.mjs
- MobileSignUpForm.tsx
- Header.tsx
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
- missing-cache-headers.mjs
- find_waterfall.js
- numberToWords.ts
- dayjs
- SettingsNav.tsx
- @eslint/js
- identity-obj-proxy
- jest
- jest-environment-jsdom
- prettier
- @types/jest
- @vitejs/plugin-react
- vitest
- vitestMock.cjs
- cwv-poor.mjs
- app/App.tsx
- ReportsDashboard.tsx
- networkSignal.ts
- scripts/reconcile-candidates.mjs
- eslint
- sync/README.md
- offline/README.md

## God Nodes (most connected - your core abstractions)
1. `useIsMobile()` - 90 edges
2. `formatMoney()` - 71 edges
3. `useAppSelector` - 63 edges
4. `verifyClaim()` - 42 edges
5. `useAppDispatch` - 40 edges
6. `queryKeys` - 34 edges
7. `renderReport()` - 33 edges
8. `ApiClient` - 31 edges
9. `extractClaims()` - 31 edges
10. `ConnectivityMonitor` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Sidebar()` --indirect_call--> `selectUserPermissions()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `Sidebar()` --indirect_call--> `selectUserRole()`  [INFERRED]
  src/app/layout/Sidebar.tsx → src/store/slices/authSlice.ts
- `CreditNoteModalProps` --references--> `Invoice`  [EXTRACTED]
  src/features/invoices/components/CreditNoteModal.tsx → src/features/billing/types.ts
- `InvoiceDetailDrawerProps` --references--> `Invoice`  [EXTRACTED]
  src/features/invoices/components/InvoiceDetailDrawer.tsx → src/features/billing/types.ts
- `CompletedSaleData` --references--> `Invoice`  [EXTRACTED]
  src/store/slices/cartSlice.ts → src/features/billing/types.ts

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

## Communities (145 total, 20 thin omitted)

### Community 0 - "common.ts"
Cohesion: 0.10
Nodes (26): createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory(), AddSubcategoryRow(), CategoryManagerModal() (+18 more)

### Community 1 - "dedup-recs.mjs"
Cohesion: 0.08
Nodes (57): affectedFiles(), appliesAlsoEntry(), cacheLifeIntent(), dedupEditTarget(), dedupeRecommendations(), dedupIntent(), firstAffectedFile(), fixShape() (+49 more)

### Community 2 - "workspace-resolver.mjs"
Cohesion: 0.07
Nodes (54): buildPackageLookup(), buildResolver(), DEFAULT_RESOLVE_OPTIONS, detectMonorepoRoot(), escapeRegExp(), expandParts(), expandResolvedSpecifier(), expandPureBarrel() (+46 more)

### Community 3 - "useSupplierProducts.ts"
Cohesion: 0.17
Nodes (21): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, SupplierProductListResponseData, unlinkSupplierProduct() (+13 more)

### Community 4 - "lib/render-report.mjs"
Cohesion: 0.05
Nodes (85): buildBudgetSummary(), buildChatPreview(), buildExactChatMessage(), buildOptions(), buildPrintCheck(), buildQuestionPayload(), buildQuestionText(), renderBudgetSummaryMarkdown() (+77 more)

### Community 5 - "CustomerList.tsx"
Cohesion: 0.11
Nodes (36): resolveOrCreateCustomer(), createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerDetailDrawer() (+28 more)

### Community 6 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 7 - "sanitizers/index.mjs"
Cohesion: 0.06
Nodes (35): computeImpactLabel(), cwvIssue(), formatCwvIssue(), formatInteger(), joinEnglish(), parseSigNumber(), round1(), round2() (+27 more)

### Community 8 - "useAppSelector"
Cohesion: 0.15
Nodes (29): Sidebar(), SidebarProps, LowStockNotifier(), notifiedProductIds, useLowStockProducts(), ACCEPTED_TYPES, LogoUpload(), LogoUploadProps (+21 more)

### Community 9 - "cartSlice.ts"
Cohesion: 0.12
Nodes (38): PAYMENT_METHODS, PaymentMethod, CartLineItemProps, useCartCheckout(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice (+30 more)

### Community 10 - "useDashboardLivePulse.ts"
Cohesion: 0.12
Nodes (28): useAllInvoices(), CashShiftSummaryWidget(), CashShiftSummaryWidgetProps, DashboardKpiStrip(), DashboardKpiStripProps, DashboardPage(), FastMoversWidget(), FastMoversWidgetProps (+20 more)

### Community 11 - "providers.tsx"
Cohesion: 0.17
Nodes (11): AppUpdatePrompt(), HeldCartCatchupNotifier(), AppProvidersProps, AuthInitializer(), selectHeldCarts(), darkTokens, lightTokens, mantineCssVariableResolver() (+3 more)

### Community 12 - "queryKeys.ts"
Cohesion: 0.12
Nodes (25): queryKeys, BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchInventoryStats() (+17 more)

### Community 13 - "gate-investigations.mjs"
Cohesion: 0.18
Nodes (15): applyAuthDisqualifier(), AUTH_ROUTE_REGEX, isAuthRoute(), CandidateContractError, candidateLabel(), nonEmptyString(), VALID_SCOPES, validateCandidate() (+7 more)

### Community 14 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.11
Nodes (26): StandalonePrintView, CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, SaleDocumentPreviewModal, DocumentPreviewSubject, SaleDocumentPreviewModal() (+18 more)

### Community 15 - "SupplierList.tsx"
Cohesion: 0.17
Nodes (20): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), applyLocalSupplierFilters(), isSupplierFilterActive() (+12 more)

### Community 16 - "useIsMobile"
Cohesion: 0.10
Nodes (30): CartLineItem, DiscountPopover(), HeldSalesDrawer(), HeldSalesDrawerProps, ProductPickerModalProps, SupplierPickerModal(), SupplierPickerModalProps, DetailDrawer() (+22 more)

### Community 17 - "dependencies"
Cohesion: 0.06
Nodes (35): axios, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/hooks, @mantine/modals, @mantine/notifications (+27 more)

### Community 18 - "ConnectivityMonitor.ts"
Cohesion: 0.18
Nodes (14): env, probeClient, probeHealth(), ProbeResult, DEGRADED_LATENCY_MS, HEADER_DEVICE_ID, HEADER_IDEMPOTENCY_KEY, HEADER_SERVER_TIME (+6 more)

### Community 19 - "compilerOptions"
Cohesion: 0.06
Nodes (33): .agents, .claude, dist, DOM, ES2023, .github, graphify-out, node_modules (+25 more)

### Community 20 - "UsersList.tsx"
Cohesion: 0.16
Nodes (23): UsersList, USER_ROLE_LABELS, USER_ROLES, UserRole, createUser(), deleteUser(), fetchUsers(), updateUser() (+15 more)

### Community 21 - "extract-claims.mjs"
Cohesion: 0.18
Nodes (31): asArray(), cacheRecommendationFiles(), extractClaims(), isCacheCandidate(), mentionsAuthSensitiveParallelization(), mentionsCachedNotFoundOr404(), mentionsCacheLifeCdnHeaderClaim(), mentionsCacheLifetimeChange() (+23 more)

### Community 22 - "verify-claim.mjs"
Cohesion: 0.11
Nodes (31): buildScriptHasMigrationSideEffect(), cacheInvalidationFileCache, cleanHeaderValue(), configContainsTag(), escapeRegExp(), extractHeaderValues(), formatPct(), functionStatusForRoute() (+23 more)

### Community 23 - "lineOf"
Cohesion: 0.11
Nodes (22): apply(), metadata, apply(), metadata, MODE_PATTERNS, isApplicable(), metadata, scan() (+14 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint-config-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, fake-indexeddb, globals, devDependencies, eslint-config-prettier, eslint-plugin-react-hooks (+23 more)

### Community 25 - "router.tsx"
Cohesion: 0.09
Nodes (22): RequireAdmin(), RequireAdminProps, BillingCounter, CustomerList, DashboardPage, EmailLoginScreen, EmployeeList, InvoicesList (+14 more)

### Community 26 - "constants/index.ts"
Cohesion: 0.05
Nodes (48): NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, STORAGE_KEYS, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS, SKELETON_WIDTH_PATTERN (+40 more)

### Community 27 - "BillingCounter.tsx"
Cohesion: 0.13
Nodes (27): BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps (+19 more)

### Community 28 - "money.ts"
Cohesion: 0.17
Nodes (25): CURRENCY, RawDashboardEntities, EmployeeFormModal(), EmployeeFormModalProps, Employee, EmployeeInput, BackendRepair, RepairFormModal() (+17 more)

### Community 29 - "inventory/types.ts"
Cohesion: 0.10
Nodes (29): ProductsPageData, ProductCatalogTree, ProductCatalogTreeProps, ProductHierarchy, FormContentProps, ProductFormContent(), ProductFormModal(), ProductFormModalProps (+21 more)

### Community 30 - "CreditNoteModal.tsx"
Cohesion: 0.13
Nodes (21): BackendCreditNoteItem, CreateCreditNoteItemInput, CreditNoteItemCondition, CreditNoteItemDisposition, CreditNoteModal(), CreditNoteModalProps, ExchangeLine, LineState (+13 more)

### Community 31 - "InvoicesList.tsx"
Cohesion: 0.21
Nodes (14): fetchInvoices(), CreditNoteModal, InvoiceDetailDrawer(), InvoiceDetailDrawerProps, SaleDocumentPreviewModal, sectionLabelStyle, applyLocalInvoiceFilters(), InvoiceFilters (+6 more)

### Community 32 - "CatalogPanel.tsx"
Cohesion: 0.16
Nodes (23): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+15 more)

### Community 33 - "DataTable.tsx"
Cohesion: 0.25
Nodes (10): ConfirmDialog(), ConfirmDialogProps, Column, DataTable(), DataTableProps, buildGridTemplateColumns(), getAvatarColor(), getInitials() (+2 more)

### Community 34 - "support-topics.mjs"
Cohesion: 0.13
Nodes (26): citationApplies(), HERE, KNOWN_CANDIDATE_KINDS, loadSupportTopics(), matchesCandidateKind(), matchesCandidateMetrics(), matchesCandidateRoutePatterns(), matchesFrameworks() (+18 more)

### Community 36 - "lib/reconcile-candidates.mjs"
Cohesion: 0.35
Nodes (20): arrayAt(), deploymentRegressionDecision(), dropWithObservation(), formatInteger(), formatMs(), formatPct(), isrOverrevalidationDecision(), numberAt() (+12 more)

### Community 37 - "AppShell.tsx"
Cohesion: 0.13
Nodes (18): AppShell(), HeldSalesDrawer, KeyboardShortcutsModal, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH (+10 more)

### Community 38 - "PrintJobList.tsx"
Cohesion: 0.15
Nodes (23): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchAllPrintJobs(), fetchPrintJobs() (+15 more)

### Community 39 - "search.ts"
Cohesion: 0.16
Nodes (25): SearchHighlightProps, QueryKeyFactory, useBackendFilteredList(), UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex(), IndexedField (+17 more)

### Community 40 - "vercel.mjs"
Cohesion: 0.14
Nodes (24): aggregateServicesByName(), baselineStack(), checkAuth(), checkCliVersion(), detectNextCacheComponents(), detectStack(), exec, extractBillingPlan() (+16 more)

### Community 41 - "investigation-brief.mjs"
Cohesion: 0.19
Nodes (23): absoluteBriefPath(), briefRoots(), buildBrief(), cachePolicyGuidance(), capBriefFiles(), closestAncestorLayoutFiles(), isCatchAllPlaceholder(), isDynamicPlaceholder() (+15 more)

### Community 42 - "creditNotesApi.ts"
Cohesion: 0.13
Nodes (24): BackendCreditNote, BackendCreditNoteExchangeItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData, fetchCreditNoteById() (+16 more)

### Community 43 - "RepairJobList.tsx"
Cohesion: 0.18
Nodes (21): calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchAllRepairs(), fetchRepairs(), FetchRepairsParams, RepairListResponseData, toRepairJob() (+13 more)

### Community 44 - "collect-signals.mjs"
Cohesion: 0.17
Nodes (21): defaultNormalize(), normalizeColdStart(), normalizerFor(), QUERIES, TIME_WINDOW, checkObservabilityPlusConfiguration(), classifyObservabilityPlusConfiguration(), getProjectConfig() (+13 more)

### Community 45 - "settingsSlice.ts"
Cohesion: 0.18
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

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
Cohesion: 0.19
Nodes (15): createEmployee(), deleteEmployee(), deleteEmployees(), EmployeeListParams, fetchEmployees(), updateEmployee(), EmployeeList(), DeleteEmployeePayload (+7 more)

### Community 50 - "ProductTable.tsx"
Cohesion: 0.10
Nodes (32): adjustStock(), createProduct(), deleteProducts(), fetchLowStockProducts(), fetchProductById(), fetchProductMovements(), fetchProducts(), fetchProductSerials() (+24 more)

### Community 51 - "posCalculations.ts"
Cohesion: 0.15
Nodes (19): PaymentPanel, calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculatePaymentState(), calculateQuickTenderSuggestions(), calculateReturnTotals(), CartLineItemSource (+11 more)

### Community 52 - "scripts/deep-dive.mjs"
Cohesion: 0.17
Nodes (17): escapeODataString(), mergeIntoEvidence(), odataEq(), SCANNER_KINDS, simplify(), SPEC_GENERATORS, specsForCandidate(), readProjectJson() (+9 more)

### Community 53 - "usePermissions.ts"
Cohesion: 0.33
Nodes (8): RequirePermission(), RequirePermissionProps, Permission, PermissionGuardProps, useHasAnyPermission(), useHasPermission(), usePermissions(), selectUserPermissions()

### Community 54 - "formatDateTime"
Cohesion: 0.16
Nodes (18): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+10 more)

### Community 55 - "verifyClaim"
Cohesion: 0.18
Nodes (19): recText(), verifyAuthGuardParallelizationSafety(), verifyCache404LongTtlSafety(), verifyCachePolicyPositiveOrNoReadyRec(), verifyCacheVaryCardinalitySafe(), verifyClaim(), verifyImmutableDynamicRouteSafety(), verifyNextCacheComponentsRouteSegmentConfig() (+11 more)

### Community 56 - "invoicesApi.ts"
Cohesion: 0.11
Nodes (29): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+21 more)

### Community 57 - "LocalStorageStore"
Cohesion: 0.16
Nodes (6): InvoiceItem, getPrintCountForInvoice(), getPrintLogsForInvoice(), PrintLogEntry, printLogStore, LocalStorageStore

### Community 58 - "SyncStatusBadge.tsx"
Cohesion: 0.23
Nodes (9): SyncStatusBadgeProps, ExpandableCard(), ExpandableCardAction(), ExpandableCardActionProps, ExpandableCardGroup(), ExpandableCardGroupProps, ExpandableCardProps, InteractiveTooltip() (+1 more)

### Community 59 - "authSlice.ts"
Cohesion: 0.16
Nodes (20): GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, getMeApi(), AuthUser, LoginPayload, LoginResponse (+12 more)

### Community 60 - "gates/index.mjs"
Cohesion: 0.16
Nodes (13): extractColdStarts(), gate(), metadata, GATE_VERSION, gates, MAX_CODE_CANDIDATES, metadata, HERE (+5 more)

### Community 61 - "withRouteShapeWarnings"
Cohesion: 0.29
Nodes (9): extractErrors(), extractFromStatusRows(), gate(), metadata, extractErrorRatesByRoute(), extractFunctionRoutes(), gate(), metadata (+1 more)

### Community 62 - "employees/types.ts"
Cohesion: 0.30
Nodes (12): JobStatus, EmployeeLogin, EmployeeRole, SplitType, BackendPrintJob, PrintJobFormModalProps, PrintJob, PrintJobInput (+4 more)

### Community 63 - "SupplierDetailDrawer.tsx"
Cohesion: 0.13
Nodes (26): useAllProducts(), createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, PurchaseListResponseData, ReceiveStockModal() (+18 more)

### Community 64 - "verify-and-regen.mjs"
Cohesion: 0.22
Nodes (14): summarizeClaimResults(), applyQualityFloor(), deriveProjectFacts(), findRecContradictions(), deriveRootFromSignals(), detectRepoRoot(), fileResolvesAt(), pickProbeFile() (+6 more)

### Community 65 - "collect-sub-agent-outputs.mjs"
Cohesion: 0.24
Nodes (16): collectInputFiles(), escapeRegExp(), extractFenceBlocks(), extractJsonValue(), findBalancedJsonSpans(), inferCandidateRefFromFile(), isRecordObject(), log() (+8 more)

### Community 66 - "merge-signals.mjs"
Cohesion: 0.23
Nodes (16): annotateCodebaseScan(), annotateFinding(), assertObject(), bestRouteSummary(), buildRouteMetricIndex(), exists(), formatRouteSignal(), hasTraffic() (+8 more)

### Community 67 - "prepare-investigation-brief.mjs"
Cohesion: 0.24
Nodes (15): citationSubset(), inferFrameworkPlaybook(), inferPlaybook(), candidateRefFor(), buildFanoutPlan(), buildManifest(), candidateFamilyKey(), HERE (+7 more)

### Community 68 - "scanners/index.mjs"
Cohesion: 0.17
Nodes (11): scanners, isApplicable(), metadata, scan(), metadata, HERE, main(), REFS (+3 more)

### Community 69 - "throttle.mjs"
Cohesion: 0.17
Nodes (10): getMetricSemaphore, getMetricThrottle(), isRateLimited(), parsePositiveIntEnv(), resolveConcurrency(), resolveRateLimit(), retryOnRateLimit(), SemaphoreAbortError (+2 more)

### Community 70 - "offline/index.ts"
Cohesion: 0.18
Nodes (9): ConnectivityListener, ConnectivityState, OFFLINE_DB_NAME, STORAGE_QUOTA_WARN_RATIO, requestPersistentStorage(), StorageEstimate, db, OfflineDb (+1 more)

### Community 71 - "verifyNextCacheComponentsRouteChainFile"
Cohesion: 0.15
Nodes (15): asArray(), firstAccessiblePath(), firstDynamicRouteChainReason(), isCatchAllPlaceholder(), isDynamicPlaceholder(), layoutAppliesToCandidateRoute(), normalizeProjectRootDirectory(), normalizeRouteForLayoutMatch() (+7 more)

### Community 72 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (14): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+6 more)

### Community 73 - "date.ts"
Cohesion: 0.45
Nodes (7): ModernClock(), ModernClockProps, ClockTimeParts, formatClockDate(), formatClockTime(), formatDate(), parseClockTimeParts()

### Community 74 - "client.ts"
Cohesion: 0.14
Nodes (13): ApiClient, buildParams(), isApiErrorLike(), MUTATING_METHODS, readServerTime(), RequestOptions, getDeviceId(), DailySalesReportSummary (+5 more)

### Community 75 - "hard-gates.mjs"
Cohesion: 0.33
Nodes (9): applyHardGates(), FLAGS_ENDPOINT, flagsEndpointReason(), isFlagsEndpointCandidate(), isWorkflowRuntimeEndpointCandidate(), normalizeRoute(), VERCEL_FLAGS_PACKAGES, WORKFLOW_ENDPOINT_PREFIXES (+1 more)

### Community 76 - "grade-recommendation.mjs"
Cohesion: 0.39
Nodes (11): grade(), gradeRecommendation(), isAccountScope(), roundTo(), scoreActionability(), scoreEvidence(), scoreEvidenceAccount(), scoreGrounding() (+3 more)

### Community 77 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, generate:icons, lint, preview, test (+4 more)

### Community 78 - "generate-icon-shards.mjs"
Cohesion: 0.18
Nodes (8): barrelPath, keys, loaderEntries, outDir, projectRoot, scriptDir, shards, total

### Community 79 - "runVercelJson"
Cohesion: 0.27
Nodes (11): isDailyQuotaExceeded(), categorizeError(), getContract(), getMetricsSchema(), getTeamInfo(), getUsage(), hasObservabilityPlus(), queryMetric() (+3 more)

### Community 80 - "uncached-route.mjs"
Cohesion: 0.24
Nodes (8): Candidate, CandidateScope, GateMetadata, Signals, extractCacheHitRates(), extractMethodShares(), gate(), metadata

### Community 81 - "count-correct.mjs"
Cohesion: 0.27
Nodes (8): apply(), COUNT_CLAIM_TYPES, metadata, rewriteCount(), apply(), metadata, STRIP_DIRECTIVES, escapeRegex()

### Community 83 - "usePayments.ts"
Cohesion: 0.30
Nodes (10): BackendPaymentRecord, fetchInvoicePayments(), PaymentRecord, recordPayment(), RecordPaymentInput, toPaymentRecord(), NO_PAYMENTS, RecordPaymentPayload (+2 more)

### Community 84 - "SegmentedToggle.tsx"
Cohesion: 0.17
Nodes (11): DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP, DiscountInput (+3 more)

### Community 85 - "scanner-driven.mjs"
Cohesion: 0.36
Nodes (8): candidateForGroup(), gate(), groupFindings(), metadata, observedCacheHitRate(), questionFor(), SCANNER_GATES, uniqueStrings()

### Community 86 - "verifyNextCacheLifetimeFreshnessSupported"
Cohesion: 0.28
Nodes (9): cacheLifeNeedsContentFreshnessProof(), dedupeCacheTags(), execFileP, extractCacheTags(), extractCacheTagsFromFiles(), readCacheInvalidationFiles(), rgRelevantFiles(), verifyNextCacheLifetimeFreshnessSupported() (+1 more)

### Community 87 - "readClaimFile"
Cohesion: 0.31
Nodes (9): compilePattern(), readClaimFile(), snippetFoundElsewhere(), verifyCodeSnippet(), verifyPatternAbsent(), verifyPatternCount(), verifyPatternExists(), verifyRepoCount() (+1 more)

### Community 88 - "large-static-asset.mjs"
Cohesion: 0.36
Nodes (7): formatBytes(), metadata, scan(), shouldSkip(), SKIP_EXTENSIONS, SKIP_PATH_PREFIXES, walk()

### Community 89 - "docs-library.json"
Cohesion: 0.25
Nodes (7): applicableFrameworksSyntax, lastVerified, ruleSkillRefs, $schema, schemaVersion, urls, version

### Community 90 - "EmployeeList.tsx"
Cohesion: 0.13
Nodes (16): PERMISSIONS, fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, useEmployeeEarnings(), EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, MetricCardDef (+8 more)

### Community 91 - "syncNotifications.ts"
Cohesion: 0.36
Nodes (4): notifyBackOnline(), notifySyncComplete(), notifyWentOffline(), showOrUpdate()

### Community 92 - "framework-support.mjs"
Cohesion: 0.43
Nodes (6): classifyFrameworkSupport(), CORE_SUPPORTED_FRAMEWORKS, frameworkLabel(), LABELS, LIMITED_FRAMEWORKS, normalizeFramework()

### Community 93 - "cache-components-suspense-dedupe.mjs"
Cohesion: 0.48
Nodes (6): countMatches(), findRepeated(), metadata, record(), scan(), truncate()

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

### Community 101 - "MobileSignUpForm.tsx"
Cohesion: 0.40
Nodes (3): MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps

### Community 102 - "Header.tsx"
Cohesion: 0.31
Nodes (7): Header(), HeaderProps, useCartSound(), CockpitHeader(), CockpitHeaderProps, selectAuthUser(), selectSoundEnabled()

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

### Community 113 - "missing-cache-headers.mjs"
Cohesion: 0.67
Nodes (3): isApplicable(), metadata, scan()

### Community 117 - "SettingsNav.tsx"
Cohesion: 0.31
Nodes (7): SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), SETTINGS_SECTIONS, SettingsSectionId, SettingsSectionMeta

### Community 136 - "cwv-poor.mjs"
Cohesion: 0.48
Nodes (6): byRoute(), gate(), metadata, ratioOverThreshold(), round2(), sumRows()

### Community 138 - "app/App.tsx"
Cohesion: 0.38
Nodes (4): App(), AppProviders(), router, container

### Community 139 - "ReportsDashboard.tsx"
Cohesion: 0.53
Nodes (4): ReportsDashboard, useAllEmployees(), fetchEmployeeCommissions(), ReportsDashboard()

### Community 140 - "networkSignal.ts"
Cohesion: 0.33
Nodes (4): Listener, listeners, NetworkObservation, observeNetwork()

### Community 141 - "scripts/reconcile-candidates.mjs"
Cohesion: 0.70
Nodes (4): reconcileInvestigation(), log(), main(), parseArgs()

## Knowledge Gaps
- **455 isolated node(s):** `SidebarProps`, `NavItemConfig`, `NavCategoryGroup`, `NAV_ITEMS`, `CockpitHeaderProps` (+450 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useIsMobile()` connect `useIsMobile` to `common.ts`, `CustomerList.tsx`, `useAppSelector`, `useDashboardLivePulse.ts`, `SaleDocumentPreviewModal.tsx`, `UsersList.tsx`, `constants/index.ts`, `BillingCounter.tsx`, `money.ts`, `inventory/types.ts`, `CreditNoteModal.tsx`, `InvoicesList.tsx`, `CatalogPanel.tsx`, `AppShell.tsx`, `ProductTable.tsx`, `posCalculations.ts`, `formatDateTime`, `SyncStatusBadge.tsx`, `employees/types.ts`, `SupplierDetailDrawer.tsx`, `LoginForm.tsx`, `SegmentedToggle.tsx`, `EmployeeList.tsx`, `Header.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `ConnectivityMonitor` connect `ConnectivityMonitor` to `ConnectivityMonitor.ts`, `networkSignal.ts`, `offline/index.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `useAppSelector` to `SyncStatusBadge.tsx`, `AppShell.tsx`, `Header.tsx`, `BillingCounter.tsx`, `cartSlice.ts`, `providers.tsx`, `SaleDocumentPreviewModal.tsx`, `posCalculations.ts`, `UsersList.tsx`, `usePermissions.ts`, `formatDateTime`, `router.tsx`, `constants/index.ts`, `authSlice.ts`, `CreditNoteModal.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `SidebarProps`, `NavItemConfig`, `NavCategoryGroup` to the rest of the system?**
  _455 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `common.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10084033613445378 - nodes in this community are weakly interconnected._
- **Should `dedup-recs.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07796610169491526 - nodes in this community are weakly interconnected._
- **Should `workspace-resolver.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07330827067669173 - nodes in this community are weakly interconnected._