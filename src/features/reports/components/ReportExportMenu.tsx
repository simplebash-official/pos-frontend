import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconFileTypePdf } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import type { AnalyticsRequestParams } from '../api/analyticsApi';
import { AnalyticsReportPreviewModal } from './AnalyticsReportPreviewModal';

export const ReportExportMenu = ({
  params,
  periodLabel,
}: {
  params: AnalyticsRequestParams;
  periodLabel?: string;
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button
        variant="light"
        leftSection={<IconFileTypePdf size={16} />}
        onClick={() => setOpened(true)}
      >
        {t('PDF Report')}
      </Button>

      <AnalyticsReportPreviewModal
        opened={opened}
        onClose={() => setOpened(false)}
        params={params}
        periodLabel={periodLabel}
      />
    </>
  );
};
