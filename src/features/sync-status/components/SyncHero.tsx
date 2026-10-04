import { useEffect, useState } from 'react';
import { Alert, Button, Group, Paper, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCloudCheck,
  IconCloudOff,
  IconCloudUpload,
  IconHourglass,
  IconPlayerPause,
  IconRefresh,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { formatDateTime } from '@/shared/lib/date';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { heroView, secondsUntil, type HeroIcon } from '../lib/syncView';
import { phraseText } from '../lib/phrase';
import type { SyncStatus } from '../types';

const ICONS: Record<HeroIcon, typeof IconCloudCheck> = {
  ok: IconCloudCheck,
  working: IconCloudUpload,
  waiting: IconHourglass,
  offline: IconCloudOff,
  attention: IconAlertTriangle,
  error: IconAlertTriangle,
  paused: IconPlayerPause,
};

export interface SyncHeroProps {
  status: SyncStatus;
  busy: boolean;
  onSyncNow: () => void;
  onTogglePause: () => void;
  onReview: () => void;
}

/** Ticks once a second only while a countdown is on screen. */
const useNow = (active: boolean): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
};

/** The one-sentence answer to "is my data safe, and what is sync doing?" */
export const SyncHero = ({ status, busy, onSyncNow, onTogglePause, onReview }: SyncHeroProps) => {
  const isMobile = useIsMobile();
  const view = heroView(status);
  const Icon = ICONS[view.icon];
  const retrying = status.state === 'error' || status.state === 'offline';
  const now = useNow(retrying && status.nextRetryAt !== null);
  const retryIn = retrying ? secondsUntil(status.nextRetryAt, now) : null;
  const paused = status.state === 'paused';
  const working = status.state === 'syncing';
  const progress = view.progress;
  const known = progress !== null && progress.total > 0;
  const buttonSize = isMobile ? 'md' : 'sm';

  return (
    <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-body)' }}>
      <Stack gap="sm">
        <Group gap="md" wrap="nowrap" align="flex-start">
          <ThemeIcon size="xl" variant="light" color={view.tone} style={{ flexShrink: 0 }}>
            <Icon size={24} />
          </ThemeIcon>
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Text fw={700} size="lg" data-sync-hero={view.icon}>
              {t(view.title)}
            </Text>
            <Text size="sm" c="dimmed">
              {phraseText(view.detail, t)}
            </Text>
            {status.lastSyncAt && !working && (
              <Text size="xs" c="dimmed">
                {t('Last checked')}: {formatDateTime(status.lastSyncAt)}
              </Text>
            )}
            {retryIn !== null && (
              <Text size="xs" c="dimmed">
                {t('Trying again in')} {retryIn} {t('seconds')}
              </Text>
            )}
          </Stack>
        </Group>

        {working && progress && (
          <Stack gap={4}>
            <Progress
              value={known ? (Math.min(progress.done, progress.total) / progress.total) * 100 : 100}
              animated={!known}
              color={view.tone}
              aria-label={t('Sync progress')}
            />
            <Text size="xs" c="dimmed">
              {known
                ? `${Math.min(progress.done, progress.total)} / ${progress.total}`
                : `${progress.done} ${t('received')}`}
            </Text>
          </Stack>
        )}

        {status.lastError && status.state !== 'error' && (
          <Alert color="red" variant="light">
            {status.lastError}
          </Alert>
        )}

        <Group gap="sm">
          {view.action === 'review' && (
            <Button
              size={buttonSize}
              color="orange"
              onClick={onReview}
              data-log-id="sync.review"
              style={{ minHeight: isMobile ? 44 : undefined }}
            >
              {t('Review')}
            </Button>
          )}
          <Button
            size={buttonSize}
            variant="light"
            leftSection={<IconRefresh size={16} />}
            loading={busy || working}
            disabled={paused}
            onClick={onSyncNow}
            data-log-id="sync.now"
            style={{ minHeight: isMobile ? 44 : undefined }}
          >
            {view.action === 'retry' ? t('Try again') : t('Sync now')}
          </Button>
          <Button
            size={buttonSize}
            variant="default"
            loading={busy}
            onClick={onTogglePause}
            data-log-id={paused ? 'sync.resume' : 'sync.pause'}
            style={{ minHeight: isMobile ? 44 : undefined }}
          >
            {paused ? t('Resume sync') : t('Pause sync')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
