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
- **Toggle buttons with state-dependent text must use fixed widths with `flexShrink: 0`.** When a button toggles its label text based on state (e.g. _"Expand All"_ / _"Collapse All"_, _"Low Stock Only"_ / _"Showing Low Stock"_), do not rely on auto width or `minWidth` alone — text length changes expand/contract the button and cause adjacent layout elements (like search `TextInput`s) to shift. Always set an explicit fixed width and `flexShrink: 0` (e.g., `style={{ width: 180, flexShrink: 0 }}`) so the button and surrounding row items stay completely fixed.
- **Print documents are exempt.** `src/shared/print/documents/` is fixed `mm`/`px` geometry on purpose. Make the _preview container_ scroll on both axes and scale the page down; never make the document itself fluid.
- **Rows inside a `ScrollArea` don't shrink on their own.** Mantine wraps ScrollArea content in a `display: table` element, which is sized to max-content — so `flex: 1; min-width: 0` and `lineClamp` have no effect and wide rows spill past the container instead of compressing. Pass `classNames={{ viewport: 'scrollarea-fluid-content' }}` (defined in `src/styles/global.css`) whenever the content should be bounded by the container rather than define its width.
- Mantine 9's `Grid` takes **`gap`**, not `gutter` (that was Mantine 7).

Verify with the real thing: `npm run dev`, then walk the full flow at 375, 414, 768, 1024, 1280 and 1920 — plus at least one pass in dark mode — and assert `document.documentElement.scrollWidth <= window.innerWidth` at every width.

## UI copy — write for a non-technical shop user

**The person using this app runs a repair/retail shop; they are not a developer and may not be a native English speaker.** Every string that reaches the screen — labels, placeholders, helper text, empty states, validation messages, toast titles, tooltips, `aria-label`s — is written for them, not for us. This is a hard requirement on every UI change, the same as responsiveness.

