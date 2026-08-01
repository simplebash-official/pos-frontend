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
} from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { formatMoney } from '@/shared/lib/money';
import { AmountInput } from '@/shared/components/AmountInput';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import type { SplitPaymentDetail } from '../types';

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
  } = useCart();

  // Inline Order Discount State
  const [discountMode, setDiscountMode] = useState<'percentage' | 'amount'>('percentage');
  const [discountInput, setDiscountInput] = useState<number | ''>('');
  const [hasEditedDiscount, setHasEditedDiscount] = useState(false);

  // Guardrail 2-step inline confirmation state
  const [confirmCreditRequired, setConfirmCreditRequired] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate order discount cents based on mode & input
  const calculatedDiscountCents = useMemo(() => {
    if (typeof discountInput !== 'number' || discountInput <= 0 || subtotalCents <= 0) {
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
  }, [discountInput, discountMode, subtotalCents]);

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
    if (paymentMethod === PAYMENT_METHODS.CASH && !isCredit) {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    }
  }, [paymentMethod, isCredit]);

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
      <Box style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
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

          {/* 2. Embedded Order Discount Card */}
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
                  style={{ width: 100 }}
                  styles={{
                    root: { padding: 2, backgroundColor: 'light-dark(#ffffff, var(--bg-card))' },
                    label: { padding: '2px 10px', fontSize: 11, fontWeight: 700 },
                  }}
                />
              </Group>

              <Group justify="space-between" align="center" wrap="nowrap">
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
                  style={{ flex: 5, minWidth: 0 }}
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

          {/* 5. Pay Now / Credit Sale Segmented Control (Steps 3 & 4) */}
          <Tooltip
            label="Credit requires attaching a customer first (F3)"
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

          {/* 6. CREDIT MODE: In-System Amber Credit Banner & Due Date (Steps 6 & 7) */}
          {isCredit && (
            <Stack gap="xs">
              {/* Amber Credit Banner */}
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

              {/* Payment Due Date */}
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

          {/* 7. PAY NOW MODE: Collapsible Payment Method & Tendered Inputs (Step 5) */}
          {!isCredit && (
            <Stack gap="xs">
              {/* Payment Method Selector */}
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
                <SimpleGrid cols={2} spacing={8}>
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
                          height: 42,
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
                          style={{ height: 36, fontWeight: 500, fontFamily: 'monospace' }}
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
                        c={isCashShort ? 'amber.7' : 'green.6'}
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
                      <Group key={sp.id} gap="xs">
                        <SegmentedControl
                          size="xs"
                          value={sp.method}
                          onChange={(v) => handleUpdateSplitRow(sp.id, 'method', v as PaymentMethod)}
                          data={[
                            { label: 'Cash', value: PAYMENT_METHODS.CASH },
                            { label: 'Card', value: PAYMENT_METHODS.CARD, disabled: true },
                            { label: 'Online', value: PAYMENT_METHODS.ONLINE },
                          ]}
                          style={{ flex: 1 }}
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
                          style={{ width: 100 }}
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="xs"
                          onClick={() => handleRemoveSplitRow(sp.id)}
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

          {/* 8. Document Selection Control */}
          <Box mt={4}>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              mb={6}
              tt="uppercase"
              style={{ fontSize: 10, letterSpacing: '0.06em' }}
            >
              DOCUMENT OUTPUT
            </Text>
            <SimpleGrid cols={4} spacing={6}>
              {(
                [
                  { label: 'Receipt', value: 'receipt' },
                  { label: 'Invoice', value: 'invoice' },
                  { label: 'Both', value: 'both' },
                  { label: 'None', value: 'none' },
                ] as const
              ).map((doc) => {
                const isSelected = documentSelection === doc.value;
                return (
                  <UnstyledButton
                    key={doc.value}
                    onClick={() => changeDocumentSelection(doc.value)}
                    style={{
                      height: 38,
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
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Text
                      size="xs"
                      fw={isSelected ? 700 : 500}
                      c={isSelected ? 'blue.7' : undefined}
                    >
                      {doc.label}
                    </Text>
                  </UnstyledButton>
                );
              })}
            </SimpleGrid>
            {(documentSelection === 'invoice' || documentSelection === 'both') && (
              <Text size="xs" c="dimmed" mt={4} style={{ fontSize: 10 }}>
                <IconFileText size={10} style={{ display: 'inline', marginRight: 4 }} />
                A4 Invoice will open in preview modal.
              </Text>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Sticky Action Footer (Steps 1, 2, & 9) */}
      <Box
        style={{
          padding: 16,
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
            height: 52,
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
                ? `Confirm Credit Sale · New Bal ${formatMoney(newCreditBalanceCents)} (F2)`
                : `Issue on Credit · ${formatMoney(totalCents)} (F2)`
              : `Complete · ${formatMoney(totalCents)} (F2)`}
        </Button>
        <Text size="xs" c="dimmed" ta="center" mt={4} style={{ fontSize: 11 }}>
          {confirmCreditRequired
            ? 'Customer has existing debt. Press F2 or click again to confirm credit sale.'
            : 'Press F2 to trigger checkout'}
        </Text>
      </Box>
    </Paper>
  );
}
