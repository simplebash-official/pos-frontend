import { t } from '@/shared/i18n/t';
import {
  Badge,
  Box,
  Center,
  Group,
  Skeleton,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowDownLeft, IconArrowUpRight, IconHistory } from '@tabler/icons-react';
import { formatDateTime } from '@/shared/lib/date';
import { movementLabel, signedQuantity } from '../lib/movementView';
import type { StockMovement } from '../types';

export interface StockMovementListProps {
  movements: StockMovement[];
  loading: boolean;
}

/** The last 20 stock movements, newest first, each with what happened, when and how many. */
export const StockMovementList = ({ movements, loading }: StockMovementListProps) => {
  if (loading) {
    return (
      <Stack gap={4} py="xs">
        <Skeleton height={14} />
        <Skeleton height={14} />
      </Stack>
    );
  }

  if (movements.length === 0) {
    return (
      <Center py="md">
        <Stack gap={4} align="center">
          <IconHistory size={20} style={{ opacity: 0.4 }} />
          <Text size="xs" c="dimmed" ta="center">
            {t('No stock movements recorded yet.')}
          </Text>
          <Text size="xs" c="dimmed" ta="center" style={{ opacity: 0.7 }}>
            {t('Movements appear here after you apply a stock adjustment above.')}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <ScrollArea.Autosize mah="30dvh" offsetScrollbars>
      <Stack gap={0}>
        {movements.slice(0, 20).map((m, index) => {
          const gained = m.quantityDelta >= 0;
          const label = movementLabel(m.type);
          return (
            <Group
              key={m.id}
              justify="space-between"
              wrap="nowrap"
              gap="sm"
              py="xs"
              style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
            >
              <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <ThemeIcon variant="light" color={gained ? 'green' : 'red'} size="md">
                  {gained ? <IconArrowDownLeft size={14} /> : <IconArrowUpRight size={14} />}
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {label}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {formatDateTime(m.createdAt)}
                    {m.note && m.note.toLowerCase() !== label.toLowerCase() ? ` · ${m.note}` : ''}
                  </Text>
                </Box>
              </Group>
              <Badge size="sm" variant="light" color={gained ? 'green' : 'red'}>
                {signedQuantity(m.quantityDelta)}
              </Badge>
            </Group>
          );
        })}
      </Stack>
    </ScrollArea.Autosize>
  );
};
