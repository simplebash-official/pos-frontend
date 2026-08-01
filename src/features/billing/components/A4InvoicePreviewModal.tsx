import { useState } from 'react';
import { Modal, Box, Group, Button, SegmentedControl, Text, Paper, Stack } from '@mantine/core';
import { IconPrinter, IconDownload } from '@tabler/icons-react';
import type { Invoice } from '../types';
import { buildPrintPayload } from '../lib/buildPrintPayload';
import { getShopProfileForInvoice } from '../lib/getShopProfileForInvoice';
import { A4Invoice } from '@/shared/print/documents/A4Invoice';
import { PAPER_PROFILES } from '@/shared/print/paperProfiles';
import { useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectShopProfileVersions,
  selectPrintSettings,
} from '@/store/slices/settingsSlice';
import { printA4Invoice } from '@/shared/print/printService';
import { getPrintCountForInvoice } from '@/features/invoices/api/printLogStore';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface A4InvoicePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function A4InvoicePreviewModal({ opened, onClose, invoice }: A4InvoicePreviewModalProps) {
  const isMobile = useIsMobile();
  const currentShopProfile = useAppSelector(selectShopProfile);
  const shopProfileVersions = useAppSelector(selectShopProfileVersions);
  const printSettings = useAppSelector(selectPrintSettings);

  const [paper, setPaper] = useState<'a4' | 'a5'>('a4');
  const [copyMode, setCopyMode] = useState<'customer' | 'office'>('customer');

  if (!invoice) return null;

  const paperProfile = paper === 'a5' ? PAPER_PROFILES.a5 : PAPER_PROFILES.a4;
  const printCount = getPrintCountForInvoice(invoice.invoiceNumber, paper);
  const isDuplicate = printCount > 0 || copyMode === 'office';
  const copyLabel =
    copyMode === 'office'
      ? 'DUPLICATE — OFFICE COPY'
      : isDuplicate
        ? 'DUPLICATE — CUSTOMER COPY'
        : 'ORIGINAL — CUSTOMER COPY';

  // Resolve the versioned shop profile for this invoice
  const shopProfile = getShopProfileForInvoice(invoice, shopProfileVersions, currentShopProfile);

  const payload = buildPrintPayload(invoice, shopProfile, printSettings, copyLabel, isDuplicate);

  const handlePrint = () => {
    printA4Invoice(payload, paper, copyMode);
  };

  const handleDownloadPDF = () => {
    const invoiceId = invoice.id || invoice.invoiceNumber;
    window.open(
      `/print/invoice/${encodeURIComponent(invoiceId)}?paper=${paper}&copy=${copyMode}`,
      '_blank'
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Text fw={700} size="lg">
            Invoice Preview — #{invoice.invoiceNumber}
          </Text>
        </Group>
      }
      size="xl"
      fullScreen={isMobile}
      radius="var(--mantine-radius-default)"
      padding="md"
      scrollAreaComponent={Box}
    >
      <Stack gap="md">
        {/* Controls Toolbar */}
        <Paper
          p="xs"
          radius="var(--mantine-radius-default)"
          withBorder
          style={{ backgroundColor: 'var(--bg-app)' }}
        >
          <Group justify="space-between" wrap="wrap">
            <Group gap="md">
              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={2}>
                  PAPER SIZE
                </Text>
                <SegmentedControl
                  size="xs"
                  value={paper}
                  onChange={(val) => setPaper(val as 'a4' | 'a5')}
                  data={[
                    { label: 'A4 Standard', value: 'a4' },
                    { label: 'A5 Compact', value: 'a5' },
                  ]}
                />
              </Box>

              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={2}>
                  COPY TYPE
                </Text>
                <SegmentedControl
                  size="xs"
                  value={copyMode}
                  onChange={(val) => setCopyMode(val as 'customer' | 'office')}
                  data={[
                    { label: 'Customer Copy', value: 'customer' },
                    { label: 'Office Copy (Duplicate)', value: 'office' },
                  ]}
                />
              </Box>
            </Group>

            <Group gap="xs">
              <Button
                size="sm"
                color="blue"
                leftSection={<IconPrinter size={16} />}
                onClick={handlePrint}
              >
                Print Invoice
              </Button>
              <Button
                size="sm"
                variant="light"
                color="gray"
                leftSection={<IconDownload size={16} />}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
              <Button size="sm" variant="subtle" color="gray" onClick={onClose}>
                Close
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Scaled Preview Box */}
        {/* The invoice inside is a fixed 210mm (~794px) page, so the box has to scroll on both axes
            — otherwise the sides of the document are simply unreachable on a narrow screen. */}
        <Box
          style={{
            backgroundColor: '#64748B',
            borderRadius: 'var(--mantine-radius-default)',
            padding: '24px 12px',
            maxHeight: '65vh',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Box
            style={{
              transform: `scale(${isMobile ? 0.5 : 0.85})`,
              transformOrigin: 'top center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <A4Invoice payload={payload} paperProfile={paperProfile} />
          </Box>
        </Box>
      </Stack>
    </Modal>
  );
}
