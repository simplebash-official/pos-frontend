# Localization & Language Engine

Loaded when working under `src/shared/i18n/`. Moved here from the root `CLAUDE.md` (kept out of always-on context since it only matters when adding/translating strings).

The application supports real-time language switching (English and Sinhala) through a custom translation engine that relies on full-tree React remounting for performance and simplicity without Hook overhead.

**How to add new frontend strings:**

1. **Always use `t()`**: When adding new user-facing UI text, import the translation function: `import { t } from '@/shared/i18n/t';` and wrap your string: `label={t("New Product")}` or `<Text>{t("Hello")}</Text>`.
2. **Update the dictionary**: Add your new English string as a key to `src/shared/i18n/dictionaries/si.json` with its corresponding Sinhala translation.
3. **Preserve technical terms**: When translating, leave shop-specific and technical terms (e.g., SKU, POS, VAT, EAN) in English to ensure it remains understandable for store owners.
4. **Automated extraction**: If you write many new components, you can use the `npx tsx scripts/auto-i18n.ts` script to automatically parse the AST, wrap your strings in `t()`, and extract missing keys into `scripts/extracted-strings.json` for batch translation.

Note: `t()` has no interpolation — compose dynamic strings from static `t()` fragments plus the interpolated value.
