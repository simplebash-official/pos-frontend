# SimpleBash POS — Frontend

[![CI](https://github.com/simplebash-official/pos-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/simplebash-official/pos-frontend/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

The cashier and back-office app for **SimpleBash POS**, a point-of-sale system
for repair and retail shops. Built with React 19, TypeScript, Vite and
[Mantine](https://mantine.dev).

One codebase, two targets:

- **Web** — a Progressive Web App served by nginx, used in any browser. Can be
  built for a single shop or for many shops on one server (sign-in with a shop code).
- **Desktop** — compiled into the [desktop app](https://github.com/simplebash-official/pos-desktop),
  where it talks to a local backend on `127.0.0.1` and works offline.
  Desktop-only screens (backup, updates, activity log) are hidden on the web.

## The SimpleBash POS family

| Repository                                                                | What it is                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [pos-backend](https://github.com/simplebash-official/pos-backend)         | REST API — Rust / Axum, SQLite or MongoDB                            |
| **pos-frontend** (this repo)                                              | The cashier & back-office UI — React / Vite / Mantine                |
| [document-server](https://github.com/simplebash-official/document-server) | Renders invoices, receipts, reports and labels to PDF — Rust / Typst |
| [pos-desktop](https://github.com/simplebash-official/pos-desktop)         | Windows / macOS / Linux app (Tauri) that bundles all three           |

## Features

- **Billing screen** built for speed — barcode scanning, keyboard shortcuts,
  held sales, split payments, discounts, credit sales, returns and credit notes.
- **Repairs & print jobs** — job tickets from intake to pickup, billed straight into a sale.
- **Inventory** — products, stock adjustments and history, serial numbers,
  low-stock alerts, categories, and Excel / CSV import with a preview step.
- **Customers, suppliers, purchases, employees and user accounts.**
- **Reports & dashboards** — sales, profit, top products, staff commissions,
  outstanding balances, with charts.
- **Invoices & receipts** — A4 and thermal (58 / 80 mm) PDFs previewed in the app
  and sent to the printer.
- **English and Sinhala** interface, light and dark themes.
- **Works on phones, tablets and desktops** — layouts adapt to three screen sizes.
- **First-run setup wizard** for new installations, with optional sample data.
- **Desktop extras** — backup / restore, in-app updates, cloud account linking
  and an activity log viewer.

## Tech stack

React 19 · TypeScript · Vite · Mantine 9 · Redux Toolkit · TanStack Query ·
React Router · axios · Recharts · pdf.js · Dexie (IndexedDB) · vite-plugin-pwa ·
Vitest + Jest + Testing Library.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 22
- A running [pos-backend](https://github.com/simplebash-official/pos-backend)
  (by default on `http://localhost:8080`)

### Run it locally

```bash
git clone https://github.com/simplebash-official/pos-frontend.git
cd pos-frontend
npm ci
cp .env.example .env      # points the app at http://localhost:8080/api
npm run dev               # http://localhost:5173
```

The backend allows `http://localhost:5173` by default, so no extra CORS setup
is needed for local development.

## Configuration

Settings are read at **build time** (Vite only exposes `VITE_*` variables to the app).

| Variable                           | Default                      | Purpose                                                                      |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`                | `/api`                       | Where the backend API lives. Use `/api` when nginx serves both on one domain |
| `VITE_APP_NAME`                    | `SimpleBash POS`             | Name shown in the browser tab and header                                     |
| `VITE_MULTI_TENANT`                | off                          | `true` = the login asks for a shop code (many shops on one server)           |
| `VITE_ACCOUNTS_URL`                | `https://app.simplebash.com` | Where "Create your shop" links, on multi-shop builds                         |
| `VITE_GIT_SHA`, `VITE_APP_VERSION` | from git / `package.json`    | Build identity, shown in Settings → Updates and `/version.json`              |

Templates: [`.env.example`](.env.example) (local), [`.env.web.example`](.env.web.example)
(web build), [`.env.tauri.example`](.env.tauri.example) (desktop build).

## Scripts

| Command                                                  | What it does                      |
| -------------------------------------------------------- | --------------------------------- |
| `npm run dev`                                            | Dev server with hot reload        |
| `npm run build`                                          | Production web build into `dist/` |
| `npm run build:tauri`                                    | Build for the desktop app         |
| `npm test`                                               | Vitest suite                      |
| `npm run test:all`                                       | Vitest + Jest                     |
| `npm run lint` / `npm run type-check` / `npm run format` | ESLint, TypeScript, Prettier      |

## Project layout

```
src/
  app/          entry component, router, providers, app shell (header, sidebar)
  features/     one folder per screen area: billing, repairs, inventory, reports …
                each with components/, api/, hooks/ and an index.ts barrel
  api/          shared axios client (auth header, idempotency keys) and query keys
  store/        Redux slices (cart, auth, theme, settings)
  shared/       reusable components, hooks, i18n, logging, money/date helpers
  offline/      connectivity monitor and small IndexedDB cache
  styles/       Mantine theme and design tokens (light / dark)
```

Money is always handled as integer cents, every on-screen string goes through
`t()` for translation, and responsive layouts use the `useLayoutTier()` /
`useIsMobile()` hooks. See [`CLAUDE.md`](CLAUDE.md) for the full conventions.

## Deployment

The [`Dockerfile`](Dockerfile) builds the app and serves it with nginx (with
security headers and a Content-Security-Policy, see [`nginx.conf`](nginx.conf)).
Pushes to `main` build `ghcr.io/simplebash-official/pos-frontend:latest` and
roll it out to the SimpleBash server; forks build but never deploy. Running
browsers detect a new version within about 15 minutes and offer to reload.

## Contributing

Issues and pull requests are welcome. Before opening a PR, run
`npm run lint && npm run type-check && npm test`, and add tests for new
behaviour. UI changes should work at phone, tablet and desktop widths and in
dark mode, and new text needs a Sinhala entry in
`src/shared/i18n/dictionaries/si.json`.

## Security

Please report vulnerabilities privately through
[GitHub's "Report a vulnerability"](https://github.com/simplebash-official/pos-frontend/security/advisories/new),
not in a public issue.

## License

[GNU Affero General Public License v3.0](LICENSE).
