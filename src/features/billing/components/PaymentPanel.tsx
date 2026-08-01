import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Divider,
  Button,
  NumberInput,
  TextInput,
  SegmentedControl,
  Switch,
  Tooltip,
  ActionIcon,
  Box,
  SimpleGrid,
  UnstyledButton,
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
} from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { useAppSelector } from '@/store/hooks';
import { selectPrintSettings } from '@/store/slices/settingsSlice';
import { formatMoney } from '@/shared/lib/money';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import type { SplitPaymentDetail } from '../types';

export interface PaymentPanelProps {
  isProcessing: boolean;
  onCompleteCheckout: () => void;
  onOpenOrderDiscount?: () => void;
}

export function PaymentPanel({
  isProcessing,
  onCompleteCheckout,
}: PaymentPanelProps) {
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
    documentSelection,
    changeDocumentSelection,
    dueDate,
    changeDueDate,
    changeTenderedAmountCents,
  } = useCart();

  // Inline Order Discount State
  const [discountMode, setDiscountMode] = useState<'percent' | 'amount'>('percent');
  const [discountInput, setDiscountInput] = useState<number | ''>('');

  // Calculate order discount cents based on mode & input
  const calculatedDiscountCents = useMemo(() => {
    if (typeof discountInput !== 'number' || discountInput <= 0 || subtotalCents <= 0) {
      return 0;
    }
    if (discountMode === 'percent') {
      const disc = Math.round((subtotalCents * discountInput) / 100);
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
  useEffect(() => {
    if (discountCents > 0 && discountInput === '') {
      if (discountMode === 'percent' && subtotalCents > 0) {
        const pct = Math.round((discountCents / subtotalCents) * 100);
        setDiscountInput(pct);
      } else {
        setDiscountInput(Math.round(discountCents / 100));
      }
    }
  }, [discountCents, subtotalCents, discountInput, discountMode]);

  // Tendered cash state in rupees
  const [tenderedRupees, setTenderedRupees] = useState<number | ''>('');
  const cashInputRef = useRef<HTMLInputElement>(null);

  const printSettings = useAppSelector(selectPrintSettings);
  const prevCustomerIdRef = useRef(customerId);

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
    if (paymentMethod === PAYMENT_METHODS.CASH) {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    }
  }, [paymentMethod]);

  // Sync tendered amount to Redux store
  useEffect(() => {
    const cents = typeof tenderedRupees === 'number' ? Math.round(tenderedRupees * 100) : 0;
    changeTenderedAmountCents(cents);
  }, [tenderedRupees, changeTenderedAmountCents]);

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

  return (
    <Paper
      p="md"
      radius="var(--mantine-radius-default)"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
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

        {/* 2. Inline Order Discount Box (Matching user mockup) */}
        <Paper
          p="xs"
          radius="var(--mantine-radius-default)"
          style={{
            backgroundColor: 'var(--mantine-color-red-0)',
            border: '1px solid var(--mantine-color-red-3)',
          }}
        >
          <Stack gap={6}>
            {/* Header: Icon + ORDER DISCOUNT label on left, % / Rs. SegmentedControl on right */}
            <Group justify="space-between" align="center">
              <Group gap={6} align="center">
                <IconTag size={15} color="var(--mantine-color-red-7)" />
                <Text size="xs" fw={700} c="red.7" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                  ORDER DISCOUNT
                </Text>
              </Group>

              <SegmentedControl
                size="xs"
                color="red"
                value={discountMode}
                onChange={(val) => {
                  setDiscountMode(val as 'percent' | 'amount');
                  setDiscountInput('');
                }}
                data={[
                  { label: '%', value: 'percent' },
                  { label: 'Rs.', value: 'amount' },
                ]}
                style={{ width: 100 }}
                styles={{
                  root: { padding: 2, backgroundColor: '#ffffff' },
                  label: { padding: '2px 10px', fontSize: 11, fontWeight: 700 },
                }}
              />
            </Group>

            {/* Input & Output Row: Value Input on left, - Rs. XX,XXX on right */}
            <Group justify="space-between" align="center">
              <NumberInput
                size="xs"
                placeholder="0"
                min={0}
                max={discountMode === 'percent' ? 100 : Math.round(subtotalCents / 100)}
                value={discountInput}
                onChange={(val) => setDiscountInput(typeof val === 'number' ? val : '')}
                styles={{
                  input: {
                    width: 75,
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--mantine-color-red-3)',
                  },
                }}
              />

              <Text size="sm" fw={700} c="red.7" style={{ fontFamily: 'monospace' }}>
                - {formatMoney(calculatedDiscountCents)}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* 3. Divider */}
        <Divider my={4} color="var(--border-strong)" />

        {/* 4. Total Due Hero Section */}
        <Box py={2}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" ta="right" style={{ fontSize: 11, letterSpacing: '0.04em' }}>
            TOTAL DUE
          </Text>
          <Text
            fw={800}
            ta="right"
            c={isCredit ? 'amber.7' : undefined}
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

        {/* 5. Divider */}
        <Divider my={4} color="var(--border-strong)" />

        {/* 6. Payment Method Section */}
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
                  onClick={() => !tile.disabled && changePaymentMethod(tile.id as PaymentMethod)}
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
                    <Text size="sm" fw={isSelected ? 700 : 500} c={isSelected ? 'blue.7' : undefined}>
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

        {/* 7. Contextual Payment Controls (Cash / Card / Online / Split) */}
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

              <NumberInput
                ref={cashInputRef}
                placeholder="0"
                prefix="Rs. "
                min={0}
                size="md"
                value={tenderedRupees}
                onChange={(val) => setTenderedRupees(typeof val === 'number' ? val : '')}
                styles={{
                  input: {
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 18,
                    borderRadius: 'var(--mantine-radius-default)',
                  },
                }}
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
                  <NumberInput
                    size="xs"
                    placeholder="Amount"
                    prefix="Rs. "
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
            {[
              { label: 'Receipt', value: 'receipt' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Both', value: 'both' },
              { label: 'None', value: 'none' },
            ].map((doc) => {
              const isSelected = documentSelection === doc.value;
              return (
                <UnstyledButton
                  key={doc.value}
                  onClick={() => changeDocumentSelection(doc.value as any)}
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
                  <Text size="xs" fw={isSelected ? 700 : 500} c={isSelected ? 'blue.7' : undefined}>
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

      {/* 9. Credit / Unpaid Toggle & Checkout Button */}
      <Stack gap="xs" mt="md">
        <Tooltip
          label={
            !customerId
              ? 'Credit requires attaching a customer first (F3)'
              : 'Leave invoice as unpaid credit balance'
          }
          disabled={Boolean(customerId)}
        >
          <Group justify="space-between" align="center" py={4}>
            <Text
              size="sm"
              c={!customerId ? 'dimmed' : isCredit ? 'amber.7' : undefined}
            >
              Leave as unpaid (credit)
            </Text>
            <Switch
              checked={isCredit}
              disabled={!customerId}
              onChange={(e) => changeIsCredit(e.currentTarget.checked)}
              color="amber"
              size="sm"
            />
          </Group>
        </Tooltip>

        {isCredit && (
          <DateInput
            label="Payment Due Date"
            placeholder="Select due date"
            size="xs"
            value={dueDate ? new Date(dueDate) : defaultDueDate}
            onChange={(d: Date | string | null) => {
              if (!d) {
                changeDueDate(null);
              } else if (typeof d === 'string') {
                changeDueDate(d);
              } else {
                changeDueDate(d.toISOString().split('T')[0]);
              }
            }}
          />
        )}

        {/* Complete Payment Button */}
        <Box>
          <Button
            fullWidth
            size="lg"
            color={isCredit ? 'amber' : 'blue'}
            disabled={isButtonDisabled}
            loading={isProcessing}
            onClick={onCompleteCheckout}
            style={{
              height: 52,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 'var(--mantine-radius-default)',
            }}
          >
            {isCartEmpty
              ? 'Add items to begin'
              : isCredit
                ? `Complete as Credit · ${formatMoney(totalCents)} (F2)`
                : `Complete · ${formatMoney(totalCents)} (F2)`}
          </Button>
          <Text size="xs" c="dimmed" ta="center" mt={4} style={{ fontSize: 11 }}>
            Press F2 to trigger checkout
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
}
