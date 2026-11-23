import { motion } from 'framer-motion';
import { ActionIcon, Badge, Box, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { formatDateTime } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import { staggerDelay, useMotionPresets } from '@/shared/motion';
import { CATEGORY_VIEW, SEVERITY_COLOR, rowTime } from '../lib/notificationView';
import type { AppNotification } from '../types';

export interface NotificationRowProps {
  notification: AppNotification;
  now: Date;
  /** `compact` (the bell): two lines of message. `full` (history): all of it, and its details. */
  variant: 'compact' | 'full';
  /** Position in the list, for the entrance stagger. */
  index: number;
  onOpen: (notification: AppNotification) => void;
  onMarkRead: (notification: AppNotification) => void;
  /** Show the mark-as-read button without hovering (touch screens). */
  touch: boolean;
}

const timeText = (createdAt: string, now: Date): string => {
  const time = rowTime(createdAt, now);
  if (time.kind === 'now') return t('Just now');
  if (time.kind === 'minutes') return `${time.minutes} ${t('min ago')}`;
  return time.text;
};

/** One notification: a tinted icon, what happened, when, and a quiet way to mark it read. */
export const NotificationRow = ({
  notification,
  now,
  variant,
  index,
  onOpen,
  onMarkRead,
  touch,
}: NotificationRowProps) => {
  const { reduced, transition } = useMotionPresets();
  const view = CATEGORY_VIEW[notification.category];
  const Icon = view.icon;
  const color = SEVERITY_COLOR[notification.severity];
  const unread = !notification.read;
  const full = variant === 'full';

  return (
    <motion.div
      layout={reduced ? false : 'position'}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
      transition={reduced ? transition : { ...transition, delay: staggerDelay(index) }}
      className="ntf-row"
      data-unread={unread || undefined}
      data-touch={touch || undefined}
    >
      <UnstyledButton
        className="ntf-row-main"
        onClick={() => onOpen(notification)}
        aria-label={`${notification.title}. ${notification.body}${unread ? `. ${t('Not read yet')}` : ''}`}
      >
        <Group wrap="nowrap" align="flex-start" gap="sm">
          <Box
            className="ntf-tile"
            style={{
              background: `var(--mantine-color-${color}-light)`,
              color: `var(--mantine-color-${color}-light-color)`,
            }}
          >
            <Icon size={18} stroke={1.8} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap" gap={8} align="baseline">
              <Text
                size="sm"
                fw={unread ? 650 : 500}
                lineClamp={touch ? 2 : 1}
                c="var(--text-primary)"
              >
                {notification.title}
              </Text>
              <Text
                size="xs"
                c="dimmed"
                style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
              >
                {timeText(notification.createdAt, now)}
              </Text>
            </Group>
            <Text size="sm" c="var(--text-secondary)" lineClamp={full ? undefined : 2} mt={2}>
              {notification.body}
            </Text>
            <Group gap={6} mt={6} wrap="wrap">
              <Text size="xs" c="dimmed">
                {t(view.label)}
              </Text>
              {notification.source === 'service' && (
                <Badge size="xs" variant="light" color="violet" tt="none">
                  {t('From SimpleBash')}
                </Badge>
              )}
              {full && (
                <Text size="xs" c="dimmed">
                  · {formatDateTime(notification.createdAt)}
                </Text>
              )}
              {notification.link !== undefined && (
                <Text size="xs" fw={600} c={`${color}.6`} className="ntf-row-link">
                  {notification.link.label}
                  <IconArrowRight size={12} />
                </Text>
              )}
            </Group>
          </Box>
        </Group>
      </UnstyledButton>
      {unread && (
        <Box className="ntf-row-side">
          <span
            className="ntf-dot"
            style={{ background: `var(--mantine-color-${color}-filled)` }}
          />
          <Tooltip label={t('Mark as read')} withinPortal>
            <ActionIcon
              className="ntf-row-action"
              variant="subtle"
              color="gray"
              size={touch ? 44 : 28}
              aria-label={`${t('Mark as read')}: ${notification.title}`}
              onClick={() => onMarkRead(notification)}
            >
              <IconCheck size={16} />
            </ActionIcon>
          </Tooltip>
        </Box>
      )}
    </motion.div>
  );
};
