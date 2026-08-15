import { Grid, Paper, Skeleton, Stack } from '@mantine/core';
import { useLayoutTier } from '@/shared/hooks/useResponsive';

const FILL: React.CSSProperties = { height: '100%', minHeight: 0 };

const RegionPlaceholder = () => (
  <Paper p="md" h="100%" withBorder>
    <Stack gap="sm">
      <Skeleton height={36} />
      <Skeleton height={20} width="70%" />
      <Skeleton height={80} />
      <Skeleton height={80} />
      <Skeleton height={80} />
    </Stack>
  </Paper>
);

/**
 * Mirrors `BillingRegions`' tier-based column spans with placeholder content, so the
 * `Suspense` fallback for the billing route doesn't jump from a generic list-shaped
 * skeleton to the real 3-column grid once the lazy chunk resolves.
 */
export const BillingPageSkeleton = () => {
  const tier = useLayoutTier();

  if (tier === 'desktop') {
    return (
      <Grid h="100%" styles={{ inner: { height: '100%' } }}>
        <Grid.Col span={5} style={FILL}>
          <RegionPlaceholder />
        </Grid.Col>
        <Grid.Col span={4} style={FILL}>
          <RegionPlaceholder />
        </Grid.Col>
        <Grid.Col span={3} style={FILL}>
          <RegionPlaceholder />
        </Grid.Col>
      </Grid>
    );
  }

  if (tier === 'tablet') {
    return (
      <Grid h="100%" styles={{ inner: { height: '100%' } }}>
        <Grid.Col span={7} style={FILL}>
          <RegionPlaceholder />
        </Grid.Col>
        <Grid.Col span={5} style={FILL}>
          <RegionPlaceholder />
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <div style={{ height: '100%' }}>
      <RegionPlaceholder />
    </div>
  );
};
