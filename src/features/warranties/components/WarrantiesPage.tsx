import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Alert,
  Box,
  Group,
  Kbd,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBarcode,
  IconFileInvoice,
  IconHash,
  IconPhone,
  IconScan,
  IconShieldCheck,
  IconShieldSearch,
} from '@tabler/icons-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { LOOKUP_MIN_LENGTH, useWarrantyLookup, useWarrantyStats } from '../hooks/useWarranties';
import { matchLabel } from '../lib/warrantyView';
import { ClaimDetailDrawer } from './ClaimDetailDrawer';
import { ClaimsQueue } from './ClaimsQueue';
import { EndingSoonList } from './EndingSoonList';
import { WarrantyDetailDrawer } from './WarrantyDetailDrawer';
import { WarrantyGroupCard } from './WarrantyGroupCard';
import { WarrantyMetrics } from './WarrantyMetrics';

type PageView = 'lookup' | 'claims' | 'ending';

const VIEWS: PageView[] = ['lookup', 'claims', 'ending'];

/** What the search box accepts, shown as hints under it. */
const HINTS = [
  { icon: <IconBarcode size={14} />, label: 'Serial or IMEI' },
  { icon: <IconFileInvoice size={14} />, label: 'Invoice number' },
  { icon: <IconHash size={14} />, label: 'Warranty number' },
  { icon: <IconPhone size={14} />, label: 'Phone number' },
];

/**
 * The counter tool: scan or type anything that identifies a sale or a device and see its
 * warranties at once, grouped by device, with how much cover is left. The server decides what
 * the text is, so there is nothing to choose first. Opening a warranty shows it in full.
 */
