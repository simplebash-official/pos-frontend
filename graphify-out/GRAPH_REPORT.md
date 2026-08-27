# Graph Report - frontend  (2026-08-27)

## Corpus Check
- 661 files · ~354,207 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2567 nodes · 6849 edges · 160 communities (134 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e151abf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useCategories.ts
- dedup-recs.mjs
- workspace-resolver.mjs
- useSupplierProducts.ts
- lib/render-report.mjs
- CustomerList.tsx
- tablerIconShards/index.ts
- sanitizers/index.mjs
- t
- cartSlice.ts
- useDashboardLivePulse.ts
- useAppSelector
- useModuleStats
- gate-investigations.mjs
- SaleDocumentPreviewModal.tsx
- SupplierList.tsx
- display-labels.mjs
- dependencies
- ConnectivityMonitor.ts
- compilerOptions
- authSlice.ts
- extract-claims.mjs
- verify-claim.mjs
- scanners/index.mjs
- devDependencies
- router.tsx
- hooks.ts
- BillingCounter.tsx
- moneyFormUtils.ts
- verifyClaim
- CreditNoteModal.tsx
- InvoicesList.tsx
- useIsMobile
- EmployeeList.tsx
- support-topics.mjs
- ConnectivityMonitor
- lib/reconcile-candidates.mjs
- useShortcuts.ts
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
- Sidebar.tsx
- date.ts
- verify-and-regen.mjs
- invoicesApi.ts
- LocalStorageStore
- AppShell.tsx
- verifyNextCacheComponentsRouteChainFile
- gates/index.mjs
- withRouteShapeWarnings
- print-jobs/types.ts
- SupplierDetailDrawer.tsx
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
- PaymentPanel.tsx
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
- CatalogPanel.tsx
- lib/budget-summary.mjs
- EmployeeDetailDrawer.tsx
- ReportsDashboard.tsx
- jest
- jest-environment-jsdom
- grade-recommendation.mjs
- cold-start.mjs
- @vitejs/plugin-react
- vitest
- vitestMock.cjs
- uncached-route.mjs
- merge-dict.mjs
- fix-newlines.mjs
- verifyNextCacheLifetimeFreshnessSupported
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
- readClaimFile
- contract.mjs
- searchFields.ts
- useResponsive.tsx
- cost-coverage.mjs
- useBillingStats.ts
- useInventoryStats.ts
- region-misconfig.mjs
- merge-catalog.mjs

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
- `MetricCard()` --calls--> `t()`  [EXTRACTED]
  src/shared/components/MetricCard.tsx → src/shared/i18n/t.ts
- `HeldCartCatchupNotifier()` --indirect_call--> `selectHeldCarts()`  [INFERRED]
  src/app/components/HeldCartCatchupNotifier.tsx → src/store/slices/cartSlice.ts
- `useHeldCarts()` --indirect_call--> `selectHeldCarts()`  [INFERRED]
  src/features/billing/hooks/useCart.ts → src/store/slices/cartSlice.ts
- `ShopProfileSection()` --indirect_call--> `selectAppLanguage()`  [INFERRED]
  src/features/settings/components/sections/ShopProfileSection.tsx → src/store/slices/settingsSlice.ts
- `SaleDocumentPreviewModal()` --indirect_call--> `selectPrintSettings()`  [INFERRED]
  src/features/billing/components/SaleDocumentPreviewModal.tsx → src/store/slices/settingsSlice.ts

## Import Cycles
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Communities (160 total, 26 thin omitted)

### Community 0 - "useCategories.ts"
Cohesion: 0.09
Nodes (40): CatalogCategoryFilter, CategoryIconInfo, createCategory(), createSubcategory(), deleteCategory(), deleteSubcategory(), fetchCategories(), updateCategory() (+32 more)

### Community 1 - "dedup-recs.mjs"
Cohesion: 0.08
Nodes (57): affectedFiles(), appliesAlsoEntry(), cacheLifeIntent(), dedupEditTarget(), dedupeRecommendations(), dedupIntent(), firstAffectedFile(), fixShape() (+49 more)

### Community 2 - "workspace-resolver.mjs"
Cohesion: 0.07
Nodes (54): buildPackageLookup(), buildResolver(), DEFAULT_RESOLVE_OPTIONS, detectMonorepoRoot(), escapeRegExp(), expandParts(), expandResolvedSpecifier(), expandPureBarrel() (+46 more)

### Community 3 - "useSupplierProducts.ts"
Cohesion: 0.17
Nodes (22): fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, SupplierProductListResponseData, unlinkSupplierProduct() (+14 more)

### Community 4 - "lib/render-report.mjs"
Cohesion: 0.10
Nodes (49): formatCandidateLabel(), formatKind(), asArray(), assertValidObservations(), buildFinalReportMessage(), candidateForDisplay(), compactFinalText(), costRoundsToCents() (+41 more)

### Community 5 - "CustomerList.tsx"
Cohesion: 0.12
Nodes (32): createCustomer(), deleteCustomer(), deleteCustomers(), fetchAllCustomers(), fetchCustomers(), updateCustomer(), CustomerFormContent(), CustomerFormModal() (+24 more)

### Community 6 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 7 - "sanitizers/index.mjs"
Cohesion: 0.11
Nodes (13): applyDollarStrip(), stripDollarLiterals(), metadata, STRING_FIELDS, metadata, STRING_FIELDS, metadata, STRING_FIELDS (+5 more)

### Community 8 - "t"
Cohesion: 0.11
Nodes (36): MobileSignUpForm(), MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps, ACCEPTED_TYPES, LogoUpload(), LogoUploadProps, BankDetailsFormValues (+28 more)

### Community 9 - "cartSlice.ts"
Cohesion: 0.13
Nodes (35): useCartCheckout(), LineSourceType, CartItem, DiscountType, initialState, selectAssignedStaffId(), selectAssignedStaffName(), selectCardRef() (+27 more)

### Community 10 - "useDashboardLivePulse.ts"
Cohesion: 0.10
Nodes (29): DashboardPage, useAllInvoices(), CashShiftSummaryWidget(), CashShiftSummaryWidgetProps, DashboardKpiStrip(), DashboardKpiStripProps, DashboardPage(), FastMoversWidget() (+21 more)

### Community 11 - "useAppSelector"
Cohesion: 0.09
Nodes (33): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, HeldCartCatchupNotifier(), RequireAdmin(), RequireAdminProps, RequireAuth(), RequireAuthProps (+25 more)

### Community 12 - "useModuleStats"
Cohesion: 0.18
Nodes (14): CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchPrintJobStats(), PrintJobStats, usePrintJobStats(), fetchRepairStats(), RepairStats (+6 more)

### Community 13 - "gate-investigations.mjs"
Cohesion: 0.31
Nodes (9): applyAuthDisqualifier(), AUTH_ROUTE_REGEX, isAuthRoute(), DEFAULT_MAX_CODE_CANDIDATES, attachDisplayRoute(), main(), parseArgs(), resolveBudget() (+1 more)

### Community 14 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.11
Nodes (27): StandalonePrintView, CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, SaleDocumentPreviewModal, DocumentPreviewSubject, SaleDocumentPreviewModal() (+19 more)

### Community 15 - "SupplierList.tsx"
Cohesion: 0.13
Nodes (27): createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), applyLocalSupplierFilters(), isSupplierFilterActive() (+19 more)

