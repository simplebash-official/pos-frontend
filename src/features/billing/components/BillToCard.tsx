import { Badge, Box, Button, Group, Loader, Paper, Radio, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconUserPlus } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { BillTo } from '../hooks/useBillTo';
import { useCartCustomer } from '../hooks/useCart';
import type { JobOwner } from '../lib/billTo';

/** The radio value for "the customer already named on the bill", who owns none of the jobs. */
const CURRENT = 'current';

export interface BillToCardProps {
  billTo: BillTo;
  onOpenCustomerPicker: () => void;
}

const tickets = (owner: JobOwner) => owner.ticketNumbers.join(', ');

/** The tickets under an owner's name: the first two and a count once there are many. */
const shortTickets = ({ ticketNumbers }: JobOwner) =>
  ticketNumbers.length <= 3
    ? ticketNumbers.join(', ')
    : `${ticketNumbers.slice(0, 2).join(', ')} +${ticketNumbers.length - 2}`;

/**
 * Who this bill is for, while a repair or print job is on it. The job's customer is chosen by
 * default; billing someone else is a visible, deliberate choice, and the warranty stays with the
 * job's customer.
 */
export const BillToCard = ({ billTo, onOpenCustomerPicker }: BillToCardProps) => {
  const isMobile = useIsMobile();
  const { customerId, customerName, customerPhone, customerBalanceCents } = useCartCustomer();
  const { status, owners, unanswered, stateOf } = billTo;
  const asking = unanswered.length > 0;
  const payerOwns = owners.some((owner) => owner.key === customerId);
  const chosen = asking ? null : payerOwns ? customerId : CURRENT;
  const allTickets = owners.flatMap((owner) => owner.ticketNumbers);

  const differentButton = (
    <Button
      variant="light"
      color="blue"
      size={isMobile ? 'md' : 'xs'}
      leftSection={<IconUserPlus size={14} />}
      onClick={onOpenCustomerPicker}
      data-log-id="billing.bill-to-different"
    >
      {t('A different customer…')}
    </Button>
  );

  const balance =
    customerBalanceCents > 0 ? (
      <Badge size="xs" color="red" variant="light" radius="xl" fw={600}>
        {t('Bal:')} {formatMoney(customerBalanceCents)}
      </Badge>
    ) : null;

  const option = (value: string, name: string, detail: string, isPayer: boolean) => (
    <Radio
      key={value}
      value={value}
      styles={{
        body: { alignItems: 'center', minHeight: isMobile ? 44 : 34 },
        labelWrapper: { flex: 1, minWidth: 0 },
        label: { cursor: 'pointer' },
      }}
      label={
        <Group gap={6} wrap="nowrap">
          <Text component="span" size="sm" fw={700} truncate>
            {name}
          </Text>
          {isPayer && balance}
        </Group>
      }
      description={detail}
    />
  );

  return (
    <Paper
      p="xs"
      withBorder
      data-testid="bill-to-card"
      style={{
        backgroundColor: asking ? 'var(--status-warn-bg)' : 'var(--mantine-color-body)',
        borderColor: asking ? 'var(--status-warn)' : undefined,
      }}
    >
      <Group justify="space-between" gap="xs" wrap="nowrap" mb={4}>
        <Text size="xs" fw={800} tt="uppercase" c="dimmed">
          {t('Bill to')}
        </Text>
        {status === 'ready' && (
          <Text size="xs" c="dimmed" truncate>
            {allTickets.length === 1
              ? `${t('From job')} ${allTickets[0]}`
              : `${t('From jobs')}: ${allTickets.length}`}
          </Text>
        )}
      </Group>

      {status === 'loading' && (
        <Group gap="xs" py={6} role="status">
          <Loader size="xs" />
          <Text size="sm" c="dimmed">
            {t('Checking whose job this is…')}
          </Text>
        </Group>
      )}

      {status === 'error' && (
        <Stack gap={6}>
          <Group gap="xs" wrap="nowrap" role="alert">
            <IconAlertTriangle size={16} color="var(--status-warn)" />
            <Text size="sm">{t('Could not check whose job this is.')}</Text>
          </Group>
          <Group gap="xs">
            <Button
              size={isMobile ? 'md' : 'xs'}
              leftSection={<IconRefresh size={14} />}
              onClick={billTo.retry}
              data-log-id="billing.bill-to-retry"
            >
              {t('Retry')}
            </Button>
            {differentButton}
          </Group>
        </Stack>
      )}

      {status === 'ready' && (
        <Stack gap={6}>
          {asking && (
            <Group gap={6} wrap="nowrap" align="flex-start" role="alert">
              <IconAlertTriangle
                size={16}
                color="var(--status-warn)"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <Text size="xs" fw={600}>
                {`${t('Choose who to bill. Job of another customer')}: ${unanswered
                  .map((owner) => `${owner.name} (${tickets(owner)})`)
                  .join(', ')}`}
              </Text>
            </Group>
          )}

          <Radio.Group
            aria-label={t('Bill to')}
            value={chosen}
            onChange={(value) => {
              if (value === CURRENT) billTo.keepPayer();
              else void billTo.billOwner(value);
            }}
          >
            <Stack gap={4}>
              {owners.map((owner) =>
                option(
                  owner.key,
                  owner.name,
                  [
                    owners.length === 1 ? t('Same as the job') : t('Job’s customer'),
                    shortTickets(owner),
                    owner.phone,
                  ].join(' · '),
                  owner.key === customerId
                )
              )}
              {!payerOwns &&
                option(
                  CURRENT,
                  customerName ?? t('Walk-in customer'),
                  [t('Paying for this bill'), customerPhone].filter(Boolean).join(' · '),
                  true
                )}
            </Stack>
          </Radio.Group>

          {owners
            .filter((owner) => stateOf(owner.key) !== 'same')
            .map((owner) => (
              <Text key={owner.key} size="xs" c="dimmed">
                {`${t('Warranty stays with')} ${owner.name} (${tickets(owner)}).`}
              </Text>
            ))}

          <Box>{differentButton}</Box>
        </Stack>
      )}
    </Paper>
  );
};
