import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconCreditCardPay,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import { useUpdateRecurringExpense } from '../hooks/useRecurring';
import { paidFromLabel } from '../lib/expenseView';
import { billLook, dueText, needsPaying } from '../lib/billView';
import type { RecurringBill, RecurringExpense } from '../types';

export interface RegularBillsPanelProps {
  bills: RecurringBill[] | undefined;
  loading: boolean;
  canManage: boolean;
  onPay: (bill: RecurringBill) => void;
  onEdit: (template: RecurringExpense) => void;
  onAdd: () => void;
}

/** The shop's monthly bills with where each stands this month, most urgent first. */
export const RegularBillsPanel = ({
  bills,
  loading,
  canManage,
  onPay,
  onEdit,
  onAdd,
}: RegularBillsPanelProps) => {
  const isMobile = useIsMobile();
  const update = useUpdateRecurringExpense();

  if (loading) {
    return (
      <Stack gap="sm">
        <Skeleton h={92} />
        <Skeleton h={92} />
      </Stack>
    );
  }
  if (bills === undefined || bills.length === 0) {
    return (
      <Paper withBorder p="xl" ta="center">
        <Stack gap="sm" align="center">
          <Text fw={600}>{t('No regular bills yet.')}</Text>
          <Text size="sm" c="dimmed" maw={420}>
            {t(
              'Add rent, electricity, water and other bills you pay every month to get reminders.'
            )}
          </Text>
          {canManage && (
            <Button h={isMobile ? 44 : undefined} onClick={onAdd}>
              {t('Add Regular Bill')}
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      {bills.map((bill) => {
        const look = billLook(bill.status);
        const { template } = bill;
        const percent = Math.min(100, Math.round((bill.paidCents / template.amountCents) * 100));
        return (
          <Paper key={template.key} withBorder p="md" data-testid="regular-bill">
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text fw={600} lineClamp={1}>
                    {template.categoryName}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {template.payeeName ? `${template.payeeName} · ` : ''}
                    {paidFromLabel(template.paidFrom)}
                  </Text>
                </Stack>
                <Badge variant="light" color={look.color} style={{ flexShrink: 0 }}>
                  {look.label}
                </Badge>
              </Group>
              <Group justify="space-between" wrap="wrap" gap="xs">
                <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(bill.paidCents)} {t('of')} {formatMoney(template.amountCents)}{' '}
                  {t('paid')}
                </Text>
                <Text size="sm" c="dimmed">
                  {bill.status === 'paid'
                    ? `${t('For')} ${formatDate(`${bill.period}-01`, 'MMMM YYYY')}`
                    : `${dueText(bill)} · ${formatDate(bill.dueDate)}`}
                </Text>
              </Group>
              <Progress
                value={percent}
                color={bill.status === 'overdue' ? 'red' : 'blue'}
                size="sm"
              />
              {canManage && (
                <Group justify="flex-end" gap="xs">
                  <ActionIcon
                    variant="default"
                    size={isMobile ? 44 : 32}
                    aria-label={`${t('Change')} ${template.categoryName}`}
                    onClick={() => onEdit(template)}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    size={isMobile ? 44 : 32}
                    aria-label={`${template.active ? t('Stop') : t('Restart')} ${template.categoryName}`}
                    loading={update.isPending}
                    onClick={() =>
                      update.mutate({ key: template.key, input: { active: !template.active } })
                    }
                  >
                    {template.active ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                  </ActionIcon>
                  {needsPaying(bill) && (
                    <Button
                      leftSection={<IconCreditCardPay size={16} />}
                      h={isMobile ? 44 : undefined}
                      size={isMobile ? 'md' : 'sm'}
                      onClick={() => onPay(bill)}
                      data-log-id="expenses.pay-regular-bill"
                    >
                      {t('Pay')} {formatMoney(bill.balanceCents)}
                    </Button>
                  )}
                </Group>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};
