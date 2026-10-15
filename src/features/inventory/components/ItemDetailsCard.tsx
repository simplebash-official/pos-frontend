import { t } from '@/shared/i18n/t';
import { Stack } from '@mantine/core';
import { IconCalendarPlus, IconClock, IconInfoCircle } from '@tabler/icons-react';
import { DrawerCard, InfoRow } from '@/shared/components/drawer';
import { formatDateTime } from '@/shared/lib/date';
import type { Product } from '../types';

const when = (date: string | undefined) => (date === undefined ? '—' : formatDateTime(date));

/** When the item was added and when it last changed. */
export const ItemDetailsCard = ({ product }: { product: Product }) => (
  <DrawerCard label={t('Details')} icon={<IconInfoCircle size={14} />}>
    <Stack gap="xs">
      <InfoRow icon={<IconCalendarPlus size={16} />} label={t('Created')}>
        {when(product.createdAt)}
      </InfoRow>
      <InfoRow icon={<IconClock size={16} />} label={t('Last Updated')}>
        {when(product.updatedAt)}
      </InfoRow>
    </Stack>
  </DrawerCard>
);