### Community 16 - "display-labels.mjs"
Cohesion: 0.15
Nodes (18): formatNumberLike(), formatPublicText(), formatRoute(), formatSignal(), formatSignalPart(), formatSignalValue(), humanizeKey(), KIND_LABELS (+10 more)

### Community 17 - "dependencies"
Cohesion: 0.05
Nodes (37): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/hooks, @mantine/modals (+29 more)

### Community 18 - "ConnectivityMonitor.ts"
Cohesion: 0.19
Nodes (13): env, probeClient, probeHealth(), ProbeResult, ConnectivityListener, ConnectivityState, DEGRADED_LATENCY_MS, HEADER_SERVER_TIME (+5 more)

### Community 19 - "compilerOptions"
Cohesion: 0.06
Nodes (33): .agents, .claude, dist, DOM, ES2023, .github, graphify-out, node_modules (+25 more)

### Community 20 - "authSlice.ts"
Cohesion: 0.10
Nodes (37): AuthInitializer(), USER_ROLE_LABELS, USER_ROLES, UserRole, STORAGE_KEYS, getMeApi(), AuthUser, LoginPayload (+29 more)

### Community 21 - "extract-claims.mjs"
Cohesion: 0.18
Nodes (31): asArray(), cacheRecommendationFiles(), extractClaims(), isCacheCandidate(), mentionsAuthSensitiveParallelization(), mentionsCachedNotFoundOr404(), mentionsCacheLifeCdnHeaderClaim(), mentionsCacheLifetimeChange() (+23 more)

