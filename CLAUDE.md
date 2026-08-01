# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A point-of-sale system for a repair/retail shop (billing, repairs, print jobs, inventory, customers, reports). React 19 + TypeScript + Vite, using Mantine 9 as the UI kit.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run format` — format code using Prettier
- `npm run lint` — lint code using ESLint
- `npm run type-check` — run TypeScript type checker (`tsc --noEmit`)
- `npm run build` — type-check (`tsc`) then production build
- `npm run preview` — preview the production build locally

**After every change**, run `npm run format && npm run lint && npm run type-check && npm run build` and fix any errors reported before considering the work done.

**Every UI change must be responsive** — verify it holds up across mobile, tablet, and desktop widths (the `AppShell` navbar already collapses at the `sm` breakpoint; follow that pattern rather than hard-coding fixed widths/pixel layouts). See **Responsive & mobile UI** below for the tiers, the hook to use, and the rules every new screen has to satisfy.

## Responsive & mobile UI

The app targets three layout tiers. `src/styles/theme.ts` defines **no** custom `breakpoints`, so Mantine 9's defaults apply: `xs` 36em/576px, `sm` 48em/768px, `md` 62em/992px, `lg` 75em/1200px, `xl` 88em/1408px. (Don't confuse these with `CONTAINER_SIZES` in `theme.ts` — those are `Container` size overrides, not breakpoints.)

| Tier      | Width                  | Shape                                       |
| --------- | ---------------------- | ------------------------------------------- |
| `mobile`  | below `sm` (768px)     | one full-screen region at a time            |
| `tablet`  | `sm`–`lg` (768–1199px) | two columns, the secondary one tab-switched |
| `desktop` | `lg`+ (1200px)         | the full multi-column layout                |

**Picking a tier**: use `useLayoutTier()` / `useIsMobile()` from `src/shared/hooks/useResponsive.ts` — never call `useMediaQuery` with a hand-written query string, and never hard-code `768`/`1200` in a component. The hook passes `getInitialValueInEffect: false` so the tier resolves on the first render; Mantine's default would flash the wrong layout for a frame. Its `below()` helper subtracts the same fraction Mantine's own `visibleFrom`/`hiddenFrom` do, so a JS tier check and a CSS `visibleFrom` on the same breakpoint always agree.

**JS switching vs CSS switching**: reach for `visibleFrom`/`hiddenFrom` for small, stateless bits of chrome (a badge, an icon button). Use the hook when the alternatives are whole stateful subtrees — CSS-only switching mounts _both_ branches, so refs, `ResizeObserver`s, autofocus effects and query subscriptions all run twice. `BillingRegions` (`src/features/billing/components/BillingRegions.tsx`) is the reference implementation of the JS approach.

**Rules for any new screen or component:**

