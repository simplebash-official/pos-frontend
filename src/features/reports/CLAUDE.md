# Reports & Analytics — module guidance

Loaded when working under `src/features/reports/`. Moved here from the root `CLAUDE.md` (kept out of always-on context since it only matters for this feature).

## Charts & analytics containers

`ChartCard` (`src/features/reports/components/ChartCard.tsx`) is the reference container for charts across analytics and reporting screens — titled `Paper`, loading skeleton, empty state, and a clean non-scrolling responsive wrapper (`overflow: 'hidden'`, `minWidth: 0`, `width: '100%'`).

- **No scrollbars on charts**: Never set `overflowX: 'auto'` or `overflowY: 'auto'` on chart containers. Recharts' `ResponsiveContainer` dynamically observes parent dimensions and renders SVG elements to fit 100% of available width; overflow scrollbars degrade UX and break fluid responsiveness.
- **Theme-aware colors**: Always use Mantine theme color tokens (e.g. `SERIES.revenue = 'blue.6'`, `SERIES.profit = 'green.6'` from `src/features/reports/lib/analyticsCharts.ts`) rather than hard-coded hex colors so charts automatically switch cleanly between light and dark themes.
- **Axis & tooltip formatting**: Use `moneyFormatter` for monetary values in tooltips, `compactMoney` (`moneyYAxis` / `moneyXAxis`) for tick marks (e.g. `Rs 24k`, `Rs 1.2M`), and `categoryYAxis` for vertical category bar charts.
- **Donut proportions & legends**: Use `DonutWithLegend` (`src/features/reports/components/DonutWithLegend.tsx`) with fixed geometry tokens (`DONUT.size = 190`, `DONUT.thickness = 32`) and `topSlicesWithOther` to keep slice counts readable (≤6-7 slices) and stack vertically on mobile (`useIsMobile()`).

## Reports & Analytics Engine (Feed)

The reporting subsystem is accelerated by the backend's unified analytical engine (`/api/reports/engine/`):

- **Engine Feed endpoint (`GET /api/reports/engine/feed`)**: Bundles complete section datasets (`overview`, `sales`, `profit`, `customers`, `staff`, `all`) in a single concurrent backend aggregation request (`tokio::try_join!`), eliminating waterfall queries across tabs and reducing frontend roundtrips from 15 to 1.
- **Unified Query Hook (`useAnalyticsFeed`)**: `useAnalyticsFeed(section, params, optsQuery, enabled)` (`src/features/reports/hooks/useAnalyticsQueries.ts`) is the primary hook for all report section components (`OverviewSection`, `SalesSection`, `ProfitSection`, `CustomersSection`, `StaffSection`), keyed via `queryKeys.reports.feed(section, filters, opts)` in `src/api/queryKeys.ts`.
- **Cache Invalidation (`POST /api/reports/engine/invalidate`)**: `invalidateEngineCache()` (`src/features/reports/api/analyticsApi.ts`) triggers explicit analytical cache purging on the backend. Billing mutations (`complete_sale`, `void_invoice`, `record_payment`, `create_credit_note`, `void_credit_note`) trigger backend active-period invalidation automatically.