### Community 22 - "verify-claim.mjs"
Cohesion: 0.11
Nodes (31): buildScriptHasMigrationSideEffect(), cacheInvalidationFileCache, cleanHeaderValue(), configContainsTag(), escapeRegExp(), extractHeaderValues(), formatPct(), functionStatusForRoute() (+23 more)

### Community 23 - "scanners/index.mjs"
Cohesion: 0.11
Nodes (18): isApplicable(), metadata, scan(), isApplicable(), metadata, scan(), scanners, metadata (+10 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint-config-prettier, @eslint/js, eslint-plugin-react-refresh, fake-indexeddb, glob, globals, identity-obj-proxy, devDependencies (+23 more)

### Community 25 - "router.tsx"
Cohesion: 0.07
Nodes (25): App(), AppShell(), AppProviders(), BillingCounter, CustomerList, EmailLoginScreen, EmployeeList, InvoicesList (+17 more)

### Community 26 - "hooks.ts"
Cohesion: 0.09
Nodes (28): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+20 more)

### Community 27 - "BillingCounter.tsx"
Cohesion: 0.20
Nodes (20): BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip(), BillingTabBar(), BillingTabBarProps (+12 more)

### Community 28 - "moneyFormUtils.ts"
Cohesion: 0.18
Nodes (23): RawDashboardEntities, EmployeeFormModal(), EmployeeFormModalProps, Employee, PrintJobFormModal(), PrintJobFormModalProps, PrintJob, BackendRepair (+15 more)

### Community 29 - "verifyClaim"
Cohesion: 0.18
Nodes (19): recText(), verifyAuthGuardParallelizationSafety(), verifyCache404LongTtlSafety(), verifyCachePolicyPositiveOrNoReadyRec(), verifyCacheVaryCardinalitySafe(), verifyClaim(), verifyImmutableDynamicRouteSafety(), verifyNextCacheComponentsRouteSegmentConfig() (+11 more)

### Community 30 - "CreditNoteModal.tsx"
Cohesion: 0.10
Nodes (23): BackendCreditNoteItem, CreateCreditNoteItemInput, CreditNoteItemCondition, CreditNoteItemDisposition, CreditNoteModal(), CreditNoteModalProps, ExchangeLine, LineState (+15 more)

### Community 31 - "InvoicesList.tsx"
Cohesion: 0.22
Nodes (14): fetchInvoices(), useCloseInvoice(), CreditNoteModal, InvoiceDetailDrawer(), InvoiceDetailDrawerProps, sectionLabelStyle, applyLocalInvoiceFilters(), InvoiceFilters (+6 more)

### Community 32 - "useIsMobile"
Cohesion: 0.15
Nodes (14): fetchProductSerials(), SerialNumberPickerModal(), SerialNumberPickerModalProps, useProductSerials(), ProductSerialStatus, FormContentProps, SupplierFormContent(), SupplierFormModal() (+6 more)

### Community 33 - "EmployeeList.tsx"
Cohesion: 0.13
Nodes (21): EmployeeList(), useCreateEmployee(), useDeleteEmployees(), useUpdateEmployee(), ConfirmDialog(), ConfirmDialogProps, Column, DataTable() (+13 more)

### Community 34 - "support-topics.mjs"
Cohesion: 0.13
Nodes (26): citationApplies(), HERE, KNOWN_CANDIDATE_KINDS, loadSupportTopics(), matchesCandidateKind(), matchesCandidateMetrics(), matchesCandidateRoutePatterns(), matchesFrameworks() (+18 more)

### Community 36 - "lib/reconcile-candidates.mjs"
Cohesion: 0.26
Nodes (24): arrayAt(), deploymentRegressionDecision(), dropWithObservation(), formatInteger(), formatMs(), formatPct(), isrOverrevalidationDecision(), numberAt() (+16 more)

### Community 37 - "useShortcuts.ts"
Cohesion: 0.36
Nodes (7): activeScopes, handleKeyDown(), isInputFocused(), parseCombo(), Shortcut, ShortcutScope, useAppShortcuts()

### Community 38 - "PrintJobList.tsx"
Cohesion: 0.16
Nodes (22): PrintJobList, BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchAllPrintJobs(), fetchPrintJobs(), FetchPrintJobsParams (+14 more)

