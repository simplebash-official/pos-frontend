import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Group, Menu, Modal } from '@mantine/core';
import { IconDownload, IconFileTypePdf, IconPrinter } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';
import { fetchAnalyticsReportPdf, type AnalyticsRequestParams } from '../api/analyticsApi';

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const ReportExportMenu = ({ params }: { params: AnalyticsRequestParams }) => {
  const isMobile = useIsMobile();
  const [opened, setOpened] = useState(false);

  const pdf = useMutation({
    mutationFn: () => fetchAnalyticsReportPdf(params),
    onSuccess: () => setOpened(true),
    onError: () =>
      notifications.show({
        color: 'red',
        title: t('Could not build the report'),
        message: t('Please try again in a moment.'),
      }),
  });

  return (
    <>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button
            variant="light"
            leftSection={<IconFileTypePdf size={16} />}
            loading={pdf.isPending}
          >
            {t('Report')}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFileTypePdf size={16} />} onClick={() => pdf.mutate()}>
            {t('Download PDF report')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('Analytics report')}
        size="xl"
        centered
        fullScreen={isMobile}
        padding={0}
      >
        <div style={{ height: isMobile ? 'calc(100dvh - 120px)' : '70vh' }}>
          <PdfCanvasViewer
            blob={pdf.data ?? null}
            loading={pdf.isPending}
            error={pdf.isError}
            documentLabel={t('Analytics report')}
            initialAutoFit
          />
        </div>
        <Group justify="flex-end" p="md" gap="sm">
          <Button
            variant="default"
            leftSection={<IconPrinter size={16} />}
            disabled={!pdf.data}
            onClick={() => pdf.data && printPdfBlob(pdf.data)}
          >
            {t('Print')}
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            disabled={!pdf.data}
            onClick={() => pdf.data && saveBlob(pdf.data, 'analytics-report.pdf')}
          >
            {t('Save PDF')}
          </Button>
        </Group>
      </Modal>
    </>
  );
};
