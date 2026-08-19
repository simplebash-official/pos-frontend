import type { ModuleSyncStatus } from '@/offline/types';
import type { OverallSyncStatus } from '@/store/slices/syncSlice';

export type { ModuleSyncStatus, ModuleSyncView } from '@/offline/types';
export type { OverallSyncStatus } from '@/store/slices/syncSlice';

/** How a status renders: a Mantine colour, a design token, and a label. */
export interface StatusPresentation {
  label: string;
  color: string;
  /** CSS variable for the accent stripe / dot. */
  token: string;
}

export const MODULE_STATUS_PRESENTATION: Record<ModuleSyncStatus, StatusPresentation> = {
  synced: { label: 'Synced', color: 'green', token: 'var(--status-ok)' },
  syncing: { label: 'Syncing', color: 'blue', token: 'var(--status-busy)' },
  pending: { label: 'Pending', color: 'orange', token: 'var(--status-warn)' },
  stale: { label: 'Out of date', color: 'yellow', token: 'var(--status-warn)' },
  never: { label: 'Not downloaded', color: 'gray', token: 'var(--status-idle)' },
  error: { label: 'Error', color: 'red', token: 'var(--status-error)' },
  conflict: { label: 'Needs attention', color: 'red', token: 'var(--status-error)' },
};

export const OVERALL_STATUS_PRESENTATION: Record<OverallSyncStatus, StatusPresentation> = {
  online: { label: 'Online', color: 'green', token: 'var(--status-ok)' },
  checking: { label: 'Checking…', color: 'gray', token: 'var(--status-idle)' },
  degraded: { label: 'Slow', color: 'yellow', token: 'var(--status-warn)' },
  syncing: { label: 'Syncing', color: 'blue', token: 'var(--status-busy)' },
  pending: { label: 'Pending', color: 'orange', token: 'var(--status-warn)' },
  // Orange, not red: being offline is an expected mode, not a fault.
  offline: { label: 'Offline', color: 'orange', token: 'var(--status-warn)' },
  error: { label: 'Sync error', color: 'red', token: 'var(--status-error)' },
  conflict: { label: 'Needs attention', color: 'red', token: 'var(--status-error)' },
};