- **No standards names, formats, or internals in user-facing text.** `EAN-13`, `GS1`, "internal prefix 20", "minted on save", `SKU` collision rules, `local_` ids, "delta", "cursor", "outbox", "idempotency" — none of it means anything to a shop owner. Say what the feature _does for them_: "Create a barcode for me" / "A scannable shop barcode is made when you save." Keep the technical term only where the user genuinely searches for it (`SKU` on a printed label), never as the explanation.
- **No developer/DB jargon as adjectives.** "Immutable" → "cannot be changed". "Validation error" → "Please check the …". "Vendor" → "Supplier" (pick one word for a concept and use it everywhere; don't alternate "Vendor / Supplier"). "Intake" → "Received".
- **Say plainly when something is optional, and when it repeats.** Any section that accepts one _or many_ rows must say so in its empty state, in plain words — e.g. the product form's supplier section reads "Add one supplier, or add several if you bought this item from more than one place. You can skip this." A user who doesn't know a section is repeatable will cram two suppliers into one row; a user who doesn't know it's optional will invent data to fill it. Once rows exist, keep pointing at the repeat affordance by name ("Add each supplier separately with 'Add Another Supplier'"), and number the rows for humans (`Supplier 1`, not `Supplier Batch #1`).
- **Validation messages say what to do, not what failed.** "A barcode should be 8 to 14 numbers, with no letters or spaces", not "must match /^\d{8,14}$/" or "invalid format". "This supplier is already added above", not "Duplicate vendor selected".
- **Prefer a short question or instruction as a heading** where it makes the intent obvious ("Who did you buy this from?"). Sentence case for helper text, full sentences with a full stop.
- Keep the `aria-label` in the same plain language as the visible label — screen-reader users get no benefit from the internal name.

`ProductFormModal.tsx`'s supplier and barcode blocks are the reference for the tone.

## Center modals — one visual family

Every center-opening `Modal` (as opposed to a `Drawer` side panel) follows the pattern set by `ProductFormModal.tsx` ("Add New Inventory Product") — new modals should default to this rather than inventing their own header/footer/color treatment:

```tsx
<Modal
  opened={opened}
  onClose={onClose}
  title={
    <Text fw={700} size="lg">
      {isEditing ? `Edit: ${entity.name}` : 'Add New X'}
    </Text>
  }
  size="lg"
  centered
  fullScreen={isMobile}
>
```

- **Title is plain text, no icon.** `<Text fw={700} size="lg">` — no leading `ThemeIcon`, no `Kbd` shortcut chip, no subtitle line under the title. If the title needs to carry an identifier, fold it into the string itself the way `ProductFormModal` does with `Edit: ${productToEdit.name}` (e.g. `A4InvoicePreviewModal`'s `Invoice Preview — {invoice.invoiceNumber}`) rather than adding a second line.
- **No `radius` prop.** `defaultRadius: 'md'` in `theme.ts` already applies; an explicit `radius="var(--mantine-radius-default)"` on a `Modal` (or any component) is redundant — omit it.
- **`centered` and `fullScreen={isMobile}` on every center modal**, no exceptions except very small (`size="sm"`) confirmation dialogs like `ConfirmDialog` — a full-screen sheet for a yes/no question is worse UX than a small centered overlay, so those get `centered` only.
- **Footer**: `<Group justify="flex-end" mt="md" gap="sm"><Button variant="default" onClick={onClose} disabled={loading}>Cancel</Button><Button type="submit" color="blue" loading={loading}>{isEditing ? 'Save Changes' : 'Create X'}</Button></Group>` — Cancel is always `variant="default"` (never `subtle`), the primary action is always `blue` (or omitted, since `primaryColor: 'blue'` is the theme default).
- **Section labels inside the body**: `<Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Label</Text>`.
- **Brand/feature accents are `blue`**, not a color picked per feature (no per-module indigo/teal/orange). This does **not** apply to semantic colors that carry independent meaning: `green` for a profit/positive amount, `orange` for a warning `Alert`, `red` for a destructive action's `confirmColor` — those stay as-is.

There's no shared `<AppModal>` wrapper — every modal styles Mantine's `Modal` inline, consistent with the rest of the codebase's per-component styling. `ProductFormModal.tsx` is the reference implementation; `ConfirmDialog.tsx` is the reference for small confirmation dialogs.

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
- `src/styles/theme.ts` defines the custom `fontSizes`/`spacing` scales (including non-default tokens like `"2xl"`–`"5xl"` and `"3xs"`–`"3xl"`) and per-component default props (`Container`, `Paper`, `Card`, `Select`, `Tooltip`, `HoverCard`) — prefer these theme tokens over hard-coded pixel values, and extend `components` here rather than passing repeated default props at call sites. `src/styles/cssVariablesResolver.ts` is the place to add custom CSS variables (light/dark/scheme-independent) consumed via `var(--...)`.
- `defaultRadius: 'md'` in `src/styles/theme.ts` sets the app-wide corner radius. **All components should use the default radius** (`var(--mantine-radius-default)`) — prefer omitting the `radius` prop entirely so components inherit it. If a place needs the radius stated explicitly (e.g. a raw CSS `border-radius` outside a `radius` prop), reference `var(--mantine-radius-default)` rather than hard-coding pixels/fixed tokens, so it keeps tracking the theme default. Never pass a smaller explicit `radius="sm"` or override unless specifically required.
- **Interactive Tooltips & HoverCards**: `InteractiveTooltip` (`src/shared/components/InteractiveTooltip.tsx`) is the standard component across the app for interactive or rich tooltips (built on Mantine's `HoverCard` so the mouse can smoothly enter the tooltip without closing). It automatically uses `var(--bg-card)`, `var(--border)`, `var(--text-primary)`, `var(--text-secondary)`, and `var(--mantine-radius-default)` to support light/dark theme switching seamlessly. It supports `title`, `description`/`content`, leading `icon`, `shortcut` key chips ([`Kbd`]), `badge`, and custom `footer` nodes. `ExpandableCard` (`src/shared/components/ExpandableCard.tsx`) natively supports a `tooltip` prop (`string`, `ReactNode`, or `InteractiveTooltipProps`) on its header without interfering with independent action buttons (e.g., used on Existing Categories cards in `CategoryManagerModal.tsx` to indicate sub-categories).

**Feature modules** (`src/features/<name>/`): each feature (`auth`, `billing`, `customers`, `inventory`, `print-jobs`, `repairs`, `reports`) follows the same shape — `components/`, `types.ts`, and an `index.ts` barrel that re-exports the public component(s) and `* from './types'`. Import features only through their barrel (`@/features/billing`), not by reaching into `components/`.

**Path alias**: `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts` via `vite-tsconfig-paths`). Always import with `@/...` rather than relative `../../` paths across module boundaries.

**Cross-cutting layers**:

- `src/api/client.ts` — a single `ApiClient` class (`apiClient` singleton) wrapping `axios`, base URL from `env.apiBaseUrl`, auto-attaches `Bearer` token from `localStorage[STORAGE_KEYS.AUTH_TOKEN]`, normalizes failures into the `ApiError` shape (`src/shared/types/common.ts`).
- `src/api/queryKeys.ts` — centralized TanStack Query key factory, one namespace per feature (`billing`, `repairs`, `printJobs`, `inventory`, `customers`, `reports`). Add new query keys here rather than inlining key arrays in components/hooks.
- `src/constants/` — shared business constants, re-exported through `index.ts`: `payment.ts` (`CURRENCY`, LKR/"Rs.", `PAYMENT_METHODS`), `jobs.ts` (repair job status enum + labels + colors, `JOB_STATUS*`), `routes.ts` (`ROUTES` absolute + `ROUTE_PATHS` relative — a new route needs an entry in **both**), `roles.ts`, `ui.ts` (default pagination), `storage.ts` (`STORAGE_KEYS` — localStorage key names; add new keys here rather than inlining string literals). Note several mock stores still hard-code their keys and bypass `STORAGE_KEYS`; don't copy that.
- `src/config/env.ts` — typed wrapper over `import.meta.env`.
- `src/shared/` — cross-feature reusable code: `components/` (e.g. `DataTable`, `MoneyInput`, `ConfirmDialog`, `EmptyState`, `PageHeader`, `InteractiveTooltip`, `ExpandableCard`), `lib/` (`money.ts`, `date.ts`, `print.ts`), `types/common.ts` (`PaginatedResponse`, `ApiError`, `ApiResponse`, `SelectOption`).

**State management (Redux Toolkit)**: `src/store/` is the app's single global client-state layer — there is no other state library in this project (no Zustand/Context-based stores). `src/store/index.ts` builds the store via `configureStore` and exports `RootState`/`AppDispatch`; always use the typed `useAppDispatch`/`useAppSelector` from `src/store/hooks.ts` instead of the raw `react-redux` hooks. New client state goes into a new slice under `src/store/slices/`, following `cartSlice.ts`'s pattern: plain field reducers via `createSlice` (Immer draft mutation), with any derived/computed values exposed as memoized selectors (`createSelector`) rather than recomputed inline in components.

- `src/store/slices/cartSlice.ts` — the active billing cart (line items, customer, discount, payment method). Derived totals (`selectSubtotalCents`/`selectTaxCents`/`selectTotalCents`/`selectCartItemsCount`) are selectors, not stored state — don't add `subtotalCents` etc. as actual reducer fields.
- `src/store/slices/themeSlice.ts` + `src/store/colorSchemeManager.ts` — color-scheme (`'light' | 'dark'`) state, with a custom `MantineColorSchemeManager` (`reduxColorSchemeManager`) bridging it to `MantineProvider`, so Redux — not Mantine's default `localStorage` manager — is the single source of truth. Persisted via a `createListenerMiddleware` listener (`src/store/listenerMiddleware.ts`) to `localStorage[STORAGE_KEYS.COLOR_SCHEME]`. `index.html` has an inline `<script>` duplicating the same initial-scheme resolution logic to prevent a flash of the wrong theme on load — if the storage key or fallback logic ever changes, update both `themeSlice.ts`'s `getInitialColorScheme()` and that script together.
- `src/store/slices/syncSlice.ts` — a **read-only mirror** of the offline sync engine's state. Only the engine dispatches into it (via `SyncProvider`); components read it through selectors. The durable source of truth is Dexie's `syncMeta` table — see **Offline & sync** below.
- **Design tokens**: `src/styles/cssVariablesResolver.ts` defines the app's neutral palette as scheme-flipping tokens — surfaces (`--bg-app`, `--bg-sidebar`, `--bg-card`, `--bg-hover`, `--bg-active`), borders (`--border`, `--border-strong`), text (`--text-primary`, `--text-secondary`, `--text-muted`), and status (`--status-ok`, `--status-busy`, `--status-warn`, `--status-error`, `--status-idle`, each with a `-bg` pair). Status tokens are named by meaning, not colour. Style with `var(--bg-card)` / `var(--text-muted)` etc.; never a raw hex, so a theme switch is only a value flip. Mantine's semantic vars (`--mantine-color-body`, `-default`, `-default-hover`, `-default-border`, `-text`, `-dimmed`, `-placeholder`) are re-pointed at these tokens in the same file, so built-in Mantine components follow the palette automatically — either name works, prefer the `--bg-*`/`--text-*` tokens in app code.
- **Dark-mode-safe styling**: never use fixed swatch vars (`--mantine-color-gray-0`…`-9`) or raw hex codes for anything that should look right in both themes — swatch vars don't change between light/dark. Both the light and dark values live in `cssVariablesResolver.ts`; define every token in both blocks so a scheme switch is only a value flip. (`theme.ts` defines one custom colour, `amber`, and no `colors.dark` override — Mantine's built-in dark scale applies.)

**No implicit fallbacks — be explicit**: don't paper over a missing value with `||` / `??` defaults, and don't invent a default at the consumption site (`textAlign: col.align || 'left'`, `icon || <IconInbox />`, `getElementById('root') || getElementById('app')` are all the anti-pattern). If a value matters to how something renders or behaves, make the field **required** in the type so every call site states it exactly — `align: 'left' | 'center' | 'right'` on `Column`, not `align?`. If a value is genuinely optional, let it be `undefined` and pass it straight through (e.g. `width: col.width`) rather than substituting a guessed stand-in. The narrow exception is documented environment configuration (`src/config/env.ts`), where a fallback is the declared default for a missing `import.meta.env` var.

**Money handling**: all monetary values are stored and passed around as integer cents (`unitPriceCents`, `totalCents`, etc.), never floats. Use `src/shared/lib/money.ts` (`toCents`, `fromCents`, `formatMoney`, `parseMoneyToCents`, `calculateTaxCents`, `calculateTotalCents`) to convert/format/compute — don't do ad hoc float math on currency.

**Backend status — mixed**: inventory (products, categories), suppliers, supplier-products, purchases and auth are on a real REST backend under `env.apiBaseUrl` (`/api` by default). Billing/invoices, customers, repairs, print-jobs, employees and payments still run on `LocalStorageStore` mocks (`src/shared/lib/localStorageStore.ts`) and are the remaining migration work.

## Offline & sync

The shop loses internet regularly (power cuts, ISP outages), so the app is **offline-first**. Every synced resource is mirrored into IndexedDB via Dexie (`src/offline/db/schema.ts`) and **the UI reads that mirror, never the network**. Writes apply locally first and queue in a durable outbox that flushes when connectivity returns.

`src/offline/` is a cross-cutting layer, peer to `src/api/` and `src/store/` — it sits underneath every feature. `src/features/sync/` holds only the UI (status badge, drawer, settings section). Currently only the **inventory domain** is wired through it; other modules adopt it one descriptor at a time.

### The four hard rules

1. **Never call `apiClient` — directly, or through a feature's `api/` module — for a synced resource.** Reads go through `useSyncedQuery`, writes through `useSyncedMutation`. A direct call bypasses the mirror and the outbox, and simply fails when offline. The descriptors in `src/offline/resources/` are the _only_ modules allowed to import a synced resource's `api/` functions.
2. **Dexie is the source of truth for the UI; TanStack Query is only for non-synced resources** (reports, `/auth/me`). Do not reintroduce `invalidateQueries` for synced data — `liveQuery` already re-renders every subscriber, in this tab and in others. Two caches over the same rows is the bug this design exists to avoid.
3. **Never store an absolute value for anything that accumulates.** Stock is the server's baseline plus a local delta ledger (`src/offline/engine/stockLedger.ts`); effective stock is the sum. Deltas commute across devices, absolute overwrites do not — two terminals each selling one unit must produce `-1` and `-1`, not two conflicting totals. The same rule applies to any future counter (customer balances, employee earnings).
4. **Never invent a server-generated identity locally.** `sku`, auto-generated barcodes and every `key`/`id` come from the server. Rows created offline get a provisional `local_<uuid>` id (`src/offline/ids/localId.ts`) and the engine rewrites every reference to it at flush time. Render a missing `sku` as a "Pending" affordance — never as a placeholder value.

### Adding a module to sync

Write one descriptor in `src/offline/resources/<name>.resource.ts` (`SyncResource<TEntity>`, see `src/offline/types.ts`) and register it in `src/offline/resources/index.ts`. `products.resource.ts` is the fullest worked example. The descriptor states:

- `id` / `label` — the Dexie table name, the `syncMeta` key, and the dashboard label.
- `primaryKey` / `restId` / `serverGeneratedFields` — identity.
- `dependsOn` — resources that must pull and flush first. A supplier-product link declares `['products', 'suppliers']`, which is what guarantees a product created offline reaches the server before the link naming it. Cycles throw at startup.
- `pull` — `delta(cursor)` plus a `full()` snapshot used on first sync, cursor rejection and force-resync. A resource with no "list everything" REST route (purchases, supplier links, stock movements) builds its snapshot from `fetchResourceSnapshot`, which pages `/sync/changes` cursorlessly. `intervalMs` is currently **not read** — the engine runs one global `PULL_INTERVAL_MS` timer for every resource.
- `operations` — one entry per write, via `defineOperation<TPayload>()`. Each has `localApply` (optimistic Dexie write, runs inside the same transaction as the enqueue), `push` (the HTTP call, with references already rewritten), `references` (which payload paths hold provisional ids, and whether an unresolved one blocks or is dropped) and `describe` (the label in the pending-changes list). **A compound server-side write is one operation, never several** — the backend does it transactionally, so splitting it would invent a partial-failure state that cannot occur.
- `conflictPolicy` — per failure class. Use `replay` only for append-only or commutative operations, `retry-with-server-version` only for documented idempotent upserts, and `manual` whenever auto-resolution would silently lose a field. Any full-replace `PUT` qualifies as `manual` — `suppliers` is the example.
- `invalidates`, `allowOfflineCreate`, `retention`.

Then swap the feature's hooks over. Keep the returned shape (`data`/`isLoading`/`isPending`/`isFetching`, `mutate`/`mutateAsync`) so call sites don't churn — the inventory migration touched about a dozen lines across two 1,000-line components.

### Connectivity

`navigator.onLine` alone is **not** a connectivity signal — it only sees the link layer, so a terminal on a router with no upstream reports `true`. The single source of truth is `ConnectivityMonitor` (`src/offline/connectivity/`), which combines it with the `statusCode: 0` signal from the `apiClient` interceptor and a `GET /health` probe. Hysteresis is deliberately asymmetric: going offline publishes immediately, coming back online is held for a settle window. Read it via `selectConnectivityState`; never call `navigator.onLine` in a component.

### Notifications

Sync toasts are the only place in the codebase that use a stable notification `id` with `notifications.update()` (`src/features/sync/lib/syncNotifications.ts`) — everywhere else fires one toast per event. Colour semantics extend the app's existing set: **orange = offline (expected, the app still works)**, **red = a human must act**. Don't use red for offline.

Toast triggers are edge-triggered, and the bookkeeping for that lives at module scope in `SyncProvider` — the engine is a singleton whose effect re-runs on every auth flip and twice under StrictMode, so effect-local state would re-announce an outage the user already saw. "Saved to the server" fires only when the change had actually been waiting; online, every edit flushes within a second and toasting each one buries the user.

### Local schema changes

Bump the Dexie version in `src/offline/db/schema.ts`; never edit an installed version in place. Mirror tables are derived state and may be truncated and re-pulled (clear the resource's cursor and the next pull full-refreshes). The `outbox`, `idMap`, `conflicts` and `stockLedger` tables hold data that exists nowhere else and must be migrated in place, never dropped. Index `_pending` and `_isDeleted` on every mirror — the shared pull and maintenance code queries them uniformly, and IndexedDB cannot index `null`, which is why `_isDeleted` exists alongside `_deletedAt`.

### Auth while offline

`initializeAuth` treats anything short of an outright rejection as _unverified_, not _invalid_: it restores the cached identity from Dexie and sets `isOfflineSession`, with a 7-day grace period. **Only 401/403 signs the user out** — an unreachable server and a 500 from `/auth/me` both leave the session intact, since neither says the credentials went bad.

The session is cached on **login** as well as on a successful `/auth/me` (`cacheSession` in `authSlice`'s `login`/`loginSuccess` reducers). Caching only in `initializeAuth` meant a cashier who logged in and then lost connectivity had nothing to restore from on the next reload, and the grace period never applied.

**Logging out never clears the local database** — a cashier's queued offline work must survive an expired session.

### Backend contract

The sync contract is **implemented** in `../backend` (Rust/Axum). The engine is not in degraded mode and should not be written as though it were.

- Every syncable collection carries `version` (bumped per write), `created_at`, `updated_at` and `deleted_at` — **soft delete, rows are never hard-deleted**, or a delta pull cannot see the deletion and the row resurrects.
- **`GET /sync/changes`** — one multiplexed delta endpoint, so a reconnect is one round trip. Query is `?resources=a,b&cursors=<json>&limit=n`, where `cursors` is a JSON object (a `resource=cursor` comma list is also accepted — note `=`, not `:`). Cursors are opaque, per-resource, URL-safe base64 of `millis|key`, and valid for 90 days; `400 CURSOR_INVALID` triggers a full refresh. `limit=0` means "cursor only, no items".
- **Items are the same DTOs the REST read endpoints return** — camelCase, server-resolved display fields present (a product's `category`/`subcategory` names, a category's nested `subcategories`), no BSON `$oid`/`$date` wrappers. The client mirrors the delta and snapshot feeds into one table, so anything else corrupts rows depending only on which feed delivered them. `backend/tests/sync_test.rs::sync_changes_items_match_the_rest_dto_shape` locks this down. `subcategories` is **not** a standalone syncable resource; it is folded into `categories`.
- **`GET /sync/status`** — per-resource `lastUpdatedAt` **and** the cursor for the newest row. That cursor is how a client starts syncing incrementally after a snapshot; it cannot be derived from `/sync/changes`, which pages oldest-first and would hand back the _first_ row's cursor (adopting that replays the whole collection every time).
- **`Idempotency-Key` on every mutating request**, stored key → response for 7 days. This is what makes retrying a request that succeeded but whose response was lost to a power cut safe. A concurrent retry gets `409 IDEMPOTENCY_IN_PROGRESS` with `Retry-After` — **transient, not a conflict**.
- `If-Match: <version>` → `409 VERSION_CONFLICT` with the server's current row in `details.server`.
- `GET /api/health` (cheap, no DB access) and an `X-Server-Time` response header on every response for clock-skew detection.
- `409 INSUFFICIENT_STOCK` on stock adjustment — **the server is the oversell authority**; no client-side guard can be, and two offline terminals will both try to sell the last unit.
- A server-issued `key` must **never** start with `local_`.
- Mongo indexes are ensured at startup (`backend/src/clients/indexes.rs`). Two of them are correctness-critical, not just performance: `(updated_at, key)` is the exact sort the cursor scan pages by, and the unique `(key, user_id)` on `idempotency_keys` is what makes the replay guard's race branch reachable at all.

`POST /sequences/{name}/reserve` is implemented for server-reserved number blocks. Billing has not adopted it yet: sequential human-facing numbers (`INV-2026-0042`, `REP-…`, `PRT-…`) still come from a localStorage counter that will issue duplicates across terminals, and the repairs/print-job generators derive from array _length_, so deleting a job re-issues a live number. Switch them to reserved blocks when billing adopts sync.

### PWA

`vite-plugin-pwa` precaches the app shell — without it a reload during an outage shows the browser's offline page and the local database is unreachable, defeating the whole design. Three rules: `registerType: 'prompt'` (never `autoUpdate` — an update reloads the page and the active cart is not persisted, so `AppUpdatePrompt` withholds it until the cart is empty); **no `runtimeCaching` for `/api`** (Dexie is the data cache, and a cached 200 would make a dead backend look online); and `navigateFallbackDenylist: [/^\/api\//]`. The service worker is disabled in dev — test offline against `npm run preview`.
