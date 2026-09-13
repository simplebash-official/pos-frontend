import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack, Divider } from '@mantine/core';
import { IconX, IconPrinter } from '@tabler/icons-react';
import type { Invoice, CreditNote } from '../types';
import { getSaleHeroPresentation } from '../lib/saleHeroPresentation';
import { useInvoiceDocument } from '../hooks/useInvoiceDocument';
import { useCreditNoteDocument } from '../hooks/useCreditNoteDocument';
import { getCreditNoteStatusMeta } from '@/features/invoices/lib/invoiceStatus';
import { getPrintLogsForInvoice, recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { useIsMobile, useLayoutTier } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime, formatTime } from '@/shared/lib/date';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { printPdfBlob } from '@/shared/print/printService';

export type DocumentPreviewSubject =
  { kind: 'invoice'; invoice: Invoice } | { kind: 'creditNote'; creditNote: CreditNote };

export interface SaleDocumentPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  subject: DocumentPreviewSubject | null;
  documentKind: 'invoice' | 'receipt' | 'credit-note' | null;
}

export const SaleDocumentPreviewModal = ({
  opened,
  onClose,
  subject,
  documentKind,
}: SaleDocumentPreviewModalProps) => {
  const isMobile = useIsMobile();
  const tier = useLayoutTier();
  const printSettings = useAppSelector(selectPrintSettings);

  const invoice = subject?.kind === 'invoice' ? subject.invoice : null;
  const creditNote = subject?.kind === 'creditNote' ? subject.creditNote : null;

  // Bumped after a Print click to force a fresh read of the (localStorage-backed) print log below.
  const [, forcePrintLogRefresh] = useState(0);
  // Fall back to the id so print-log lookups/recording still work (the
  // lookup already matches on either field) on the rare chance the number
  // is somehow absent.
  const printLogNumber = invoice?.invoiceNumber || creditNote?.creditNoteNumber;
  const printLogKey = printLogNumber || invoice?.id || creditNote?.id || '';
  const printLogs = opened && printLogKey ? getPrintLogsForInvoice(printLogKey) : [];
  const hasPrinted = printLogs.length > 0;

  const paperWidthMm = printSettings.receiptPaper === '58mm' ? 58 : 80;
  const invoiceDocType =
    opened && invoice && documentKind
      ? documentKind === 'invoice'
        ? 'a4-invoice'
        : documentKind === 'receipt'
          ? 'thermal-receipt'
          : null
      : null;

  // Both hooks are always called (Rules of Hooks) — each is a no-op query
  // (`enabled: false`) when its subject isn't the active one.
  const invoiceDoc = useInvoiceDocument(invoice?.id, invoiceDocType, paperWidthMm);
  const creditNoteDoc = useCreditNoteDocument(opened && creditNote ? creditNote.id : undefined);
  const { blob, loading, error, isPaused } = creditNote ? creditNoteDoc : invoiceDoc;

  const printDocLabel =
    documentKind === 'receipt'
      ? 'Receipt'
      : documentKind === 'credit-note'
        ? 'Credit Note'
        : 'Invoice';
  const printTitle = `${printDocLabel} — ${printLogNumber || 'Pending'}`;

  const handlePrint = () => {
    if (!blob) return;
    void printPdfBlob(blob, printTitle);
    recordPrintEvent({
      invoiceId: invoice?.id ?? creditNote?.id ?? '',
      invoiceNumber: printLogKey,
      format:
        documentKind === 'invoice' || documentKind === 'credit-note'
          ? 'a4'
          : paperWidthMm === 58
            ? 'receipt-58'
            : 'receipt-80',
      copy: hasPrinted ? 'DUPLICATE COPY' : 'ORIGINAL — CUSTOMER COPY',
      printedBy: invoice?.cashierName ?? creditNote?.cashierName ?? '',
    });
    window.setTimeout(() => forcePrintLogRefresh((t) => t + 1), 300);
  };

  // Bound via the shared shortcut engine so pressing Enter prints (or Cmd+P / Ctrl+P)
  useAppShortcuts(
    [
      { key: 'Enter', handler: handlePrint, ignoreInput: true },
      { key: ['Mod+P', 'Ctrl+P'], handler: handlePrint, ignoreInput: true, preventDefault: true },
    ],
    opened
  );

  if (!subject || !documentKind) return null;

  const isReceipt = documentKind === 'receipt';
  const isCreditNote = documentKind === 'credit-note';
  const isDesktopTier = tier === 'desktop';

  // `getSaleHeroPresentation` only understands an `Invoice` — the credit
  // note case builds its own, much simpler header values below instead.
  const hero = invoice ? getSaleHeroPresentation(invoice, invoice.changeDueCents ?? 0) : null;

  const statusWord = isCreditNote
    ? getCreditNoteStatusMeta(creditNote!.status).label
    : hero!.isCreditCompleted
      ? 'On account'
      : hero!.isChangeDue
        ? 'Change due'
        : 'Paid in full';

  const docLabel = isReceipt ? 'Receipt' : isCreditNote ? 'Credit Note' : 'Invoice';
  const heroColor = isCreditNote
    ? getCreditNoteStatusMeta(creditNote!.status).color
    : hero!.heroColor;

  const title = `${docLabel} — ${printLogNumber || 'Pending'}`;
  const subtitle = isCreditNote
    ? `${statusWord} · ${formatDateTime(creditNote!.createdAt)}`
    : `${statusWord} · ${hero!.methodLabel} · ${formatDateTime(invoice!.createdAt)}`;

  const documentPane = (
    <PdfCanvasViewer
      blob={blob}
      loading={loading}
      error={error}
      isPaused={isPaused}
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
              backgroundColor: `var(--mantine-color-${heroColor}-6)`,
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
            disabled={loading || !!error}
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
            aria-label={t('Close preview')}
            onClick={onClose}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {isReceipt && invoice && hero ? (
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
                  {t('Sale details')}
                </Text>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {t('Items')}
                    </Text>
                    <Text size="xs" fw={600}>
                      {invoice.items.length}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {t('Payment method')}
                    </Text>
                    <Text size="xs" fw={600}>
                      {hero.methodLabel}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {t('Cashier')}
                    </Text>
                    <Text size="xs" fw={600}>
                      {invoice.cashierName}
                    </Text>
                  </Group>
                  {invoice.customerName && (
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {t('Customer')}
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
                  {t('Print activity')}
                </Text>
                {printLogs.length === 0 ? (
                  <Text size="xs" c="dimmed">
                    {t('Not yet sent to printer')}
                  </Text>
                ) : (
                  <Stack gap={4}>
                    {printLogs.map((log) => (
                      <Text key={log.id} size="xs" c="dimmed">
                        {t('Printed at')} {formatTime(log.printedAt)}
                      </Text>
                    ))}
                  </Stack>
                )}
              </Box>

              <Stack gap="xs">
                <Button
                  fullWidth
                  color="blue"
                  disabled={loading || !!error}
                  leftSection={<IconPrinter size={16} />}
                  onClick={handlePrint}
                >
                  {hasPrinted ? 'Print Another Copy' : 'Print receipt'}
                </Button>
                <Button fullWidth variant="default" onClick={onClose}>
                  {t('Done')}
                </Button>
              </Stack>
              <Text size="xs" c="dimmed" ta="center">
                {t('Tip: choose &quot;Save as PDF&quot; in the print dialog to save a copy.')}
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
