import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Alert,
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
  IconClipboardList,
  IconHourglass,
  IconScan,
  IconShieldSearch,
} from '@tabler/icons-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { AnimatedTabs } from '@/shared/components/drawer';
import { LOOKUP_MIN_LENGTH, useWarrantyLookup, useWarrantyStats } from '../hooks/useWarranties';
import { matchLabel } from '../lib/warrantyView';
import { ClaimDetailDrawer } from './ClaimDetailDrawer';
import { ClaimsQueue } from './ClaimsQueue';
import { EndingSoonList } from './EndingSoonList';
import { WarrantyDetailDrawer } from './WarrantyDetailDrawer';
import { WarrantyGroupCard } from './WarrantyGroupCard';
import { AllWarranties } from './AllWarranties';
import { WarrantyMetrics } from './WarrantyMetrics';

type PageView = 'lookup' | 'claims' | 'ending';

const VIEWS: PageView[] = ['lookup', 'claims', 'ending'];

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

      <AnimatedTabs<PageView>
        value={view}
        onChange={setView}
        tabs={[
          { value: 'lookup', label: t('Look up'), icon: <IconShieldSearch size={16} /> },
          { value: 'claims', label: t('Claims'), icon: <IconClipboardList size={16} /> },
          { value: 'ending', label: t('Ending soon'), icon: <IconHourglass size={16} /> },
        ]}
      >
        {(active) =>
          active === 'claims' ? (
            <ClaimsQueue onOpen={openClaim} />
          ) : active === 'ending' ? (
            <EndingSoonList
              until={stats.data === undefined ? null : stats.data.endingSoonUntil}
              onOpen={openWarranty}
            />
          ) : (
            <Stack gap="md">
              <Paper p="xs" shadow="xs">
                <SearchHistoryInput
                  ref={inputRef}
                  namespace="warranty-lookup"
                  size="md"
                  value={text}
                  onValueChange={setText}
                  onSearchSubmit={(value) => {
                    setText(value);
                    setSubmitted(value);
                  }}
                  placeholder={t('Serial / IMEI, invoice, warranty number or phone')}
                  leftSection={<IconScan size={20} />}
                  rightSectionWidth={isMobile ? 36 : 120}
                  rightSection={
                    lookup.isFetching ? (
                      <Loader size="xs" />
                    ) : (
                      <Group gap={4} wrap="nowrap" visibleFrom="sm">
                        <Kbd size="xs">Alt</Kbd>
                        <Text size="xs" c="dimmed">
                          +
                        </Text>
                        <Kbd size="xs">W</Kbd>
                      </Group>
                    )
                  }
                  data-barcode-scanner="true"
                  aria-label={t('Serial / IMEI, invoice, warranty number or phone')}
                />
              </Paper>

              {lookup.isError && searching && (
                <Alert color="red" icon={<IconAlertTriangle size={18} />}>
                  {getErrorMessage(lookup.error)}
                </Alert>
              )}

              {!searching ? (
                <AllWarranties onOpen={openWarranty} />
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
            </Stack>
          )
        }
      </AnimatedTabs>

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
