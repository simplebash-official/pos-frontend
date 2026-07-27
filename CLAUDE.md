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
- `AppProviders` sets up, in order: TanStack Query (`QueryClientProvider`, 5 min `staleTime`, no refetch-on-focus), Mantine (`MantineProvider` with the shared `theme` from `src/styles/theme.ts`), `Notifications`, `ModalsProvider`. Mantine/notifications/dates CSS is imported here — new Mantine subpackages (e.g. carousel, dropzone) need their CSS imported wherever they're first used.

**Feature modules** (`src/features/<name>/`): each feature (`auth`, `billing`, `customers`, `inventory`, `print-jobs`, `repairs`, `reports`) follows the same shape — `components/`, `types.ts`, and an `index.ts` barrel that re-exports the public component(s) and `* from './types'`. Import features only through their barrel (`@/features/billing`), not by reaching into `components/`.

**Path alias**: `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts` via `vite-tsconfig-paths`). Always import with `@/...` rather than relative `../../` paths across module boundaries.

**Cross-cutting layers**:

- `src/api/client.ts` — a single `ApiClient` class (`apiClient` singleton) wrapping `fetch`, base URL from `env.apiBaseUrl`, auto-attaches `Bearer` token from `localStorage.auth_token`, normalizes failures into the `ApiError` shape (`src/shared/types/common.ts`).
- `src/api/queryKeys.ts` — centralized TanStack Query key factory, one namespace per feature (`billing`, `repairs`, `printJobs`, `inventory`, `customers`, `reports`). Add new query keys here rather than inlining key arrays in components/hooks.
- `src/config/constants.ts` — shared business constants: currency (`CURRENCY`, LKR/"Rs."), `TAX_RATE`, repair job status enum + labels + colors (`JOB_STATUS*`), `PAYMENT_METHODS`, default pagination.
- `src/config/env.ts` — typed wrapper over `import.meta.env`.
- `src/stores/cartStore.ts` — Zustand store for the active billing cart (line items, customer, discount, payment method); derived totals (`getSubtotalCents`/`getTaxCents`/`getTotalCents`) are computed via store getters rather than duplicated in components.
- `src/shared/` — cross-feature reusable code: `components/` (e.g. `DataTable`, `MoneyInput`, `ConfirmDialog`, `EmptyState`, `PageHeader`), `lib/` (`money.ts`, `date.ts`, `print.ts`), `types/common.ts` (`PaginatedResponse`, `ApiError`, `ApiResponse`, `SelectOption`).

**Money handling**: all monetary values are stored and passed around as integer cents (`unitPriceCents`, `totalCents`, etc.), never floats. Use `src/shared/lib/money.ts` (`toCents`, `fromCents`, `formatMoney`, `parseMoneyToCents`, `calculateTaxCents`, `calculateTotalCents`) to convert/format/compute — don't do ad hoc float math on currency.

**No backend yet**: `apiClient` and `queryKeys` are wired up but feature components currently work with local/mock state (e.g. `cartStore`); expect to connect real endpoints under `env.apiBaseUrl` (`/api` by default) as backend work lands.
