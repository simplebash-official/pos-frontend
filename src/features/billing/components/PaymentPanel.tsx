import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Divider,
  Button,
  TextInput,
  SegmentedControl,
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
  IconShare,
  IconRotate,
} from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { usePrint } from '../hooks/usePrint';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { formatMoney } from '@/shared/lib/money';
import { AmountInput } from '@/shared/components/AmountInput';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { SplitPaymentDetail } from '../types';
import { notifications } from '@mantine/notifications';

export interface PaymentPanelProps {
  isProcessing: boolean;
  onCompleteCheckout: () => void;
  onOpenOrderDiscount?: () => void;
}

export function PaymentPanel({ isProcessing, onCompleteCheckout }: PaymentPanelProps) {
  const {
    items,
    subtotalCents,
    discountCents,
    totalCents,
    setDiscount,
    paymentMethod,
    changePaymentMethod,
    splitPayments,
    changeSplitPayments,
    splitRemainingCents,
    isCredit,
    changeIsCredit,
    cardRef,
    changeCardRef,
    onlineRef,
    changeOnlineRef,
    onlineNote,
    changeOnlineNote,
    customerId,
    customerName,
    customerBalanceCents,
    documentSelection,
    changeDocumentSelection,
    dueDate,
    changeDueDate,
    changeTenderedAmountCents,
    completedSale,
    startNextSale,
  } = useCart();

  const { printReceipt, previewInvoiceDoc } = usePrint();

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

  // Guardrail 2-step inline confirmation state
  const [confirmCreditRequired, setConfirmCreditRequired] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New Sale CTA button ref for auto-focusing in confirmation mode
  const newSaleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (completedSale) {
      setTimeout(() => newSaleButtonRef.current?.focus(), 50);
    }
  }, [completedSale]);

  // Calculate order discount cents based on mode & input
  const calculatedDiscountCents = useMemo(() => {
    if (!showDiscountInput || typeof discountInput !== 'number' || discountInput <= 0 || subtotalCents <= 0) {
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
    setDiscount(calculatedDiscountCents);
  }, [calculatedDiscountCents, setDiscount]);

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

  // Tendered cash state in rupees
  const [tenderedRupees, setTenderedRupees] = useState<number | ''>('');
  const cashInputRef = useRef<HTMLInputElement>(null);

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

  // Focus cash input on payment method change to Cash
  useEffect(() => {
    if (paymentMethod === PAYMENT_METHODS.CASH && !isCredit && !completedSale) {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    }
  }, [paymentMethod, isCredit, completedSale]);

  // Sync tendered amount to Redux store
  useEffect(() => {
    const cents = typeof tenderedRupees === 'number' ? Math.round(tenderedRupees * 100) : 0;
    changeTenderedAmountCents(cents);
  }, [tenderedRupees, changeTenderedAmountCents]);

  // Clear tendered amount when switching to credit mode
  useEffect(() => {
    if (isCredit) {
      setTenderedRupees('');
    }
  }, [isCredit]);

  // Cash calculation
  const tenderedCents = typeof tenderedRupees === 'number' ? Math.round(tenderedRupees * 100) : 0;
  const changeDueCents = Math.max(0, tenderedCents - totalCents);
  const shortByCents = totalCents - tenderedCents;
  const isCashShort = paymentMethod === PAYMENT_METHODS.CASH && tenderedCents < totalCents;

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
    field: 'method' | 'amountCents',
    value: PaymentMethod | number
  ) => {
    const updated = splitPayments.map((sp) => (sp.id === id ? { ...sp, [field]: value } : sp));
    changeSplitPayments(updated);
  };

  const handleRemoveSplitRow = (id: string) => {
    changeSplitPayments(splitPayments.filter((sp) => sp.id !== id));
  };

  // Complete button disabled logic
  const isCartEmpty = items.length === 0;
  const isButtonDisabled =
    isCartEmpty ||
    isProcessing ||
    (paymentMethod === PAYMENT_METHODS.CASH && isCashShort && !isCredit) ||
    (paymentMethod === PAYMENT_METHODS.SPLIT && isSplitIncomplete && !isCredit);

  // Consequence helper label
  const printConsequenceText = useMemo(() => {
    if (documentSelection === 'receipt') return 'will print 80mm receipt';
    if (documentSelection === 'invoice') return 'will print A4 invoice';
    if (documentSelection === 'both') return 'will print receipt & invoice';
    return 'no document will print';
  }, [documentSelection]);

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

  const paymentTiles = [
    { id: PAYMENT_METHODS.CASH, label: 'Cash', icon: IconCash, disabled: false },
    {
      id: PAYMENT_METHODS.CARD,
      label: 'Card',
      icon: IconCreditCard,
      disabled: true,
      tooltip: 'Card integration coming soon',
    },
    { id: PAYMENT_METHODS.ONLINE, label: 'Online', icon: IconWorld, disabled: false },
    { id: PAYMENT_METHODS.SPLIT, label: 'Split', icon: IconArrowsSplit, disabled: false },
  ];

  const newCreditBalanceCents = (customerBalanceCents || 0) + totalCents;

  // Render Confirmation Card if sale was completed
  if (completedSale) {
    const { invoice, changeDueCents: saleChangeCents } = completedSale;
    const isCreditCompleted = invoice.isCredit || invoice.status === 'pending';

    let printStatusText = 'No print requested';
    if (invoice.documentSelection === 'receipt') printStatusText = 'Receipt sent to printer';
    else if (invoice.documentSelection === 'invoice') printStatusText = 'Invoice sent to printer';
    else if (invoice.documentSelection === 'both') printStatusText = 'Receipt & Invoice sent to printer';

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
        <Box style={{ flex: 1, overflowY: 'auto', padding: regionPadding }}>
          <Stack gap="md">
            {/* Header Badge */}
            <Group justify="space-between" align="center">
              <Group gap="xs" align="center">
                <ThemeIcon
                  size="md"
                  radius="xl"
                  color={isCreditCompleted ? 'amber' : 'green'}
                  variant="filled"
                >
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

            {/* BIG HERO NUMBER CARD (Priority #1) */}
            {isCreditCompleted ? (
              <Paper
                p="md"
                radius="var(--mantine-radius-default)"
                style={{
                  backgroundColor: 'var(--mantine-color-amber-light)',
                  border: '1px solid var(--mantine-color-amber-filled)',
                  textAlign: 'center',
                }}
              >
                <Text
                  size="xs"
                  fw={700}
                  c="amber.9"
                  tt="uppercase"
                  style={{ letterSpacing: '0.06em' }}
                >
                  BALANCE DUE
                </Text>
                <Text
                  fw={800}
                  c="amber.9"
                  style={{
                    fontSize: 34,
                    lineHeight: 1.1,
                    fontFamily: 'monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatMoney(invoice.totalCents)}
                </Text>
                {invoice.dueDate && (
                  <Text size="xs" fw={600} c="amber.8" mt={4}>
                    Payment Due by {invoice.dueDate}
                  </Text>
                )}
              </Paper>
            ) : saleChangeCents > 0 ? (
              <Paper
                p="md"
                radius="var(--mantine-radius-default)"
                style={{
                  backgroundColor: 'var(--mantine-color-green-light)',
                  border: '1px solid var(--mantine-color-green-filled)',
                  textAlign: 'center',
                }}
              >
                <Text
                  size="xs"
                  fw={700}
                  c="green.9"
                  tt="uppercase"
                  style={{ letterSpacing: '0.08em' }}
                >
                  CHANGE TO GIVE
                </Text>
                <Text
                  fw={800}
                  c="green.9"
                  style={{
                    fontSize: 36,
                    lineHeight: 1.1,
                    fontFamily: 'monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatMoney(saleChangeCents)}
                </Text>
              </Paper>
            ) : invoice.paymentMethod === PAYMENT_METHODS.CASH ? (
              <Paper
                p="md"
                radius="var(--mantine-radius-default)"
                style={{
                  backgroundColor: 'var(--mantine-color-blue-light)',
                  border: '1px solid var(--mantine-color-blue-filled)',
                  textAlign: 'center',
                }}
              >
                <Text size="xs" fw={700} c="blue.9" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                  EXACT CASH RECEIVED
                </Text>
                <Text fw={700} size="sm" c="blue.8" mt={2}>
                  No change to hand back
                </Text>
              </Paper>
            ) : (
              <Paper
                p="md"
                radius="var(--mantine-radius-default)"
                style={{
                  backgroundColor: 'var(--mantine-color-blue-light)',
                  border: '1px solid var(--mantine-color-blue-filled)',
                  textAlign: 'center',
                }}
              >
                <Text size="xs" fw={700} c="blue.9" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                  PAID VIA {invoice.paymentMethod.toUpperCase()}
                </Text>
                <Text fw={700} size="sm" c="blue.8" mt={2}>
                  Paid in full ({formatMoney(invoice.totalCents)}) · No change
                </Text>
              </Paper>
            )}

            {/* Status Line */}
            <Stack gap={4}>
              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  Status
                </Text>
                <Text size="xs" fw={600} c="var(--text-primary)">
                  {isCreditCompleted
                    ? `On Account · INV-${invoice.invoiceNumber}`
                    : `Paid in Full · ${invoice.paymentMethod.toUpperCase()} · INV-${invoice.invoiceNumber}`}
                </Text>
              </Group>

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

              {/* Split payment breakdown lines */}
              {invoice.splitPayments && invoice.splitPayments.length > 0 && (
                <Stack gap={2} mt={4}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Split Breakdown
                  </Text>
                  {invoice.splitPayments.map((sp) => (
                    <Group key={sp.id} justify="space-between" align="center">
                      <Text size="xs" c="dimmed">
                        {sp.method.toUpperCase()}
                      </Text>
                      <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
                        {formatMoney(sp.amountCents)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider color="var(--border-strong)" />

            {/* Print status line */}
            <Group justify="space-between" align="center">
              <Group gap={6} align="center">
                <IconPrinter size={16} color="var(--text-muted)" />
                <Text size="xs" c="dimmed">
                  {printStatusText}
                </Text>
              </Group>
              <Button
                size="xs"
                variant="subtle"
                color="blue"
                leftSection={<IconRotate size={13} />}
                onClick={() => printReceipt(invoice)}
              >
                Reprint
              </Button>
            </Group>
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
            {/* Primary focus button: New Sale (N / Enter) */}
            <Button
              ref={newSaleButtonRef}
              fullWidth
              size="lg"
              color="blue"
              leftSection={<IconPlus size={18} />}
              onClick={() => startNextSale()}
              style={{
                height: isMobile ? 54 : 48,
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 'var(--mantine-radius-default)',
              }}
            >
              New Sale (N)
            </Button>

            {/* Secondary row */}
            <Group gap="xs" grow>
              <Button
                size="xs"
                variant="outline"
                color="gray"
                leftSection={<IconPrinter size={14} />}
                onClick={() => printReceipt(invoice)}
              >
                Reprint (R)
              </Button>
              <Button
                size="xs"
                variant="outline"
                color="violet"
                leftSection={<IconFileText size={14} />}
                onClick={() => previewInvoiceDoc(invoice)}
              >
                Preview (I)
              </Button>
              <Button
                size="xs"
                variant="light"
                color="gray"
                leftSection={<IconShare size={14} />}
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(`Invoice #${invoice.invoiceNumber} - Total: ${formatMoney(invoice.totalCents)}`);
                    notifications.show({
                      title: 'Copied',
                      message: 'Invoice info copied to clipboard',
                      color: 'green',
                    });
                  }
                }}
              >
                Share
              </Button>
            </Group>

            {!isMobile && (
              <Text size="xs" c="dimmed" ta="center" style={{ fontSize: 11 }}>
                Press <strong>N</strong> or <strong>Enter</strong> to start next sale · <strong>R</strong> to reprint · <strong>I</strong> for preview
              </Text>
            )}
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
      <Box style={{ flex: 1, overflowY: 'auto', padding: regionPadding }}>
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
                size="xs"
                variant="subtle"
                color="red"
                leftSection={<IconTag size={13} />}
                disabled={isCartEmpty}
                onClick={() => setShowDiscountInput(true)}
                style={{ height: 26, fontSize: 11 }}
              >
                + Add discount
              </Button>
            </Group>
          ) : (
            <Paper
              p="xs"
              withBorder
              radius="md"
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
                    <IconTag size={15} color="var(--mantine-color-red-6)" />
                    <Text
                      size="xs"
                      fw={700}
                      c="red.6"
                      tt="uppercase"
                      style={{ letterSpacing: '0.04em' }}
                    >
                      ORDER DISCOUNT
                    </Text>
                  </Group>

                  <Group gap={4}>
                    <SegmentedControl
                      size="xs"
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
                      style={{ width: 90 }}
                      styles={{
                        root: { padding: 2, backgroundColor: 'light-dark(#ffffff, var(--bg-card))' },
                        label: { padding: '2px 8px', fontSize: 11, fontWeight: 700 },
                      }}
                    />
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        setDiscountInput('');
                        setShowDiscountInput(false);
                        setDiscount(0);
                      }}
                    >
                      <IconX size={13} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
                  <AmountInput
                    size="xs"
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
                fontSize: 32,
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
              <SegmentedControl
                fullWidth
                size="sm"
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
                radius="md"
                styles={{
                  root: {
                    backgroundColor: 'var(--bg-app)',
                    padding: 3,
                  },
                  label: {
                    fontWeight: 700,
                    fontSize: 12,
                  },
                }}
              />
            </Box>
          </Tooltip>

          <Divider my={4} color="var(--border-strong)" />

          {/* 6. CREDIT MODE: In-System Amber Credit Banner & Due Date */}
          {isCredit && (
            <Stack gap="xs">
              <Paper
                p="xs"
                radius="md"
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
                        style={{ letterSpacing: '0.04em' }}
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
                    style={{ fontSize: 10, letterSpacing: '0.06em' }}
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
                      height: 24,
                      fontSize: 10,
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
                  size="xs"
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
                  style={{ fontSize: 10, letterSpacing: '0.06em' }}
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
                          height: isMobile ? 52 : 42,
                          borderRadius: 'var(--mantine-radius-default)',
                          border: isSelected
                            ? '1px solid var(--mantine-color-blue-4)'
                            : '1px solid var(--border)',
                          backgroundColor: isSelected
                            ? 'var(--mantine-color-blue-light)'
                            : 'var(--bg-card)',
                          opacity: tile.disabled ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: tile.disabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Group gap={6} align="center">
                          <Icon
                            size={16}
                            color={isSelected ? 'var(--mantine-color-blue-6)' : 'var(--text-muted)'}
                          />
                          <Text
                            size="sm"
                            fw={isSelected ? 700 : 500}
                            c={isSelected ? 'blue.7' : undefined}
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
                      style={{ fontSize: 10, letterSpacing: '0.06em' }}
                    >
                      AMOUNT TENDERED (RS.)
                    </Text>

                    <AmountInput
                      ref={cashInputRef}
                      placeholder="0"
                      mode="amount"
                      size="md"
                      value={tenderedRupees}
                      onChange={(val) => setTenderedRupees(val)}
                    />

                    {/* Quick Tender Chips */}
                    <Group gap={6} grow>
                      {quickChips.slice(0, 2).map((amt) => (
                        <Button
                          key={amt}
                          size="xs"
                          variant="outline"
                          color="gray"
                          radius="var(--mantine-radius-default)"
                          onClick={() => setTenderedRupees(amt)}
                          style={{
                            height: isMobile ? 44 : 36,
                            fontWeight: 500,
                            fontFamily: 'monospace',
                          }}
                        >
                          Rs. {amt.toLocaleString()}
                        </Button>
                      ))}
                    </Group>

                    {/* Change Due / Short By Display Row */}
                    <Group justify="space-between" align="center" py={4}>
                      <Text size="sm" c="dimmed">
                        {isCashShort ? 'Short by' : 'Change due'}
                      </Text>
                      <Text
                        size="md"
                        fw={700}
                        c={isCashShort ? 'amber.7' : changeDueCents > 0 ? 'green.6' : 'dimmed'}
                        style={{ fontFamily: 'monospace' }}
                      >
                        {isCashShort ? formatMoney(shortByCents) : formatMoney(changeDueCents)}
                      </Text>
                    </Group>
                  </Stack>
                )}

                {paymentMethod === PAYMENT_METHODS.CARD && (
                  <TextInput
                    label="Card Reference / Last 4 Digits (Optional)"
                    placeholder="e.g. 4321"
                    size="sm"
                    value={cardRef}
                    onChange={(e) => changeCardRef(e.currentTarget.value)}
                  />
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
                      <Group key={sp.id} gap="xs" wrap={isMobile ? 'wrap' : 'nowrap'}>
                        <SegmentedControl
                          size="xs"
                          value={sp.method}
                          onChange={(v) =>
                            handleUpdateSplitRow(sp.id, 'method', v as PaymentMethod)
                          }
                          data={[
                            { label: 'Cash', value: PAYMENT_METHODS.CASH },
                            { label: 'Card', value: PAYMENT_METHODS.CARD, disabled: true },
                            { label: 'Online', value: PAYMENT_METHODS.ONLINE },
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
                        >
                          <IconTrash size={12} />
                        </ActionIcon>
                      </Group>
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

          {/* 8. PRINT / Document Selection Control */}
          <Box mt={4}>
            <Group justify="space-between" align="center" mb={6}>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ fontSize: 10, letterSpacing: '0.06em' }}
              >
                PRINT
              </Text>
              <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
                {documentSelection === 'receipt'
                  ? 'Default for walk-in'
                  : documentSelection === 'invoice'
                  ? 'Default for account'
                  : ''}
              </Text>
            </Group>

            <SimpleGrid cols={{ base: 2, lg: 4 }} spacing={6}>
              {(
                [
                  { label: 'Receipt (80mm)', value: 'receipt' },
                  { label: 'Invoice (A4)', value: 'invoice' },
                  { label: 'Both', value: 'both' },
                  { label: 'No print', value: 'none' },
                ] as const
              ).map((doc) => {
                const isSelected = documentSelection === doc.value;
                return (
                  <UnstyledButton
                    key={doc.value}
                    onClick={() => changeDocumentSelection(doc.value)}
                    style={{
                      height: isMobile ? 48 : 38,
                      borderRadius: 'var(--mantine-radius-default)',
                      border: isSelected
                        ? '1px solid var(--mantine-color-blue-4)'
                        : '1px solid var(--border)',
                      backgroundColor: isSelected
                        ? 'var(--mantine-color-blue-light)'
                        : 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <Text
                      size="xs"
                      fw={isSelected ? 700 : 500}
                      c={isSelected ? 'blue.7' : undefined}
                      style={{ fontSize: 11, lineHeight: 1.2 }}
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
            height: isMobile ? 56 : 52,
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
              : isCashShort
                ? `Short by ${formatMoney(shortByCents)}`
                : `Complete · ${formatMoney(totalCents)}${checkoutKeyHint}`}
        </Button>
        <Text size="xs" c="dimmed" ta="center" mt={4} style={{ fontSize: 11 }}>
          {confirmCreditRequired
            ? isMobile
              ? 'Customer has existing debt. Tap again to confirm credit sale.'
              : 'Customer has existing debt. Press F2 or click again to confirm credit sale.'
            : isButtonDisabled
              ? isCashShort
                ? `Enter tendered cash amount to complete`
                : 'Complete disabled'
              : `${printConsequenceText} · Press F2`}
        </Text>
      </Box>
    </Paper>
  );
}
