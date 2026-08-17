import { useState, useCallback, useRef } from 'react';
import { Box } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useOutletContext } from 'react-router-dom';

import {
  useCartItems,
  useCartTotals,
  useCartCustomer,
  useCartCheckout,
  useHeldCarts,
  useCartSound,
} from '../hooks/useCart';
import { usePrint } from '../hooks/usePrint';
import { BillingRegions } from './BillingRegions';
import type { BillingPane } from './BillingTabBar';
import { ServiceJobPickerModal } from './ServiceJobPickerModal';
import { CustomerPickerModal } from '@/features/customers';
import { DiscountPopover } from './DiscountPopover';
import { SaleDocumentPreviewModal } from './SaleDocumentPreviewModal';
import type { PaymentPanelHandle } from './PaymentPanel';
import { createInvoice } from '../api/mockInvoices';
import { updateRepairJob } from '@/features/repairs/api/mockRepairs';
import { updatePrintJob } from '@/features/print-jobs/api/mockPrintJobs';
import { queryKeys } from '@/api/queryKeys';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { playPaymentCompleteSound } from '../lib/audio';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts, type Shortcut } from '@/shared/hooks/useShortcuts';
import { BILLING_HEADER_HEIGHT } from '@/app/layout/constants';
import type { Invoice } from '../types';