export const WarrantiesPage = () => {
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const openKey = searchParams.get('key');
  const openClaimKey = searchParams.get('claim');
  const requestedView = searchParams.get('view');
  const view: PageView =
    VIEWS.find((candidate) => candidate === requestedView) === undefined
      ? 'lookup'
      : (requestedView as PageView);
  const stats = useWarrantyStats();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [debounced] = useDebouncedValue(text, 300);
  // Enter (or a scanner's Enter) searches at once; typing waits for a short pause.
  const query = submitted === text ? submitted : debounced;
  const lookup = useWarrantyLookup(query);
  const searching = query.trim().length >= LOOKUP_MIN_LENGTH;

  useEffect(() => {
    if (!isMobile && openKey === null && view === 'lookup') inputRef.current?.focus();
  }, [isMobile, openKey, view]);

  // One drawer at a time: opening a warranty closes a claim and the other way round.
  const show = (param: 'key' | 'claim', value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(param === 'key' ? 'claim' : 'key');
    next.set(param, value);
    setSearchParams(next);
  };
  const openWarranty = (key: string) => show('key', key);
  const openClaim = (key: string) => show('claim', key);
  const close = (param: 'key' | 'claim') => {
    const next = new URLSearchParams(searchParams);
    next.delete(param);
    setSearchParams(next, { replace: true });
  };
  const setView = (value: PageView) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'lookup') next.delete('view');
    else next.set('view', value);
    setSearchParams(next, { replace: true });
  };

  const result = lookup.data;
  const groups = searching && result !== undefined ? result.groups : [];

  return (
    <Stack gap="lg">
      <PageHeader
        title={t('Warranties')}
        description={t('Scan or type to check a warranty while the customer waits.')}
      />

      {/* On a phone the scan box comes first; the numbers wait on the other views. */}
      {(!isMobile || view !== 'lookup') && <WarrantyMetrics />}

      <SegmentedToggle
        value={view}
        onChange={(value) => setView(value as PageView)}
        data={[
          { value: 'lookup', label: t('Look up') },
          { value: 'claims', label: t('Claims') },
          { value: 'ending', label: t('Ending soon') },
        ]}
        size={isMobile ? 'md' : 'sm'}
        fullWidth={isMobile}
      />

      {view === 'claims' ? (
        <ClaimsQueue onOpen={openClaim} />
      ) : view === 'ending' ? (
        <EndingSoonList
          until={stats.data === undefined ? null : stats.data.endingSoonUntil}
          onOpen={openWarranty}
        />
      ) : (
        <>
          <Paper
            p={isMobile ? 'md' : 'lg'}
            shadow="xs"
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-blue-light) 0%, var(--bg-card) 65%)',
            }}
          >
            <Stack gap="sm">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={40} variant="filled" color="blue">
                  <IconShieldSearch size={22} />
                </ThemeIcon>
                <Box>
                  <Text fw={800} size="lg">
                    {t('Check a warranty')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('Point the scanner at the serial or the receipt, or type it.')}
                  </Text>
                </Box>
              </Group>
              <SearchHistoryInput
                ref={inputRef}
                namespace="warranty-lookup"
                size={isMobile ? 'md' : 'lg'}
                value={text}
                onValueChange={setText}
                onSearchSubmit={(value) => {
                  setText(value);
                  setSubmitted(value);
                }}
                placeholder={t('Serial / IMEI, invoice, warranty number or phone')}
                leftSection={<IconScan size={20} />}
                rightSection={lookup.isFetching ? <Loader size="xs" /> : undefined}
                data-barcode-scanner="true"
                aria-label={t('Serial / IMEI, invoice, warranty number or phone')}
              />
              <Group gap="md" wrap="wrap">
                {HINTS.map((hint) => (
                  <Group key={hint.label} gap={4} wrap="nowrap" c="dimmed">
                    {hint.icon}
                    <Text size="xs" c="dimmed">
                      {t(hint.label)}
                    </Text>
                  </Group>
                ))}
                <Group gap={4} wrap="nowrap" visibleFrom="sm" ml="auto">
                  <Text size="xs" c="dimmed">
                    {t('From anywhere')}
                  </Text>
                  <Kbd size="xs">Alt</Kbd>
                  <Text size="xs" c="dimmed">
                    +
                  </Text>
                  <Kbd size="xs">W</Kbd>
                </Group>
              </Group>
            </Stack>
          </Paper>

          {lookup.isError && searching && (
            <Alert color="red" icon={<IconAlertTriangle size={18} />}>
              {getErrorMessage(lookup.error)}
            </Alert>
          )}

          {!searching ? (
            <EmptyState
              icon={
                <ThemeIcon size={56} variant="light" color="blue">
                  <IconShieldCheck size={30} />
                </ThemeIcon>
              }
              title={t('Ready when the customer is')}
              description={t(
                'Every item sold with a warranty is here. Scan its serial, the invoice, or type the phone number the customer gave.'
              )}
            />
          ) : result !== undefined && result.matchedBy === 'nothing' ? (
            <EmptyState
              icon={
                <ThemeIcon size={56} variant="light" color="gray">
                  <IconShieldSearch size={30} />
                </ThemeIcon>
              }
              title={t('No warranty found')}
              description={t(
                'Check the number, or try the invoice number or the phone number. Items sold without a warranty do not show here.'
              )}
            />
          ) : result !== undefined ? (
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                {matchLabel(result.matchedBy)} · {groups.length}{' '}
                {groups.length === 1 ? t('item') : t('items')}
              </Text>
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                {groups.map((group, index) => (
                  <WarrantyGroupCard
                    key={group.serialNumber ?? group.warranties[0].key}
                    group={group}
                    index={index}
                    onOpen={openWarranty}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          ) : null}
        </>
      )}

      <WarrantyDetailDrawer
        warrantyKey={openKey}
        onClose={() => close('key')}
        onOpenWarranty={openWarranty}
        onOpenClaim={openClaim}
      />
      <ClaimDetailDrawer
        claimKey={openClaimKey}
        onClose={() => close('claim')}
        onOpenWarranty={openWarranty}
      />
    </Stack>
  );
};