### Community 39 - "search.ts"
Cohesion: 0.15
Nodes (27): SearchHighlight(), SearchHighlightProps, QueryKeyFactory, useBackendFilteredList(), UseBackendFilteredListResult, EntitySearchResult, useEntitySearch(), buildSearchIndex() (+19 more)

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
Cohesion: 0.19
Nodes (19): calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchAllRepairs(), fetchRepairs(), FetchRepairsParams, RepairListResponseData, toRepairJob() (+11 more)

### Community 44 - "collect-signals.mjs"
Cohesion: 0.17
Nodes (21): defaultNormalize(), normalizeColdStart(), normalizerFor(), QUERIES, TIME_WINDOW, checkObservabilityPlusConfiguration(), classifyObservabilityPlusConfiguration(), getProjectConfig() (+13 more)

### Community 45 - "settingsSlice.ts"
Cohesion: 0.17
Nodes (14): DEFAULT_PRINT_SETTINGS, DEFAULT_SHOP_PROFILE, AutoPrintOption, DocumentSelection, InvoiceCopyOption, PrintSettings, ShopProfile, initialState (+6 more)

### Community 46 - "ThinkingOrb.tsx"
Cohesion: 0.15
Nodes (22): clampNormalizeData(), create3DRotation(), DEFAULT_LABELS, Dot, drawDots(), drawLines(), fibonacciSphere(), fract() (+14 more)

### Community 47 - "citations.mjs"
Cohesion: 0.17
Nodes (19): compareVersion(), HERE, isKnownUrl(), LIBRARY_PATH, libraryForStack(), loadLibrary(), lookupSkillRule(), lookupUrl() (+11 more)

### Community 48 - "route-normalize.mjs"
Cohesion: 0.19
Nodes (20): canonicalRefOf(), enrichRecFromCandidates(), candidateKey(), canonicalizeBranchPrefix(), canonicalizeRoute(), decodeSegmentToken(), dedupeCandidates(), firstRouteSegment() (+12 more)

### Community 49 - "useEmployees.ts"
Cohesion: 0.21
Nodes (12): createEmployee(), deleteEmployee(), deleteEmployees(), EmployeeListParams, fetchEmployees(), updateEmployee(), DeleteEmployeePayload, DeleteEmployeesPayload (+4 more)

### Community 50 - "ProductTable.tsx"
Cohesion: 0.12
Nodes (31): queryKeys, adjustStock(), createProduct(), deleteProducts(), fetchLowStockProducts(), fetchProductById(), fetchProductMovements(), fetchProducts() (+23 more)

### Community 51 - "posCalculations.ts"
Cohesion: 0.13
Nodes (19): calculateCartTotals(), calculateLineItem(), calculateOrderDiscount(), calculateReturnTotals(), CartLineItemSource, CartTotalsCalculationInput, CartTotalsResult, DiscountType (+11 more)

### Community 52 - "scripts/deep-dive.mjs"
Cohesion: 0.17
Nodes (17): escapeODataString(), mergeIntoEvidence(), odataEq(), SCANNER_KINDS, simplify(), SPEC_GENERATORS, specsForCandidate(), readProjectJson() (+9 more)

### Community 53 - "Sidebar.tsx"
Cohesion: 0.16
Nodes (16): RequirePermission(), RequirePermissionProps, SidebarProps, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup, NavItemConfig, Permission (+8 more)

### Community 54 - "date.ts"
Cohesion: 0.08
Nodes (38): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+30 more)

### Community 55 - "verify-and-regen.mjs"
Cohesion: 0.22
Nodes (14): summarizeClaimResults(), applyQualityFloor(), deriveProjectFacts(), findRecContradictions(), deriveRootFromSignals(), detectRepoRoot(), fileResolvesAt(), pickProbeFile() (+6 more)

### Community 56 - "invoicesApi.ts"
Cohesion: 0.11
Nodes (28): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+20 more)

### Community 57 - "LocalStorageStore"
Cohesion: 0.16
Nodes (6): InvoiceItem, getPrintCountForInvoice(), getPrintLogsForInvoice(), PrintLogEntry, printLogStore, LocalStorageStore

### Community 58 - "AppShell.tsx"
Cohesion: 0.17
Nodes (12): HeldSalesDrawer, KeyboardShortcutsModal, ROUTE_TITLES, BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT, SHELL_NAVBAR_RAIL_WIDTH, SHELL_NAVBAR_WIDTH, HeldSalesDrawer() (+4 more)

