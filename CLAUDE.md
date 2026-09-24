# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A point-of-sale system for a repair/retail shop (billing, repairs, print jobs, inventory, customers, reports). React 19 + TypeScript + Vite, using Mantine 9 as the UI kit.

## Commands

Scripts are in `package.json`. Note this project runs **both** test runners — `npm run test:all` = Vitest (`test`) + Jest (`test:jest`).

**After every change or new implementation**, create comprehensive Jest/Vitest unit tests for all modified and new parts, run `npm run test:all && npm run format && npm run lint && npm run type-check && npm run build`, and fix any errors reported before considering the work done.

**Every UI change must be responsive** — verify it holds up across mobile, tablet, and desktop widths (the `AppShell` navbar already collapses at the `sm` breakpoint; follow that pattern rather than hard-coding fixed widths/pixel layouts). See **Responsive & mobile UI** below for the tiers, the hook to use, and the rules every new screen has to satisfy.

## Responsive & mobile UI

The app targets three layout tiers. `src/styles/theme.ts` defines **no** custom `breakpoints`, so Mantine 9's defaults apply: `xs` 36em/576px, `sm` 48em/768px, `md` 62em/992px, `lg` 75em/1200px, `xl` 88em/1408px. (Don't confuse these with `CONTAINER_SIZES` in `theme.ts` — those are `Container` size overrides, not breakpoints.)

| Tier      | Width                  | Shape                                       |
| --------- | ---------------------- | ------------------------------------------- |
| `mobile`  | below `sm` (768px)     | one full-screen region at a time            |
| `tablet`  | `sm`–`lg` (768–1199px) | two columns, the secondary one tab-switched |
| `desktop` | `lg`+ (1200px)         | the full multi-column layout                |

**Picking a tier**: use `useLayoutTier()` / `useIsMobile()` from `src/shared/hooks/useResponsive.tsx` — never call `useMediaQuery` with a hand-written query string, and never hard-code `768`/`1200` in a component. Both hooks read from a single `LayoutTierProvider` subscription (mounted once in `src/app/providers.tsx`, above the router) rather than opening their own `useMediaQuery` listener — with ~40 call sites, independent listeners meant one breakpoint crossing fired a synchronized re-render burst across the whole tree at the exact moment layout-dependent CSS transitions were trying to animate. The hook passes `getInitialValueInEffect: false` so the tier resolves on the first render; Mantine's default would flash the wrong layout for a frame. Its `below()` helper subtracts the same fraction Mantine's own `visibleFrom`/`hiddenFrom` do, so a JS tier check and a CSS `visibleFrom` on the same breakpoint always agree.

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
- **The sidebar adapts to viewport _height_, not just width.** `useSidebarDensity` (`src/app/layout/sidebarDensity.ts`) measures the navbar against its own content with a `ResizeObserver` and steps `SIDEBAR_DENSITY_PRESETS` (`comfortable → compact → dense`) so the nav fits without an internal scrollbar; `dense` drops the uppercase group labels for plain dividers, and the root `overflowY: 'auto'` is the floor below it. The footer (Settings / theme toggle / Sign Out) stays bottom-pinned in every tier via `flex: '1 0 auto'` on the content group + `flexShrink: 0` on the footer — never `justify-content: space-between` (which pushes the first child above the scroll origin when it overflows). `Sidebar.tsx` calls the hook once for both the full and rail layouts (`enabled = !isMobile`; mobile is a scrollable drawer and stays `comfortable`).
- **Chart containers must never use scrollbars (horizontal or vertical).** Wrap charts with `ChartCard` (`src/features/reports/components/ChartCard.tsx`) which enforces `overflow: 'hidden'`, `width: '100%'`, and `minWidth: 0`. Mantine/Recharts chart components (`AreaChart`, `BarChart`, `LineChart`, `CompositeChart`, `DonutChart`) dynamically resize to 100% width via Recharts `ResponsiveContainer`; setting `overflowX: 'auto'` or `overflow: auto` causes fractional subpixel differences to trigger persistent horizontal scrollbars.
- Mantine 9's `Grid` takes **`gap`**, not `gutter` (that was Mantine 7).

Verify with the real thing: `npm run dev`, then walk the full flow at 375, 414, 768, 1024, 1280 and 1920 — plus at least one pass in dark mode — and assert `document.documentElement.scrollWidth <= window.innerWidth` at every width.

