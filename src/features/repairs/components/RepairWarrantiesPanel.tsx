import { useState } from 'react';
import { Anchor, Box, Button, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  StartClaimModal,
  WarrantyStateDot,
  useWarranties,
  validUntil,
  type Warranty,
} from '@/features/warranties';
import { ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { t } from '@/shared/i18n/t';

const CLAIMABLE = new Set(['active', 'expiring_soon', 'expired']);

export interface RepairWarrantiesPanelProps {
  repairKey: string;
  /** The claim window is open, so the job window must not close on Escape. */
  onNestedWindowChange: (open: boolean) => void;
}

/**
 * The warranties a handed-back job's work came with, each with where it stands and, while it
 * can still be claimed, a "Start claim" button that opens the claim window right here.
 */
export const RepairWarrantiesPanel = ({
  repairKey,
  onNestedWindowChange,
}: RepairWarrantiesPanelProps) => {
  const navigate = useNavigate();
  const canView = useHasPermission(PERMISSIONS.WARRANTIES_VIEW);
  const canRecord = useHasPermission(PERMISSIONS.WARRANTY_CLAIMS_RECORD);
  const warranties = useWarranties(canView ? { repairKey } : null);
  const [claiming, setClaiming] = useState<Warranty | null>(null);

  if (!canView) return null;

  const open = (warranty: Warranty | null) => {
    setClaiming(warranty);
    onNestedWindowChange(warranty !== null);
  };

  return (
    <Paper withBorder p="sm" bg="var(--bg-app)">
      <Stack gap="xs">
        <Group gap={6}>
          <IconShieldCheck size={16} style={{ color: 'var(--status-ok)' }} />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            {t('Warranty on this work')}
          </Text>
        </Group>
        {warranties.isLoading ? (
          <Loader size="sm" />
        ) : warranties.data === undefined || warranties.data.items.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('None of the work on this job came with a warranty.')}
          </Text>
        ) : (
          warranties.data.items.map((warranty) => (
            <Group key={warranty.key} justify="space-between" gap="sm" wrap="wrap">
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Anchor
                  component="button"
                  type="button"
                  size="sm"
                  fw={600}
                  onClick={() => navigate(`${ROUTES.WARRANTIES}?key=${warranty.key}`)}
                  style={{ textAlign: 'left' }}
                >
                  {warranty.itemName}
                </Anchor>
                <Group gap="xs">
                  <WarrantyStateDot state={warranty.state} size="xs" />
                  <Text size="xs" c="dimmed">
                    {validUntil(warranty)}
                  </Text>
                </Group>
              </Box>
              {canRecord && CLAIMABLE.has(warranty.state) && (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => open(warranty)}
                  data-log-id="repairs.start-warranty-claim"
                >
                  {t('Start claim')}
                </Button>
              )}
            </Group>
          ))
        )}
      </Stack>
      <StartClaimModal
        warranty={claiming}
        onClose={() => open(null)}
        onStarted={(claim) => {
          open(null);
          navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${claim.key}`);
        }}
      />
    </Paper>
  );
};
