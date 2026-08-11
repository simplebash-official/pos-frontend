import { Box, Group, Paper, Skeleton, Stack } from '@mantine/core';

// Deterministic row widths (no Math.random) — narrows each row a bit for a natural,
// stable "content still loading" look inside the generic content block below.
const CONTENT_ROW_WIDTHS = [90, 82, 74, 66, 58];

export const PageSkeleton = () => {
  return (
    <Box>
      <Group justify="space-between" align="flex-start" mb="lg">
        <Stack gap="xs">
          <Skeleton height={24} width={200} />
          <Skeleton height={14} width={300} />
        </Stack>
        <Skeleton height={36} width={130} />
      </Group>

      <Paper p="xl" withBorder>
        <Stack gap="md">
          {CONTENT_ROW_WIDTHS.map((widthPercent, index) => (
            <Skeleton key={index} height={20} width={`${widthPercent}%`} />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};
