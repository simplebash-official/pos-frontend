import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconPrinter,
  IconTools,
} from '@tabler/icons-react';
import { useCustomerJobs } from '@/features/customer-jobs/hooks/useCustomerJobs';
import type { CustomerJob } from '@/features/customer-jobs/types';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { useCartCustomer, useCartItems } from '../hooks/useCart';
import { isTicketLine } from '../lib/handover';

/** A job that can join this bill now, or could once it is priced. */
const isOffered = (job: CustomerJob) =>
  job.isOpen && (job.blocker === null || job.blocker === 'no_work');

/**
 * The customer's other open jobs, offered under their name on the bill. One button adds the ones
 * that are ready; anything unfinished is added one by one, so nothing is handed over by mistake.
 */
export const OtherCustomerJobs = () => {
  const isMobile = useIsMobile();
  const { customerId, customerName } = useCartCustomer();
  const { items, completedSale, add } = useCartItems();
  const { jobs, isError, retry } = useCustomerJobs(completedSale ? null : customerId);
  const [expanded, setExpanded] = useState(false);

  if (completedSale || customerId === null) return null;
  if (isError) {
    return (
      <Group justify="space-between" gap="xs" wrap="nowrap" mt={6} role="alert">
        <Text size="xs" c="dimmed">
          {t('Could not load this customer’s other jobs.')}
        </Text>
        <Button size={isMobile ? 'sm' : 'compact-xs'} variant="light" onClick={retry}>
          {t('Retry')}
        </Button>
      </Group>
    );
  }

  if (jobs === undefined) return null;

  const onBill = new Set(items.filter(isTicketLine).map((item) => item.productId));
  const offered = jobs.filter((job) => isOffered(job) && !onBill.has(job.id));
  if (offered.length === 0) return null;
  const ready = offered.filter((job) => job.blocker === null && job.status === 'ready');
  const noun =
    onBill.size === 0
      ? t(offered.length === 1 ? 'open job for' : 'open jobs for')
      : t(offered.length === 1 ? 'more open job for' : 'more open jobs for');
  const summary = `${offered.length} ${noun} ${customerName}`;

  return (
    <Paper withBorder mt={6} data-testid="other-customer-jobs">
      <Group gap="xs" p={6} wrap="nowrap" justify="space-between">
        <Text size="xs" fw={700} lineClamp={2} style={{ minWidth: 0 }}>
          {summary}
        </Text>
        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
          {ready.length > 0 && (
            <Button
              size={isMobile ? 'sm' : 'compact-sm'}
              leftSection={<IconPlus size={12} />}
              onClick={() => ready.forEach((job) => add(job.line))}
              data-log-id="billing.add-ready-jobs"
              style={{ minHeight: isMobile ? 44 : undefined }}
            >
              {`${t('Add ready')} (${ready.length})`}
            </Button>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            size={isMobile ? 44 : 28}
            aria-expanded={expanded}
            aria-label={t(expanded ? 'Hide the jobs' : 'Show the jobs')}
            onClick={() => setExpanded((shown) => !shown)}
          >
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>
      </Group>

      {expanded && (
        <ScrollArea.Autosize mah={isMobile ? 240 : 180} type="auto">
          <Stack gap={0}>
            {offered.map((job) => {
              const JobIcon = job.kind === 'repair' ? IconTools : IconPrinter;
              return (
                <Group
                  key={job.id}
                  gap="xs"
                  px={6}
                  py={4}
                  wrap="nowrap"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <JobIcon size={16} style={{ flexShrink: 0 }} />
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    <Text size="xs" fw={700} truncate>
                      {`${job.ticketNumber} · ${job.title}`}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      <Badge
                        size="xs"
                        variant="light"
                        color={job.status === 'ready' ? 'green' : 'gray'}
                      >
                        {job.statusLabel}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {job.priceCents === undefined
                          ? t('Not priced yet')
                          : formatMoney(job.priceCents)}
                      </Text>
                    </Group>
                  </Box>
                  <Button
                    size={isMobile ? 'sm' : 'compact-xs'}
                    variant="default"
                    disabled={job.blocker !== null}
                    aria-label={`${t('Add')} ${job.ticketNumber}`}
                    onClick={() => add(job.line)}
                    style={{ flexShrink: 0, minHeight: isMobile ? 44 : undefined }}
                  >
                    {t('Add')}
                  </Button>
                </Group>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Paper>
  );
};