## Animation performance

Every animation in the app must play smoothly — no dropped frames, no visible stutter. The rules below come from a real incident: navigating into the Billing screen appeared to make the left navbar "shrink" with a stuck animation. The actual cause wasn't anything billing-specific — it was `AppShell`'s own chrome transition (driven by `isBillingPage`) racing Billing's heavy first mount, worsened by an unrelated `left`-property animation and an app-wide re-render fan-out. Follow these rules so the same class of bug doesn't come back.

- **Only animate `transform` and `opacity`.** Those are the only two CSS properties the browser can update on the compositor thread without a `layout`/`paint` pass. Never animate `left`/`top`/`right`/`bottom`/`width`/`height`/`padding`/`margin` — if something needs to slide or resize, animate a `transform: translate()`/`scale()` instead. `transform`'s percentage values resolve against the animated element's **own** box, not its parent, so sliding relative to a fluid parent needs the parent's pixel width measured via `ResizeObserver` first — see `AmountInput.tsx`'s mode-toggle slider and `CartPanel.tsx`'s scroll-affordance observer for the reference pattern.
- **A route/screen boundary should snap, not animate.** Entering/leaving a screen is a navigation, not a resize — if a screen change (e.g. `AppShell`'s billing-specific header height / navbar width / padding) drives a Mantine transition, suppress that transition for the one render where the boundary is crossed (see `AppShell.tsx`'s `isBillingBoundaryChange` render-time state adjustment), and only let it animate for genuine in-page dimension changes (a tier crossing, a focus-mode toggle). An animated chrome resize landing in the same frame as a heavy screen's first mount is what makes it look "stuck" — the main thread can't keep up with per-frame layout work while it's busy committing a large render tree.
- **Never call `useMediaQuery` directly in a component.** Always go through `useLayoutTier()`/`useIsMobile()` (see **Responsive & mobile UI** above) — this isn't just about breakpoint consistency, it's what keeps a single breakpoint crossing from re-rendering dozens of components at once and colliding with whatever CSS transition is trying to animate that same dimension change.
- **Don't pair a `@keyframes animation` with `transition: all` on the same element.** `transition: all` re-evaluates every animatable property on every style recalculation, which is redundant work when a keyframe animation is already running and nothing else on the element actually changes conditionally. Scope `transition` to the specific properties that do (e.g. `border-color 0.15s ease, box-shadow 0.15s ease`), or drop it entirely if nothing else changes — see `CatalogPanel.tsx`'s scan-bar `Paper` and `CartLineItem.tsx`'s flash-row `Paper`.
- **Debounce a `ResizeObserver` that drives re-renders during a window drag.** A `ResizeObserver` fires every frame while the user drags a window edge; if its callback calls `setState` that changes padding / gaps / element visibility, the subtree re-renders on every one of those frames and visibly shakes. `useSidebarDensity` (`src/app/layout/sidebarDensity.ts`) never changes the tier straight from an RO event — it only (re)arms a `SETTLE_DELAY` (120 ms) timer, so the tier is frozen mid-drag and settles **once**, in a ≤3-frame `requestAnimationFrame` step-sequence, after the drag stops. All the observer/timer/measurement state lives in a mutable ref box behind a **callback ref** (never React state), so re-attaching on a standard↔rail layout swap is clean and a density change can't feed a render synchronously back into the effect.

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

## Right-side detail & profile drawers — one visual family

Every right-side entity detail drawer (e.g. Item Specifications, Supplier Profile, Employee Profile & Commission, Customer Profile) follows the standard established by `ProductTable.tsx` ("Item Specifications"), `SupplierDetailDrawer.tsx` ("Supplier Profile"), and `EmployeeDetailDrawer.tsx` ("Employee Profile & Commission"):

```tsx
<DetailDrawer
  data={entity}
  opened={opened}
  onClose={handleClose}
  size={isMobile ? '100%' : 'md'}
  title={
    <Group gap="xs">
      <ThemeIcon
        color="blue"
        variant="light"
        size="lg"
        radius="var(--mantine-radius-default)"
      >
        <IconEntity size={20} />
      </ThemeIcon>
      <div>
        <Text fw={800} size="md">
          {Entity} Profile & Details
        </Text>
        <Text size="xs" c="dimmed">
          Entity Specifications, Contacts & Records
        </Text>
      </div>
    </Group>
  }
>
```

