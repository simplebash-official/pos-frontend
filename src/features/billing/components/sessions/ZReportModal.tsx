import React from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconPrinter, IconReceipt } from '@tabler/icons-react';
import { useZReport } from '../../hooks/useRegisterSession';
import { formatMoney } from '@/shared/lib/money';
import { printZReportHtml } from './sessionPrint';
import { t } from '@/shared/i18n/t';
import { FadeIn } from '@/shared/motion';

export interface ZReportModalProps {
  opened: boolean;
  onClose: () => void;
  sessionKey?: string;
}

export const ZReportModal: React.FC<ZReportModalProps> = ({ opened, onClose, sessionKey }) => {
  const { data: report, isLoading, isError } = useZReport(sessionKey);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconReceipt size={22} color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="lg">
            {t('End of Session Z-Report')}
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      {isLoading ? (
        <Group justify="center" p="xl">
          <Loader size="md" />
        </Group>
      ) : isError || !report ? (
        <Text c="red" ta="center" p="md">
          {t('Failed to load Z-Report')}
        </Text>
      ) : (
        <Stack gap="md">
          {/* Header Card */}
          <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-gray-0)">
            <Grid gap="xs">
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" tt="uppercase">
                  {t('Session Number')}
                </Text>
                <Text size="md" fw={700}>
                  {report.session.sessionNumber}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" tt="uppercase">
                  {t('Terminal')}
                </Text>
                <Text size="md" fw={600}>
                  {report.session.terminalId}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" tt="uppercase">
                  {t('Cashier')}
                </Text>
                <Text size="sm" fw={500}>
                  {report.session.cashierNameSnapshot}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" tt="uppercase">
                  {t('Closed At')}
                </Text>
                <Text size="sm">
                  {report.session.closedAt
                    ? new Date(report.session.closedAt).toLocaleString()
                    : t('Still Open')}
                </Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Sales Summary */}
          <FadeIn index={1}>
            <Card withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Text size="sm" fw={700}>
                  {t('Sales Performance')}
                </Text>
                <Group justify="space-between">
                  <Text size="sm">{t('Gross Sales:')}</Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(report.grossSalesCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Returns & Credit Notes:')}</Text>
                  <Text size="sm" c="red">
                    -{formatMoney(report.returnsCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Discounts Given:')}</Text>
                  <Text size="sm" c="dimmed">
                    -{formatMoney(report.discountCents)}
                  </Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="md" fw={700}>
                    {t('Net Sales:')}
                  </Text>
                  <Text size="lg" fw={700} c="blue">
                    {formatMoney(report.netSalesCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t('Total Invoices Completed:')}
                  </Text>
                  <Text size="xs" fw={600}>
                    {report.totalInvoicesCount}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </FadeIn>

          {/* Payment Method Breakdown */}
          <FadeIn index={2}>
            <Card withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Text size="sm" fw={700}>
                  {t('Payment Method Breakdown')}
                </Text>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('Method')}</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>{t('Payments')}</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>{t('Total')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {report.paymentMethods.map((pm) => (
                      <Table.Tr key={pm.method}>
                        <Table.Td tt="capitalize" fw={500}>
                          {pm.method}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>{pm.count}</Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatMoney(pm.totalCents)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Card>
          </FadeIn>

          {/* Cash Drawer Reconciliation */}
          <FadeIn index={3}>
            <Card withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Text size="sm" fw={700}>
                  {t('Cash Drawer Reconciliation')}
                </Text>
                <Group justify="space-between">
                  <Text size="sm">{t('Opening Float:')}</Text>
                  <Text size="sm">{formatMoney(report.cashReconciliation.openingFloatCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Cash Sales:')}</Text>
                  <Text size="sm">+{formatMoney(report.cashReconciliation.cashSalesCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Pay-Ins:')}</Text>
                  <Text size="sm">+{formatMoney(report.cashReconciliation.payInCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Pay-Outs:')}</Text>
                  <Text size="sm">-{formatMoney(report.cashReconciliation.payOutCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Cash Refunds:')}</Text>
                  <Text size="sm">-{formatMoney(report.cashReconciliation.cashRefundsCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Owner Withdrawals:')}</Text>
                  <Text size="sm">
                    -{formatMoney(report.cashReconciliation.ownerWithdrawalsCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Cash Drops to Safe:')}</Text>
                  <Text size="sm">-{formatMoney(report.cashReconciliation.cashDropsCents)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    {t('Expected Cash:')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(report.cashReconciliation.expectedCashCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    {t('Actual Counted Cash:')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(report.cashReconciliation.countedCashCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" fw={700}>
                    {t('Cash Variance:')}
                  </Text>
                  <Badge
                    size="lg"
                    color={
                      report.cashReconciliation.varianceCents === 0
                        ? 'teal'
                        : report.cashReconciliation.varianceCents < 0
                          ? 'red'
                          : 'yellow'
                    }
                    variant="filled"
                  >
                    {formatMoney(report.cashReconciliation.varianceCents)}
                  </Badge>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm">{t('Retained Float (For Next Shift):')}</Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(report.cashReconciliation.closingFloatCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Safe Deposit:')}</Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(report.cashReconciliation.safeDepositCents)}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </FadeIn>

          <Group justify="space-between" mt="sm">
            <Button
              variant="outline"
              color="blue"
              leftSection={<IconPrinter size={18} />}
              onClick={() => printZReportHtml(report)}
            >
              {t('Print Z-Report')}
            </Button>
            <Button variant="default" onClick={onClose}>
              {t('Close')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};
