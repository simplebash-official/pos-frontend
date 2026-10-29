# Centralized Presentation Calculations (`@/shared/calculations`)

This module houses **Tier 2 (Presentation Math & Formatting Layer)** calculations for SimpleBash POS.

---

## Architectural Boundary: Tier 1 vs. Tier 2

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: Core Financial Engine (Rust / WebAssembly)                     │
│ import { calc_checkout, calc_earnings, calc_shares } from '@/wasm'    │
│ -> Bit-for-bit mathematical parity between frontend and backend.       │
│ -> Checkout cart totals, line discounts, commissions, landed cost.     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ TIER 2: Centralized Presentation Calculations (TypeScript)             │
│ import { ... } from '@/shared/calculations'                            │
│ ├── currency.ts           -> toCents, fromCents, parseMoney, format    │
│ ├── words.ts              -> numberToWords (receipt word generation)   │
│ ├── warranty.ts           -> isWithinWarranty, getExpirationDate       │
│ ├── inventoryMetrics.ts   -> tiersWithRoom, calculateProfitRange       │
│ ├── invoiceMetrics.ts     -> describeInvoiceUnits, unit summaries      │
│ ├── rollups.ts            -> sumCashMovements, sumRegisterSales, etc.  │
│ └── index.ts              -> Master barrel export                      │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Tier 1 (Core Financial Engine - `@/wasm`)**:
   - Implemented in Rust (`pos-calc-core`) and compiled to WebAssembly.
   - Responsible for commercial/financial formulas: cart pricing, order/item discounts, taxes, commission shares, and landed cost.
   - Re-evaluated independently by the backend before mutation persistence.

2. **Tier 2 (Presentation & Formatting Layer - `@/shared/calculations`)**:
   - Implemented in TypeScript.
   - Responsible for UI presentation math, string/number conversions, display rollups, list aggregations, and business date boundaries.
   - Pure, synchronous, and deterministic with zero side effects.

---

## Engineering Rules

### 1. Zero Fallback / Explicit Contract Rule (`CLAUDE.md#L225`)

Do **not** use implicit fallback operators (`|| 0`, `?? ''`) or invent guessed defaults at calculation sites.

- If an input is required to compute a valid result, the function signature must require it or return an explicit typed outcome.
- For example, `isWithinWarranty` returns `false` if `warrantyMonths` is absent, undefined, or `<= 0`.
- Missing values in rollup sums are checked explicitly with `typeof val === 'number'` rather than silent truthiness coercion.

### 2. 30-Day Billing Month Warranty Convention

- In accordance with retail accounting conventions, product warranties are evaluated using standard 30-day billing months:
  $$\text{durationMs} = \text{warrantyMonths} \times 30 \times 86{,}400{,}000\text{ ms}$$
- `isWithinWarranty(createdAt, warrantyMonths, currentTimestampMs)` evaluates whether the current timestamp is strictly less than the expiration timestamp.

### 3. Integer Cents Currency Standard

- All monetary values are represented as integer cents (`1000` = Rs. 10.00).
- Float conversions (`toCents`, `fromCents`, `formatMoney`, `parseMoneyToCents`) must use `currency.ts`.

---

## Submodule Overview

- **`currency.ts`**: Cents-to-rupees conversions, localized money formatting (`formatMoney`, `formatCentsRange`), and resilient user input string parsing (`parseMoneyToCents`).
- **`words.ts`**: Converts integer cents into formal English words for receipt printing and tax invoices (e.g. `numberToWords`, `numberToWordsRupees`).
- **`warranty.ts`**: Validates whether an invoice/item remains within its manufacturer or store warranty (`isWithinWarranty`, `getWarrantyExpirationTimestamp`).
- **`inventoryMetrics.ts`**: Inventory stock tier calculations (`getTiersWithRoom`, `calculateProfitRange`, `sumTierQuantities`).
- **`invoiceMetrics.ts`**: Aggregates returned and original units from invoice items and checks completion states (`describeInvoiceUnits`, `calcItemReturnedUnits`, `calcItemRemainingUnits`, `isItemFullyReturned`, `sumCreditNoteItemsCount`).
- **`rollups.ts`**: Drawer summary aggregations (`sumCashMovements`, `sumRegisterSales`, `sumEmployeeEarnings`, `sumParkedCartsTotal`, `sumPipelineStages`).