- **Touch targets ≥44px** below `sm`. Desktop-density controls (32–40px icon buttons, `size="xs"` steppers, tight action rails) must grow on mobile — see `CartLineItem.tsx`'s `railWidth`/`rowMinHeight` pattern. Never place two destructive-adjacent targets under 44px side by side.
- **Inputs must be ≥16px font on mobile.** iOS Safari zooms the entire page when a smaller input takes focus and does not zoom back out. `AmountInput` already clamps this; do the same for any bare `TextInput`/`NumberInput` you style with an explicit `fontSize`.
- **Don't autofocus on mobile.** The soft keyboard covers the list or grid the input filters. Gate every autofocus/refocus behind `!isMobile` (`CatalogPanel`'s `keepScanInputFocused`, and the search fields in `ServiceJobPickerModal` / `CustomerPickerModal`).
- **Modals go `fullScreen={isMobile}`**, drawers go `size={isMobile ? '100%' : ...}`, and popovers must clamp their width (`width: 'min(280px, calc(100vw - 32px))'`). A fixed `mah={440}` scroll area should become a viewport-relative `'60vh'`.
- **Use `dvh`, not `vh`,** for anything that fills the screen — `vh` ignores the mobile browser URL bar and the bottom of the layout ends up under it. Where a `vh` fallback is needed for older engines, declare the pair in `src/styles/global.css` (see `.billing-root`); an inline React style object can only hold one value per property.
- **Never hard-code the header height.** Import `BILLING_HEADER_HEIGHT` / `SHELL_HEADER_HEIGHT` from `src/app/layout/constants.ts`; `AppShell` and the screens that size against it must read the same constant.
- **Keyboard affordances are desktop-only.** Hotkey hints baked into labels (`Jobs (F4)`, `Complete · … (F2)`, `Hold (Ctrl+H)`), the focus-mode toggle and the shortcuts modal entry are meaningless on touch — strip the hint from the label string (don't fork the JSX) and wrap the controls in `visibleFrom="sm"`. Leave the `keydown` listeners registered: they're harmless without a keyboard and keep external-keyboard tablets working.
- **Grid spans must follow the tier, not the viewport.** A `span={{ base: 6, sm: 4 }}` inside a column whose own width changes per tier resolves against the _viewport_, so it silently means something different in each layout. Derive the span from `useLayoutTier()` instead (`CatalogPanel`'s `productCardSpan`).
- **Print documents are exempt.** `src/shared/print/documents/` is fixed `mm`/`px` geometry on purpose. Make the _preview container_ scroll on both axes and scale the page down; never make the document itself fluid.
- **Rows inside a `ScrollArea` don't shrink on their own.** Mantine wraps ScrollArea content in a `display: table` element, which is sized to max-content — so `flex: 1; min-width: 0` and `lineClamp` have no effect and wide rows spill past the container instead of compressing. Pass `classNames={{ viewport: 'scrollarea-fluid-content' }}` (defined in `src/styles/global.css`) whenever the content should be bounded by the container rather than define its width.
- Mantine 9's `Grid` takes **`gap`**, not `gutter` (that was Mantine 7).

Verify with the real thing: `npm run dev`, then walk the full flow at 375, 414, 768, 1024, 1280 and 1920 — plus at least one pass in dark mode — and assert `document.documentElement.scrollWidth <= window.innerWidth` at every width.

## Keyboard shortcuts

`useAppShortcuts` (`src/shared/hooks/useShortcuts.ts`) is the single global keyboard-shortcut engine — bind through it rather than a component-local `window.addEventListener('keydown', ...)`. Pass an array of `{ key, handler, ignoreInput?, preventDefault? }` entries; `key` is a combo string like `"Enter"`, `"F2"`, `"Ctrl+D"`, `"Ctrl+Shift+H"`, or `"?"` (`ctrl` matches both `ctrlKey` and `metaKey`, so one combo covers Windows/Linux Ctrl and Mac Cmd).

Shortcuts are scoped and stack: a call to `useAppShortcuts(shortcuts, isActive)` registers while `isActive` is true, and the most-recently-activated scope sees a keypress first — if it handles the key, scopes registered earlier (e.g. the billing page underneath an open modal) never see it. This is how a modal binds its own `Enter`/`Escape` and have it take priority over the page behind it without either side coordinating — see `A4InvoicePreviewModal`'s `Enter` → print binding, which fires the print handler directly rather than focusing the Print button (don't reintroduce the old pattern of `ref.focus()`-ing a button just to make Enter click it; bind the key instead).

`ignoreInput: true` makes a shortcut fire even while a text `<input>`/`<textarea>`/contenteditable elsewhere has focus (used for things like F-keys and Ctrl-combos that should work globally); omit it for shortcuts that should be suppressed while the user is typing.

Shortcut hint labels baked into component text (`"(F2)"`, `"Hold (Ctrl+H)"`, etc.) and `KeyboardShortcutsModal.tsx`'s shortcut list are hand-maintained, not generated from the registry — a deliberate scope decision, so update both by hand when a binding changes.

## Architecture

**Entry chain**: `index.html` → `src/main.tsx` → `src/app/App.tsx` → `AppProviders` (`src/app/providers.tsx`) wraps `RouterProvider` (`src/app/router.tsx`).

- `src/App.tsx` at the repo root is a one-line re-export of `src/app/App.tsx`, left over from the initial Vite scaffold. Treat `src/app/App.tsx` as the real entry component; don't add logic to the root-level one.
- Routing (`src/app/router.tsx`) is a single `createBrowserRouter` tree: all authenticated routes (`billing`, `repairs`, `print-jobs`, `inventory`, `customers`, `reports`) render inside `AppShell` (`src/app/layout/`), which provides the header/sidebar chrome. `/login` is outside the shell. Unknown paths and `/` redirect to `/billing`.
- `AppProviders` sets up, in order: Redux (`Provider` from `react-redux`, `store` from `src/store/index.ts`), TanStack Query (`QueryClientProvider`, 5 min `staleTime`, no refetch-on-focus), Mantine (`MantineProvider` with `mantineTheme` from `src/styles/theme.ts`, `mantineCssVariableResolver` from `src/styles/cssVariablesResolver.ts`, and `colorSchemeManager={reduxColorSchemeManager}`), `Notifications`, `ModalsProvider`. Mantine/notifications/dates CSS is imported here — new Mantine subpackages (e.g. carousel, dropzone) need their CSS imported wherever they're first used.
- `src/styles/theme.ts` defines the custom `fontSizes`/`spacing` scales (including non-default tokens like `"2xl"`–`"5xl"` and `"3xs"`–`"3xl"`) and per-component default props (`Container`, `Paper`, `Card`, `Select`) — prefer these theme tokens over hard-coded pixel values, and extend `components` here rather than passing repeated default props at call sites. `src/styles/cssVariablesResolver.ts` is the place to add custom CSS variables (light/dark/scheme-independent) consumed via `var(--...)`.
- `defaultRadius: 'lg'` in `src/styles/theme.ts` sets the app-wide corner radius. **All components should use the default large radius** — prefer omitting the `radius` prop entirely so components inherit it. If a place needs the radius stated explicitly (e.g. a raw CSS `border-radius` outside a `radius` prop), reference `var(--mantine-radius-default)` rather than hard-coding `"lg"`/`var(--mantine-radius-lg)`, so it keeps tracking the theme default. Never pass a smaller explicit `radius="md"`/`"sm"` (or `var(--mantine-radius-md)`, etc.) that overrides it — that applies to every component with a `radius` prop (`Modal`, `Paper`, `Card`, `Button`, `ThemeIcon`, `TextInput`, `SegmentedControl`, etc.), not just the ones already listed with theme-level defaults above.

**Feature modules** (`src/features/<name>/`): each feature (`auth`, `billing`, `customers`, `inventory`, `print-jobs`, `repairs`, `reports`) follows the same shape — `components/`, `types.ts`, and an `index.ts` barrel that re-exports the public component(s) and `* from './types'`. Import features only through their barrel (`@/features/billing`), not by reaching into `components/`.

**Path alias**: `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts` via `vite-tsconfig-paths`). Always import with `@/...` rather than relative `../../` paths across module boundaries.