- **Header Structure**: `<Group gap="xs"><ThemeIcon color="blue" variant="light" size="lg"><Icon size={20} /></ThemeIcon><div><Text fw={800} size="md">Title</Text><Text size="xs" c="dimmed">Subtitle</Text></div></Group>`.
- **Hero Identity Card**: `<Paper p="md" radius="var(--mantine-radius-default)" withBorder bg="var(--mantine-color-body)">` displaying top status/key badges, large entity title (`<Text fw={800} size="lg">`), primary contact/tag pills, and rule/highlight sub-cards.
- **3-Column Metrics Snapshot**: A 3-column `<Grid gap={0}>` `<Paper p="md" withBorder>` with `borderRight` column dividers displaying high-level financial & operational metrics (e.g., _Selling/Cost/Margin_ or _Commission/Jobs/Revenue_ or _Products/Intakes/Spend_).
- **Tabbed Operations & Activity (`Tabs`)**: High-density interactive views with `<Tabs.List grow>` and concise labels (e.g. `[ Products (12) ] [ Intake (4) ] [ Details ]` or `[ History (8) ] [ Split Rules ] [ Details ]`) to ensure tabs fill the width evenly and never wrap into multi-line rows.
- **Inline Expandable Actions (`<Collapse expanded={...}>`)**: Provide quick inline forms (linking items, recording stock receipts, quick filters) directly inside the drawer without forcing full-page or modal navigation jumps.
- **System Metadata & Actions**: Metadata rows (`Registered On`, `Last Updated`, `Key / ID`) followed by a standard footer with `Delete` (red light with `IconTrash`), `Close` (`variant="default"`), and `Edit Details` (`variant="filled" color="blue"` with `IconEdit`).

## Dashboard KPI cards

`MetricCard`/`MetricCardRow` (`src/shared/components/MetricCard.tsx`) is the reference component for a screen's top-of-page KPI strip — e.g. Sales & Invoices History's Today's Sales/Invoices/Outstanding Credit/Avg Basket Value, or Repair Jobs'/Print Jobs' Today's Jobs/Revenue/Open Tickets/Avg Value. Render a `<MetricCardRow cards={[...]} staleAsOf={...} />` rather than hand-rolling another `Paper`/`Group`/`ThemeIcon`/`Skeleton` block — it already reproduces the established shape (uppercase dimmed label, `xl`/`fw={700}` colored tabular-nums value, light-variant `ThemeIcon`, `Skeleton` while loading) and the `SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}` responsive layout.

