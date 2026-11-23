import { Alert, Button, Group, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconHourglassLow, IconShieldCheck } from '@tabler/icons-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListRow } from '@/shared/components/drawer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { useEndingSoonWarranties } from '../hooks/useWarranties';
import { daysLeftLabel, validUntil } from '../lib/warrantyView';
import type { Warranty } from '../types';

/** Who to call about it: the customer's name and phone, or that it was a walk-in sale. */
const whoBought = (warranty: Warranty): string => {
  const name = warranty.customerName === undefined ? t('Walk-in customer') : warranty.customerName;
  return warranty.customerPhone === undefined ? name : `${name} · ${warranty.customerPhone}`;
};

/**
 * Warranties in force whose last day falls within the week, soonest first: the shop can call
 * the customer while the item is still covered. Opening one shows it in the warranty drawer.
 */
export const EndingSoonList = ({
  until,
  onOpen,
}: {
  /** The last day the list covers (from the stats), or `null` while it is loading. */
  until: string | null;
  onOpen: (warrantyKey: string) => void;
}) => {
  const isMobile = useIsMobile();
  const query = useEndingSoonWarranties(true);
  const items = query.data === undefined ? [] : query.data.items;

  if (query.isError) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={16} />}>
        {getErrorMessage(query.error)}
      </Alert>
    );
  }
  if (query.data !== undefined && items.length === 0) {
    return (
      <EmptyState
        icon={
          <ThemeIcon size={56} variant="light" color="teal">
            <IconShieldCheck size={30} />
          </ThemeIcon>
        }
        title={t('No warranty ends this week')}
        description={t('Warranties in their last seven days show here, the soonest first.')}
      />
    );
  }

  return (
    <Paper withBorder p={isMobile ? 'sm' : 'md'} style={{ backgroundColor: 'var(--bg-card)' }}>
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          {until === null
            ? t('These warranties end within the week.')
            : `${t('These warranties end on or before')} ${formatDate(until)}. ${t(
                'A call now lets the customer bring the item in while it is still covered.'
              )}`}
        </Text>
        {query.data === undefined ? (
          <Stack gap="xs" mt="xs">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} height={44} />
            ))}
          </Stack>
        ) : (
          items.map((warranty, index) => (
            <ListRow
              key={warranty.key}
              index={index}
              first={index === 0}
              icon={
                <ThemeIcon variant="light" color="orange" size="lg">
                  <IconHourglassLow size={18} />
                </ThemeIcon>
              }
              title={warranty.itemName}
              meta={
                <Stack gap={0}>
                  <span>{whoBought(warranty)}</span>
                  <span>
                    {warranty.serialNumber === undefined
                      ? warranty.invoiceNumber
                      : warranty.serialNumber}{' '}
                    · {validUntil(warranty)}
                  </span>
                </Stack>
              }
              trailing={
                <Group gap="xs" wrap="nowrap">
                  <Text size="xs" fw={700} c="orange" visibleFrom="xs">
                    {daysLeftLabel(warranty)}
                  </Text>
                  <Button
                    variant="light"
                    size={isMobile ? 'sm' : 'xs'}
                    mih={isMobile ? 44 : undefined}
                    onClick={() => onOpen(warranty.key)}
                    aria-label={`${t('Open')} ${warranty.warrantyNumber}`}
                  >
                    {t('Open')}
                  </Button>
                </Group>
              }
            />
          ))
        )}
      </Stack>
    </Paper>
  );
};
