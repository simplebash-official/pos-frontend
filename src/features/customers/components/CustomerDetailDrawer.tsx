import { t } from '@/shared/i18n/t';
import { BRAND_NAME } from '@/config/branding';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Center, Divider, Group, ScrollArea, Stack, Text } from '@mantine/core';
import {
  IconAddressBook,
  IconAlertCircle,
  IconCalendarPlus,
  IconClock,
  IconMail,
  IconMapPin,
  IconNotes,
  IconReceipt,
  IconScale,
  IconShoppingBag,
  IconTools,
  IconEdit,
  IconUser,
} from '@tabler/icons-react';
import { Customer } from '../types';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import {
  AnimatedTabs,
  CopyIconButton,
  DrawerAfter,
  DrawerCard,
  DrawerFooter,
  FooterDelete,
  DrawerGrid,
  DrawerHero,
  DrawerMain,
  DrawerRail,
  Figure,
  InfoRow,
  KpiStrip,
  KpiTile,
  ListRow,
  RichDrawer,
} from '@/shared/components/drawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { fetchInvoices } from '@/features/billing/api/invoicesApi';
import { fetchRepairs } from '@/features/repairs/api/repairsApi';
import { queryKeys } from '@/api/queryKeys';

type HistoryTab = 'invoices' | 'repairs' | 'notes';