These numbers must come from the backend, never be calculated client-side from a full list fetch — see the matching precedent in the backend CLAUDE.md's "Dashboard stats endpoints" section. Fetch them with `useModuleStats` (`src/shared/hooks/useModuleStats.ts`), a plain TanStack Query hook that also writes the result into Dexie's `statsCache` table (`src/offline/db/tables.ts`'s `StatsCacheRow`) on every successful fetch — a last-known-value cache the hook falls back to reading when a fetch fails, independent of anything else in `src/offline/` (see **Local database** below). `useBillingStats`/`useRepairStats`/`usePrintJobStats` are the thin per-module wrappers; follow that pattern (`useModuleStats(module, queryKeys.<module>.stats(), fetch<Module>Stats)`) for any new KPI-backed screen rather than writing a bespoke hook.

## Charts, analytics containers & the Reports Engine feed

See `src/features/reports/CLAUDE.md` — loads automatically when working in that feature.

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
- `src/config/env.ts` — typed wrapper over `import.meta.env`. Multi-tenant web build (`VITE_MULTI_TENANT=true`): the login asks for a shop code, prefills it from a `?shop=<code>` link (the SimpleBash app's "Open POS" button; a valid link code wins over the remembered one, see `getInitialShopCode` in `features/auth/lib/shopCode.ts`), and shows a "Create your shop" link to `env.accountsUrl` (`VITE_ACCOUNTS_URL`, default https://app.simplebash.com) for people without a shop.
- `src/shared/` — cross-feature reusable code: `components/` (e.g. `DataTable`, `MoneyInput`, `ConfirmDialog`, `EmptyState`, `PageHeader`, `InteractiveTooltip`, `ExpandableCard`), `lib/` (`money.ts`, `date.ts`, `print.ts`), `types/common.ts` (`PaginatedResponse`, `ApiError`, `ApiResponse`, `SelectOption`).

**State management (Redux Toolkit)**: `src/store/` is the app's single global client-state layer — there is no other state library in this project (no Zustand/Context-based stores). `src/store/index.ts` builds the store via `configureStore` and exports `RootState`/`AppDispatch`; always use the typed `useAppDispatch`/`useAppSelector` from `src/store/hooks.ts` instead of the raw `react-redux` hooks. New client state goes into a new slice under `src/store/slices/`, following `cartSlice.ts`'s pattern: plain field reducers via `createSlice` (Immer draft mutation), with any derived/computed values exposed as memoized selectors (`createSelector`) rather than recomputed inline in components.

- `src/store/slices/cartSlice.ts` — the active billing cart (line items, customer, discount, payment method). Derived totals (`selectSubtotalCents`/`selectTaxCents`/`selectTotalCents`/`selectCartItemsCount`) are selectors, not stored state — don't add `subtotalCents` etc. as actual reducer fields.
- `src/store/slices/themeSlice.ts` + `src/store/colorSchemeManager.ts` — color-scheme (`'light' | 'dark'`) state, with a custom `MantineColorSchemeManager` (`reduxColorSchemeManager`) bridging it to `MantineProvider`, so Redux — not Mantine's default `localStorage` manager — is the single source of truth. Persisted via a `createListenerMiddleware` listener (`src/store/listenerMiddleware.ts`) to `localStorage[STORAGE_KEYS.COLOR_SCHEME]`. `index.html` has an inline `<script>` duplicating the same initial-scheme resolution logic to prevent a flash of the wrong theme on load — if the storage key or fallback logic ever changes, update both `themeSlice.ts`'s `getInitialColorScheme()` and that script together.
- **Design tokens**: `src/styles/cssVariablesResolver.ts` defines the app's neutral palette as scheme-flipping tokens — surfaces (`--bg-app`, `--bg-sidebar`, `--bg-card`, `--bg-hover`, `--bg-active`), borders (`--border`, `--border-strong`), text (`--text-primary`, `--text-secondary`, `--text-muted`), and status (`--status-ok`, `--status-busy`, `--status-warn`, `--status-error`, `--status-idle`, each with a `-bg` pair). Status tokens are named by meaning, not colour. Style with `var(--bg-card)` / `var(--text-muted)` etc.; never a raw hex, so a theme switch is only a value flip. Mantine's semantic vars (`--mantine-color-body`, `-default`, `-default-hover`, `-default-border`, `-text`, `-dimmed`, `-placeholder`) are re-pointed at these tokens in the same file, so built-in Mantine components follow the palette automatically — either name works, prefer the `--bg-*`/`--text-*` tokens in app code.
- **Dark-mode-safe styling**: never use fixed swatch vars (`--mantine-color-gray-0`…`-9`) or raw hex codes for anything that should look right in both themes — swatch vars don't change between light/dark. Both the light and dark values live in `cssVariablesResolver.ts`; define every token in both blocks so a scheme switch is only a value flip. (`theme.ts` defines one custom colour, `amber`, and no `colors.dark` override — Mantine's built-in dark scale applies.)

**No implicit fallbacks — be explicit**: don't paper over a missing value with `||` / `??` defaults, and don't invent a default at the consumption site (`textAlign: col.align || 'left'`, `icon || <IconInbox />`, `getElementById('root') || getElementById('app')` are all the anti-pattern). If a value matters to how something renders or behaves, make the field **required** in the type so every call site states it exactly — `align: 'left' | 'center' | 'right'` on `Column`, not `align?`. If a value is genuinely optional, let it be `undefined` and pass it straight through (e.g. `width: col.width`) rather than substituting a guessed stand-in. The narrow exception is documented environment configuration (`src/config/env.ts`), where a fallback is the declared default for a missing `import.meta.env` var.

**Money handling**: all monetary values are stored and passed around as integer cents (`unitPriceCents`, `totalCents`, etc.), never floats. Use `src/shared/lib/money.ts` (`toCents`, `fromCents`, `formatMoney`, `parseMoneyToCents`, `calculateTaxCents`, `calculateTotalCents`) to convert/format/compute — don't do ad hoc float math on currency.

**Backend status — fully migrated, direct REST**: every domain is on a real REST backend under `env.apiBaseUrl` (`/api` by default) — inventory (products, categories), suppliers, supplier-products, purchases, customers, billing/invoices, payments, repairs, print-jobs and employees all read/write straight through `apiClient` + TanStack Query, the same way `users`/`auth`/`reports` always have. **Employees** (`src/features/employees/`) is the HR/commission profile domain — a separate, optional login account (`src/features/users/`) can be linked to one via `employeeKey`.

A "fetch everything" hook (`useAllInvoices`, `useAllProducts`, etc.) must not silently truncate at the backend's per-page cap (100–200 items depending on module) once a shop's data outgrows one page — loop pages with `fetchAllPages` (`src/shared/lib/fetchAllPages.ts`) or an inline equivalent (see `fetchAllInvoices`/`fetchAllRepairs`/`fetchAllPrintJobs`/`fetchAllProducts`/`fetchAllCustomers`). A hook backing a debounced backend search (via `useBackendFilteredList`, see below) stays a single capped page — a search wants the top matches, not the whole collection.

An offline-first sync engine (mirroring every resource into IndexedDB, queuing writes in an outbox, reconciling conflicts) used to sit between the UI and this API and has been removed — the app now depends on the backend being reachable, the same as any ordinary web app. **A future, separate sync backend is planned** to bring back cross-terminal syncing; until then, see **Local database** below for what's left in place and **Sync UI (disabled)** for what's parked pending that work.

## Local database

`src/offline/` is what remains of the removed sync engine — kept as infrastructure for a possible future non-sync local-storage feature, not because anything currently depends on it for correctness:

- `src/offline/db/schema.ts` — the `OfflineDb` Dexie class and `db` singleton. Only real table today: `statsCache` (`db/tables.ts`'s `StatsCacheRow`) — see **Dashboard KPI cards** above. Bump the Dexie version for any schema change; never edit an installed `this.version(n)` block in place, or it bricks the app for anyone who already has data at the old version.
- `src/offline/db/maintenance.ts` — `estimateStorage`/`requestPersistentStorage`, generic browser storage-quota helpers, unrelated to any specific table.
- `src/offline/connectivity/` — `ConnectivityMonitor` combines `navigator.onLine`, the `statusCode: 0` signal from the `apiClient` response interceptor, and a `GET /health` probe into one verdict, with asymmetric hysteresis (offline publishes immediately, online is held for a settle window). Its only consumer is `onlineManagerBridge.ts`, wired in `providers.tsx`, which feeds TanStack Query's `onlineManager` so background refetches correctly pause/resume with real connectivity — `navigator.onLine` alone only sees the link layer (a terminal on a router with no upstream still reports `true`). Never call `navigator.onLine` directly in a component.
- `src/offline/react/useLiveQuery.ts` — a generic Dexie `liveQuery` → React state hook, used by `useModuleStats` to read `statsCache`.

Auth is strict online-only (`authSlice.ts`'s `initializeAuth`): any failure to verify the stored token — 401/403, a network error, a 500 — signs the user out. There is no cached-session offline grace period.

## Sync UI (disabled)

`src/features/sync/` (status badge, drawer, settings section) is dead code kept on disk, not deleted, so it can be repaired once the future sync backend exists — it still imports the removed engine modules and does not type-check, so it's excluded from the compiled project (`tsconfig.json`'s `exclude`) and from lint (`eslint.config.js`'s `ignores`). It has no mount points anywhere in the live app (`Header.tsx`, `AppShell.tsx`, `SettingsPage.tsx` don't reference it). Don't add new imports into or out of this folder from live code; when the sync backend is built, its design will very likely not match this folder's shape closely enough to just re-enable it as-is.

## Desktop activity log

The desktop app records everything that happens into a unified, append-only log written by the Tauri shell (`<app data>/logs/<day>/<source>.jsonl`, schema in the pos-compose repo's `docs/logging.md`). The frontend side lives in `src/shared/logging/` and is a no-op in the browser.

- **Automatic capture** (installed once by `initLogging()` in `src/main.tsx`): clicks/double/right clicks, debounced typing (final value), committed changes, form submits and named/modifier key presses (`capture/dom.ts`); route changes (`capture/navigation.ts`); every `apiClient` and health-probe call with an `X-Request-Id` the backend and document-server log under too (`capture/http.ts`); every Redux action and the signed-in user (`capture/state.ts`); TanStack query failures and mutation lifecycle (`capture/query.ts`); uncaught errors, unhandled rejections and React root errors (`capture/errors.ts`); the console (`capture/console.ts`); visibility, online/offline, resizes, long tasks, Mantine notifications and modals (`capture/app.ts`).
- **Explicit events**: call `logger.event(category, event, data)` (or `logger.info`/`warn`/`error`) from `@/shared/logging` for business or workflow steps automatic capture can't name (see `UpdatesSection.tsx`, `printService.tsx`, `WelcomeWizard.tsx`). Add a new category to `LogCategory` in `src/shared/logging/types.ts`.
- **Label critical controls** with `data-log-id="<feature>.<action>"` (e.g. `billing.complete-sale`) so their log label survives copy and language changes.
- **Sensitive fields**: passwords, `autocomplete="cc-*"`/one-time codes and any key matching the shared secret pattern are redacted automatically; mark anything else that must never be logged with `data-log-redact` (on the field or a container).
- **Cost**: captured payloads must go through `redactAndCap` (`shared/logging/redact.ts`) — a single budgeted walk that stops at the cap. Never `JSON.stringify` a whole API body to measure or cut it; that made a 6 MB list cost ~32 ms instead of ~0.2 ms. `logger.pause()`/`resume()` and `logger.stats()` exist for the benchmark below.
- **Benchmark**: Settings → System Benchmark has a `logging` phase (`settings/lib/loggingBenchmark.ts`) that replays a simulated, read-only sale flow with logging off/standard/full and reports CPU, memory and disk per 1,000 sales via the shell's `benchmark_log_mode` / `benchmark_resource_sample` commands. It restores the user's saved logging settings in a `finally`. Re-run it (or `npm run bench:logging` in the pos-compose repo) after changing anything in `shared/logging/`.
- **Viewer**: Settings → Activity Log (`src/features/logs/`, section `LogsSection.tsx`, desktop-only + admin-only) — filters, live tail, "Trace this request", open folder, ZIP export and logging options.

## API client conventions

`src/api/client.ts`'s `apiClient` auto-attaches an `Idempotency-Key` header (a fresh UUID per request, via `createIdempotencyKey()` in `src/shared/lib/id.ts`) to every mutating request (POST/PUT/PATCH/DELETE) in its request interceptor — this is what makes retrying a request whose response was lost (a power cut mid-request) safe; the backend returns the original response instead of double-applying the write (`Idempotency-Key`, stored key → response for 7 days — see the backend CLAUDE.md). Callers never need to set this themselves. There is no client-side optimistic-concurrency (`If-Match`) support — a version conflict on a genuinely concurrent edit is last-write-wins; the backend still supports `If-Match` for any caller that wants to send it, but nothing in this frontend does today.

`POST /sequences/{name}/reserve` mints sequential human-facing numbers (`INV-2026-0042`, `REP-…`, `PRT-…`) server-side at the moment a sale/repair/print-job is created — never client-side, never a localStorage counter or array-length-derived number.

## Spreadsheet Data Import Engine

`src/features/imports/` provides a reusable, cross-module batch ingestion feature for Excel (`.xlsx`/`.xls`) and `.csv` files:

- **Center Modal Family (`<DataImportModal>`)**: Follows `ProductFormModal.tsx` standards (`centered`, `fullScreen={isMobile}`, default cancel / blue primary buttons, plain text title).
- **Client-Side Extraction & Validation (`fileParser.ts`)**: Parses uploaded spreadsheets client-side via SheetJS before transmitting to the server. Evaluates required columns, case-insensitive header aliases, custom row validators, and data transformations with instant visual preview.
- **Preflight Preview, Row Selection & Data Grid**: Full-width scrollable data grid with sticky row checkboxes, row numbers, and status badges. Allows users to selectively check/uncheck rows (master select-all with indeterminate state, "Select All Valid", "Deselect All") so only selected valid data is imported. Displays all configured columns without header clipping, formatted currency (`formatMoney`) and numeric values right-aligned, monospace barcodes, real-time search, status filter tabs (`All`, `Selected`, `Valid`, `Issues`), and selectable page sizes (10, 25, 50).
- **Automatic Category Identification & Styling View (`CategoryStylingView.tsx`, `categoryDetector.ts`)**: Automatically discovers distinct categories and subcategories from parsed files, matches them with catalog entries, auto-assigns rotating palette colors and smart contextual icons, and offers a dedicated styling view where users can fine-tune colors and icons using `TablerIconPicker` and color swatches before saving.
- **Template Generation (`templateGenerator.ts`)**: Generates downloadable sample `.xlsx` (with auto-column widths) and `.csv` templates with prefilled example rows.
- **Server Audit & Processing**: Confirms import batch via `POST /api/imports`, pre-creating/updating customized categories with their custom colors & icons, invalidating relevant queries (`queryKeys.imports.all`, `queryKeys.categories.all`, `queryKeys.inventory.all`), and displaying server outcomes with expandable row-level error reports.
- **Config-Driven Extensibility (`ImportConfig`)**: Reusable across any module by providing an `ImportConfig` object (`target`, `columns`, `sampleRows`, `supportedOptions`). The inventory implementation is configured in `src/features/inventory/config/inventoryImportConfig.ts`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Localization & Language Engine

Every user-facing string goes through `t()` (`@/shared/i18n/t`) with an entry added to `src/shared/i18n/dictionaries/si.json`. Full guidance in `src/shared/i18n/CLAUDE.md` — loads automatically when working in that directory.

## Release & Versioning Management

- **Automated Conventional Commit Versioning**: Pushes to `main` evaluate Conventional Commit prefixes via `scripts/ci/next-version.sh`.
  - `feat:` -> minor bump (`0.5.0` -> `0.6.0`)
  - `fix:` / `perf:` -> patch bump (`0.5.0` -> `0.5.1`)
  - `feat!:` or `BREAKING CHANGE:` -> minor bump (pre-1.0)
  - `chore:`, `docs:`, `ci:`, `refactor:`, `test:`, `style:` -> no bump
  - Release-worthy commits automatically trigger `node scripts/ci/set-version.mjs`, committing `chore(release): vX.Y.Z [skip ci]` and tagging `vX.Y.Z` on `main`.
- **Single Source of Truth**: `frontend/package.json`'s `version` field tracks this automated stream and is aligned with the desktop pos-compose repo's baseline (`0.5.0`). Root `scripts/set-version.py` also updates both manifests when pos-compose releases run.
- **Build Identity**: `vite.config.ts` bakes `__APP_VERSION__`, `__BUILD_TIME__`, and `__GIT_SHA__` into `src/config/env.ts`, and emits `dist/version.json`.
- **Environment Override**: `vite.config.ts` supports `VITE_APP_VERSION` environment variable to override `package.json` if explicitly provided during CI or Docker builds (`process.env.VITE_APP_VERSION?.trim() || pkg.version`).
- **Web CI Deployment (`.github/workflows/deploy.yml`)**: On push to `main`, the workflow executes `next-version.sh`, pushes the release commit/tag if bumped, and passes `VITE_APP_VERSION` and `VITE_GIT_SHA` as build-args to Docker.
- **Updates Section UI (`UpdatesSection.tsx`)**:
  - Web displays `env.appVersion`, `env.buildTime`, and the short commit hash (`env.commit.slice(0, 7)`).
  - Desktop uses `isTauri()` gating and queries `@tauri-apps/api/app`'s `getVersion()` which resolves dynamically to the desktop bundle's version.

## Recent Features & Evolution (Last 30 Days)

### Landed Capabilities

- **Modular Settings Framework (`src/features/settings/config/settingsSections.ts`)**: Extensible settings architecture with section registry. Supports `desktopOnly: true` gating backed by `isTauri()` detection (`src/shared/lib/tauri.ts`).
- **Data Backup & Restore (`src/features/settings/components/BackupSection.tsx`)**: Complete database management UI in Settings for desktop users. Triggers server-side backup export (`POST /api/backup/export`), file download with automatic timestamped naming, drag-and-drop file restore (`POST /api/backup/restore`), destructive overwrite confirmation modals, and automatic session logout upon restore completion.
- **In-App Desktop Auto-Updater (`src/features/settings/components/UpdatesSection.tsx`)**: Automated update checks and one-click installs using `@tauri-apps/plugin-updater` and `process.relaunch()`.
- **Canvas-based PDF Previewer (`PdfCanvasViewer`)**: High-performance canvas rendering via `pdfjs-dist` replacing `<iframe src="blob:...">` in invoice/receipt/report modals, eliminating WebView2/WebKit iframe blank-page bugs on Windows and macOS.
- **Split Payment & Tender Engine**: Split payment capabilities (Cash + Card simultaneous allocation), dynamic change calculation, credit balance handling, and credit note refund processing in the billing cart and invoice settlement workflows.
- **First-Run Welcome & Onboarding Wizard (`src/features/onboarding/`)**:
  - Implements the initial installation onboarding experience on `/welcome` (`WelcomeWizard.tsx`).
  - Gated route protection: `RequireAuth` and `GuestOnly` evaluate `useSetupStatus()` and redirect unconfigured systems (`setup_completed === false`) to `/welcome`.
  - **Full-Screen Desktop Studio Layout (`100vw` × `100vh`)**: Fixed 340px Left Navigation Rail with branding, workstation ID badge, theme/language switchers, and vertical Stepper, paired with an expansive, centered right-hand main stage (`maxWidth: 1120px`) ensuring full-length and full-height coverage without dark void margins. Follows `theme.ts` tokens (`primaryColor: 'blue'`, `var(--mantine-radius-default)`, `var(--bg-app)`, `var(--bg-sidebar)`, `var(--bg-card)`).
  - Step 1 (`SplashStep`): Workstation verification (SQLite engine on :8080, Typst document server on :8090, Offline Vault, installation ID, installed timestamp) and interactive language selection (English / Sinhala).
  - Step 2 (`FeatureGuideStep`): Expansive 2x2 capability tour covering Smart Billing & Split Tender, Repair Jobs & Workshop, Inventory & Serial Tracking, and Offline-First Privacy.
  - Step 3 (`DataChoiceStep`): Interactive elevated cards offering 'Load Sample / Demo Data' (for exploration) vs. 'Clean Database (Empty Tables)' (for production) along with primary Administrator credentials configuration.
  - Step 4 (`ProgressStep`): Live initialization indicator, Tauri desktop metadata persistence (`completeInstallationSetupNative`), and launch card with instant auto-login into the POS Dashboard.
- **Sinhala Localization (`si.json`)**: Expanded dictionary coverage for backup/restore, auto-updates, invoice canvas previews, onboarding wizard, and report exports with strict alphabetical key sorting.

### Invariants & Rules for Future Implementations

- **Desktop Feature Isolation**: Any desktop-native capability (file system operations, backup/restore, auto-updater, window controls) must be gated using `isTauri()` and declared with `desktopOnly: true` in `settingsSections.ts`. Never assume Tauri APIs exist in standard browser environments.
- **PDF Rendering Standard**: Never render generated documents using raw browser `<iframe>` or `embed` tags. Always use `PdfCanvasViewer` to ensure consistent rendering across all platforms (desktop WebKit/WebView2 and browsers).
- **Modal & Layout Consistency**: Modals must adhere to the `ProductFormModal.tsx` design pattern: `centered`, `fullScreen={isMobile}`, plain text titles (no emoji/raw JSX in header titles), and consistent button ordering (Cancel on left, primary action on right). Responsive UI must use `useLayoutTier` or `useIsMobile`.
- **I18n Alphabetization**: All new user-facing strings must use `t('key')` and be added to `src/shared/i18n/dictionaries/si.json` in strictly alphabetical order without omitting translations.
- **State & Money Management**: All monetary values must remain integer cents throughout UI components (`unitPriceCents`, `totalCents`), formatted only at the presentation boundary via `formatMoney`. Never compute currency totals with floating-point arithmetic.

### How AI Agents Can Help & Verification

- **Dual Test Suite Execution**: Run `npm run test:all` (runs both Vitest unit/integration tests and Jest suites). Run `npm test` for the standard test suite.
- **Static Verification**:
  ```bash
  npm run type-check   # Verifies TypeScript compiler without emitting JS
  npm run lint         # Runs ESLint checks across feature modules
  ```
- **Platform Guard Audits**: When modifying or adding settings or system-level features, agents must verify that `isTauri()` checks protect against browser crashes when `@tauri-apps/api` or plugin methods are invoked.
- **Responsive Layout Verification**: Check that modals and tables handle small screen viewports gracefully using `useIsMobile()` and Mantine's responsive style props.
