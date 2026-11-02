import { Box } from '@mantine/core';
import { BRAND_GRADIENT } from './gradient';

// A faint tile grid, like the product buttons on a till screen.
const TILE_GRID =
  'repeating-linear-gradient(0deg, var(--brand-grid-line) 0 1px, transparent 1px 56px), ' +
  'repeating-linear-gradient(90deg, var(--brand-grid-line) 0 1px, transparent 1px 56px)';

/** The brand gradient with its tile grid: fills its (relatively positioned) parent. */
export const BrandBackdrop = () => (
  <Box
    aria-hidden
    data-testid="brand-backdrop"
    style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BRAND_GRADIENT }}
  >
    <Box style={{ position: 'absolute', inset: 0, background: TILE_GRID }} />
    {/* A faint wash of light from the top so the panel doesn't look flat. */}
    <Box
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
      }}
    />
  </Box>
);
