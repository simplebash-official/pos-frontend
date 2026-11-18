import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconBellCheck, IconChecks, IconSettings, IconX } from '@tabler/icons-react';
import { ROUTES } from '@/constants';
import { t } from '@/shared/i18n/t';
import { PresenceSwitch } from '@/shared/motion';
import { useMarkAllNotificationsRead, useMarkNotificationsRead } from '../hooks/useNotifications';
import { CATEGORY_ORDER, CATEGORY_VIEW } from '../lib/notificationView';
import { useMinuteClock } from '../lib/useMinuteClock';
import type { AppNotification, NotificationCategory, NotificationSummary } from '../types';
import { NotificationList } from './NotificationList';
import { PillSwitch } from './PillSwitch';

type Tab = 'all' | 'unread';

interface NotificationPanelProps {
  summary: NotificationSummary | undefined;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  onClose: () => void;
  /** Phone layout: fills the screen and shows a close button. */
  mobile: boolean;
}

const EMPTY_FILTER = { categories: [], severities: [] };

/** What the bell opens: the newest notifications, with quick filters and actions. */
export const NotificationPanel = ({
  summary,
  loading,
  failed,
  onRetry,
  onClose,
  mobile,
}: NotificationPanelProps) => {
  const navigate = useNavigate();
  const now = useMinuteClock(true);
  const [tab, setTab] = useState<Tab>('all');
  const [category, setCategory] = useState<NotificationCategory | null>(null);
  const markRead = useMarkNotificationsRead();
  const markAll = useMarkAllNotificationsRead();

  // Nothing to list until the summary has loaded (the loading state shows meanwhile).
  const latest = summary === undefined ? [] : summary.latest;
  const unreadTotal = summary === undefined ? 0 : summary.unreadTotal;
  const present = CATEGORY_ORDER.filter((c) => latest.some((n) => n.category === c));
  // A category missing from the counts has nothing unread.
  const unreadOf = (c: NotificationCategory) => {
    const entry = summary?.unreadByCategory.find((e) => e.category === c);
    return entry === undefined ? 0 : entry.unread;
  };
  const items = latest.filter(
    (n) => (tab === 'all' || !n.read) && (category === null || n.category === category)
  );

  const open = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate([notification.key]);
    if (notification.link !== undefined) {
      navigate(notification.link.path);
      onClose();
    }
  };
  const seeAll = () => {
    navigate(ROUTES.SETTINGS, { state: { section: 'notifications' } });
    onClose();
  };

  const state = failed ? 'failed' : loading ? 'loading' : items.length === 0 ? 'empty' : 'list';

  return (
    <Stack gap={0} className="ntf-panel" data-mobile={mobile || undefined}>
      <Group justify="space-between" wrap="nowrap" px="md" pt="md" pb="xs" gap="xs">
        <Group gap={8} wrap="nowrap">
          <Text fw={700} size="lg">
            {t('Notifications')}
          </Text>
          {unreadTotal > 0 && (
            <Text size="xs" fw={700} className="ntf-unread-pill">
              {unreadTotal > 99 ? '99+' : unreadTotal} {t('new')}
            </Text>
          )}
        </Group>
        <Group gap={4} wrap="nowrap">
          <Tooltip label={t('Mark all as read')} withinPortal>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={mobile ? 44 : 32}
              disabled={unreadTotal === 0}
              aria-label={t('Mark all as read')}
              onClick={() => markAll.mutate(EMPTY_FILTER)}
            >
              <IconChecks size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('Notification history')} withinPortal>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={mobile ? 44 : 32}
              aria-label={t('Notification history')}
              onClick={seeAll}
            >
              <IconSettings size={18} />
            </ActionIcon>
          </Tooltip>
          {mobile && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size={44}
              aria-label={t('Close')}
              onClick={onClose}
            >
              <IconX size={20} />
            </ActionIcon>
          )}
        </Group>
      </Group>

      <Box px="md" pb="xs">
        <PillSwitch
          label={t('Show')}
          grow
          value={tab}
          onChange={setTab}
          options={[
            { value: 'all', label: t('All') },
            { value: 'unread', label: t('Unread'), count: unreadTotal },
          ]}
        />
      </Box>

      {present.length > 1 && (
        <ScrollArea type="never" px="md" pb="xs" className="ntf-chips-scroll">
          <Group gap={6} wrap="nowrap">
            <UnstyledButton
              className="ntf-chip"
              data-active={category === null || undefined}
              onClick={() => setCategory(null)}
            >
              {t('Everything')}
            </UnstyledButton>
            {present.map((c) => {
              const Icon = CATEGORY_VIEW[c].icon;
              const unread = unreadOf(c);
              return (
                <UnstyledButton
                  key={c}
                  className="ntf-chip"
                  data-active={category === c || undefined}
                  aria-pressed={category === c}
                  onClick={() => setCategory(category === c ? null : c)}
                >
                  <Icon size={14} />
                  {t(CATEGORY_VIEW[c].label)}
                  {unread > 0 && <span className="ntf-chip-count">{unread}</span>}
                </UnstyledButton>
              );
            })}
          </Group>
        </ScrollArea>
      )}

      <ScrollArea.Autosize
        mah={mobile ? undefined : 'min(60dvh, 520px)'}
        className="ntf-panel-list"
        classNames={{ viewport: 'scrollarea-fluid-content' }}
        type="hover"
        offsetScrollbars
      >
        <PresenceSwitch stateKey={state}>
          {state === 'failed' && (
            <Stack align="center" gap="xs" py="xl" px="md">
              <Text size="sm" c="dimmed" ta="center">
                {t('Notifications could not be loaded.')}
              </Text>
              <Button size="xs" variant="light" onClick={onRetry}>
                {t('Try again')}
              </Button>
            </Stack>
          )}
          {state === 'loading' && (
            <Stack gap="sm" p="md">
              {[0, 1, 2].map((i) => (
                <Group key={i} gap="sm" wrap="nowrap" align="flex-start">
                  <Skeleton height={36} width={36} />
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Skeleton height={12} width="60%" />
                    <Skeleton height={10} width="90%" />
                  </Stack>
                </Group>
              ))}
            </Stack>
          )}
          {state === 'empty' && (
            <Stack align="center" gap={6} py={36} px="md">
              <ThemeIcon size={56} variant="light" color="teal" radius="xl">
                <IconBellCheck size={28} />
              </ThemeIcon>
              <Text fw={600} mt={6}>
                {tab === 'unread' ? t("You're all caught up") : t('No notifications yet')}
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={260}>
                {tab === 'unread'
                  ? t('New alerts about your shop will show up here.')
                  : t('Alerts about stock, repairs, bills and more will show up here.')}
              </Text>
            </Stack>
          )}
          {state === 'list' && (
            <Box px={6} pb={6}>
              <NotificationList
                items={items}
                now={now}
                variant="compact"
                onOpen={open}
                onMarkRead={(n) => markRead.mutate([n.key])}
                touch={mobile}
              />
            </Box>
          )}
        </PresenceSwitch>
      </ScrollArea.Autosize>

      <Box p="xs" className="ntf-panel-footer">
        <Button variant="subtle" fullWidth size={mobile ? 'md' : 'sm'} onClick={seeAll}>
          {t('See all notifications')}
        </Button>
      </Box>
    </Stack>
  );
};
