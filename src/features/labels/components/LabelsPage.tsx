import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Stack } from '@mantine/core';
import { IconHistory, IconPalette, IconPrinter, IconTagStarred } from '@tabler/icons-react';
import { AnimatedTabs } from '@/shared/components/drawer';
import { PageHeader } from '@/shared/components/PageHeader';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useLabelCoverage } from '../hooks/useLabelJobs';
import type { LabelRow } from '../lib/printJob';
import { LabelCoverageTab } from './LabelCoverageTab';
import { LabelDesignsTab } from './LabelDesignsTab';
import { LabelHistoryTab } from './LabelHistoryTab';
import { LabelPrintTab } from './LabelPrintTab';

type LabelsTab = 'print' | 'needs' | 'history' | 'designs';

/**
 * Labels: print stickers, see which items still need them, look back at every
 * print, and manage the designs. For Admin and Manager (the route and the
 * sidebar entry both require inventory write).
 */
export const LabelsPage = () => {
  const isMobile = useIsMobile();
  // A computer fits the window (only lists scroll); a phone scrolls the page as usual.
  const fill = !isMobile;
  const [tab, setTab] = useState<LabelsTab>('print');
  // Kept here so a half-built print survives a look at another tab.
  const [rows, setRows] = useState<LabelRow[]>([]);
  const counts = useLabelCoverage({ page: 1, limit: 1 }).data?.counts;

  const printThese = (next: LabelRow[]) => {
    setRows(next);
    setTab('print');
  };

  return (
    <Stack gap="md" style={fill ? { height: '100%', minHeight: '34rem' } : undefined}>
      <PageHeader
        title={t('Labels')}
        description={t(
          'Print barcode and price labels, see which items still need them, and look back at every print.'
        )}
      />
      <AnimatedTabs<LabelsTab>
        fill={fill}
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'print', label: t('Print'), icon: <IconPrinter size={16} /> },
          {
            value: 'needs',
            label: t('Needs labels'),
            icon: <IconTagStarred size={16} />,
            count: counts === undefined ? undefined : counts.never + counts.needed,
          },
          { value: 'history', label: t('History'), icon: <IconHistory size={16} /> },
          { value: 'designs', label: t('Designs'), icon: <IconPalette size={16} /> },
        ]}
      >
        {(active) => {
          switch (active) {
            case 'print':
              return <LabelPrintTab rows={rows} onRowsChange={setRows} onPrintAgain={printThese} />;
            case 'needs':
              return <LabelCoverageTab onPrint={printThese} />;
            case 'history':
              return <LabelHistoryTab onPrintAgain={printThese} />;
            case 'designs':
              return <LabelDesignsTab />;
          }
        }}
      </AnimatedTabs>
    </Stack>
  );
};