### Community 59 - "verifyNextCacheComponentsRouteChainFile"
Cohesion: 0.15
Nodes (15): asArray(), firstAccessiblePath(), firstDynamicRouteChainReason(), isCatchAllPlaceholder(), isDynamicPlaceholder(), layoutAppliesToCandidateRoute(), normalizeProjectRootDirectory(), normalizeRouteForLayoutMatch() (+7 more)

### Community 60 - "gates/index.mjs"
Cohesion: 0.20
Nodes (15): GATE_VERSION, gates, MAX_CODE_CANDIDATES, HERE, main(), REFS, renderCandidates(), renderScanners() (+7 more)

### Community 61 - "withRouteShapeWarnings"
Cohesion: 0.18
Nodes (15): byRoute(), gate(), metadata, ratioOverThreshold(), round2(), sumRows(), extractErrors(), extractFromStatusRows() (+7 more)

### Community 62 - "print-jobs/types.ts"
Cohesion: 0.27
Nodes (11): JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus, SplitType, UpdatePrintJobPayload, PrintJobInput, UpdateRepairPayload (+3 more)

### Community 63 - "SupplierDetailDrawer.tsx"
Cohesion: 0.18
Nodes (20): useAllProducts(), createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier(), PurchaseListParams, PurchaseListResponseData, ReceiveStockModal() (+12 more)

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
Cohesion: 0.27
Nodes (7): OFFLINE_DB_NAME, db, OfflineDb, StatsCacheRow, depsChanged(), LiveQueryResult, useLiveQuery()

### Community 71 - "common.ts"
Cohesion: 0.11
Nodes (18): FormContentProps, ProductFormModal(), ProductFormModalProps, SupplierIntakeRow, ProductFormModal, BarcodeSource, ProductInput, ProductListResponse (+10 more)

### Community 72 - "LoginForm.tsx"
Cohesion: 0.18
Nodes (15): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+7 more)

### Community 73 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 74 - "client.ts"
Cohesion: 0.16
Nodes (15): isApiErrorLike(), MUTATING_METHODS, readServerTime(), RequestOptions, getDeviceId(), Listener, listeners, NetworkObservation (+7 more)

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

### Community 87 - "PaymentPanel.tsx"
Cohesion: 0.24
Nodes (11): PAYMENT_METHODS, PaymentMethod, PaymentPanel, PaymentPanelProps, getSaleHeroPresentation(), SaleHeroPresentation, SplitPaymentDetail, calculatePaymentState() (+3 more)

### Community 88 - "large-static-asset.mjs"
Cohesion: 0.36
Nodes (7): formatBytes(), metadata, scan(), shouldSkip(), SKIP_EXTENSIONS, SKIP_PATH_PREFIXES, walk()

### Community 89 - "docs-library.json"
Cohesion: 0.25
Nodes (7): applicableFrameworksSyntax, lastVerified, ruleSkillRefs, $schema, schemaVersion, urls, version

### Community 90 - "formatMoney"
Cohesion: 0.17
Nodes (15): CURRENCY, CartLineItem, CartLineItemProps, DiscountPopover(), DiscountPopoverProps, CustomerDetailDrawer(), CustomerDetailDrawerProps, ProductFormContent() (+7 more)

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

### Community 116 - "CatalogPanel.tsx"
Cohesion: 0.20
Nodes (15): CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS, getAudioContext(), playErrorSound() (+7 more)

### Community 117 - "lib/budget-summary.mjs"
Cohesion: 0.31
Nodes (11): buildBudgetSummary(), buildChatPreview(), buildExactChatMessage(), buildOptions(), buildPrintCheck(), buildQuestionPayload(), buildQuestionText(), renderBudgetSummaryMarkdown() (+3 more)

### Community 118 - "EmployeeDetailDrawer.tsx"
Cohesion: 0.27
Nodes (8): fetchEmployeeEarnings(), EmployeeDetailDrawer(), EmployeeDetailDrawerProps, useEmployeeEarnings(), EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord, EmployeeLogin, EmployeeRole

### Community 119 - "ReportsDashboard.tsx"
Cohesion: 0.29
Nodes (7): ReportsDashboard, useAllEmployees(), fetchEmployeeCommissions(), ReportsDashboard(), DailySalesReportSummary, EmployeeCommissionsReportResponse, EmployeePerformanceEntry

