import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconBan, IconFilePlus, IconPrinter, IconSearch } from '@tabler/icons-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { useCancelQuotation, useQuotations } from '../hooks/useQuotations';
import { emptyDraft } from '../lib/quotationForm';
import type { Quotation, QuotationListStatus } from '../types';
import { QuotationFormModal } from './QuotationFormModal';
import { QuotationPreviewModal } from './QuotationPreviewModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = 'all' | QuotationListStatus;

const isStatusFilter = (value: string | null): value is StatusFilter =>
  value === 'all' || value === 'active' || value === 'expired' || value === 'cancelled';

const statusBadge = (quotation: Quotation) => {
  if (quotation.status === 'cancelled') return { label: t('Cancelled'), color: 'red' };
  if (quotation.isExpired) return { label: t('Expired'), color: 'orange' };
  return { label: t('Valid'), color: 'green' };
};

// Every quotation made so far, newest first. Search, status filter and paging all happen on the
// server. Only people with the quotations permission reach this page (see the route guard), and
// the backend refuses everyone else regardless.
export const QuotationsPage = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  const { data, isLoading } = useQuotations({
    page,
    limit: pageSize,
    search: debouncedSearch === '' ? undefined : debouncedSearch,
    status: status === 'all' ? undefined : status,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [previewing, setPreviewing] = useState<Quotation | null>(null);
  const [cancelling, setCancelling] = useState<Quotation | null>(null);
  const cancelMutation = useCancelQuotation();

  const handleConfirmCancel = async () => {
    if (cancelling === null) return;
    try {
      await cancelMutation.mutateAsync(cancelling.key);
      notifications.show({
        title: t('Quotation cancelled'),
        message: cancelling.quotationNumber,
        color: 'green',
      });
      setCancelling(null);
    } catch (error) {
      notifications.show({
        title: t('Could not cancel the quotation'),
        message: getErrorMessage(error),
        color: 'red',
      });
    }
  };

  const columns = useMemo<Column<Quotation>[]>(
    () => [
      {
        key: 'quotationNumber',
        header: t('Number'),
        align: 'left',
        render: (q) => (
          <Text size="sm" fw={700}>
            {q.quotationNumber}
          </Text>
        ),
      },
      {
        key: 'customer',
        header: t('Customer'),
        align: 'left',
        render: (q) => (
          <Stack gap={0}>
            <Text size="sm" fw={600} lineClamp={1}>
              {q.customerName}
            </Text>
            {q.customerPhone && (
              <Text size="xs" c="dimmed">
                {q.customerPhone}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        key: 'createdAt',
        header: t('Made on'),
        align: 'left',
        render: (q) => <Text size="sm">{formatDate(q.createdAt)}</Text>,
      },
      {
        key: 'validUntil',
        header: t('Valid until'),
        align: 'left',
        render: (q) => <Text size="sm">{formatDate(q.validUntil)}</Text>,
      },
      {
        key: 'total',
        header: t('Total'),
        align: 'right',
        render: (q) => (
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(q.totalCents)}
          </Text>
        ),
      },
      {
        key: 'status',
        header: t('Status'),
        align: 'center',
        render: (q) => {
          const badge = statusBadge(q);
          return (
            <Badge size="sm" variant="light" color={badge.color}>
              {badge.label}
            </Badge>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (q) => (
          <Group
            gap={6}
            justify="flex-end"
            wrap="nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <ActionIcon
              variant="light"
              color="blue"
              size={isMobile ? 44 : 32}
              aria-label={`${t('Print quotation')} ${q.quotationNumber}`}
              onClick={() => setPreviewing(q)}
              data-log-id="quotations.open-preview"
            >
              <IconPrinter size={16} />
            </ActionIcon>
            {q.status === 'active' && (
              <ActionIcon
                variant="light"
                color="red"
                size={isMobile ? 44 : 32}
                aria-label={`${t('Cancel quotation')} ${q.quotationNumber}`}
                onClick={() => setCancelling(q)}
                data-log-id="quotations.cancel"
              >
                <IconBan size={16} />
              </ActionIcon>
            )}
          </Group>
        ),
      },
    ],
    [isMobile]
  );

  return (
    <>
      <Stack gap="md">
        <PageHeader
          title={t('Quotations')}
          description={t('Price offers you give to customers before they buy.')}
          action={
            <Button
              h={isMobile ? 44 : undefined}
              leftSection={<IconFilePlus size={16} />}
              onClick={() => setFormOpen(true)}
              data-log-id="quotations.new"
            >
              {t('New Quotation')}
            </Button>
          }
        />

        <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <TextInput
            aria-label={t('Search quotations')}
            placeholder={t('Search by number, customer name or phone')}
            leftSection={<IconSearch size={16} />}
            size={isMobile ? 'md' : 'sm'}
            styles={isMobile ? { input: { minHeight: 44 } } : undefined}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            style={{ flex: 1, minWidth: 0 }}
          />
          <Select
            aria-label={t('Show')}
            size={isMobile ? 'md' : 'sm'}
            styles={isMobile ? { input: { minHeight: 44 } } : undefined}
            allowDeselect={false}
            data={[
              { value: 'all', label: t('All quotations') },
              { value: 'active', label: t('Still valid') },
              { value: 'expired', label: t('Expired') },
              { value: 'cancelled', label: t('Cancelled') },
            ]}
            value={status}
            onChange={(value) => {
              if (isStatusFilter(value)) {
                setStatus(value);
                setPage(1);
              }
            }}
            style={{ width: isMobile ? '100%' : 200, flexShrink: 0 }}
          />
        </Group>

        <DataTable<Quotation>
          data={data?.quotations ?? []}
          columns={columns}
          keyExtractor={(q) => q.key}
          loading={isLoading}
          emptyText={t('No quotations found. Press "New Quotation" to make one.')}
          selectable={false}
          onRowClick={setPreviewing}
          clientPagination={false}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          total={data?.total ?? 0}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </Stack>

      {formOpen && (
        <QuotationFormModal
          opened
          onClose={() => setFormOpen(false)}
          initialDraft={emptyDraft()}
          onCreated={(created) => {
            setFormOpen(false);
            setPreviewing(created);
          }}
        />
      )}

      <QuotationPreviewModal
        opened={previewing !== null}
        onClose={() => setPreviewing(null)}
        quotation={previewing}
      />

      <ConfirmDialog
        opened={cancelling !== null}
        onClose={() => setCancelling(null)}
        onConfirm={() => void handleConfirmCancel()}
        title={t('Cancel this quotation?')}
        confirmLabel={t('Yes, cancel it')}
        cancelLabel={t('No, keep it')}
        loading={cancelMutation.isPending}
      >
        {t(
          'The customer can no longer use it. You can still open and print it, marked as cancelled.'
        )}
      </ConfirmDialog>
    </>
  );
};
