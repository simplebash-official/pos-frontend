import { Box, Group, Paper, Progress, Stack, Text, UnstyledButton } from '@mantine/core';
import {
  IconCamera,
  IconChevronRight,
  IconDeviceMobile,
  IconPackage,
  IconPrinter,
  IconTool,
} from '@tabler/icons-react';
import { CopyIconButton, IconTile } from '@/shared/components/drawer';
import { FadeIn } from '@/shared/motion';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { daysLeftLabel, periodUsedPercent, stateLook, validUntil } from '../lib/warrantyView';
import type { Warranty, WarrantyGroup, WarrantySourceType } from '../types';
import { WarrantyStateDot } from './WarrantyStateDot';

/** Where a warranty came from, as the card says it. */
const sourceLook = (source: WarrantySourceType): { Icon: typeof IconTool; label: string } => {
  switch (source) {
    case 'product_sale':
      return { Icon: IconPackage, label: t('Product sale') };
    case 'repair':
      return { Icon: IconTool, label: t('Repair') };
    case 'print':
      return { Icon: IconPrinter, label: t('Print work') };
  }
};

const getItemIcon = (name: string, warranties: Warranty[]) => {
  // A device with repair work done on it, or a print job's own line, shows the job's icon.
  const job = warranties.find((w) => w.sourceType !== 'product_sale');
  if (job !== undefined) {
    const { Icon } = sourceLook(job.sourceType);
    return <Icon size={22} />;
  }
  const lower = name.toLowerCase();
  if (
    lower.includes('phone') ||
    lower.includes('mobile') ||
    lower.includes('iphone') ||
    lower.includes('galaxy')
  ) {
    return <IconDeviceMobile size={22} />;
  }
  if (lower.includes('camera') || lower.includes('cam') || lower.includes('lens')) {
    return <IconCamera size={22} />;
  }
  return <IconPackage size={22} />;
};

const WarrantyLine = ({
  warranty,
  onOpen,
}: {
  warranty: Warranty;
  onOpen: (key: string) => void;
}) => {
  const isMobile = useIsMobile();
  const used = periodUsedPercent(warranty);
  const look = stateLook(warranty.state);
  const daysLeft = daysLeftLabel(warranty);
  const isMultiUnit = warranty.quantity > 1;
  const source = sourceLook(warranty.sourceType);

  return (
    <UnstyledButton
      onClick={() => onOpen(warranty.key)}
      aria-label={`${t('Open warranty')} ${warranty.warrantyNumber}`}
      className="warranty-line"
      style={{
        display: 'block',
        width: '100%',
        padding: isMobile ? '12px' : '10px 12px',
        minHeight: isMobile ? 44 : undefined,
        borderRadius: 'var(--mantine-radius-default)',
        border: '1px solid var(--border)',
        background: 'var(--bg-app)',
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm" align="flex-start">
        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
          <Group gap={8} wrap="nowrap">
            <source.Icon size={14} color="var(--text-muted)" />
            <Text size="sm" fw={700} lineClamp={1}>
              {source.label}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" ff="monospace" style={{ overflowWrap: 'anywhere' }}>
            {warranty.invoiceNumber} · {warranty.warrantyNumber}
            {isMultiUnit
              ? (warranty.claimedQuantity ?? 0) > 0
                ? ` · ${warranty.claimedQuantity} of ${warranty.quantity} ${t('claimed')}`
                : ` · ${warranty.quantity} ${t('units')}`
              : ''}
          </Text>
          {(warranty.customerName || warranty.customerPhone) && (
            <Text size="xs" c="dimmed">
              {[warranty.customerName, warranty.customerPhone].filter(Boolean).join(' · ')}
            </Text>
          )}
        </Stack>
        <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
          <WarrantyStateDot state={warranty.state} size="xs" />
          <IconChevronRight size={16} color="var(--text-muted)" />
        </Group>
      </Group>
      <Group justify="space-between" mt={8} gap="xs" wrap="nowrap">
        <Text size="xs" c="var(--text-secondary)">
          {validUntil(warranty)}
        </Text>
        {daysLeft !== '' && (
          <Text size="xs" fw={700} c={look.color} style={{ whiteSpace: 'nowrap' }}>
            {daysLeft}
          </Text>
        )}
      </Group>
      {used !== null && (
        <Progress
          mt={6}
          value={used}
          color={look.color}
          size={4}
          aria-label={t('How much of the warranty has passed')}
        />
      )}
    </UnstyledButton>
  );
};

/**
 * One device (one serial or IMEI) and every warranty it has, newest first: a product sale and
 * the repairs done on it sit together so staff pick the right one. A non-serialized item is a
 * card of its own.
 */
export const WarrantyGroupCard = ({
  group,
  index,
  onOpen,
}: {
  group: WarrantyGroup;
  index: number;
  onOpen: (key: string) => void;
}) => {
  return (
    <FadeIn index={index}>
      <Paper p="md" bg="var(--bg-card)" shadow="xs" h="100%">
        <Group gap="md" wrap="nowrap" align="flex-start" mb="sm">
          <IconTile color="blue" size={44}>
            {getItemIcon(group.itemName, group.warranties)}
          </IconTile>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text fw={800} size="md" lineClamp={2}>
              {group.itemName}
            </Text>
            {group.serialNumber !== undefined && (
              <Group gap={4} wrap="nowrap">
                <Text size="xs" c="dimmed" ff="monospace" style={{ wordBreak: 'break-all' }}>
                  {group.serialNumber}
                </Text>
                <CopyIconButton value={group.serialNumber} label={t('Copy serial number')} />
              </Group>
            )}
            {(group.customerName !== undefined || group.customerPhone !== undefined) && (
              <Text size="xs" c="dimmed">
                {[group.customerName, group.customerPhone]
                  .filter((part): part is string => part !== undefined)
                  .join(' · ')}
              </Text>
            )}
          </Box>
        </Group>
        <Stack gap="xs">
          {group.warranties.map((warranty) => (
            <WarrantyLine key={warranty.key} warranty={warranty} onOpen={onOpen} />
          ))}
        </Stack>
      </Paper>
    </FadeIn>
  );
};