### Community 122 - "grade-recommendation.mjs"
Cohesion: 0.39
Nodes (11): grade(), gradeRecommendation(), isAccountScope(), roundTo(), scoreActionability(), scoreEvidence(), scoreEvidenceAccount(), scoreGrounding() (+3 more)

### Community 123 - "cold-start.mjs"
Cohesion: 0.67
Nodes (3): extractColdStarts(), gate(), metadata

### Community 136 - "uncached-route.mjs"
Cohesion: 0.24
Nodes (8): Candidate, CandidateScope, GateMetadata, Signals, extractCacheHitRates(), extractMethodShares(), gate(), metadata

### Community 138 - "merge-dict.mjs"
Cohesion: 0.50
Nodes (3): extracted, merged, outDict

### Community 140 - "verifyNextCacheLifetimeFreshnessSupported"
Cohesion: 0.28
Nodes (9): cacheLifeNeedsContentFreshnessProof(), dedupeCacheTags(), execFileP, extractCacheTags(), extractCacheTagsFromFiles(), readCacheInvalidationFiles(), rgRelevantFiles(), verifyNextCacheLifetimeFreshnessSupported() (+1 more)

### Community 151 - "readClaimFile"
Cohesion: 0.31
Nodes (9): compilePattern(), readClaimFile(), snippetFoundElsewhere(), verifyCodeSnippet(), verifyPatternAbsent(), verifyPatternCount(), verifyPatternExists(), verifyRepoCount() (+1 more)

### Community 152 - "contract.mjs"
Cohesion: 0.36
Nodes (6): CandidateContractError, candidateLabel(), nonEmptyString(), VALID_SCOPES, validateCandidate(), validateCandidates()

### Community 153 - "searchFields.ts"
Cohesion: 0.39
Nodes (6): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, CUSTOMER_SEARCH_FIELDS, PRINT_JOB_SEARCH_FIELDS, REPAIR_JOB_SEARCH_FIELDS

### Community 154 - "useResponsive.tsx"
Cohesion: 0.33
Nodes (6): below(), LayoutTier, LayoutTierContext, LayoutTierContextValue, LayoutTierProvider(), MEDIA_QUERY_OPTIONS

### Community 155 - "cost-coverage.mjs"
Cohesion: 0.47
Nodes (5): classifyService(), computeCostCoverage(), escapeCell(), renderCostCoverageMarkdown(), SERVICE_DIMENSION

### Community 156 - "useBillingStats.ts"
Cohesion: 0.70
Nodes (3): BillingStats, fetchBillingStats(), useBillingStats()

### Community 157 - "useInventoryStats.ts"
Cohesion: 0.70
Nodes (3): fetchInventoryStats(), InventoryStats, useInventoryStats()

## Knowledge Gaps
- **522 isolated node(s):** `mainDict`, `translations`, `CombinedServiceJob`, `SERVICE_JOB_SEARCH_FIELDS`, `CatalogPanelProps` (+517 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `useCategories.ts`, `CustomerList.tsx`, `tablerIconShards/index.ts`, `useDashboardLivePulse.ts`, `useAppSelector`, `SaleDocumentPreviewModal.tsx`, `SupplierList.tsx`, `authSlice.ts`, `searchFields.ts`, `hooks.ts`, `BillingCounter.tsx`, `moneyFormUtils.ts`, `router.tsx`, `CreditNoteModal.tsx`, `InvoicesList.tsx`, `useIsMobile`, `EmployeeList.tsx`, `PrintJobList.tsx`, `RepairJobList.tsx`, `ProductTable.tsx`, `Sidebar.tsx`, `date.ts`, `AppShell.tsx`, `SupplierDetailDrawer.tsx`, `common.ts`, `LoginForm.tsx`, `PaymentPanel.tsx`, `formatMoney`, `CatalogPanel.tsx`, `EmployeeDetailDrawer.tsx`, `ReportsDashboard.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `scanners` connect `scanners/index.mjs` to `workspace-resolver.mjs`, `gates/index.mjs`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `gates` connect `gates/index.mjs` to `support-topics.mjs`, `lib/render-report.mjs`, `gate-investigations.mjs`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `mainDict`, `translations`, `CombinedServiceJob` to the rest of the system?**
  _522 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useCategories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09019607843137255 - nodes in this community are weakly interconnected._
- **Should `dedup-recs.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07796610169491526 - nodes in this community are weakly interconnected._
- **Should `workspace-resolver.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07330827067669173 - nodes in this community are weakly interconnected._