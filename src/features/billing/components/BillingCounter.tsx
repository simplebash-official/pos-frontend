import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Grid,
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import { IconCheck, IconPrinter, IconRefresh } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useOutletContext } from 'react-router-dom';

import { useCart } from '../hooks/useCart';
import { CatalogPanel } from './CatalogPanel';
import { CartPanel } from './CartPanel';
import { PaymentPanel } from './PaymentPanel';
import { ServiceJobPickerModal } from './ServiceJobPickerModal';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { DiscountPopover } from './DiscountPopover';
import { createInvoice } from '../api/mockInvoices';
import { updateRepairJob } from '@/features/repairs/api/mockRepairs';
import { updatePrintJob } from '@/features/print-jobs/api/mockPrintJobs';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { triggerThermalPrint } from '@/shared/lib/print';
import { playPaymentCompleteSound } from '../lib/audio';

export function BillingCounter() {
  const queryClient = useQueryClient();
  const outletContext = useOutletContext<{
    setHeldDrawerOpen?: (open: boolean) => void;
    setShortcutsOpen?: (open: boolean) => void;
  }>();

  const {
    items,
    customerId,
    customerName,
    discountCents,
    subtotalCents,
    totalCents,
    paymentMethod,
    splitPayments,
    isCredit,
    notes,
    soundEnabled,
    attachCustomer,
    changePaymentMethod,
    setDiscount,
    clear,
  } = useCart();

  // Modals state
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [orderDiscountOpen, setOrderDiscountOpen] = useState(false);

  // Processing & Success screen state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompletedInvoice, setLastCompletedInvoice] = useState<{
    invoiceNumber: string;
    totalCents: number;
    changeDueCents: number;
    paymentMethod: string;
    customerName: string;
    items: typeof items;
  } | null>(null);

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Complete Payment Action
  const handleCompleteCheckout = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      // Create invoice record
      const invoice = await createInvoice({
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.name,
          productName: i.name,
          sku: i.sku,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
          discountCents: i.discountCents,
          totalCents: i.totalCents,
          sourceType: i.sourceType,
          sourceTicketNumber: i.sourceTicketNumber,
          assignedEmployeeId: i.assignedEmployeeId,
          assignedEmployeeName: i.assignedEmployeeName,
        })),
        subtotalCents,
        taxCents: 0,
        discountCents,
        totalCents,
        paymentMethod,
        splitPayments,
        isCredit,
        status: isCredit ? 'pending' : 'paid',
        notes,
      });

      // Update service tickets status to 'delivered' if applicable
      for (const item of items) {
        if (item.sourceType === 'repair' && item.productId) {
          await updateRepairJob(item.productId, { status: 'delivered' });
        } else if (item.sourceType === 'print' && item.productId) {
          await updatePrintJob(item.productId, { status: 'delivered' });
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });

      // Play chime sound
      playPaymentCompleteSound(soundEnabled);

      // Trigger Thermal Receipt Printing
      triggerThermalPrint('thermal-receipt-printable');

      // Set last invoice snapshot for success overlay & thermal receipt
      const snapshot = {
        invoiceNumber: invoice.invoiceNumber,
        totalCents: invoice.totalCents,
        changeDueCents: invoice.changeDueCents || 0,
        paymentMethod,
        customerName: customerName || 'Walk-in Guest',
        items: [...items],
      };
      setLastCompletedInvoice(snapshot);
      setShowSuccessOverlay(true);

      // Auto-clear cart and auto-reset after 2.5s
      clear();

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 2500);
    } catch {
      notifications.show({
        title: 'Checkout Error',
        message: 'Failed to process payment invoice',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    items,
    isProcessing,
    customerId,
    customerName,
    subtotalCents,
    discountCents,
    totalCents,
    paymentMethod,
    splitPayments,
    isCredit,
    notes,
    soundEnabled,
    clear,
    queryClient,
  ]);

  // Global Cashier Hotkeys Binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if active element is an input inside a modal
      if (e.key === 'F1') {
        e.preventDefault();
        const scanBar = document.querySelector(
          'input[placeholder*="Scan barcode"]'
        ) as HTMLInputElement;
        scanBar?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleCompleteCheckout();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setCustomerModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setServicePickerOpen(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        const methods = [
          PAYMENT_METHODS.CASH,
          PAYMENT_METHODS.CARD,
          PAYMENT_METHODS.ONLINE,
          PAYMENT_METHODS.SPLIT,
        ];
        const nextIdx = (methods.indexOf(paymentMethod) + 1) % methods.length;
        changePaymentMethod(methods[nextIdx] as PaymentMethod);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setOrderDiscountOpen(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'h' && !e.shiftKey) {
        e.preventDefault();
        const scanBar = document.querySelector(
          'input[placeholder*="Scan barcode"]'
        ) as HTMLInputElement;
        scanBar?.blur();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        outletContext.setHeldDrawerOpen?.(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (lastCompletedInvoice) {
          triggerThermalPrint('thermal-receipt-printable');
        } else {
          notifications.show({
            title: 'Reprint Last Receipt',
            message: 'No previous invoice found to reprint',
            color: 'orange',
          });
        }
      } else if (e.key === '?') {
        if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
          e.preventDefault();
          outletContext.setShortcutsOpen?.(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleCompleteCheckout,
    paymentMethod,
    changePaymentMethod,
    outletContext,
    lastCompletedInvoice,
  ]);

  return (
    <Box
      style={{
        height: 'calc(100vh - 48px)', // Fit 1366x768 monitor screen exactly
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        padding: 8,
      }}
    >
      {/* Static 3-Region 12-Column Grid Layout */}
      <Grid h="100%">
        {/* Region A: Catalog / Entry (5 columns, left) */}
        <Grid.Col span={5} style={{ height: '100%' }}>
          <CatalogPanel onOpenServicePicker={() => setServicePickerOpen(true)} />
        </Grid.Col>

        {/* Region B: Cart (4 columns, center) */}
        <Grid.Col span={4} style={{ height: '100%' }}>
          <CartPanel onOpenCustomerPicker={() => setCustomerModalOpen(true)} />
        </Grid.Col>

        {/* Region C: Payment (3 columns, right) */}
        <Grid.Col span={3} style={{ height: '100%' }}>
          <PaymentPanel
            isProcessing={isProcessing}
            onCompleteCheckout={handleCompleteCheckout}
            onOpenOrderDiscount={() => setOrderDiscountOpen(true)}
          />
        </Grid.Col>
      </Grid>

      {/* Full-Panel Green Success Confirmation Overlay (2.5s Auto-Reset) */}
      {showSuccessOverlay && lastCompletedInvoice && (
        <Paper
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'var(--mantine-color-green-9)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon size={96} radius="xl" color="white" c="green.8">
              <IconCheck size={64} stroke={3} />
            </ThemeIcon>

            <Title order={1} c="white" style={{ fontSize: 36, fontWeight: 900 }}>
              Payment Completed!
            </Title>

            <Badge size="lg" color="white" c="green.9" variant="filled">
              Invoice #{lastCompletedInvoice.invoiceNumber}
            </Badge>

            <Text size="xl" fw={700} c="green.1">
              Customer: {lastCompletedInvoice.customerName}
            </Text>

            {lastCompletedInvoice.changeDueCents > 0 && (
              <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Stack align="center" gap={2}>
                  <Text size="xs" fw={700} c="green.1" tt="uppercase">
                    CHANGE DUE TO CUSTOMER
                  </Text>
                  <Text size="3xl" fw={900} c="white" style={{ fontFamily: 'monospace' }}>
                    {formatMoney(lastCompletedInvoice.changeDueCents)}
                  </Text>
                </Stack>
              </Paper>
            )}

            <Group gap="md" mt="md">
              <Button
                size="md"
                color="white"
                c="green.9"
                leftSection={<IconPrinter size={20} />}
                onClick={() => triggerThermalPrint('thermal-receipt-printable')}
              >
                Print Receipt
              </Button>
              <Button
                size="md"
                variant="outline"
                color="white"
                leftSection={<IconRefresh size={20} />}
                onClick={() => setShowSuccessOverlay(false)}
              >
                Start New Sale
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Hidden Printable Thermal Receipt Container */}
      <div style={{ display: 'none' }}>
        <div id="thermal-receipt-printable">
          <div className="text-center bold" style={{ fontSize: 16 }}>
            JANA2U POS SERVICE CENTER
          </div>
          <div className="text-center">Phone Repairs & Custom Print Shop</div>
          <div className="text-center">No. 12, Main Street, Colombo</div>
          <div className="divider"></div>
          <div>Invoice #: {lastCompletedInvoice?.invoiceNumber || 'INV-1001'}</div>
          <div>Date: {new Date().toLocaleString()}</div>
          <div>Cashier: Admin</div>
          <div>Customer: {lastCompletedInvoice?.customerName || 'Walk-in Guest'}</div>
          <div className="divider"></div>
          {lastCompletedInvoice?.items.map((item) => (
            <div key={item.id} style={{ marginBottom: 4 }}>
              <div>
                {item.name} {item.sku ? `(${item.sku})` : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {item.quantity} x {formatMoney(item.unitPriceCents)}
                </span>
                <span className="bold">{formatMoney(item.totalCents)}</span>
              </div>
            </div>
          ))}
          <div className="divider"></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>{formatMoney(lastCompletedInvoice?.totalCents || 0)}</span>
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}
            className="bold"
          >
            <span>TOTAL:</span>
            <span>{formatMoney(lastCompletedInvoice?.totalCents || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Method:</span>
            <span>{lastCompletedInvoice?.paymentMethod.toUpperCase()}</span>
          </div>
          {lastCompletedInvoice?.changeDueCents ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Change Due:</span>
              <span>{formatMoney(lastCompletedInvoice.changeDueCents)}</span>
            </div>
          ) : null}
          <div className="divider"></div>
          <div className="text-center" style={{ fontSize: 10 }}>
            Warranty Notice: 30 days warranty on screen & repair parts. Physical damage voids
            warranty.
          </div>
          <div className="text-center bold" style={{ marginTop: 6 }}>
            Thank you for your business!
          </div>
        </div>
      </div>

      {/* Modals */}
      <ServiceJobPickerModal
        opened={servicePickerOpen}
        onClose={() => setServicePickerOpen(false)}
      />

      <CustomerPickerModal
        opened={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        selectedCustomerId={customerId}
        onSelectCustomer={(cust) => {
          if (cust) {
            attachCustomer(cust.id, cust.name, cust.primaryPhone, cust.outstandingBalanceCents);
          } else {
            attachCustomer(null, null);
          }
        }}
      />

      <DiscountPopover
        opened={orderDiscountOpen}
        onClose={() => setOrderDiscountOpen(false)}
        targetName="Entire Order"
        originalCents={subtotalCents}
        currentDiscountCents={discountCents}
        onApplyDiscount={setDiscount}
      >
        <span />
      </DiscountPopover>
    </Box>
  );
}
