import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { Box, Text } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { groupByDay } from '../lib/notificationView';
import type { AppNotification } from '../types';
import { NotificationRow, type NotificationRowProps } from './NotificationRow';

interface NotificationListProps {
  items: AppNotification[];
  now: Date;
  variant: NotificationRowProps['variant'];
  onOpen: (notification: AppNotification) => void;
  onMarkRead: (notification: AppNotification) => void;
  touch: boolean;
}

/** Notifications under sticky day headings; rows glide into place as others leave. */
export const NotificationList = ({
  items,
  now,
  variant,
  onOpen,
  onMarkRead,
  touch,
}: NotificationListProps) => {
  const groups = groupByDay(items, now);
  // Where each day starts in the whole list, so the entrance stagger runs across days.
  const starts = groups.map((_, i) =>
    groups.slice(0, i).reduce((total, group) => total + group.items.length, 0)
  );
  return (
    <LayoutGroup>
      {groups.map((group, groupIndex) => (
        <Box
          key={group.key}
          component="section"
          aria-label={group.phrase ? t(group.label) : group.label}
        >
          <Text className="ntf-day" size="xs" fw={700} c="dimmed" tt="uppercase">
            {group.phrase ? t(group.label) : group.label}
          </Text>
          <AnimatePresence initial>
            {group.items.map((item, itemIndex) => (
              <NotificationRow
                key={item.key}
                notification={item}
                now={now}
                variant={variant}
                index={starts[groupIndex] + itemIndex}
                onOpen={onOpen}
                onMarkRead={onMarkRead}
                touch={touch}
              />
            ))}
          </AnimatePresence>
        </Box>
      ))}
    </LayoutGroup>
  );
};
