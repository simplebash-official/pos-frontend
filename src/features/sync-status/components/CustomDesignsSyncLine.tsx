import { t } from '@/shared/i18n/t';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { formatDateTime } from '@/shared/lib/date';
import { isTauri } from '@/shared/lib/runtime';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { packagesView } from '../lib/packagesView';
import type { PackagesStatus } from '../types';

interface PackagesLineProps {
  packages: PackagesStatus;
}

// One line under Document Designs on the desktop app: have the shop's custom designs reached this
// computer? (Web shops read them from the cloud directly, so they have nothing to show.)
export const PackagesLine = ({ packages }: PackagesLineProps) => {
  const view = packagesView(packages);
  return (
    <Stack gap={2} data-testid="custom-designs-sync">
      <Group gap="xs" wrap="wrap">
        <Text size="sm" fw={600}>
          {t('Custom designs on this computer')}
        </Text>
        <Badge variant="light" color={view.color}>
          {t(view.label)}
          {view.count !== null ? ` · ${view.count}` : ''}
        </Badge>
      </Group>
      {view.hint && (
        <Text size="xs" c="dimmed">
          {view.hintIsRaw ? view.hint : t(view.hint)}
        </Text>
      )}
      {packages.checkedAt && (
        <Text size="xs" c="dimmed">
          {`${t('Checked')} ${formatDateTime(packages.checkedAt)}`}
        </Text>
      )}
    </Stack>
  );
};

/** The line for the live status; renders nothing on the web or on a computer not linked to a shop. */
export const CustomDesignsSyncLine = () => {
  const status = useSyncStatus();
  if (!isTauri() || !status.linked) return null;
  return <PackagesLine packages={status.packages} />;
};
