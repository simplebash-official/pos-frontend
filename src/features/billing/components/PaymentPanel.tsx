import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, memo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Divider,
  Button,
  TextInput,
  Textarea,
  Switch,
  Tooltip,
  ActionIcon,
  Box,
  SimpleGrid,
  UnstyledButton,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconCash,
  IconCreditCard,
  IconWorld,
  IconArrowsSplit,
  IconPlus,
  IconTrash,
  IconFileText,
  IconTag,
  IconAlertCircle,
  IconCalendar,
  IconX,
  IconCheck,
  IconPrinter,
} from '@tabler/icons-react';

import { useCartItems, useCartTotals, useCartCustomer, useCartCheckout } from '../hooks/useCart';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { formatMoney } from '@/shared/lib/money';
import { AmountInput } from '@/shared/components/AmountInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getSaleHeroPresentation } from '../lib/saleHeroPresentation';
import type { Invoice, SplitPaymentDetail } from '../types';

export interface PaymentPanelProps {
  isProcessing: boolean;
  onCompleteCheckout: () => void;
  onOpenOrderDiscount?: () => void;
  onOpenDocumentPreview: (invoice: Invoice, kind: 'invoice' | 'receipt') => void;
}

export interface PaymentPanelHandle {
  /** Runs the exact same path as clicking the primary action button, including the credit guardrail. */
  triggerPrimaryAction: () => void;
}

