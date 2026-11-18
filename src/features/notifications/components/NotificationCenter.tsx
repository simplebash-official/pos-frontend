import { useEffect, useRef, useState } from 'react';
import { useAnimationControls } from 'framer-motion';
import { Drawer, Popover } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { notify } from '@/shared/notify';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useMotionPresets } from '@/shared/motion';
import { useNotificationSummary, useNotificationsEnabled } from '../hooks/useNotifications';
import { RING_KEYFRAMES, announcesOnArrival } from '../lib/notificationView';
import type { AppNotification } from '../types';
import { NotificationBell } from './NotificationBell';
import { NotificationPanel } from './NotificationPanel';

/** Notifications that arrived since the last look: new keys, unread. */
const arrivals = (seen: Set<string>, latest: AppNotification[]): AppNotification[] =>
  latest.filter((n) => !seen.has(n.key) && !n.read);

const peek = (alerts: AppNotification[]) => {
  if (alerts.length === 1) {
    const [alert] = alerts;
    const toast = { title: alert.title, message: alert.body };
    if (alert.severity === 'critical') notify.error(toast);
    else notify.warning(toast);
    return;
  }
  notify.warning({
    title: `${alerts.length} ${t('new alerts')}`,
    message: t('Open the bell to see them.'),
  });
};

const Center = () => {
  const isMobile = useIsMobile();
  const { reduced } = useMotionPresets();
  const ring = useAnimationControls();
  const [opened, setOpened] = useState(false);
  const summary = useNotificationSummary();
  const seen = useRef<Set<string> | null>(null);

  // Whatever is there on first load is not "new"; later arrivals swing the bell, and urgent ones
  // pop up once so nobody misses them.
  useEffect(() => {
    if (summary.data === undefined) return;
    const latest = summary.data.latest;
    if (seen.current === null) {
      seen.current = new Set(latest.map((n) => n.key));
      return;
    }
    const fresh = arrivals(seen.current, latest);
    for (const n of latest) seen.current.add(n.key);
    if (fresh.length === 0) return;
    if (!reduced) void ring.start(RING_KEYFRAMES);
    const loud = fresh.filter((n) => announcesOnArrival(n.severity));
    if (loud.length > 0 && !opened) peek(loud);
  }, [summary.data, reduced, ring, opened]);

  const size = isMobile ? 44 : 32;
  const unread = summary.data === undefined ? 0 : summary.data.unreadTotal;
  const close = () => setOpened(false);
  const panel = (
    <NotificationPanel
      summary={summary.data}
      loading={summary.isPending}
      failed={summary.isError}
      onRetry={() => void summary.refetch()}
      onClose={close}
      mobile={isMobile}
    />
  );

  if (isMobile) {
    return (
      <>
        <NotificationBell
          unread={unread}
          ring={ring}
          size={size}
          opened={opened}
          onClick={() => setOpened(true)}
        />
        <Drawer
          opened={opened}
          onClose={close}
          position="bottom"
          size="100%"
          offset={0}
          withCloseButton={false}
          title={t('Notifications')}
          classNames={{ header: 'ntf-drawer-header', body: 'ntf-drawer-body' }}
        >
          {panel}
        </Drawer>
      </>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={10}
      shadow="xl"
      width="min(420px, calc(100vw - 32px))"
      trapFocus
      closeOnEscape
      returnFocus
    >
      <Popover.Target>
        <NotificationBell
          unread={unread}
          ring={ring}
          size={size}
          opened={opened}
          onClick={() => setOpened((o) => !o)}
        />
      </Popover.Target>
      <Popover.Dropdown p={0} className="ntf-dropdown" aria-label={t('Notifications')}>
        {panel}
      </Popover.Dropdown>
    </Popover>
  );
};

/** The header bell and its panel; nothing for a user who cannot see notifications. */
export const NotificationCenter = () => (useNotificationsEnabled() ? <Center /> : null);
