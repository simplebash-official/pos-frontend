# Graph Report - frontend  (2026-08-28)

## Corpus Check
- 670 files · ~357,463 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2594 nodes · 6931 edges · 145 communities (121 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `075e6a6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useCategories.ts
- dedup-recs.mjs
- workspace-resolver.mjs
- useSupplierProducts.ts
- lib/render-report.mjs
- useCustomers.ts
- tablerIconShards/index.ts
- sanitizers/index.mjs
- useAppDispatch
- cartSlice.ts
- useDashboardLivePulse.ts
- useAppSelector
- useModuleStats
- gate-investigations.mjs
- SaleDocumentPreviewModal.tsx
- SupplierList.tsx
- calculator/index.ts
- dependencies
- authSlice.ts
- compilerOptions
- UsersList.tsx
- extract-claims.mjs
- verify-claim.mjs
- scanners/index.mjs
- devDependencies
- providers.tsx
- notificationSlice.ts
- BillingCounter.tsx
- money.ts
- customersApi.ts
- CreditNoteModal.tsx
- InvoicesList.tsx
- SettingsPage.tsx
- CustomerList.tsx
- support-topics.mjs
- ConnectivityMonitor
- lib/reconcile-candidates.mjs
- date.ts
- PrintJobList.tsx
- ProductTable.tsx
- vercel.mjs
- investigation-brief.mjs
- cwv-poor.mjs
- RepairJobList.tsx
- collect-signals.mjs
- settingsSlice.ts
- ThinkingOrb.tsx
- citations.mjs
- route-normalize.mjs
- useEmployees.ts
- useProducts.ts
- posCalculations.ts
- scripts/deep-dive.mjs
- router.tsx
- SyncPanel.tsx
- audio.ts
- invoicesApi.ts
- useSupplierStats.ts
- t
- gates/index.mjs
- withRouteShapeWarnings
- employees/types.ts
- common.ts
- CLAUDE.md
- collect-sub-agent-outputs.mjs
- merge-signals.mjs
- prepare-investigation-brief.mjs
- middleware-broad-matcher.mjs
- throttle.mjs
- offline/index.ts
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
- scanner-driven.mjs
- ApiClient
- large-static-asset.mjs
- docs-library.json
- CustomerDetailDrawer.tsx
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
- useIsMobile
- ReportsDashboard.tsx
- jest
- jest-environment-jsdom
- cold-start.mjs
- @vitejs/plugin-react
- vitest
- vitestMock.cjs
- merge-dict.mjs
- fix-newlines.mjs
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
- searchFields.ts
- useInventoryStats.ts
- merge-catalog.mjs

## God Nodes (most connected - your core abstractions)
1. `t()` - 181 edges
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
- `UserSession` --references--> `UserRole`  [EXTRACTED]
  src/features/auth/types.ts → src/constants/roles.ts
- `BackendRepair` --references--> `RepairJob`  [EXTRACTED]
  src/features/repairs/api/repairsApi.ts → src/features/repairs/types.ts
- `UpdateCustomerPayload` --references--> `CustomerInput`  [EXTRACTED]
  src/features/customers/hooks/useCustomers.ts → src/features/customers/types.ts
- `UpdatePrintJobPayload` --references--> `PrintJobInput`  [EXTRACTED]
  src/features/print-jobs/hooks/usePrintJobs.ts → src/features/print-jobs/types.ts
- `UpdateRepairPayload` --references--> `RepairJobInput`  [EXTRACTED]
  src/features/repairs/hooks/useRepairs.ts → src/features/repairs/types.ts

## Import Cycles
- 3-file cycle: `src/features/employees/components/EmployeeList.tsx -> src/shared/lib/searchFields.ts -> src/features/employees/index.ts -> src/features/employees/components/EmployeeList.tsx`
- 3-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductPickerModal.tsx`
- 3-file cycle: `src/features/inventory/components/ProductTable.tsx -> src/shared/lib/searchFields.ts -> src/features/inventory/index.ts -> src/features/inventory/components/ProductTable.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierList.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx`
- 3-file cycle: `src/features/suppliers/components/SupplierPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierPickerModal.tsx`
- 3-file cycle: `src/features/customers/components/CustomerList.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerList.tsx`
- 3-file cycle: `src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/customers/index.ts -> src/features/customers/components/CustomerPickerModal.tsx`
- 3-file cycle: `src/features/print-jobs/components/PrintJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/print-jobs/index.ts -> src/features/print-jobs/components/PrintJobList.tsx`
- 3-file cycle: `src/features/repairs/components/RepairJobList.tsx -> src/shared/lib/searchFields.ts -> src/features/repairs/index.ts -> src/features/repairs/components/RepairJobList.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/customers/components/CustomerPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`
- 4-file cycle: `src/features/suppliers/components/SupplierFormModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierFormModal.tsx`
- 5-file cycle: `src/features/inventory/components/ProductPickerModal.tsx -> src/shared/lib/searchFields.ts -> src/features/suppliers/index.ts -> src/features/suppliers/components/SupplierList.tsx -> src/features/suppliers/components/SupplierDetailDrawer.tsx -> src/features/inventory/components/ProductPickerModal.tsx`
- 5-file cycle: `src/features/billing/components/BillingCounter.tsx -> src/features/billing/components/BillingRegions.tsx -> src/features/billing/components/CatalogPanel.tsx -> src/shared/lib/searchFields.ts -> src/features/billing/index.ts -> src/features/billing/components/BillingCounter.tsx`

## Communities (145 total, 24 thin omitted)

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
Cohesion: 0.12
Nodes (32): useAllProducts(), fetchSupplierProducts(), getLinksForProduct(), getLinksForSupplier(), linkSupplierProduct(), setLinksForSupplier(), SupplierProductListParams, SupplierProductListResponseData (+24 more)

### Community 4 - "lib/render-report.mjs"
Cohesion: 0.05
Nodes (85): buildBudgetSummary(), buildChatPreview(), buildExactChatMessage(), buildOptions(), buildPrintCheck(), buildQuestionPayload(), buildQuestionText(), renderBudgetSummaryMarkdown() (+77 more)

### Community 5 - "useCustomers.ts"
Cohesion: 0.15
Nodes (19): createCustomer(), deleteCustomer(), deleteCustomers(), updateCustomer(), applyLocalCustomerFilters(), CustomerList(), isCustomerFilterActive(), CustomerPickerModal() (+11 more)

### Community 6 - "tablerIconShards/index.ts"
Cohesion: 0.06
Nodes (19): TablerIconPicker(), TablerIconPickerProps, EMPTY_MAP, getServerSnapshot(), getSnapshot(), listeners, loadShard(), resolved (+11 more)

### Community 7 - "sanitizers/index.mjs"
Cohesion: 0.11
Nodes (13): applyDollarStrip(), stripDollarLiterals(), metadata, STRING_FIELDS, metadata, STRING_FIELDS, metadata, STRING_FIELDS (+5 more)

### Community 8 - "useAppDispatch"
Cohesion: 0.20
Nodes (19): BankDetailsFormValues, BankDetailsSection(), BrandingFormValues, BrandingSection(), DocumentTemplatesFormValues, DocumentTemplatesSection(), PrintingFormValues, PrintingSection() (+11 more)

### Community 9 - "cartSlice.ts"
Cohesion: 0.10
Nodes (43): PaymentMethod, useCartCheckout(), useCartSound(), LineSourceType, SplitPaymentDetail, CartItem, cartSlice, CartState (+35 more)

### Community 10 - "useDashboardLivePulse.ts"
Cohesion: 0.09
Nodes (31): DashboardPage, JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, CashShiftSummaryWidget(), CashShiftSummaryWidgetProps, DashboardKpiStrip(), DashboardKpiStripProps (+23 more)

### Community 11 - "useAppSelector"
Cohesion: 0.12
Nodes (29): AppUpdatePrompt(), GuestOnly(), GuestOnlyProps, RequireAuth(), RequireAuthProps, AppShell(), HeldSalesDrawer, ROUTE_TITLES (+21 more)

### Community 12 - "useModuleStats"
Cohesion: 0.18
Nodes (14): BillingStats, fetchBillingStats(), useBillingStats(), CustomerStats, fetchCustomerStats(), useCustomerStats(), fetchPrintJobStats(), PrintJobStats (+6 more)

### Community 13 - "gate-investigations.mjs"
Cohesion: 0.18
Nodes (15): applyAuthDisqualifier(), AUTH_ROUTE_REGEX, isAuthRoute(), CandidateContractError, candidateLabel(), nonEmptyString(), VALID_SCOPES, validateCandidate() (+7 more)

### Community 14 - "SaleDocumentPreviewModal.tsx"
Cohesion: 0.06
Nodes (38): StandalonePrintView, CreditNoteDocumentType, getCreditNoteDocument(), getInvoiceDocument(), InvoiceDocumentType, SaleDocumentPreviewModal, DocumentPreviewSubject, SaleDocumentPreviewModal() (+30 more)

### Community 15 - "SupplierList.tsx"
Cohesion: 0.16
Nodes (21): SupplierList, createSupplier(), deleteSupplier(), deleteSuppliers(), fetchSuppliers(), SupplierListParams, updateSupplier(), applyLocalSupplierFilters() (+13 more)

### Community 16 - "calculator/index.ts"
Cohesion: 0.19
Nodes (18): CalculatorModal, Calculator(), CalculatorDisplay(), CalculatorDisplayProps, formatDisplayNumber(), CalculatorHistory(), CalculatorHistoryProps, CalculatorKeypad() (+10 more)

### Community 17 - "dependencies"
Cohesion: 0.05
Nodes (37): axios, dayjs, dexie, @mantine/core, @mantine/dates, @mantine/form, @mantine/hooks, @mantine/modals (+29 more)

### Community 18 - "authSlice.ts"
Cohesion: 0.19
Nodes (15): AuthInitializer(), STORAGE_KEYS, getMeApi(), AuthUser, LoginPayload, LoginResponse, LoginResponseData, MeResponse (+7 more)

### Community 19 - "compilerOptions"
Cohesion: 0.06
Nodes (33): .agents, .claude, dist, DOM, ES2023, .github, graphify-out, node_modules (+25 more)

### Community 20 - "UsersList.tsx"
Cohesion: 0.15
Nodes (24): RequireAdmin(), RequireAdminProps, USER_ROLE_LABELS, USER_ROLES, UserRole, createUser(), deleteUser(), fetchUsers() (+16 more)

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

### Community 25 - "providers.tsx"
Cohesion: 0.07
Nodes (28): App(), HeldCartCatchupNotifier(), AppProviders(), AppProvidersProps, LanguageRemounter(), router, DEFAULT_PAGINATION, HELD_CART_REMINDER_MS (+20 more)

### Community 26 - "notificationSlice.ts"
Cohesion: 0.18
Nodes (15): NotificationItem(), NotificationItemProps, NotificationPopover(), NotificationPopoverProps, AppNotification, NotificationActor, NotificationCategory, NotificationPriority (+7 more)

### Community 27 - "BillingCounter.tsx"
Cohesion: 0.14
Nodes (27): BillingCounter, PAYMENT_METHODS, BillingCounter(), BillingRegions, BillingRegionsProps, FILL, BillingPane, BillingSummaryStrip() (+19 more)

### Community 28 - "money.ts"
Cohesion: 0.15
Nodes (26): CURRENCY, RawDashboardEntities, EmployeeFormModal(), EmployeeFormModalProps, Employee, PrintJobFormModal(), PrintJobFormModalProps, RepairFormModal() (+18 more)

### Community 29 - "customersApi.ts"
Cohesion: 0.26
Nodes (8): resolveOrCreateCustomer(), fetchAllCustomers(), fetchCustomers(), Customer, CustomerInput, CustomerListParams, CustomerListResponse, CustomerTagsResponse

### Community 30 - "CreditNoteModal.tsx"
Cohesion: 0.08
Nodes (37): BackendCreditNote, BackendCreditNoteExchangeItem, BackendCreditNoteItem, createCreditNote(), CreateCreditNoteExchangeItemInput, CreateCreditNoteItemInput, CreateCreditNoteRefundBreakdownInput, CreditNoteListResponseData (+29 more)

### Community 31 - "InvoicesList.tsx"
Cohesion: 0.14
Nodes (22): InvoicesList, CreateCreditNoteInput, fetchCreditNotes(), voidCreditNote(), fetchInvoices(), CreateCreditNotePayload, NO_CREDIT_NOTES, useInvoiceCreditNotes() (+14 more)

### Community 32 - "SettingsPage.tsx"
Cohesion: 0.27
Nodes (10): SettingsPage, SettingsNavDrillDownList(), SettingsNavList(), SettingsNavProps, SettingsNavTabs(), renderSection(), SettingsPage(), SETTINGS_SECTIONS (+2 more)

### Community 33 - "CustomerList.tsx"
Cohesion: 0.14
Nodes (23): CustomerList, EmployeeList, CustomerFilters, EmployeeList(), useDeleteEmployee(), useDeleteEmployees(), useUpdateEmployee(), ConfirmDialog() (+15 more)

### Community 34 - "support-topics.mjs"
Cohesion: 0.13
Nodes (26): citationApplies(), HERE, KNOWN_CANDIDATE_KINDS, loadSupportTopics(), matchesCandidateKind(), matchesCandidateMetrics(), matchesCandidateRoutePatterns(), matchesFrameworks() (+18 more)

### Community 35 - "ConnectivityMonitor"
Cohesion: 0.18
Nodes (4): ConnectivityMonitor, ConnectivityListener, ConnectivitySnapshot, ConnectivityState

### Community 36 - "lib/reconcile-candidates.mjs"
Cohesion: 0.26
Nodes (24): arrayAt(), deploymentRegressionDecision(), dropWithObservation(), formatInteger(), formatMs(), formatPct(), isrOverrevalidationDecision(), numberAt() (+16 more)

### Community 37 - "date.ts"
Cohesion: 0.37
Nodes (9): ModernClock(), ModernClockProps, ClockTimeParts, formatClockDate(), formatClockTime(), formatDate(), formatRelativeTime(), formatTime() (+1 more)

### Community 38 - "PrintJobList.tsx"
Cohesion: 0.15
Nodes (23): PrintJobList, BackendPrintJob, calculatePrintEarnings(), createPrintJobRaw(), deletePrintJobsRaw(), fetchAllPrintJobs(), fetchPrintJobs(), FetchPrintJobsParams (+15 more)

### Community 39 - "ProductTable.tsx"
Cohesion: 0.12
Nodes (31): applyLocalProductFilters(), isProductFilterActive(), ProductFilters, ProductTable(), useDeleteProducts(), useUpdateProduct(), HEIGHT_MAP, QuantityInput() (+23 more)

### Community 40 - "vercel.mjs"
Cohesion: 0.14
Nodes (24): aggregateServicesByName(), baselineStack(), checkAuth(), checkCliVersion(), detectNextCacheComponents(), detectStack(), exec, extractBillingPlan() (+16 more)

### Community 41 - "investigation-brief.mjs"
Cohesion: 0.19
Nodes (23): absoluteBriefPath(), briefRoots(), buildBrief(), cachePolicyGuidance(), capBriefFiles(), closestAncestorLayoutFiles(), isCatchAllPlaceholder(), isDynamicPlaceholder() (+15 more)

### Community 42 - "cwv-poor.mjs"
Cohesion: 0.48
Nodes (6): byRoute(), gate(), metadata, ratioOverThreshold(), round2(), sumRows()

### Community 43 - "RepairJobList.tsx"
Cohesion: 0.16
Nodes (22): RepairJobList, BackendRepair, calculateRepairEarnings(), createRepairJobRaw(), deleteRepairsRaw(), fetchAllRepairs(), fetchRepairs(), FetchRepairsParams (+14 more)

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
Cohesion: 0.21
Nodes (18): candidateKey(), canonicalizeBranchPrefix(), canonicalizeRoute(), decodeSegmentToken(), dedupeCandidates(), firstRouteSegment(), isBase64FlagState(), isDynamicPlaceholder() (+10 more)

### Community 49 - "useEmployees.ts"
Cohesion: 0.21
Nodes (12): createEmployee(), deleteEmployee(), deleteEmployees(), EmployeeListParams, fetchEmployees(), updateEmployee(), DeleteEmployeePayload, DeleteEmployeesPayload (+4 more)

### Community 50 - "useProducts.ts"
Cohesion: 0.07
Nodes (40): adjustStock(), createProduct(), deleteProducts(), fetchLowStockProducts(), fetchProductById(), fetchProductMovements(), fetchProducts(), fetchProductSerials() (+32 more)

### Community 51 - "posCalculations.ts"
Cohesion: 0.09
Nodes (26): DiscountPopover(), DiscountPopoverProps, AmountInput, AmountInputProps, BUTTON_WIDTH_MAP, FONT_SIZE_MAP, HEIGHT_MAP, PADDING_MAP (+18 more)

### Community 52 - "scripts/deep-dive.mjs"
Cohesion: 0.17
Nodes (17): escapeODataString(), mergeIntoEvidence(), odataEq(), SCANNER_KINDS, simplify(), SPEC_GENERATORS, specsForCandidate(), readProjectJson() (+9 more)

### Community 53 - "router.tsx"
Cohesion: 0.12
Nodes (20): RequirePermission(), RequirePermissionProps, EmailLoginScreen, ProductTable, UsersList, NAV_CATEGORIES, NAV_ITEMS, NavCategoryGroup (+12 more)

### Community 54 - "SyncPanel.tsx"
Cohesion: 0.09
Nodes (27): PendingOperationsList(), PendingOperationsListProps, STATUS_LABEL, SyncDrawer(), SyncDrawerProps, SyncModuleCard(), SyncModuleCardProps, formatBytes() (+19 more)

### Community 55 - "audio.ts"
Cohesion: 0.70
Nodes (4): getAudioContext(), playErrorSound(), playPaymentCompleteSound(), playScanSuccessSound()

### Community 56 - "invoicesApi.ts"
Cohesion: 0.10
Nodes (31): BackendInvoice, BackendInvoiceItem, BackendPaymentRecord, BackendSplitPayment, closeInvoice(), completeSale(), CompleteSaleInput, CompleteSaleItemInput (+23 more)

### Community 57 - "useSupplierStats.ts"
Cohesion: 0.70
Nodes (3): fetchSupplierStats(), SupplierStats, useSupplierStats()

### Community 58 - "t"
Cohesion: 0.16
Nodes (14): KeyboardShortcutsModal, MobileSignUpForm(), MobileSignUpFormProps, MobileSocialButtons(), MobileSocialButtonsProps, KeyboardShortcutsModal(), KeyboardShortcutsModalProps, SHORTCUTS (+6 more)

### Community 60 - "gates/index.mjs"
Cohesion: 0.16
Nodes (16): GATE_VERSION, gates, MAX_CODE_CANDIDATES, metadata, HERE, main(), REFS, renderCandidates() (+8 more)

### Community 61 - "withRouteShapeWarnings"
Cohesion: 0.14
Nodes (17): extractErrors(), extractFromStatusRows(), gate(), metadata, extractErrorRatesByRoute(), extractFunctionRoutes(), gate(), metadata (+9 more)

### Community 62 - "employees/types.ts"
Cohesion: 0.38
Nodes (9): JobStatus, EmployeeLogin, EmployeeRole, SplitType, PrintJob, PrintJobInput, RepairJobInput, AssignmentInfo (+1 more)

### Community 63 - "common.ts"
Cohesion: 0.11
Nodes (23): queryKeys, fetchEmployeeEarnings(), useEmployeeEarnings(), EmployeeEarningRecord, createPurchase(), fetchPurchases(), fetchPurchasesByProduct(), fetchPurchasesBySupplier() (+15 more)

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

### Community 72 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (14): loginApi(), AuthLayout(), AuthLayoutProps, EmailLoginScreen(), LoginForm(), MobileAuthContainer(), MobileAuthView, MobileLoginForm() (+6 more)

### Community 73 - "useSearchHistory.ts"
Cohesion: 0.27
Nodes (12): getServerSnapshot(), getSnapshot(), parseHistory(), parseHistoryBlob(), prune(), readAllHistory(), SearchHistoryData, SearchHistoryItem (+4 more)

### Community 74 - "client.ts"
Cohesion: 0.10
Nodes (26): isApiErrorLike(), MUTATING_METHODS, readServerTime(), RequestOptions, getDeviceId(), env, probeClient, probeHealth() (+18 more)

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

### Community 85 - "scanner-driven.mjs"
Cohesion: 0.36
Nodes (8): candidateForGroup(), gate(), groupFindings(), metadata, observedCacheHitRate(), questionFor(), SCANNER_GATES, uniqueStrings()

### Community 88 - "large-static-asset.mjs"
Cohesion: 0.36
Nodes (7): formatBytes(), metadata, scan(), shouldSkip(), SKIP_EXTENSIONS, SKIP_PATH_PREFIXES, walk()

### Community 89 - "docs-library.json"
Cohesion: 0.25
Nodes (7): applicableFrameworksSyntax, lastVerified, ruleSkillRefs, $schema, schemaVersion, urls, version

### Community 90 - "CustomerDetailDrawer.tsx"
Cohesion: 0.21
Nodes (9): CustomerDetailDrawer(), CustomerDetailDrawerProps, CustomerFormContent(), CustomerFormModal(), CustomerFormModalProps, FormContentProps, useCustomerTags(), PhoneDisplay() (+1 more)

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

### Community 116 - "useIsMobile"
Cohesion: 0.07
Nodes (43): CartLineItem, CartLineItemProps, CatalogPanel, CatalogPanelProps, chunk(), CombinedServiceJob, generateServiceJobId(), SERVICE_JOB_SEARCH_FIELDS (+35 more)

### Community 119 - "ReportsDashboard.tsx"
Cohesion: 0.26
Nodes (8): ReportsDashboard, useAllEmployees(), EMPLOYEE_ROLE_LABELS, fetchEmployeeCommissions(), ReportsDashboard(), DailySalesReportSummary, EmployeeCommissionsReportResponse, EmployeePerformanceEntry

### Community 123 - "cold-start.mjs"
Cohesion: 0.67
Nodes (3): extractColdStarts(), gate(), metadata

### Community 138 - "merge-dict.mjs"
Cohesion: 0.50
Nodes (3): extracted, merged, outDict

### Community 153 - "searchFields.ts"
Cohesion: 0.17
Nodes (15): GlobalQuickSearchModal(), mergeByCategory(), QuickSearchResult, SearchHighlight(), SearchHighlightProps, EntitySearchResult, getMatchRanges(), SearchTerm (+7 more)

### Community 157 - "useInventoryStats.ts"
Cohesion: 0.70
Nodes (3): fetchInventoryStats(), InventoryStats, useInventoryStats()

## Knowledge Gaps
- **523 isolated node(s):** `mainDict`, `translations`, `ROUTE_TITLES`, `HeaderProps`, `CalculatorDisplayProps` (+518 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `useCategories.ts`, `useSupplierProducts.ts`, `useCustomers.ts`, `tablerIconShards/index.ts`, `useAppDispatch`, `useDashboardLivePulse.ts`, `useAppSelector`, `SaleDocumentPreviewModal.tsx`, `SupplierList.tsx`, `calculator/index.ts`, `UsersList.tsx`, `searchFields.ts`, `notificationSlice.ts`, `BillingCounter.tsx`, `money.ts`, `CreditNoteModal.tsx`, `InvoicesList.tsx`, `SettingsPage.tsx`, `CustomerList.tsx`, `date.ts`, `PrintJobList.tsx`, `ProductTable.tsx`, `RepairJobList.tsx`, `useProducts.ts`, `posCalculations.ts`, `router.tsx`, `SyncPanel.tsx`, `LoginForm.tsx`, `CustomerDetailDrawer.tsx`, `useIsMobile`, `ReportsDashboard.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `gates` connect `gates/index.mjs` to `support-topics.mjs`, `lib/render-report.mjs`, `gate-investigations.mjs`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `scanners` connect `scanners/index.mjs` to `workspace-resolver.mjs`, `gates/index.mjs`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `mainDict`, `translations`, `ROUTE_TITLES` to the rest of the system?**
  _523 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useCategories.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08862745098039215 - nodes in this community are weakly interconnected._
- **Should `dedup-recs.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07796610169491526 - nodes in this community are weakly interconnected._
- **Should `workspace-resolver.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07330827067669173 - nodes in this community are weakly interconnected._