import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Alert,
  Box,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconClipboardCheck,
  IconLayoutKanban,
  IconSearch,
  IconTable,
} from '@tabler/icons-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { EmptyState } from '@/shared/components/EmptyState';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { FadeIn } from '@/shared/motion';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { useClaims } from '../hooks/useClaims';
import { ageLabel, claimStatusLook, decisionLabel, needsAttention } from '../lib/claimView';
import type { ClaimStatus, WarrantyClaim } from '../types';
import { ClaimStatusDot } from './WarrantyStateDot';

type QueueFilter = 'open' | 'at_supplier' | 'resolved' | 'all';
type QueueLayout = 'table' | 'board';

const FILTERS: { value: QueueFilter; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'at_supplier', label: 'At supplier' },
  { value: 'resolved', label: 'Ready to give back' },
  { value: 'all', label: 'All' },
];

/** The board's columns: every open step, left to right. */
const BOARD_COLUMNS: ClaimStatus[] = ['received', 'inspected', 'decided', 'at_supplier'];

/** "Waiting 12 days" in orange when it has waited too long, else plain. */
const AgeText = ({ claim }: { claim: WarrantyClaim }) => (
  <Text
    size="xs"
    fw={needsAttention(claim) ? 700 : 500}
    c={needsAttention(claim) ? 'orange' : 'dimmed'}
  >
    {claim.supplierOverdue ? t('Supplier late') : ageLabel(claim.ageDays)}
  </Text>
);

/** One claim as a card; an orange left edge when it has waited too long. */
const ClaimCard = ({
  claim,
  index,
  onOpen,
  showStatus,
}: {
  claim: WarrantyClaim;
  index: number;
  onOpen: (key: string) => void;
  showStatus: boolean;
}) => (
  <FadeIn index={index}>
    <UnstyledButton
      onClick={() => onOpen(claim.key)}
      w="100%"
      display="block"
      aria-label={`${claim.claimNumber} ${claim.itemName}`}
    >
      <Paper
        withBorder
        p="sm"
        style={{
          borderLeft: needsAttention(claim)
            ? '4px solid var(--status-warn)'
            : '4px solid transparent',
          minHeight: 44,
        }}
      >
        <Stack gap={4}>
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Text size="xs" ff="monospace" c="dimmed">
              {claim.claimNumber}
            </Text>
            <AgeText claim={claim} />
          </Group>
          <Text fw={700} size="sm" lineClamp={2}>
            {claim.itemName}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {claim.customerName === undefined ? t('Walk-in customer') : claim.customerName}
            {claim.serialNumber !== undefined && ` · ${claim.serialNumber}`}
          </Text>
          <Group justify="space-between" wrap="wrap" gap="xs">
            {showStatus ? <ClaimStatusDot status={claim.status} size="xs" /> : <span />}
            {claim.decision !== undefined && (
              <Text size="xs" fw={600}>
                {decisionLabel(claim.decision)}
              </Text>
            )}
          </Group>
        </Stack>
      </Paper>
    </UnstyledButton>
  </FadeIn>
);

/**
 * The claims queue: what is waiting, oldest first, as a table or a board of steps (computers),
 * or a list of cards (phones). Searching and filtering run on the server. Opening a claim shows
 * it in the claim drawer.
 */