**Cross-cutting layers**:

- `src/api/client.ts` — a single `ApiClient` class (`apiClient` singleton) wrapping `axios`, base URL from `env.apiBaseUrl`, auto-attaches `Bearer` token from `localStorage[STORAGE_KEYS.AUTH_TOKEN]`, normalizes failures into the `ApiError` shape (`src/shared/types/common.ts`).
- `src/api/queryKeys.ts` — centralized TanStack Query key factory, one namespace per feature (`billing`, `repairs`, `printJobs`, `inventory`, `customers`, `reports`). Add new query keys here rather than inlining key arrays in components/hooks.
- `src/config/constants.ts` — shared business constants: currency (`CURRENCY`, LKR/"Rs."), `TAX_RATE`, repair job status enum + labels + colors (`JOB_STATUS*`), `PAYMENT_METHODS`, default pagination, `STORAGE_KEYS` (localStorage key names — add new keys here rather than inlining string literals).
- `src/config/env.ts` — typed wrapper over `import.meta.env`.
- `src/shared/` — cross-feature reusable code: `components/` (e.g. `DataTable`, `MoneyInput`, `ConfirmDialog`, `EmptyState`, `PageHeader`), `lib/` (`money.ts`, `date.ts`, `print.ts`), `types/common.ts` (`PaginatedResponse`, `ApiError`, `ApiResponse`, `SelectOption`).

