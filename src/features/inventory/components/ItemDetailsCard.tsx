import { t } from '@/shared/i18n/t';
import { Group, Paper, Stack, Text } from '@mantine/core';
import { IconCalendarPlus, IconClock, IconInfoCircle } from '@tabler/icons-react';
import { formatDateTime } from '@/shared/lib/date';
import type { Product } from '../types';
import { SectionLabel } from './itemDrawerParts';

const when = (date: string | undefined) => (date === undefined ? '—' : formatDateTime(date));

/** When the item was added and when it last changed. */
export const ItemDetailsCard = ({ product }: { product: Product }) => (
  <Paper p="md" bg="var(--bg-card)" shadow="xs">
    <Stack gap="xs">
      <SectionLabel icon={<IconInfoCircle size={14} />}>{t('Details')}</SectionLabel>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <IconCalendarPlus size={16} style={{ opacity: 0.6 }} />
          <Text size="xs" c="dimmed">
            {t('Created')}
          </Text>
        </Group>
        <Text size="xs" fw={700}>
          {when(product.createdAt)}
        </Text>
      </Group>

      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <IconClock size={16} style={{ opacity: 0.6 }} />
          <Text size="xs" c="dimmed">
            {t('Last Updated')}
          </Text>
        </Group>
        <Text size="xs" fw={700}>
          {when(product.updatedAt)}
        </Text>
      </Group>
    </Stack>
  </Paper>
);
