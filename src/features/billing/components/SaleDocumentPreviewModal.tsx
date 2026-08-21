import { useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack, Divider } from '@mantine/core';
import { IconX, IconPrinter } from '@tabler/icons-react';
import type { Invoice } from '../types';
import { getSaleHeroPresentation } from '../lib/saleHeroPresentation';
import { useInvoiceDocument } from '../hooks/useInvoiceDocument';
import { getPrintLogsForInvoice, recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { useIsMobile, useLayoutTier } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime, formatTime } from '@/shared/lib/date';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';

export interface SaleDocumentPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  documentKind: 'invoice' | 'receipt' | 'return-slip' | 'credit-note' | null;
}

export const SaleDocumentPreviewModal = ({
  opened,
  onClose,
  invoice,
  documentKind,
}: SaleDocumentPreviewModalProps) => {
  const isMobile = useIsMobile();
  const tier = useLayoutTier();
  const printSettings = useAppSelector(selectPrintSettings);

  // Bumped after a Print click to force a fresh read of the (localStorage-backed) print log below.
  const [, forcePrintLogRefresh] = useState(0);
  const printLogs = opened && invoice ? getPrintLogsForInvoice(invoice.invoiceNumber) : [];
  const hasPrinted = printLogs.length > 0;

  const paperWidthMm = printSettings.receiptPaper === '58mm' ? 58 : 80;
  const docType =
    opened && documentKind
      ? documentKind === 'invoice'
        ? 'a4-invoice'
        : documentKind === 'receipt'
          ? 'thermal-receipt'
          : documentKind
      : null;

  const { blob, loading, error, isPaused, isPending } = useInvoiceDocument(
    invoice?.id,
    docType,
    paperWidthMm
  );

  const handlePrint = () => {
    if (!invoice || !blob) return;
    void printPdfBlob(blob);
    recordPrintEvent({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      format:
        documentKind === 'invoice' || documentKind === 'credit-note'
          ? 'a4'
          : paperWidthMm === 58
            ? 'receipt-58'
            : 'receipt-80',
      copy: hasPrinted ? 'DUPLICATE COPY' : 'ORIGINAL — CUSTOMER COPY',
      printedBy: invoice.cashierName,
    });
    window.setTimeout(() => forcePrintLogRefresh((t) => t + 1), 300);
  };

  // Bound via the shared shortcut engine so pressing Enter prints (or Ctrl+P)
  useAppShortcuts(
    [
      { key: 'Enter', handler: handlePrint, ignoreInput: true },
      { key: 'Ctrl+P', handler: handlePrint, ignoreInput: true, preventDefault: true },
    ],
    opened
  );

  if (!invoice || !documentKind) return null;

  const hero = getSaleHeroPresentation(invoice, invoice.changeDueCents ?? 0);
  const isReceipt = documentKind === 'receipt';
  const isReturnSlip = documentKind === 'return-slip';
  const isCreditNote = documentKind === 'credit-note';

  const statusWord = isReturnSlip
    ? 'Refund / Return'
    : isCreditNote
      ? 'Credit Note'
      : hero.isCreditCompleted
        ? 'On account'
        : hero.isChangeDue
          ? 'Change due'
          : 'Paid in full';

  const docLabel = isReceipt
    ? 'Receipt'
    : isReturnSlip
      ? 'Return Slip'
      : isCreditNote
        ? 'Credit Note'
        : 'Invoice';

  const title = `${docLabel} — ${invoice.invoiceNumber}`;
  const subtitle = `${statusWord} · ${hero.methodLabel} · ${formatDateTime(invoice.createdAt)}`;
  const isDesktopTier = tier === 'desktop';

  const documentPane = (
    <PdfCanvasViewer
      blob={blob}
      loading={loading}
      error={error}
      isPaused={isPaused}
      isPending={isPending}
      documentLabel={isReceipt ? 'receipt' : 'invoice'}
    />
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      padding={0}
      withCloseButton={false}
      transitionProps={{ duration: 150 }}
      styles={{
        content: { backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' },
        body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0 },
      }}
    >
      <Box
        style={{
          height: isMobile ? 56 : 60,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: isMobile ? '0 12px' : '0 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${hero.heroColor}-6)`,
              flexShrink: 0,
            }}
          />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text fw={700} size="sm" truncate>
              {title}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {subtitle}
            </Text>
          </Stack>
        </Group>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="blue"
            disabled={loading || !!error || isPending}
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            {hasPrinted ? 'Print Again' : 'Print'}
          </Button>
          <Button size={isMobile ? 'sm' : 'md'} variant="default" onClick={onClose}>
            {hasPrinted ? 'Done' : 'Close'}
          </Button>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={isMobile ? 44 : 36}
            aria-label="Close preview"
            onClick={onClose}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {isReceipt ? (
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isDesktopTier ? 'row' : 'column',
            overflow: isDesktopTier ? 'hidden' : 'auto',
            minHeight: 0,
          }}
        >
          <Box
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              minHeight: isDesktopTier ? 0 : 500,
              height: isDesktopTier ? '100%' : undefined,
            }}
          >
            {documentPane}
          </Box>

          <Box
            style={{
              width: isDesktopTier ? 320 : '100%',
              flexShrink: 0,
              borderLeft: isDesktopTier ? '1px solid var(--border)' : undefined,
              borderTop: !isDesktopTier ? '1px solid var(--border)' : undefined,
              backgroundColor: 'var(--bg-card)',
              padding: 20,
              overflowY: isDesktopTier ? 'auto' : undefined,
            }}
          >
            <Stack gap="lg">
              <Box>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {hero.isCreditCompleted
                    ? 'Balance due'
                    : hero.isChangeDue
                      ? 'Change to hand back'
                      : 'Total paid'}
                </Text>
                <Text
                  fw={800}
                  c={hero.heroColor}
                  style={{
                    fontSize: 32,
                    lineHeight: 1.15,
                    fontFamily: 'monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatMoney(hero.heroAmountCents)}
                </Text>
                <Text size="xs" c="dimmed">
                  {hero.heroCaption}
                </Text>
              </Box>

              <Divider color="var(--border)" />

              <Box>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                  Sale details
                </Text>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Items
                    </Text>
                    <Text size="xs" fw={600}>
                      {invoice.items.length}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Payment method
                    </Text>
                    <Text size="xs" fw={600}>
                      {hero.methodLabel}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Cashier
                    </Text>
                    <Text size="xs" fw={600}>
                      {invoice.cashierName}
                    </Text>
                  </Group>
                  {invoice.customerName && (
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Customer
                      </Text>
                      <Text size="xs" fw={600}>
                        {invoice.customerName}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Box>

              <Divider color="var(--border)" />

              <Box>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                  Print activity
                </Text>
                {printLogs.length === 0 ? (
                  <Text size="xs" c="dimmed">
                    Not yet sent to printer
                  </Text>
                ) : (
                  <Stack gap={4}>
                    {printLogs.map((log) => (
                      <Text key={log.id} size="xs" c="dimmed">
                        Printed at {formatTime(log.printedAt)}
                      </Text>
                    ))}
                  </Stack>
                )}
              </Box>

              <Stack gap="xs">
                <Button
                  fullWidth
                  color="blue"
                  disabled={loading || !!error || isPending}
                  leftSection={<IconPrinter size={16} />}
                  onClick={handlePrint}
                >
                  {hasPrinted ? 'Print Another Copy' : 'Print receipt'}
                </Button>
                <Button fullWidth variant="default" onClick={onClose}>
                  Done
                </Button>
              </Stack>
              <Text size="xs" c="dimmed" ta="center">
                Tip: choose &quot;Save as PDF&quot; in the print dialog to save a copy.
              </Text>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{documentPane}</Box>
      )}
    </Modal>
  );
};
