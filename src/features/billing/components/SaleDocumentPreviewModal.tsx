import { useRef, useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack, Divider, Loader } from '@mantine/core';
import { IconX, IconPrinter, IconCheck, IconAlertCircle } from '@tabler/icons-react';
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

export interface SaleDocumentPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  documentKind: 'invoice' | 'receipt' | null;
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

  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Bumped after a Print click to force a fresh read of the (localStorage-backed) print log below.
  const [, forcePrintLogRefresh] = useState(0);
  const printLogs = opened && invoice ? getPrintLogsForInvoice(invoice.invoiceNumber) : [];
  const hasPrinted = printLogs.length > 0;

  const paperWidthMm = printSettings.receiptPaper === '58mm' ? 58 : 80;
  const { blobUrl, loading, error } = useInvoiceDocument(
    invoice?.id,
    opened && documentKind ? (documentKind === 'invoice' ? 'a4-invoice' : 'thermal-receipt') : null,
    paperWidthMm
  );

  const handlePrint = () => {
    if (!invoice || !blobUrl) return;
    try {
      iframeRef.current?.contentWindow?.focus();
      iframeRef.current?.contentWindow?.print();
    } catch (e) {
      console.error('Failed to print document:', e);
    }
    recordPrintEvent({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      format: documentKind === 'invoice' ? 'a4' : paperWidthMm === 58 ? 'receipt-58' : 'receipt-80',
      copy: 'ORIGINAL — CUSTOMER COPY',
      printedBy: invoice.cashierName,
    });
    window.setTimeout(() => forcePrintLogRefresh((t) => t + 1), 300);
  };

  // First press prints; once a print has been recorded the same action closes the
  // preview instead, so Print becomes Complete without a separate confirmation step.
  const handlePrimaryAction = () => {
    if (hasPrinted) {
      onClose();
    } else {
      handlePrint();
    }
  };

  // Bound via the shared shortcut engine (not a focused-button click) so pressing
  // Enter never puts a visible focus ring on the Print/Complete button.
  useAppShortcuts(
    [
      { key: 'Enter', handler: handlePrimaryAction, ignoreInput: true },
      { key: 'Ctrl+P', handler: handlePrint, ignoreInput: true, preventDefault: true },
    ],
    opened
  );

  if (!invoice || !documentKind) return null;

  const hero = getSaleHeroPresentation(invoice, invoice.changeDueCents ?? 0);
  const isReceipt = documentKind === 'receipt';
  const statusWord = hero.isCreditCompleted
    ? 'On account'
    : hero.isChangeDue
      ? 'Change due'
      : 'Paid in full';
  const title = `${isReceipt ? 'Receipt' : 'Invoice'} — ${invoice.invoiceNumber}`;
  const subtitle = `${statusWord} · ${hero.methodLabel} · ${formatDateTime(invoice.createdAt)}`;
  const isDesktopTier = tier === 'desktop';

  const documentPane = (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading && (
        <Stack align="center" gap="xs">
          <Loader size="sm" />
          <Text size="xs" c="dimmed">
            Preparing document…
          </Text>
        </Stack>
      )}
      {!loading && error && (
        <Stack align="center" gap="xs">
          <IconAlertCircle size={28} color="var(--mantine-color-red-6)" />
          <Text size="sm" c="red" fw={600}>
            Could not load the document
          </Text>
          <Text size="xs" c="dimmed">
            Check your connection and try again.
          </Text>
        </Stack>
      )}
      {!loading && !error && blobUrl && (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          title={title}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      )}
    </Box>
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
            color="green"
            disabled={loading || !!error}
            leftSection={hasPrinted ? <IconCheck size={16} /> : <IconPrinter size={16} />}
            onClick={handlePrimaryAction}
          >
            {hasPrinted ? 'Complete' : 'Print'}
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
        <Box style={{ flex: 1, overflow: 'auto' }}>
          <Box
            style={{
              display: 'flex',
              flexDirection: isDesktopTier ? 'row' : 'column',
              minHeight: '100%',
            }}
          >
            <Box
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                padding: isMobile ? '24px 12px' : '40px 24px',
              }}
            >
              <Box
                style={{
                  width: isMobile ? '100%' : 380,
                  minHeight: 400,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                }}
              >
                {documentPane}
              </Box>
            </Box>

            <Box
              style={{
                width: isDesktopTier ? 320 : '100%',
                flexShrink: 0,
                borderLeft: isDesktopTier ? '1px solid var(--border)' : undefined,
                borderTop: !isDesktopTier ? '1px solid var(--border)' : undefined,
                backgroundColor: 'var(--bg-card)',
                padding: 20,
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

                <Button
                  fullWidth
                  color="green"
                  disabled={loading || !!error}
                  leftSection={hasPrinted ? <IconCheck size={16} /> : <IconPrinter size={16} />}
                  onClick={handlePrimaryAction}
                >
                  {hasPrinted ? 'Complete' : 'Print receipt'}
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  Tip: choose &quot;Save as PDF&quot; in the print dialog to save a copy.
                </Text>
              </Stack>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box style={{ flex: 1, overflow: 'hidden' }}>{documentPane}</Box>
      )}
    </Modal>
  );
};
