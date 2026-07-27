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

**Every UI change must be responsive** — verify it holds up across mobile, tablet, and desktop widths (the `AppShell` navbar already collapses at the `sm` breakpoint; follow that pattern rather than hard-coding fixed widths/pixel layouts).

## Architecture

**Entry chain**: `index.html` → `src/main.tsx` → `src/app/App.tsx` → `AppProviders` (`src/app/providers.tsx`) wraps `RouterProvider` (`src/app/router.tsx`).

- `src/App.tsx` at the repo root is a one-line re-export of `src/app/App.tsx`, left over from the initial Vite scaffold. Treat `src/app/App.tsx` as the real entry component; don't add logic to the root-level one.
- Routing (`src/app/router.tsx`) is a single `createBrowserRouter` tree: all authenticated routes (`billing`, `repairs`, `print-jobs`, `inventory`, `customers`, `reports`) render inside `AppShell` (`src/app/layout/`), which provides the header/sidebar chrome. `/login` is outside the shell. Unknown paths and `/` redirect to `/billing`.
- `AppProviders` sets up, in order: Redux (`Provider` from `react-redux`, `store` from `src/store/index.ts`), TanStack Query (`QueryClientProvider`, 5 min `staleTime`, no refetch-on-focus), Mantine (`MantineProvider` with `mantineTheme` from `src/styles/theme.ts`, `mantineCssVariableResolver` from `src/styles/cssVariablesResolver.ts`, and `colorSchemeManager={reduxColorSchemeManager}`), `Notifications`, `ModalsProvider`. Mantine/notifications/dates CSS is imported here — new Mantine subpackages (e.g. carousel, dropzone) need their CSS imported wherever they're first used.
- `src/styles/theme.ts` defines the custom `fontSizes`/`spacing` scales (including non-default tokens like `"2xl"`–`"5xl"` and `"3xs"`–`"3xl"`) and per-component default props (`Container`, `Paper`, `Card`, `Select`) — prefer these theme tokens over hard-coded pixel values, and extend `components` here rather than passing repeated default props at call sites. `src/styles/cssVariablesResolver.ts` is the place to add custom CSS variables (light/dark/scheme-independent) consumed via `var(--...)`.
- `defaultRadius: 'lg'` in `src/styles/theme.ts` sets the app-wide corner radius. **All components should use a large radius** — don't pass a smaller explicit `radius="md"`/`"sm"` (or `var(--mantine-radius-md)`, etc.) that overrides this default; either omit `radius` to inherit it or set it to `"lg"` explicitly.

**Feature modules** (`src/features/<name>/`): each feature (`auth`, `billing`, `customers`, `inventory`, `print-jobs`, `repairs`, `reports`) follows the same shape — `components/`, `types.ts`, and an `index.ts` barrel that re-exports the public component(s) and `* from './types'`. Import features only through their barrel (`@/features/billing`), not by reaching into `components/`.

**Path alias**: `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts` via `vite-tsconfig-paths`). Always import with `@/...` rather than relative `../../` paths across module boundaries.

**Cross-cutting layers**:

- `src/api/client.ts` — a single `ApiClient` class (`apiClient` singleton) wrapping `fetch`, base URL from `env.apiBaseUrl`, auto-attaches `Bearer` token from `localStorage[STORAGE_KEYS.AUTH_TOKEN]`, normalizes failures into the `ApiError` shape (`src/shared/types/common.ts`).
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