export const ClaimsQueue = ({ onOpen }: { onOpen: (claimKey: string) => void }) => {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<QueueFilter>('open');
  const [layout, setLayout] = useState<QueueLayout>('table');
  const [text, setText] = useState('');
  const [q] = useDebouncedValue(text.trim(), 300);
  const claims = useClaims({ status: filter, q: q === '' ? undefined : q });
  const items = claims.data === undefined ? [] : claims.data.items;
  const late = items.filter(needsAttention).length;
  const board = !isMobile && layout === 'board' && filter === 'open';

  const columns: Column<WarrantyClaim>[] = [
    {
      key: 'claim',
      header: t('Claim'),
      align: 'left',
      render: (claim) => (
        <Stack gap={0}>
          <Text size="sm" fw={700}>
            {claim.itemName}
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {claim.claimNumber}
            {claim.serialNumber !== undefined && ` · ${claim.serialNumber}`}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'customer',
      header: t('Customer'),
      align: 'left',
      render: (claim) => (
        <Text size="sm">
          {claim.customerName === undefined ? t('Walk-in customer') : claim.customerName}
        </Text>
      ),
    },
    {
      key: 'status',
      header: t('Where it is'),
      align: 'left',
      render: (claim) => <ClaimStatusDot status={claim.status} size="xs" />,
    },
    {
      key: 'decision',
      header: t('Decision'),
      align: 'left',
      render: (claim) => (
        <Text size="sm">
          {claim.decision === undefined ? t('Not yet') : decisionLabel(claim.decision)}
        </Text>
      ),
    },
    {
      key: 'age',
      header: t('Waiting'),
      align: 'right',
      render: (claim) => <AgeText claim={claim} />,
    },
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between" gap="sm" wrap="wrap">
        <ScrollArea type="never" style={{ maxWidth: '100%' }}>
          <SegmentedToggle
            value={filter}
            onChange={(value) => setFilter(value as QueueFilter)}
            data={FILTERS.map((option) => ({ value: option.value, label: t(option.label) }))}
            size={isMobile ? 'md' : 'sm'}
          />
        </ScrollArea>
        <Group gap="sm" wrap="nowrap" style={{ flex: isMobile ? '1 1 100%' : undefined }}>
          <TextInput
            placeholder={t('Search claims')}
            aria-label={t('Search claims')}
            leftSection={<IconSearch size={16} />}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            size={isMobile ? 'md' : 'sm'}
            style={{ flex: 1, minWidth: 0 }}
          />
          {!isMobile && filter === 'open' && (
            <SegmentedToggle
              value={layout}
              onChange={(value) => setLayout(value as QueueLayout)}
              data={[
                {
                  value: 'table',
                  label: (
                    <Group gap={4} wrap="nowrap">
                      <IconTable size={14} />
                      {t('Table')}
                    </Group>
                  ),
                },
                {
                  value: 'board',
                  label: (
                    <Group gap={4} wrap="nowrap">
                      <IconLayoutKanban size={14} />
                      {t('Board')}
                    </Group>
                  ),
                },
              ]}
              size="sm"
              style={{ flexShrink: 0 }}
            />
          )}
        </Group>
      </Group>

      {late > 0 && (
        <Alert color="orange" icon={<IconAlertTriangle size={16} />} p="xs">
          {late === 1
            ? t('1 claim has waited too long.')
            : `${late} ${t('claims have waited too long.')}`}
        </Alert>
      )}

      {claims.isError ? (
        <Alert color="red" icon={<IconAlertTriangle size={16} />}>
          {getErrorMessage(claims.error)}
        </Alert>
      ) : claims.data !== undefined && items.length === 0 ? (
        <EmptyState
          icon={
            <ThemeIcon size={56} variant="light" color="blue">
              <IconClipboardCheck size={30} />
            </ThemeIcon>
          }
          title={q === '' ? t('Nothing waiting here') : t('No claim matches')}
          description={t(
            'A claim starts from a warranty: look it up, open it and choose Start claim.'
          )}
        />
      ) : board ? (
        <SimpleGrid cols={4} spacing="sm">
          {BOARD_COLUMNS.map((status) => {
            const column = items.filter((claim) => claim.status === status);
            const look = claimStatusLook(status);
            return (
              <Paper key={status} p="xs" bg="var(--bg-app)" withBorder>
                <Group justify="space-between" mb="xs" px={4}>
                  <ClaimStatusDot status={status} size="xs" />
                  <Text size="xs" c="dimmed" fw={700} aria-label={`${column.length} ${look.label}`}>
                    {column.length}
                  </Text>
                </Group>
                <Stack gap="xs">
                  {column.map((claim, index) => (
                    <ClaimCard
                      key={claim.key}
                      claim={claim}
                      index={index}
                      onOpen={onOpen}
                      showStatus={false}
                    />
                  ))}
                  {column.length === 0 && (
                    <Box py="md">
                      <Text size="xs" c="dimmed" ta="center">
                        {t('None')}
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      ) : isMobile ? (
        <Stack gap="xs">
          {items.map((claim, index) => (
            <ClaimCard key={claim.key} claim={claim} index={index} onOpen={onOpen} showStatus />
          ))}
        </Stack>
      ) : (
        <DataTable<WarrantyClaim>
          data={items}
          columns={columns}
          keyExtractor={(claim) => claim.key}
          loading={claims.data === undefined}
          emptyText={t('Nothing waiting here')}
          onRowClick={(claim) => onOpen(claim.key)}
          selectable={false}
          clientPagination
          pageSize={20}
        />
      )}
    </Stack>
  );
};