export const PaymentPanel = memo(
  forwardRef<PaymentPanelHandle, PaymentPanelProps>(function PaymentPanel(
    { isProcessing, onCompleteCheckout, onOpenDocumentPreview },
    ref
  ) {
    const { items } = useCartItems();
    const { subtotalCents, discountCents, totalCents, setDiscount, splitRemainingCents } =
      useCartTotals();
    const { customerId, customerName, customerBalanceCents } = useCartCustomer();
    const {
      paymentMethod,
      changePaymentMethod,
      splitPayments,
      changeSplitPayments,
      isCredit,
      changeIsCredit,
      cardRef,
      changeCardRef,
      onlineRef,
      changeOnlineRef,
      onlineNote,
      changeOnlineNote,
      documentSelection,
      changeDocumentSelection,
      dueDate,
      changeDueDate,
      changeTenderedAmountCents,
      notes,
      changeNotes,
      completedSale,
      startNextSale,
    } = useCartCheckout();

    const isMobile = useIsMobile();
    const regionPadding = isMobile ? 'var(--mantine-spacing-sm)' : 'var(--mantine-spacing-md)';
    const checkoutKeyHint = isMobile ? '' : ' (F2)';

    // Collapsible Order Discount State
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountMode, setDiscountMode] = useState<'percentage' | 'amount'>('percentage');
    const [discountInput, setDiscountInput] = useState<number | ''>('');
    const [hasEditedDiscount, setHasEditedDiscount] = useState(false);

    // Auto-expand discount input if discountCents > 0
    useEffect(() => {
      if (discountCents > 0) {
        setShowDiscountInput(true);
      }
    }, [discountCents]);

    // Collapsible Order Note State
    const [showNotes, setShowNotes] = useState(() => Boolean(notes));

    useEffect(() => {
      if (notes && !showNotes) {
        setShowNotes(true);
      }
    }, [notes, showNotes]);

    // Collapse the order-note panel once the cart empties (cleared or a new sale started) —
    // otherwise the previous order's now-empty note box stays expanded.
    useEffect(() => {
      if (items.length === 0) {
        setShowNotes(false);
      }
    }, [items.length]);

    // Guardrail 2-step inline confirmation state
    const [confirmCreditRequired, setConfirmCreditRequired] = useState(false);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Calculate order discount cents based on mode & input
    const calculatedDiscountCents = useMemo(() => {
      if (
        !showDiscountInput ||
        typeof discountInput !== 'number' ||
        discountInput <= 0 ||
        subtotalCents <= 0
      ) {
        return 0;
      }
      if (discountMode === 'percentage') {
        const clampedPct = Math.min(100, Math.max(0, discountInput));
        const disc = Math.round((subtotalCents * clampedPct) / 100);
        return Math.min(disc, subtotalCents);
      } else {
        const disc = Math.round(discountInput * 100);
        return Math.min(disc, subtotalCents);
      }
    }, [showDiscountInput, discountInput, discountMode, subtotalCents]);

    // Sync calculated discount to cart store
    useEffect(() => {
      if (calculatedDiscountCents <= 0) {
        setDiscount(0, null, 0);
        return;
      }
      setDiscount(
        calculatedDiscountCents,
        discountMode === 'percentage' ? 'percentage' : 'fixed',
        discountMode === 'percentage'
          ? Math.min(100, Math.max(0, typeof discountInput === 'number' ? discountInput : 0))
          : calculatedDiscountCents
      );
    }, [calculatedDiscountCents, discountMode, discountInput, setDiscount]);

    // Sync external discountCents to discountInput state if set externally
    const [lastSyncedDiscountCents, setLastSyncedDiscountCents] = useState<number | null>(null);
    if (
      !hasEditedDiscount &&
      discountCents > 0 &&
      discountInput === '' &&
      discountCents !== lastSyncedDiscountCents
    ) {
      setLastSyncedDiscountCents(discountCents);
      if (discountMode === 'percentage' && subtotalCents > 0) {
        setDiscountInput(Math.round((discountCents / subtotalCents) * 100));
      } else {
        setDiscountInput(Math.round(discountCents / 100));
      }
    }

    // Reset the discount panel once the cart empties (cleared or a new sale started) —
    // otherwise the previous order's discount input stays visible with a stale value.
    useEffect(() => {
      if (items.length === 0) {
        setShowDiscountInput(false);
        setDiscountInput('');
        setHasEditedDiscount(false);
        setLastSyncedDiscountCents(null);
      }
    }, [items.length]);

    // Tendered cash state in rupees
    const [tenderedRupees, setTenderedRupees] = useState<number | ''>('');
    const cashInputRef = useRef<HTMLInputElement>(null);

    // Reset tendered cash once the cart empties (cleared or a new sale started) —
    // otherwise the previous sale's "Cash Received" / change due lingers on screen.
    useEffect(() => {
      if (items.length === 0) {
        setTenderedRupees('');
      }
    }, [items.length]);

    const printSettings = useAppSelector(selectPrintSettings);
    const prevCustomerIdRef = useRef(customerId);

    // Reset credit confirmation on cart or mode changes
    useEffect(() => {
      setConfirmCreditRequired(false);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    }, [items, totalCents, customerId, isCredit]);

    // Auto-set document selection when customer is attached/detached
    useEffect(() => {
      if (customerId && !prevCustomerIdRef.current) {
        changeDocumentSelection(printSettings.defaultDocumentForAccountCustomer);
      } else if (!customerId && prevCustomerIdRef.current) {
        changeDocumentSelection(printSettings.defaultDocumentForWalkIn);
      }
      prevCustomerIdRef.current = customerId;
    }, [
      customerId,
      changeDocumentSelection,
      printSettings.defaultDocumentForAccountCustomer,
      printSettings.defaultDocumentForWalkIn,
    ]);

    // Focus cash input on payment method change to Cash, or set default total for Card
    const prevPaymentMethodRef = useRef(paymentMethod);
    useEffect(() => {
      if (
        paymentMethod === PAYMENT_METHODS.CASH &&
        prevPaymentMethodRef.current !== PAYMENT_METHODS.CASH &&
        !isCredit &&
        !completedSale
      ) {
        if (!isMobile) {
          setTimeout(() => cashInputRef.current?.focus(), 50);
        }
      } else if (
        paymentMethod === PAYMENT_METHODS.CARD &&
        prevPaymentMethodRef.current !== PAYMENT_METHODS.CARD &&
        !isCredit &&
        totalCents > 0
      ) {
        setTenderedRupees(Math.round(totalCents / 100));
      }
      prevPaymentMethodRef.current = paymentMethod;
    }, [paymentMethod, isCredit, completedSale, totalCents, isMobile]);

    // Sync tendered amount to Redux store
    useEffect(() => {
      const cents =
        typeof tenderedRupees === 'number'
          ? Math.round(tenderedRupees * 100)
          : paymentMethod === PAYMENT_METHODS.CARD
            ? totalCents
            : 0;
      changeTenderedAmountCents(cents);
    }, [tenderedRupees, paymentMethod, totalCents, changeTenderedAmountCents]);

    // Clear tendered amount when switching to credit mode
    useEffect(() => {
      if (isCredit) {
        setTenderedRupees('');
      }
    }, [isCredit]);

    // Payment calculations
    const effectiveTenderedCents =
      typeof tenderedRupees === 'number'
        ? Math.round(tenderedRupees * 100)
        : paymentMethod === PAYMENT_METHODS.CARD
          ? totalCents
          : 0;
    const changeDueCents = Math.max(0, effectiveTenderedCents - totalCents);
    const shortByCents = totalCents - effectiveTenderedCents;
    const isCashShort =
      paymentMethod === PAYMENT_METHODS.CASH && effectiveTenderedCents < totalCents;
    const isCardShort =
      paymentMethod === PAYMENT_METHODS.CARD && effectiveTenderedCents < totalCents;

    // Default due date calculation (30 days from now)
    const [defaultDueDate] = useState(() => new Date(Date.now() + 30 * 86400000));

    // Split payment validation
    const isSplitIncomplete =
      paymentMethod === PAYMENT_METHODS.SPLIT &&
      (splitRemainingCents !== 0 || splitPayments.length === 0);

    // Quick Tender Chips calculation
    const quickChips = useMemo(() => {
      if (totalCents <= 0) return [];
      const totalRs = Math.ceil(totalCents / 100);
      const set = new Set<number>();
      set.add(totalRs);

      const next500 = Math.ceil(totalRs / 500) * 500;
      if (next500 > totalRs) set.add(next500);

      const next1000 = Math.ceil(totalRs / 1000) * 1000;
      if (next1000 > totalRs) set.add(next1000);

      const next5000 = Math.ceil(totalRs / 5000) * 5000;
      if (next5000 > totalRs) set.add(next5000);

      return Array.from(set).sort((a, b) => a - b);
    }, [totalCents]);

    // Handle Split Rows
    const handleAddSplitRow = () => {
      const remaining = Math.max(0, splitRemainingCents);
      const newSplit: SplitPaymentDetail = {
        id: `sp-${Date.now()}`,
        method: PAYMENT_METHODS.CASH,
        amountCents: remaining,
      };
      changeSplitPayments([...splitPayments, newSplit]);
    };

    const handleUpdateSplitRow = (
      id: string,
      field: keyof SplitPaymentDetail,
      value: PaymentMethod | number | string | undefined
    ) => {
      const updated = splitPayments.map((sp) => (sp.id === id ? { ...sp, [field]: value } : sp));
      changeSplitPayments(updated);
    };

    const handleRemoveSplitRow = (id: string) => {
      changeSplitPayments(splitPayments.filter((sp) => sp.id !== id));
    };

    // Card validation (last 4 digits required)
    const isCardDigitsMissing =
      paymentMethod === PAYMENT_METHODS.CARD && !isCredit && cardRef.trim().length !== 4;

    const isSplitCardDigitsMissing =
      paymentMethod === PAYMENT_METHODS.SPLIT &&
      !isCredit &&
      splitPayments.some(
        (sp) =>
          sp.method === PAYMENT_METHODS.CARD && (!sp.cardLast4 || sp.cardLast4.trim().length !== 4)
      );

    // Complete button disabled logic
    const isCartEmpty = items.length === 0;
    const isButtonDisabled =
      isCartEmpty ||
      isProcessing ||
      (paymentMethod === PAYMENT_METHODS.CASH && isCashShort && !isCredit) ||
      (paymentMethod === PAYMENT_METHODS.CARD &&
        (isCardShort || isCardDigitsMissing) &&
        !isCredit) ||
      (paymentMethod === PAYMENT_METHODS.SPLIT &&
        (isSplitIncomplete || isSplitCardDigitsMissing) &&
        !isCredit);

    // Print document options based on mode (No print first; Credit has only No print and Unpaid invoice)
    const printOptions = useMemo(() => {
      if (!isCredit) {
        return [
          { label: 'No print', value: 'none' as const },
          { label: 'Receipt', value: 'receipt' as const },
          { label: 'Paid invoice', value: 'invoice' as const },
        ];
      }
      return [
        { label: 'No print', value: 'none' as const },
        { label: 'Unpaid invoice', value: 'invoice' as const },
      ];
    }, [isCredit]);

    // Consequence helper label
    const printConsequenceText = useMemo(() => {
      if (documentSelection === 'receipt') return 'will print 80mm receipt';
      if (documentSelection === 'invoice')
        return isCredit ? 'will print A4 unpaid invoice' : 'will print A4 paid invoice';
      return 'no document will print';
    }, [documentSelection, isCredit]);

    // Handle Primary Action Click / F2
    const handlePrimaryAction = () => {
      if (isButtonDisabled) return;

      // In-system 2-click guardrail for existing customer balance
      if (isCredit && (customerBalanceCents || 0) > 0 && !confirmCreditRequired) {
        setConfirmCreditRequired(true);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => {
          setConfirmCreditRequired(false);
        }, 5000);
        return;
      }

      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      setConfirmCreditRequired(false);
      onCompleteCheckout();
    };

    // Exposes the same guardrailed path the button click goes through, so keyboard
    // shortcuts (e.g. BillingCounter's F2) can't bypass the credit-limit confirmation.
    useImperativeHandle(ref, () => ({ triggerPrimaryAction: handlePrimaryAction }));

    const paymentTiles = [
      { id: PAYMENT_METHODS.CASH, label: 'Cash', icon: IconCash, disabled: false },
      {
        id: PAYMENT_METHODS.CARD,
        label: 'Card',
        icon: IconCreditCard,
        disabled: false,
      },
      {
        id: PAYMENT_METHODS.ONLINE,
        label: 'Online',
        icon: IconWorld,
        disabled: true,
        tooltip: 'Online payment integration coming soon',
      },
      { id: PAYMENT_METHODS.SPLIT, label: 'Split', icon: IconArrowsSplit, disabled: false },
    ];

    const newCreditBalanceCents = (customerBalanceCents || 0) + totalCents;

    // Render Confirmation Card if sale was completed
    if (completedSale) {
      const { invoice, changeDueCents: saleChangeCents } = completedSale;
      const { isCreditCompleted, heroColor, heroAmountCents, heroCaption, methodLabel } =
        getSaleHeroPresentation(invoice, saleChangeCents);

      const showReprintAction =
        invoice.documentSelection === 'receipt' ||
        invoice.documentSelection === 'both' ||
        !invoice.documentSelection ||
        invoice.documentSelection === 'none';
      const showInvoiceAction =
        invoice.documentSelection === 'invoice' || invoice.documentSelection === 'both';

      return (
        <Paper
          radius="var(--mantine-radius-default)"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-card)',
            borderLeft: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <Box
            className="no-scrollbar"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: regionPadding,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="xs" align="center">
                  <ThemeIcon size="md" radius="xl" color={heroColor} variant="filled">
                    <IconCheck size={16} stroke={3} />
                  </ThemeIcon>
                  <Text fw={800} size="sm" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                    {isCreditCompleted ? 'Sale Recorded on Account' : 'Sale Completed'}
                  </Text>
                </Group>
                <Badge size="sm" variant="light" color="gray">
                  #{invoice.invoiceNumber}
                </Badge>
              </Group>

              <Stack gap={2} align="center" ta="center">
                <Text
                  fw={800}
                  c={heroColor}
                  style={{
                    fontSize: isMobile ? 32 : 40,
                    lineHeight: 1.1,
                    fontFamily: 'monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatMoney(heroAmountCents)}
                </Text>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.06em' }}
                >
                  {heroCaption}
                </Text>
                {isCreditCompleted && invoice.dueDate && (
                  <Text size="xs" fw={600} c="amber" mt={2}>
                    Payment Due by {invoice.dueDate}
                  </Text>
                )}
              </Stack>

              <SimpleGrid
                cols={2}
                spacing={0}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--mantine-radius-default)',
                  overflow: 'hidden',
                }}
              >
                <Box p="sm" style={{ borderRight: '1px solid var(--border)' }}>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Method
                  </Text>
                  <Text size="sm" fw={600} c="var(--text-primary)" mt={2}>
                    {methodLabel}
                  </Text>
                </Box>
                <Box p="sm">
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Cashier
                  </Text>
                  <Text size="sm" fw={600} c="var(--text-primary)" mt={2}>
                    {invoice.cashierName}
                  </Text>
                </Box>
              </SimpleGrid>

              {invoice.customerName && (
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed">
                    Customer
                  </Text>
                  <Text size="xs" fw={600} c="var(--text-primary)">
                    {invoice.customerName}
                  </Text>
                </Group>
              )}

              {invoice.splitPayments && invoice.splitPayments.length > 0 && (
                <Stack gap={2}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Split Breakdown
                  </Text>
                  {invoice.splitPayments.map((sp) => (
                    <Group key={sp.id} justify="space-between" align="center">
                      <Text size="xs" c="dimmed">
                        {sp.method.toUpperCase()}
                        {sp.method === PAYMENT_METHODS.CARD && (sp.cardLast4 || sp.reference)
                          ? ` (•••• ${sp.cardLast4 || sp.reference})`
                          : ''}
                      </Text>
                      <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
                        {formatMoney(sp.amountCents)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Footer Actions on Confirmation Card */}
          <Box
            style={{
              padding: regionPadding,
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <Stack gap="xs">
              <Group gap="xs" wrap="nowrap" align="stretch">
                <Button
                  style={{
                    flex: 1,
                    height: isMobile ? 54 : 48,
                    fontSize: 16,
                    fontWeight: 700,
                    borderRadius: 'var(--mantine-radius-default)',
                  }}
                  size="lg"
                  color="green"
                  leftSection={<IconPlus size={18} />}
                  onClick={() => startNextSale()}
                >
                  New Sale
                </Button>

                {showReprintAction && (
                  <Tooltip label="View receipt" disabled={isMobile}>
                    <ActionIcon
                      variant="outline"
                      color="gray"
                      size={isMobile ? 44 : 48}
                      radius="var(--mantine-radius-default)"
                      aria-label="View receipt"
                      onClick={() => onOpenDocumentPreview(invoice, 'receipt')}
                    >
                      <IconPrinter size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {showInvoiceAction && (
                  <Tooltip label="View invoice" disabled={isMobile}>
                    <ActionIcon
                      variant="outline"
                      color="gray"
                      size={isMobile ? 44 : 48}
                      radius="var(--mantine-radius-default)"
                      aria-label="View invoice"
                      onClick={() => onOpenDocumentPreview(invoice, 'invoice')}
                    >
                      <IconFileText size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              <Text size="xs" c="dimmed" ta="center" style={{ fontSize: 11 }} visibleFrom="sm">
                Press <strong>N</strong> or <strong>↵</strong> for next sale
                {showInvoiceAction && (
                  <>
                    {' '}
                    · <strong>P</strong> to print invoice
                  </>
                )}
              </Text>
            </Stack>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        radius="var(--mantine-radius-default)"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable Upper Region */}
        <Box
          className="no-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: regionPadding,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <Stack gap="xs">
            {/* 1. Subtotal Line */}
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Subtotal
              </Text>
              <Text size="sm" fw={700} style={{ fontFamily: 'monospace' }}>
                {formatMoney(subtotalCents)}
              </Text>
            </Group>

            {/* 2. Collapsible Order Discount Control */}
            {!showDiscountInput && discountCents === 0 ? (
              <Group justify="space-between" align="center" py={2}>
                <Text size="xs" c="dimmed">
                  Order Discount
                </Text>
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  leftSection={<IconTag size={15} />}
                  disabled={isCartEmpty}
                  onClick={() => setShowDiscountInput(true)}
                  style={{
                    height: 34,
                    fontSize: 12,
                    fontWeight: 600,
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                >
                  + Add discount
                </Button>
              </Group>
            ) : (
              <Paper
                p="xs"
                withBorder
                opacity={isCartEmpty ? 0.5 : 1}
                style={{
                  pointerEvents: isCartEmpty ? 'none' : 'auto',
                  backgroundColor: 'light-dark(var(--mantine-color-red-0), rgba(239, 68, 68, 0.1))',
                  borderColor: 'light-dark(var(--mantine-color-red-3), rgba(239, 68, 68, 0.3))',
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Group gap={6} align="center">
                      <IconTag size={16} color="var(--mantine-color-red-6)" />
                      <Text
                        size="xs"
                        fw={700}
                        c="red.6"
                        tt="uppercase"
                        style={{ letterSpacing: '0.04em', fontSize: 11 }}
                      >
                        ORDER DISCOUNT
                      </Text>
                    </Group>

                    <Group gap={6}>
                      <SegmentedToggle
                        size="sm"
                        color="red"
                        value={discountMode}
                        onChange={(val) => {
                          const newMode = val as 'percentage' | 'amount';
                          setDiscountMode(newMode);
                          if (
                            newMode === 'percentage' &&
                            typeof discountInput === 'number' &&
                            discountInput > 100
                          ) {
                            setDiscountInput(100);
                          }
                        }}
                        data={[
                          { label: '%', value: 'percentage' },
                          { label: 'Rs.', value: 'amount' },
                        ]}
                        style={{ width: 100 }}
                      />
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          setDiscountInput('');
                          setShowDiscountInput(false);
                          setDiscount(0, null, 0);
                        }}
                        style={{ width: 32, height: 32 }}
                      >
                        <IconX size={15} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
                    <AmountInput
                      size="sm"
                      mode={discountMode}
                      onModeChange={setDiscountMode}
                      value={discountInput}
                      onChange={(v) => {
                        setHasEditedDiscount(true);
                        setDiscountInput(v);
                      }}
                      maxAmount={subtotalCents > 0 ? Math.round(subtotalCents / 100) : 0}
                      style={{ flex: 5, minWidth: 110 }}
                    />

                    <Text
                      size="sm"
                      fw={700}
                      c="red.7"
                      ta="right"
                      style={{ fontFamily: 'monospace', flex: 3, minWidth: 0 }}
                    >
                      - {formatMoney(calculatedDiscountCents)}
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            )}

            {/* 3. Divider */}
            <Divider my={4} color="var(--border-strong)" />

            {/* 4. Total Due Hero Section */}
            <Box py={2}>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                ta="right"
                style={{ fontSize: 11, letterSpacing: '0.04em' }}
              >
                TOTAL DUE
              </Text>
              <Text
                fw={800}
                ta="right"
                c={isCredit ? 'amber.7' : 'blue.6'}
                style={{
                  fontSize: 34,
                  fontFamily: 'monospace',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatMoney(totalCents)}
              </Text>
            </Box>

            {/* 5. Pay Now / Credit Sale Segmented Control */}
            <Tooltip
              label={
                isMobile
                  ? 'Credit requires attaching a customer first'
                  : 'Credit requires attaching a customer first (F3)'
              }
              disabled={Boolean(customerId)}
              position="top"
            >
              <Box>
                <SegmentedToggle
                  fullWidth
                  size="md"
                  value={isCredit ? 'credit' : 'pay_now'}
                  onChange={(val) => {
                    if (val === 'credit') {
                      if (!customerId) return;
                      changeIsCredit(true);
                    } else {
                      changeIsCredit(false);
                    }
                  }}
                  data={[
                    { label: 'Pay Now', value: 'pay_now' },
                    {
                      label: 'Credit Sale',
                      value: 'credit',
                      disabled: !customerId,
                    },
                  ]}
                  color={isCredit ? 'amber' : 'blue'}
                />
              </Box>
            </Tooltip>

            <Divider my={4} color="var(--border-strong)" />

            {/* 6. CREDIT MODE: In-System Amber Credit Banner & Due Date */}
            {isCredit && (
              <Stack gap="xs">
                <Paper
                  p="xs"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'light-dark(var(--mantine-color-amber-4), rgba(245, 159, 0, 0.4))',
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                >
                  <Stack gap={6}>
                    <Group justify="space-between" align="center">
                      <Group gap={6} align="center">
                        <IconAlertCircle size={15} color="var(--mantine-color-amber-7)" />
                        <Text
                          size="xs"
                          fw={700}
                          c="amber.8"
                          tt="uppercase"
                          style={{ letterSpacing: '0.04em', fontSize: 11 }}
                        >
                          CREDIT SALE PREVIEW
                        </Text>
                      </Group>
                      {(customerBalanceCents || 0) > 0 && (
                        <Badge size="xs" color="amber" variant="light">
                          BAL: {formatMoney(customerBalanceCents)}
                        </Badge>
                      )}
                    </Group>

                    <Text size="xs" c="var(--text-primary)" lh={1.4}>
                      This sale will be added to{' '}
                      <Text span fw={700}>
                        {customerName || 'Customer'}
                      </Text>
                      's credit balance.
                    </Text>

                    <Group
                      justify="space-between"
                      align="center"
                      mt={2}
                      style={{
                        borderTop:
                          '1px dashed light-dark(var(--mantine-color-amber-3), rgba(245, 159, 0, 0.3))',
                        paddingTop: 6,
                      }}
                    >
                      <Text
                        size="xs"
                        fw={700}
                        c="dimmed"
                        tt="uppercase"
                        style={{ letterSpacing: '0.04em', fontSize: 10 }}
                      >
                        RESULTING NEW BALANCE
                      </Text>
                      <Text fw={800} c="amber.8" style={{ fontFamily: 'monospace', fontSize: 14 }}>
                        {formatMoney(newCreditBalanceCents)}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                <Stack gap={4} mt={2}>
                  <Group justify="space-between" align="center">
                    <Text
                      size="xs"
                      fw={700}
                      c="dimmed"
                      tt="uppercase"
                      style={{ fontSize: 11, letterSpacing: '0.05em' }}
                    >
                      PAYMENT DUE DATE
                    </Text>
                    <Button
                      size="xs"
                      variant="outline"
                      color={dueDate ? 'gray' : 'blue'}
                      leftSection={dueDate ? <IconX size={12} /> : <IconCalendar size={12} />}
                      onClick={() =>
                        changeDueDate(dueDate ? null : defaultDueDate.toISOString().split('T')[0])
                      }
                      style={{
                        height: 30,
                        fontSize: 11,
                        fontWeight: 600,
                        paddingLeft: 8,
                        paddingRight: 8,
                      }}
                    >
                      {dueDate ? 'Clear (Open-ended)' : 'Set 30-day default'}
                    </Button>
                  </Group>

                  <DateInput
                    placeholder="Open-ended (No due date)"
                    size="sm"
                    value={dueDate ? new Date(dueDate) : null}
                    onChange={(d: Date | string | null) => {
                      if (!d) {
                        changeDueDate(null);
                      } else if (typeof d === 'string') {
                        changeDueDate(d);
                      } else {
                        changeDueDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    popoverProps={{ width: 'target', position: 'bottom-start' }}
                    styles={{
                      input: {
                        borderRadius: 'var(--mantine-radius-default)',
                        fontFamily: 'monospace',
                      },
                      month: {
                        width: '100%',
                      },
                      calendarHeader: {
                        maxWidth: '100%',
                      },
                    }}
                  />
                </Stack>
              </Stack>
            )}

            {/* 7. PAY NOW MODE: Collapsible Payment Method & Tendered Inputs */}
            {!isCredit && (
              <Stack gap="xs">
                <Box mt={2}>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    mb={6}
                    tt="uppercase"
                    style={{ fontSize: 11, letterSpacing: '0.05em' }}
                  >
                    PAYMENT METHOD
                  </Text>
                  <SimpleGrid cols={2} spacing={isMobile ? 10 : 8}>
                    {paymentTiles.map((tile) => {
                      const Icon = tile.icon;
                      const isSelected = paymentMethod === tile.id;

                      const tileNode = (
                        <UnstyledButton
                          key={tile.id}
                          disabled={tile.disabled}
                          onClick={() =>
                            !tile.disabled && changePaymentMethod(tile.id as PaymentMethod)
                          }
                          style={{
                            height: isMobile ? 54 : 48,
                            borderRadius: 'var(--mantine-radius-default)',
                            border: isSelected
                              ? '1.5px solid var(--mantine-color-blue-5)'
                              : '1px solid var(--border)',
                            backgroundColor: isSelected
                              ? 'var(--mantine-color-blue-light)'
                              : 'var(--bg-card)',
                            opacity: tile.disabled ? 0.45 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: tile.disabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Group gap={8} align="center">
                            <Icon
                              size={18}
                              color={
                                isSelected ? 'var(--mantine-color-blue-6)' : 'var(--text-muted)'
                              }
                            />
                            <Text
                              size="sm"
                              fw={isSelected ? 700 : 600}
                              c={isSelected ? 'blue.7' : undefined}
                              style={{ fontSize: 14 }}
                            >
                              {tile.label}
                            </Text>
                          </Group>
                        </UnstyledButton>
                      );

                      return tile.disabled && tile.tooltip ? (
                        <Tooltip key={tile.id} label={tile.tooltip} position="top">
                          {tileNode}
                        </Tooltip>
                      ) : (
                        tileNode
                      );
                    })}
                  </SimpleGrid>
                </Box>

                {/* Contextual Payment Controls (Cash / Card / Online / Split) */}
                <Box mt={4}>
                  {paymentMethod === PAYMENT_METHODS.CASH && (
                    <Stack gap="xs">
                      <Text
                        size="xs"
                        fw={700}
                        c="dimmed"
                        tt="uppercase"
                        style={{ fontSize: 11, letterSpacing: '0.05em' }}
                      >
                        Cash Received
                      </Text>

                      <AmountInput
                        ref={cashInputRef}
                        placeholder="0"
                        mode="amount"
                        size="lg"
                        value={tenderedRupees}
                        onChange={(val) => setTenderedRupees(val)}
                      />

                      {/* Quick Tender Chips */}
                      <Group gap={8} grow>
                        {quickChips.slice(0, 2).map((amt, idx) => (
                          <Button
                            key={amt}
                            size="sm"
                            variant={idx === 0 ? 'light' : 'outline'}
                            color={idx === 0 ? 'blue' : 'gray'}
                            radius="var(--mantine-radius-default)"
                            onClick={() => setTenderedRupees(amt)}
                            style={{
                              height: isMobile ? 48 : 42,
                              fontWeight: 600,
                              fontSize: 13,
                              fontFamily: 'monospace',
                            }}
                          >
                            {idx === 0
                              ? `Exact · Rs. ${amt.toLocaleString()}`
                              : `Rs. ${amt.toLocaleString()}`}
                          </Button>
                        ))}
                      </Group>

                      {/* Change Due / Short By Display Row */}
                      <Group justify="space-between" align="center" py={4}>
                        <Text size="sm" fw={600} c="dimmed">
                          {isCashShort ? 'Short by' : 'Change due'}
                        </Text>
                        <Text
                          size="lg"
                          fw={800}
                          c={isCashShort ? 'amber.7' : changeDueCents > 0 ? 'green.6' : 'dimmed'}
                          style={{ fontFamily: 'monospace', fontSize: 18 }}
                        >
                          {isCashShort ? formatMoney(shortByCents) : formatMoney(changeDueCents)}
                        </Text>
                      </Group>
                    </Stack>
                  )}

                  {paymentMethod === PAYMENT_METHODS.CARD && (
                    <Stack gap="xs">
                      <Text
                        size="xs"
                        fw={700}
                        c="dimmed"
                        tt="uppercase"
                        style={{ fontSize: 11, letterSpacing: '0.05em' }}
                      >
                        Card Amount Received
                      </Text>

                      <AmountInput
                        placeholder={Math.round(totalCents / 100).toString()}
                        mode="amount"
                        size="lg"
                        value={
                          tenderedRupees === '' ? Math.round(totalCents / 100) : tenderedRupees
                        }
                        onChange={(val) => setTenderedRupees(val)}
                      />

                      {/* Exact amount suggestion for Card */}
                      <Button
                        size="sm"
                        variant="light"
                        color="blue"
                        radius="var(--mantine-radius-default)"
                        onClick={() => setTenderedRupees(Math.round(totalCents / 100))}
                        style={{
                          height: isMobile ? 48 : 42,
                          fontWeight: 600,
                          fontSize: 13,
                          fontFamily: 'monospace',
                        }}
                      >
                        Exact Total · Rs. {Math.round(totalCents / 100).toLocaleString()}
                      </Button>

                      <TextInput
                        label="Card Last 4 Digits"
                        placeholder="e.g. 4321"
                        size="sm"
                        leftSection={<IconCreditCard size={16} />}
                        maxLength={4}
                        inputMode="numeric"
                        value={cardRef}
                        error={
                          cardRef && cardRef.trim().length > 0 && cardRef.trim().length < 4
                            ? 'Please enter all 4 digits'
                            : undefined
                        }
                        onChange={(e) => {
                          const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 4);
                          changeCardRef(val);
                        }}
                        description="Enter the last 4 digits on the customer's card to complete payment."
                      />

                      {isCardShort && (
                        <Group justify="space-between" align="center" py={2}>
                          <Text size="sm" fw={600} c="dimmed">
                            Short by
                          </Text>
                          <Text size="sm" fw={800} c="amber.7" style={{ fontFamily: 'monospace' }}>
                            {formatMoney(shortByCents)}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  )}

                  {paymentMethod === PAYMENT_METHODS.ONLINE && (
                    <Stack gap="xs">
                      <TextInput
                        label="Transaction Ref / Slip #"
                        placeholder="e.g. TRX-987654"
                        size="sm"
                        value={onlineRef}
                        onChange={(e) => changeOnlineRef(e.currentTarget.value)}
                      />
                      <TextInput
                        label="Bank / Payment App Note"
                        placeholder="e.g. Commercial Bank QR"
                        size="sm"
                        value={onlineNote}
                        onChange={(e) => changeOnlineNote(e.currentTarget.value)}
                      />
                    </Stack>
                  )}

                  {paymentMethod === PAYMENT_METHODS.SPLIT && (
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" fw={700} c="dimmed">
                          SPLIT ALLOCATIONS
                        </Text>
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconPlus size={12} />}
                          onClick={handleAddSplitRow}
                        >
                          Add Row
                        </Button>
                      </Group>

                      {splitPayments.map((sp) => (
                        <Paper
                          key={sp.id}
                          p="xs"
                          withBorder
                          radius="var(--mantine-radius-default)"
                          bg="var(--mantine-color-body)"
                        >
                          <Stack gap="xs">
                            <Group gap="xs" wrap={isMobile ? 'wrap' : 'nowrap'}>
                              <SegmentedToggle
                                size="xs"
                                value={sp.method}
                                onChange={(v) =>
                                  handleUpdateSplitRow(sp.id, 'method', v as PaymentMethod)
                                }
                                data={[
                                  { label: 'Cash', value: PAYMENT_METHODS.CASH },
                                  { label: 'Card', value: PAYMENT_METHODS.CARD, disabled: false },
                                  {
                                    label: 'Online',
                                    value: PAYMENT_METHODS.ONLINE,
                                    disabled: true,
                                  },
                                ]}
                                style={{ flex: 1, minWidth: 0 }}
                              />
                              <AmountInput
                                size="xs"
                                placeholder="Amount"
                                mode="amount"
                                value={Math.round(sp.amountCents / 100)}
                                onChange={(v) =>
                                  handleUpdateSplitRow(
                                    sp.id,
                                    'amountCents',
                                    typeof v === 'number' ? v * 100 : 0
                                  )
                                }
                                style={{ flex: 1, minWidth: 110 }}
                              />
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                size="xs"
                                onClick={() => handleRemoveSplitRow(sp.id)}
                                style={{ flexShrink: 0 }}
                                aria-label="Remove split row"
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>

                            {sp.method === PAYMENT_METHODS.CARD && (
                              <TextInput
                                size="xs"
                                placeholder="Card Last 4 Digits (e.g. 4321)"
                                leftSection={<IconCreditCard size={14} />}
                                maxLength={4}
                                inputMode="numeric"
                                value={sp.cardLast4 || ''}
                                error={
                                  sp.cardLast4 &&
                                  sp.cardLast4.trim().length > 0 &&
                                  sp.cardLast4.trim().length < 4
                                    ? '4 digits required'
                                    : undefined
                                }
                                onChange={(e) => {
                                  const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 4);
                                  handleUpdateSplitRow(sp.id, 'cardLast4', val);
                                }}
                              />
                            )}
                          </Stack>
                        </Paper>
                      ))}

                      <Group justify="space-between" align="center" py={4}>
                        <Text size="xs" fw={700} c="dimmed">
                          REMAINING TO ALLOCATE
                        </Text>
                        <Text
                          size="sm"
                          fw={700}
                          c={splitRemainingCents === 0 ? 'green.6' : 'amber.7'}
                          style={{ fontFamily: 'monospace' }}
                        >
                          {formatMoney(splitRemainingCents)}
                        </Text>
                      </Group>
                    </Stack>
                  )}
                </Box>
              </Stack>
            )}

            {/* 8. ORDER NOTE */}
            <Box mt={4}>
              <Group justify="space-between" align="center" mb={showNotes ? 6 : 0}>
                <Group gap="xs" align="center">
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ fontSize: 11, letterSpacing: '0.05em' }}
                  >
                    Order Note
                  </Text>
                  {showNotes && (
                    <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
                      Optional
                    </Text>
                  )}
                </Group>

                <Switch
                  size="sm"
                  color="blue"
                  checked={showNotes}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setShowNotes(checked);
                    if (!checked) {
                      changeNotes('');
                    }
                  }}
                  aria-label="Toggle Order Note"
                />
              </Group>

              {showNotes && (
                <Textarea
                  placeholder="Add order note or customer instructions..."
                  size="sm"
                  minRows={2}
                  maxRows={4}
                  autosize
                  value={notes || ''}
                  onChange={(e) => changeNotes(e.currentTarget.value)}
                  styles={{
                    input: {
                      fontSize: isMobile ? 16 : 13,
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--mantine-radius-default)',
                    },
                  }}
                />
              )}
            </Box>

            {/* 9. PRINT / Document Selection Control */}
            <Box mt={4}>
              <Group justify="space-between" align="center" mb={6}>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ fontSize: 11, letterSpacing: '0.05em' }}
                >
                  PRINT
                </Text>
                <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
                  {documentSelection === 'none'
                    ? 'No physical printout'
                    : documentSelection === 'receipt'
                      ? '80mm thermal receipt'
                      : isCredit
                        ? 'A4 unpaid invoice'
                        : 'A4 paid invoice'}
                </Text>
              </Group>

              <SimpleGrid cols={isCredit ? 2 : 3} spacing={8}>
                {printOptions.map((doc) => {
                  const isSelected = documentSelection === doc.value;
                  return (
                    <UnstyledButton
                      key={doc.value}
                      onClick={() => changeDocumentSelection(doc.value)}
                      style={{
                        height: isMobile ? 48 : 44,
                        borderRadius: 'var(--mantine-radius-default)',
                        border: isSelected
                          ? '1.5px solid var(--mantine-color-blue-5)'
                          : '1px solid var(--border)',
                        backgroundColor: isSelected
                          ? 'var(--mantine-color-blue-light)'
                          : 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                      }}
                    >
                      <Text
                        size="sm"
                        fw={isSelected ? 700 : 600}
                        c={isSelected ? 'blue.7' : undefined}
                        style={{ fontSize: 13, lineHeight: 1.2 }}
                      >
                        {doc.label}
                      </Text>
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Stack>
        </Box>

        {/* Sticky Action Footer */}
        <Box
          style={{
            padding: regionPadding,
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <Button
            fullWidth
            size="lg"
            color={isCredit ? (confirmCreditRequired ? 'orange' : 'amber') : 'blue'}
            disabled={isButtonDisabled}
            loading={isProcessing}
            onClick={handlePrimaryAction}
            style={{
              height: 56,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 'var(--mantine-radius-default)',
              opacity: isButtonDisabled ? 0.6 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            {isCartEmpty
              ? 'Add items to begin'
              : isCredit
                ? confirmCreditRequired
                  ? `Confirm Credit Sale · New Bal ${formatMoney(newCreditBalanceCents)}${checkoutKeyHint}`
                  : `Issue on Credit · ${formatMoney(totalCents)}${checkoutKeyHint}`
                : isCashShort || isCardShort
                  ? `Short by ${formatMoney(shortByCents)}`
                  : isCardDigitsMissing || isSplitCardDigitsMissing
                    ? 'Enter Card Last 4 Digits'
                    : `Complete · ${formatMoney(totalCents)}${checkoutKeyHint}`}
          </Button>
          <Text size="xs" c="dimmed" ta="center" mt={4} style={{ fontSize: 11 }}>
            {confirmCreditRequired
              ? isMobile
                ? 'Customer has existing debt. Tap again to confirm credit sale.'
                : 'Customer has existing debt. Press F2 or click again to confirm credit sale.'
              : isButtonDisabled
                ? isCashShort
                  ? 'Enter tendered cash amount to complete'
                  : isCardDigitsMissing || isSplitCardDigitsMissing
                    ? 'Card last 4 digits required to complete payment'
                    : isSplitIncomplete
                      ? 'Allocate the full total across split payments'
                      : 'Complete disabled'
                : `${printConsequenceText} · Press F2`}
          </Text>
        </Box>
      </Paper>
    );
  })
);
