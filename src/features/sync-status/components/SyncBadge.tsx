import { t } from '@/shared/i18n/t';
import { Badge, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconCloudCheck, IconCloudOff, IconCloudUpload, IconPlayerPause } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { isTauri } from '@/shared/lib/runtime';
import { badgeView } from '../lib/statusView';
import { useSyncStatus } from '../hooks/useSyncStatus';
import type { SyncPhase } from '../types';

const ICONS: Record<SyncPhase, typeof IconCloudCheck> = {
  idle: IconCloudCheck,
  syncing: IconCloudUpload,
  offline: IconCloudOff,
  error: IconAlertTriangle,
  paused: IconPlayerPause,
};

/**
 * Header badge for the desktop sync agent. Renders nothing on web and on a
 * desktop that is not linked to a cloud account, so it never adds noise for
 * users who stay offline.
 */
export const SyncBadge = () => {
  const status = useSyncStatus();
  const navigate = useNavigate();
  if (!isTauri()) return null;
  const view = badgeView(status);
  if (!view) return null;

  const Icon = ICONS[status.state];
  const attention = status.conflictsOpen > 0 || status.bootstrapRequired;
  const label = attention
    ? `${t(view.label)} · ${status.bootstrapRequired ? t('Action needed') : status.conflictsOpen}`
    : t(view.label);

  return (
    <Tooltip label={view.hint ? t(view.hint) : t(view.label)} withArrow disabled={!view.hint}>
      <Badge
        component="button"
        type="button"
        size="sm"
        variant="light"
        color={attention ? 'orange' : view.color}
        leftSection={<Icon size={12} />}
        style={{ cursor: 'pointer', flexShrink: 0 }}
        onClick={() =>
          navigate(ROUTES.SETTINGS, {
            state: { section: status.conflictsOpen > 0 && !status.bootstrapRequired ? 'conflicts' : 'sync' },
          })
        }
        data-log-id="sync.badge"
        data-sync-state={status.state}
      >
        {label}
      </Badge>
    </Tooltip>
  );
};
