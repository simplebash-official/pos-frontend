import { Badge } from '@mantine/core';
import { t } from '@/shared/i18n/t';

/** "3 items", at the right of the card title that holds a job's work. */
export const ItemCountBadge = ({ count }: { count: number }) => (
  <Badge variant="light" color="gray" radius="xl" size="sm" style={{ flexShrink: 0 }}>
    {count} {count === 1 ? t('item') : t('items')}
  </Badge>
);
