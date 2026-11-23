import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { Alert, Group, Loader, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconClipboardList,
  IconHourglass,
  IconScan,
  IconShieldSearch,
} from '@tabler/icons-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';
import { KbdAction } from '@/shared/components/KbdShortcut';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { getActionShortcut } from '@/shared/lib/shortcuts';
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
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useWarrantyColumns, type WarrantyColumns } from '../hooks/useWarrantyColumns';
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
  const { perRow, choices, choose } = useWarrantyColumns();
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Set by the shortcut: the box may not be on screen yet (another tab is open), so it takes the
  // cursor as soon as it appears.
  const focusWhenShown = useRef(false);
  const setInput = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (element !== null && focusWhenShown.current) {
      focusWhenShown.current = false;
      element.focus();
      element.select();
    }
  }, []);
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

  // Alt/Option+W while already here: back to the look-up with the search box ready for a scan.
  // (From any other page the shell's binding opens this page, which focuses the box itself.)
  useAppShortcuts([
    {
      key: getActionShortcut('warrantyLookup').primary,
      ignoreInput: true,
      handler: () => {
        const next = new URLSearchParams(searchParams);
        next.delete('view');
        next.delete('key');
        next.delete('claim');
        setSearchParams(next, { replace: true });
        focusWhenShown.current = true;
        setInput(inputRef.current);
      },
    },
  ]);

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
              <Group gap="sm" wrap="nowrap" align="stretch">
                <Paper p="xs" shadow="xs" style={{ flex: 1, minWidth: 0 }}>
                  <SearchHistoryInput
                    ref={setInput}
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
                          <KbdAction actionId="warrantyLookup" />
                        </Group>
                      )
                    }
                    data-barcode-scanner="true"
                    aria-label={t('Serial / IMEI, invoice, warranty number or phone')}
                  />
                </Paper>
                {choices.length > 1 && (
                  <Paper p="xs" shadow="xs" visibleFrom="sm">
                    <Group gap="xs" wrap="nowrap" h="100%">
                      <Text size="xs" c="dimmed">
                        {t('Cards per row')}
                      </Text>
                      <SegmentedToggle
                        size="sm"
                        value={String(perRow)}
                        onChange={(value) => choose(Number(value) as WarrantyColumns)}
                        data={choices.map((option) => String(option))}
                        aria-label={t('Cards per row')}
                      />
                    </Group>
                  </Paper>
                )}
              </Group>

              {lookup.isError && searching && (
                <Alert color="red" icon={<IconAlertTriangle size={18} />}>
                  {getErrorMessage(lookup.error)}
                </Alert>
              )}

              {!searching ? (
                <AllWarranties onOpen={openWarranty} perRow={perRow} />
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
                  <SimpleGrid cols={perRow} spacing="md">
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