export const BillingCounter = () => {
  const queryClient = useQueryClient();
  const authUser = useAppSelector(selectAuthUser);
  const shopProfile = useAppSelector(selectShopProfile);
  const outletContext = useOutletContext<{
    setHeldDrawerOpen?: (open: boolean) => void;
    setShortcutsOpen?: (open: boolean) => void;
  }>();

  const { items } = useCartItems();
  const { customerId, customerName, customerPhone, customerAddress, attachCustomer } =
    useCartCustomer();
  const { discountCents, subtotalCents, totalCents, setDiscount } = useCartTotals();
  const {
    paymentMethod,
    splitPayments,
    isCredit,
    tenderedAmountCents,
    documentSelection,
    dueDate,
    cardRef,
    onlineRef,
    onlineNote,
    notes,
    changePaymentMethod,
    markSaleCompleted,
    startNextSale,
    completedSale,
  } = useCartCheckout();
  const { soundEnabled } = useCartSound();
  const { holdCurrentCart } = useHeldCarts();

  const { preview, openDocumentPreview, closeDocumentPreview } = usePrint();

  const isMobile = useIsMobile();

  // Which region is on screen below desktop tier
  const [activePane, setActivePane] = useState<BillingPane>('catalog');

  // Modals state
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [orderDiscountOpen, setOrderDiscountOpen] = useState(false);

  // Stable references so CatalogPanel/CartPanel (both React.memo'd) don't re-render just because
  // BillingCounter re-rendered for an unrelated reason (e.g. a Notes/Card-Ref keystroke).
  const openServicePicker = useCallback(() => setServicePickerOpen(true), []);
  const openCustomerPicker = useCallback(() => setCustomerModalOpen(true), []);
  const openOrderDiscount = useCallback(() => setOrderDiscountOpen(true), []);

  // Processing & Last completed invoice state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompletedInvoice, setLastCompletedInvoice] = useState<Invoice | null>(null);

  // Lets F2 run PaymentPanel's own guardrailed primary-action path (see the F2 shortcut below)
  // instead of jumping straight to checkout and bypassing the credit-limit confirmation.
  const paymentPanelRef = useRef<PaymentPanelHandle>(null);

  // Complete Payment Action (F2)
  const handleCompleteCheckout = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;
    if (
      paymentMethod === PAYMENT_METHODS.CARD &&
      !isCredit &&
      (!cardRef || cardRef.trim().length !== 4)
    ) {
      return;
    }
    if (
      paymentMethod === PAYMENT_METHODS.SPLIT &&
      !isCredit &&
      splitPayments.some(
        (sp) =>
          sp.method === PAYMENT_METHODS.CARD && (!sp.cardLast4 || sp.cardLast4.trim().length !== 4)
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const calculatedChangeCents =
        paymentMethod === PAYMENT_METHODS.CASH
          ? Math.max(0, (tenderedAmountCents || 0) - totalCents)
          : 0;

      const cashierName = authUser?.name || 'Store Cashier';

      // Create invoice record
      const invoice = await createInvoice({
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress || undefined,
        cashierId: authUser?.id || 'usr-cashier',
        cashierName,
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
        taxCents: shopProfile.isVatRegistered ? Math.round(subtotalCents * shopProfile.vatRate) : 0,
        discountCents,
        totalCents: shopProfile.isVatRegistered
          ? subtotalCents - discountCents + Math.round(subtotalCents * shopProfile.vatRate)
          : totalCents,
        paymentMethod,
        splitPayments,
        isCredit,
        cardLast4: cardRef || undefined,
        cardRef: cardRef || undefined,
        onlineRef: onlineRef || undefined,
        onlineNote: onlineNote || undefined,
        tenderedAmountCents:
          paymentMethod === PAYMENT_METHODS.CASH ? tenderedAmountCents : totalCents,
        changeDueCents: calculatedChangeCents,
        dueDate: isCredit
          ? dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          : undefined,
        status: isCredit ? 'pending' : 'paid',
        notes,
        shopProfileVersion: shopProfile.version,
        warrantyTermsSnapshot: shopProfile.defaultWarrantyText,
        documentSelection,
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

      // Preview-first: nothing auto-prints. Open the full-screen document preview so the
      // cashier reviews the invoice/receipt and prints from there themselves.
      if (documentSelection === 'invoice' || documentSelection === 'both') {
        openDocumentPreview(invoice, 'invoice');
      } else if (documentSelection === 'receipt') {
        openDocumentPreview(invoice, 'receipt');
      }

      setLastCompletedInvoice(invoice);

      // Mark sale completed (transforms PaymentPanel in-place to Confirmation Card, keeps cart visible)
      markSaleCompleted(invoice, calculatedChangeCents);

      // On mobile tab layouts, remain on pay pane to view confirmation card
      if (isMobile) {
        setActivePane('pay');
      }
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
    customerPhone,
    customerAddress,
    subtotalCents,
    discountCents,
    totalCents,
    paymentMethod,
    cardRef,
    onlineRef,
    onlineNote,
    splitPayments,
    isCredit,
    tenderedAmountCents,
    dueDate,
    documentSelection,
    notes,
    soundEnabled,
    authUser,
    shopProfile,
    queryClient,
    openDocumentPreview,
    markSaleCompleted,
    isMobile,
  ]);

  // Global Cashier Hotkeys Binding
  const focusScanBar = () => {
    const scanBar = document.querySelector(
      'input[placeholder*="Scan barcode"], input[placeholder*="Scan or search"]'
    ) as HTMLInputElement;
    scanBar?.focus();
  };

  const postSaleShortcuts: Shortcut[] = completedSale
    ? (() => {
        const docSel = completedSale.invoice.documentSelection;
        const isInvoiceMode = docSel === 'invoice' || docSel === 'both';

        const shortcuts: Shortcut[] = [
          {
            key: 'Enter',
            handler: () => {
              if (isInvoiceMode) {
                openDocumentPreview(completedSale.invoice, 'invoice');
              } else {
                startNextSale();
                setActivePane('catalog');
              }
            },
          },
          {
            key: 'N',
            handler: () => {
              startNextSale();
              setActivePane('catalog');
            },
          },
          { key: 'R', handler: () => openDocumentPreview(completedSale.invoice, 'receipt') },
          { key: 'I', handler: () => openDocumentPreview(completedSale.invoice, 'invoice') },
        ];

        if (isInvoiceMode) {
          shortcuts.push({
            key: 'P',
            handler: () => openDocumentPreview(completedSale.invoice, 'invoice'),
          });
        }

        return shortcuts;
      })()
    : [];

  useAppShortcuts([
    { key: 'F1', ignoreInput: true, handler: focusScanBar },
    {
      key: 'F2',
      ignoreInput: true,
      handler: () => {
        if (completedSale) return;
        // Route through PaymentPanel's own primary-action path so the credit-limit
        // guardrail applies the same way it does for a click; fall back to a direct
        // checkout when the panel isn't mounted (tablet/mobile off the pay pane).
        if (paymentPanelRef.current) {
          paymentPanelRef.current.triggerPrimaryAction();
        } else {
          handleCompleteCheckout();
        }
      },
    },
    { key: 'F3', ignoreInput: true, handler: () => setCustomerModalOpen(true) },
    { key: 'F4', ignoreInput: true, handler: () => setServicePickerOpen(true) },
    {
      key: 'F6',
      ignoreInput: true,
      handler: () => {
        const methods: PaymentMethod[] = [
          PAYMENT_METHODS.CASH,
          PAYMENT_METHODS.CARD,
          PAYMENT_METHODS.SPLIT,
        ];
        const nextIdx = (methods.indexOf(paymentMethod) + 1) % methods.length;
        changePaymentMethod(methods[nextIdx]);
      },
    },
    { key: 'Ctrl+D', ignoreInput: true, handler: () => setOrderDiscountOpen(true) },
    { key: 'Ctrl+H', ignoreInput: true, handler: () => holdCurrentCart() },
    {
      key: 'Ctrl+Shift+H',
      ignoreInput: true,
      handler: () => outletContext.setHeldDrawerOpen?.(true),
    },
    {
      key: 'Ctrl+P',
      ignoreInput: true,
      handler: () => {
        const targetInv = completedSale?.invoice || lastCompletedInvoice;
        if (targetInv) {
          openDocumentPreview(targetInv, 'receipt');
        } else {
          notifications.show({
            title: 'Preview Last Receipt',
            message: 'No previous invoice found to preview',
            color: 'orange',
          });
        }
      },
    },
    {
      key: 'Ctrl+Shift+P',
      ignoreInput: true,
      handler: () => {
        const targetInv = completedSale?.invoice || lastCompletedInvoice;
        if (targetInv) {
          openDocumentPreview(targetInv, 'invoice');
        } else {
          notifications.show({
            title: 'Preview Last Invoice',
            message: 'No previous invoice found to preview',
            color: 'orange',
          });
        }
      },
    },
    { key: '?', handler: () => outletContext.setShortcutsOpen?.(true) },
    ...postSaleShortcuts,
  ]);

  return (
    <Box
      className="billing-root"
      style={{
        ['--billing-header-h' as string]: `${BILLING_HEADER_HEIGHT}px`,
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        padding: isMobile ? 4 : 8,
      }}
    >
      <BillingRegions
        activePane={activePane}
        onChangePane={setActivePane}
        isProcessing={isProcessing}
        onCompleteCheckout={handleCompleteCheckout}
        onOpenServicePicker={openServicePicker}
        onOpenCustomerPicker={openCustomerPicker}
        onOpenOrderDiscount={openOrderDiscount}
        onOpenDocumentPreview={openDocumentPreview}
        paymentPanelRef={paymentPanelRef}
      />

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
            attachCustomer(
              cust.id,
              cust.name,
              cust.primaryPhone,
              cust.address,
              cust.outstandingBalanceCents
            );
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

      <SaleDocumentPreviewModal
        opened={!!preview}
        onClose={closeDocumentPreview}
        invoice={preview?.invoice ?? null}
        documentKind={preview?.kind ?? null}
      />
    </Box>
  );
};
