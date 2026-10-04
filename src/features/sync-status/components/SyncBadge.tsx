import { t } from '@/shared/i18n/t';
import { Badge, Tooltip } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCloudCheck,
  IconCloudOff,
  IconCloudUpload,
  IconPlayerPause,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { isTauri } from '@/shared/lib/runtime';
import { badgeView } from '../lib/statusView';
import { phraseText } from '../lib/phrase';
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
 * Header badge for the desktop sync agent. Says what the data is doing (synced,
 * syncing, waiting, offline), not just whether the internet is up. Renders
 * nothing on web and on a desktop that is not linked to a cloud account.
 */
export const SyncBadge = () => {
  const status = useSyncStatus();
  const navigate = useNavigate();
  if (!isTauri()) return null;
  const view = badgeView(status);
  if (!view) return null;

  const Icon = view.attention ? IconAlertTriangle : ICONS[status.state];

  return (
    <Tooltip label={phraseText(view.hint, t)} withArrow>
      <Badge
        component="button"
        type="button"
        size="sm"
        variant="light"
        color={view.color}
        leftSection={<Icon size={12} />}
        style={{ cursor: 'pointer', flexShrink: 0 }}
        onClick={() =>
          navigate(ROUTES.SETTINGS, {
            state: {
              section: status.conflictsOpen > 0 && !status.bootstrapRequired ? 'conflicts' : 'sync',
            },
          })
        }
        data-log-id="sync.badge"
        data-sync-state={status.state}
      >
        {phraseText(view.parts, t)}
      </Badge>
    </Tooltip>
  );
};