**State management (Redux Toolkit)**: `src/store/` is the app's single global client-state layer — there is no other state library in this project (no Zustand/Context-based stores). `src/store/index.ts` builds the store via `configureStore` and exports `RootState`/`AppDispatch`; always use the typed `useAppDispatch`/`useAppSelector` from `src/store/hooks.ts` instead of the raw `react-redux` hooks. New client state goes into a new slice under `src/store/slices/`, following `cartSlice.ts`'s pattern: plain field reducers via `createSlice` (Immer draft mutation), with any derived/computed values exposed as memoized selectors (`createSelector`) rather than recomputed inline in components.

- `src/store/slices/cartSlice.ts` — the active billing cart (line items, customer, discount, payment method). Derived totals (`selectSubtotalCents`/`selectTaxCents`/`selectTotalCents`/`selectCartItemsCount`) are selectors, not stored state — don't add `subtotalCents` etc. as actual reducer fields.
- `src/store/slices/themeSlice.ts` + `src/store/colorSchemeManager.ts` — color-scheme (`'light' | 'dark'`) state, with a custom `MantineColorSchemeManager` (`reduxColorSchemeManager`) bridging it to `MantineProvider`, so Redux — not Mantine's default `localStorage` manager — is the single source of truth. Persisted via a `createListenerMiddleware` listener (`src/store/listenerMiddleware.ts`) to `localStorage[STORAGE_KEYS.COLOR_SCHEME]`. `index.html` has an inline `<script>` duplicating the same initial-scheme resolution logic to prevent a flash of the wrong theme on load — if the storage key or fallback logic ever changes, update both `themeSlice.ts`'s `getInitialColorScheme()` and that script together.
- **Design tokens**: `src/styles/cssVariablesResolver.ts` defines the app's neutral palette as scheme-flipping tokens — surfaces (`--bg-app`, `--bg-sidebar`, `--bg-card`, `--bg-hover`, `--bg-active`), borders (`--border`, `--border-strong`), and text (`--text-primary`, `--text-secondary`, `--text-muted`). Style with `var(--bg-card)` / `var(--text-muted)` etc.; never a raw hex, so a theme switch is only a value flip. Mantine's semantic vars (`--mantine-color-body`, `-default`, `-default-hover`, `-default-border`, `-text`, `-dimmed`, `-placeholder`) are re-pointed at these tokens in the same file, so built-in Mantine components follow the palette automatically — either name works, prefer the `--bg-*`/`--text-*` tokens in app code.
- **Dark-mode-safe styling**: never use fixed swatch vars (`--mantine-color-gray-0`…`-9`) or raw hex codes for anything that should look right in both themes — swatch vars don't change between light/dark. The dark scale also lives in `theme.ts`'s `colors.dark` array (Mantine's own `dark.N` lookups read it); it mirrors the dark tokens in `cssVariablesResolver.ts`, so **update both together**.

**No implicit fallbacks — be explicit**: don't paper over a missing value with `||` / `??` defaults, and don't invent a default at the consumption site (`textAlign: col.align || 'left'`, `icon || <IconInbox />`, `getElementById('root') || getElementById('app')` are all the anti-pattern). If a value matters to how something renders or behaves, make the field **required** in the type so every call site states it exactly — `align: 'left' | 'center' | 'right'` on `Column`, not `align?`. If a value is genuinely optional, let it be `undefined` and pass it straight through (e.g. `width: col.width`) rather than substituting a guessed stand-in. The narrow exception is documented environment configuration (`src/config/env.ts`), where a fallback is the declared default for a missing `import.meta.env` var.

**Money handling**: all monetary values are stored and passed around as integer cents (`unitPriceCents`, `totalCents`, etc.), never floats. Use `src/shared/lib/money.ts` (`toCents`, `fromCents`, `formatMoney`, `parseMoneyToCents`, `calculateTaxCents`, `calculateTotalCents`) to convert/format/compute — don't do ad hoc float math on currency.

**No backend yet**: `apiClient` and `queryKeys` are wired up but feature components currently work with local/mock state (e.g. `cartSlice`); expect to connect real endpoints under `env.apiBaseUrl` (`/api` by default) as backend work lands.
