import type { ReactNode } from 'react';
import { FadeIn } from '@/shared/motion';
import { Box, Group, Text } from '@mantine/core';

export interface ListRowProps {
  /** Leading tile (an icon in a tinted square). */
  icon: ReactNode;
  title: string;
  /** Small lines under the title. */
  meta?: ReactNode;
  /** Right-aligned figure or status. */
  trailing?: ReactNode;
  /** Position in the list; later rows enter a touch later (capped) so a list settles in. */
  index: number;
  /** A row that is the first in its list has no rule above it. */
  first?: boolean;
}

/** A divided list row with a leading icon, title, meta lines and a trailing figure. */
export const ListRow = ({ icon, title, meta, trailing, index, first }: ListRowProps) => {
  return (
    <FadeIn index={index} style={{ borderTop: first ? undefined : '1px solid var(--border)' }}>
      <Group justify="space-between" wrap="nowrap" gap="sm" py="xs" align="center">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          {icon}
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={700} lineClamp={1}>
              {title}
            </Text>
            {meta !== undefined && (
              <Text component="div" size="xs" c="dimmed">
                {meta}
              </Text>
            )}
          </Box>
        </Group>
        {trailing !== undefined && (
          <Box style={{ flexShrink: 0, textAlign: 'right' }}>{trailing}</Box>
        )}
      </Group>
    </FadeIn>
  );
};