export interface CustomerDetailDrawerProps {
  customer: Customer | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerDetailDrawer = ({
  customer,
  opened,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailDrawerProps) => {
  const [historyTab, setHistoryTab] = useState<HistoryTab>('invoices');

  const { data: scopedInvoices = [] } = useQuery({
    queryKey: queryKeys.billing.invoices({ customerKey: customer?.key }),
    queryFn: () => fetchInvoices({ customerKey: customer?.key }),
    enabled: opened && !!customer,
  });

  const customerInvoices = useMemo(() => {
    if (!customer) return [];
    // `customerKey` is an exact server-side filter, so this is a defensive
    // pass only (e.g. a legacy invoice snapshot recorded under a stale key).
    return scopedInvoices
      .filter(
        (inv) =>
          inv.customerId === customer.id ||
          (customer.primaryPhone && inv.customerPhone === customer.primaryPhone) ||
          (inv.customerName && inv.customerName.toLowerCase() === customer.name.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customer, scopedInvoices]);

  // Repairs has no server-side customer-key filter, so `search` (name/phone,
  // case-insensitive substring match) is the closest scoping available.
  const repairsSearchTerm = customer?.primaryPhone || customer?.name;
  const { data: scopedRepairs = [] } = useQuery({
    queryKey: queryKeys.repairs.list({ search: repairsSearchTerm }),
    queryFn: () => fetchRepairs({ search: repairsSearchTerm }),
    enabled: opened && !!customer && !!repairsSearchTerm,
  });

  const customerRepairs = useMemo(() => {
    if (!customer) return [];
    return scopedRepairs
      .filter(
        (r) =>
          (customer.primaryPhone && r.customerPhone === customer.primaryPhone) ||
          (r.customerName && r.customerName.toLowerCase() === customer.name.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customer, scopedRepairs]);

  return (
    <RichDrawer
      data={customer}
      opened={opened}
      onClose={onClose}
      width="wide"
      title={{
        icon: <IconUser size={20} />,
        text: t('Customer Specifications'),
        subtitle: t(`${BRAND_NAME} Client & Account Detail`),
      }}
      footer={(c) => (
        <DrawerFooter
          start={
            <FooterDelete
              label={t('Delete')}
              hint={t('Delete Customer Profile')}
              onClick={() => onDelete(c)}
            />
          }
        >
          <Button variant="default" size="sm" onClick={onClose}>
            {t('Close')}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="sm"
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(c)}
          >
            {t('Edit Details')}
          </Button>
        </DrawerFooter>
      )}
    >
      {(c) => {
        const owes = c.outstandingBalanceCents > 0;
        // A customer with no notes has no Notes tab, so fall back if it was the one selected.
        const tab: HistoryTab = historyTab === 'notes' && !c.notes ? 'invoices' : historyTab;
        const lastInvoice = customerInvoices[0];
        const lastRepair = customerRepairs[0];

        return (
          <DrawerGrid>
            <KpiStrip>
              <KpiTile
                icon={<IconShoppingBag size={16} />}
                color="blue"
                label={t('Total Purchases')}
              >
                <Figure
                  value={formatMoney(c.totalPurchasesCents)}
                  hint={`${customerInvoices.length} ${t('Invoices')}`}
                  color="blue"
                />
              </KpiTile>
              <KpiTile
                icon={<IconScale size={16} />}
                color={owes ? 'red' : 'teal'}
                label={t('Balance Due')}
              >
                <Figure
                  value={formatMoney(c.outstandingBalanceCents)}
                  hint={owes ? t('Outstanding Due') : t('In Good Standing')}
                  color={owes ? 'red' : 'teal'}
                />
              </KpiTile>
              <KpiTile icon={<IconReceipt size={16} />} color="gray" label={t('Invoices')}>
                <Figure
                  value={String(customerInvoices.length)}
                  hint={lastInvoice ? `${t('Last')} ${formatDate(lastInvoice.createdAt)}` : '—'}
                  color="gray"
                />
              </KpiTile>
              <KpiTile icon={<IconTools size={16} />} color="gray" label={t('Repairs')}>
                <Figure
                  value={String(customerRepairs.length)}
                  hint={lastRepair ? `${t('Last')} ${formatDate(lastRepair.createdAt)}` : '—'}
                  color="gray"
                />
              </KpiTile>
            </KpiStrip>

            <DrawerRail>
              <DrawerHero
                accent={owes ? 'red' : 'blue'}
                icon={<IconUser size={32} />}
                status={{
                  color: owes ? 'red' : 'teal',
                  label: owes ? t('Outstanding Due') : t('In Good Standing'),
                }}
                title={c.name || t('Unnamed Customer')}
                subtitle={
                  <>
                    {c.contactPerson ? (
                      <div>
                        {t('Primary Contact:')}{' '}
                        <Text component="span" fw={600} c="var(--text-primary)" inherit>
                          {c.contactPerson}
                        </Text>
                      </div>
                    ) : null}
                    {c.tags && c.tags.length > 0 ? <div>{c.tags.join(' · ')}</div> : null}
                  </>
                }
              >
                {owes ? (
                  <Group gap="xs" wrap="nowrap" align="flex-start">
                    <IconAlertCircle
                      size={16}
                      style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: 2 }}
                    />
                    <Text size="xs" c="var(--status-error)">
                      {t('This client has an outstanding balance of')}{' '}
                      <strong>{formatMoney(c.outstandingBalanceCents)}</strong>.{' '}
                      {t('Outstanding debt must be settled before this profile can be deleted.')}
                    </Text>
                  </Group>
                ) : null}
              </DrawerHero>

              <DrawerAfter>
                <DrawerCard label={t('Contact & Address')} icon={<IconAddressBook size={14} />}>
                  <Stack gap="sm">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} mb={4}>
                        {t('Contact Numbers')}
                      </Text>
                      <PhoneDisplay
                        primaryPhone={c.primaryPhone}
                        secondaryPhone={c.secondaryPhone}
                        layout="stack"
                      />
                    </Box>
                    {c.address ? (
                      <>
                        <Divider />
                        <InfoRow icon={<IconMapPin size={16} />} label={t('Address')} stacked>
                          {c.address}
                        </InfoRow>
                      </>
                    ) : null}
                    {c.email ? (
                      <>
                        <Divider />
                        <InfoRow icon={<IconMail size={16} />} label={t('Email Address')} stacked>
                          <Group gap={2} wrap="nowrap" justify="flex-start">
                            <span style={{ minWidth: 0, wordBreak: 'break-all' }}>{c.email}</span>
                            <CopyIconButton value={c.email} label={t('Copy email')} />
                          </Group>
                        </InfoRow>
                      </>
                    ) : null}
                  </Stack>
                </DrawerCard>
              </DrawerAfter>

              <DrawerAfter>
                <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
                  <Stack gap="xs">
                    <InfoRow icon={<IconCalendarPlus size={16} />} label={t('Registered On')}>
                      {formatDateTime(c.createdAt)}
                    </InfoRow>
                    <InfoRow icon={<IconClock size={16} />} label={t('Last Updated')}>
                      {formatDateTime(c.updatedAt)}
                    </InfoRow>
                  </Stack>
                </DrawerCard>
              </DrawerAfter>
            </DrawerRail>

            <DrawerMain>
              <AnimatedTabs<HistoryTab>
                value={tab}
                onChange={setHistoryTab}
                tabs={[
                  {
                    value: 'invoices',
                    label: t('Invoices'),
                    icon: <IconReceipt size={16} />,
                    count: customerInvoices.length,
                  },
                  {
                    value: 'repairs',
                    label: t('Repairs'),
                    icon: <IconTools size={16} />,
                    count: customerRepairs.length,
                  },
                  ...(c.notes
                    ? [
                        {
                          value: 'notes' as const,
                          label: t('Notes'),
                          icon: <IconNotes size={16} />,
                        },
                      ]
                    : []),
                ]}
              >
                {(value) => {
                  if (value === 'invoices') {
                    return customerInvoices.length === 0 ? (
                      <Center py="md">
                        <Stack gap={6} align="center">
                          <IconReceipt size={22} style={{ opacity: 0.4 }} />
                          <Text size="sm" c="dimmed" ta="center">
                            {t('No sales or invoices recorded for this customer.')}
                          </Text>
                        </Stack>
                      </Center>
                    ) : (
                      <ScrollArea.Autosize
                        mah="45dvh"
                        type="hover"
                        scrollbarSize={6}
                        classNames={{ viewport: 'scrollarea-fluid-content' }}
                      >
                        {customerInvoices.map((inv, index) => (
                          <ListRow
                            key={inv.id}
                            index={index}
                            first={index === 0}
                            icon={
                              <IconReceipt
                                size={20}
                                style={{
                                  color: `var(--mantine-color-${inv.isCredit ? 'amber' : 'teal'}-6)`,
                                }}
                              />
                            }
                            title={`#${inv.invoiceNumber}`}
                            meta={`${formatDateTime(inv.createdAt)} · ${inv.items.length} ${t('item(s)')}`}
                            trailing={
                              <>
                                <Text size="sm" fw={700}>
                                  {formatMoney(inv.totalCents)}
                                </Text>
                                <Text size="xs" fw={700} c={inv.isCredit ? 'amber' : 'teal'}>
                                  {inv.isCredit ? t('Credit') : t('Paid')}
                                </Text>
                              </>
                            }
                          />
                        ))}
                      </ScrollArea.Autosize>
                    );
                  }
                  if (value === 'repairs') {
                    return customerRepairs.length === 0 ? (
                      <Center py="md">
                        <Stack gap={6} align="center">
                          <IconTools size={22} style={{ opacity: 0.4 }} />
                          <Text size="sm" c="dimmed" ta="center">
                            {t('No repair tickets found for this customer.')}
                          </Text>
                        </Stack>
                      </Center>
                    ) : (
                      <ScrollArea.Autosize
                        mah="45dvh"
                        type="hover"
                        scrollbarSize={6}
                        classNames={{ viewport: 'scrollarea-fluid-content' }}
                      >
                        {customerRepairs.map((rep, index) => (
                          <ListRow
                            key={rep.id}
                            index={index}
                            first={index === 0}
                            icon={
                              <IconTools
                                size={20}
                                style={{ color: 'var(--mantine-color-blue-6)' }}
                              />
                            }
                            title={`#${rep.ticketNumber} · ${rep.deviceModel}`}
                            meta={
                              <>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {rep.issueDescription}
                                </Text>
                                {formatDateTime(rep.createdAt)}
                              </>
                            }
                            trailing={
                              rep.estimatedCostCents !== undefined && rep.estimatedCostCents > 0 ? (
                                <Text size="sm" fw={700}>
                                  {formatMoney(rep.estimatedCostCents)}
                                </Text>
                              ) : (
                                <Text size="xs" fw={700} c="yellow">
                                  {t('Pending diagnosis')}
                                </Text>
                              )
                            }
                          />
                        ))}
                      </ScrollArea.Autosize>
                    );
                  }
                  return (
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {c.notes}
                    </Text>
                  );
                }}
              </AnimatedTabs>
            </DrawerMain>
          </DrawerGrid>
        );
      }}
    </RichDrawer>
  );
};
