import { t } from '@/shared/i18n/t';

// DISABLED, NOT DEAD — do not delete. This folder's engine was removed;
// this file is kept for a future sync backend. See src/features/sync/README.md.
import { Badge, Button, Group, Loader, Text, UnstyledButton } from '@mantine/core';
import { IconCloudOff, IconRefresh } from '@tabler/icons-react';
import { InteractiveTooltip } from '@/shared/components/InteractiveTooltip';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDateTime } from '@/shared/lib/date';
import { useAppSelector } from '@/store/hooks';
import {
  selectConnectivity,
  selectModuleViews,
  selectOverallSyncStatus,
  selectSyncTotals,
} from '@/store/slices/syncSlice';
import { selectIsOfflineSession } from '@/store/slices/authSlice';
import { OVERALL_STATUS_PRESENTATION } from '../types';

export interface SyncStatusBadgeProps {
  /** Opens the sync dashboard. */
  onOpenPanel: () => void;
}

/**
 * The connection indicator in the app header.
 *
 * Replaces a hardcoded green "Online" badge that was never wired to anything.
 * On mobile it collapses to a coloured dot inside a 44px tap target — offline
 * is exactly when a phone user most needs to see this, so it is never hidden.
 */
export const SyncStatusBadge = ({ onOpenPanel }: SyncStatusBadgeProps) => {
  const status = useAppSelector(selectOverallSyncStatus);
  const totals = useAppSelector(selectSyncTotals);
  const connectivity = useAppSelector(selectConnectivity);
  const modules = useAppSelector(selectModuleViews);
  const isOfflineSession = useAppSelector(selectIsOfflineSession);
  const isMobile = useIsMobile();

  const presentation = OVERALL_STATUS_PRESENTATION[status];
  const isBusy = status === 'syncing';

  const countSuffix =
    status === 'syncing' || status === 'pending'
      ? ` ${totals.pending}`
      : status === 'conflict'
        ? ` ${totals.dead + totals.conflicts}`
        : '';

  const lastSynced = modules.reduce<string | null>((latest, module) => {
    if (!module.lastPulledAt) {
      return latest;
    }
    return latest === null || module.lastPulledAt > latest ? module.lastPulledAt : latest;
  }, null);

  const tooltipDescription = [
    connectivity.state === 'offline'
      ? 'Changes are saved on this device and will sync when the connection returns.'
      : `Last updated ${lastSynced ? formatDateTime(lastSynced) : 'never'}.`,
    totals.pending > 0 ? `${totals.pending} change(s) waiting to upload.` : null,
    totals.dead + totals.conflicts > 0
      ? `${totals.dead + totals.conflicts} change(s) need your attention.`
      : null,
    isOfflineSession ? 'Signed in from a saved session — reconnect to re-verify.' : null,
  ]
    .filter((line): line is string => line !== null)
    .join(' ');

  return (
    <InteractiveTooltip
      title={`${presentation.label}${countSuffix}`}
      description={tooltipDescription}
      icon={
        connectivity.state === 'offline' ? <IconCloudOff size={16} /> : <IconRefresh size={16} />
      }
      color={presentation.color}
      footer={
        <Button
          size="xs"
          variant="light"
          color={presentation.color}
          fullWidth
          onClick={onOpenPanel}
        >
          {t('Open sync panel')}
        </Button>
      }
    >
      <UnstyledButton
        onClick={onOpenPanel}
        aria-label={`Connection status: ${presentation.label}. Open sync panel.`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Touch targets stay at 44px below `sm`, per the responsive rules.
          minWidth: isMobile ? 44 : undefined,
          minHeight: isMobile ? 44 : undefined,
        }}
      >
        {isMobile ? (
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: presentation.token,
              display: 'inline-block',
            }}
          />
        ) : (
          <Badge
            size="xs"
            color={presentation.color}
            variant="light"
            style={{ cursor: 'pointer' }}
            leftSection={
              isBusy ? (
                <Loader size={8} color={presentation.color} />
              ) : (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: presentation.token,
                    display: 'inline-block',
                  }}
                />
              )
            }
          >
            <Group gap={4} wrap="nowrap">
              <Text inherit>
                {presentation.label}
                {countSuffix}
              </Text>
            </Group>
          </Badge>
        )}
      </UnstyledButton>
    </InteractiveTooltip>
  );
};
