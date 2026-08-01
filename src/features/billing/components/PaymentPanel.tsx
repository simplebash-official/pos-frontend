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
  Badge,
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
  onOpenOrderDiscount: () => void;
}

export function PaymentPanel({
  isProcessing,
  onCompleteCheckout,
  onOpenOrderDiscount,
}: PaymentPanelProps) {
  const {
    items,
    subtotalCents,
    discountCents,
    totalCents,
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
        justify: 'space-between',
        backgroundColor: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      <Stack gap="xs">
        {/* 1. Subtotal Line */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Subtotal
          </Text>
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(subtotalCents)}
          </Text>
        </Group>

        {/* 2. Discount Line */}
        {discountCents > 0 && (
          <Group justify="space-between" align="center">
            <Group gap={4} style={{ cursor: 'pointer' }} onClick={onOpenOrderDiscount}>
              <Text size="sm" c="red" fw={600}>
                Order Discount
              </Text>
              <Badge size="xs" color="red" variant="subtle">
                Edit
              </Badge>
            </Group>
            <Text size="sm" fw={700} c="red" style={{ fontVariantNumeric: 'tabular-nums' }}>
              -{formatMoney(discountCents)}
            </Text>
          </Group>
        )}

        {/* 3. Divider */}
        <Divider my={4} color="var(--border-strong)" />

        {/* 4. Total Hero Digit */}
        <Box py={2}>
          <Text size="xs" fw={800} c="dimmed" tt="uppercase" ta="right">
            TOTAL DUE
          </Text>
          <Group justify="flex-end" align="baseline" gap={4}>
            <Text size="md" fw={700} c="dimmed">
              Rs.
            </Text>
            <Text
              fw={700}
              c={isCredit ? 'amber.7' : 'blue.6'}
              style={{
                fontSize: 40,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                transition: 'color 0.2s ease',
              }}
            >
              {Math.round(totalCents / 100).toLocaleString('en-US')}
            </Text>
          </Group>
        </Box>

        {/* 5. 2x2 Payment Method Tiles (56px) */}
        <Box mt="xs">
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
          <SimpleGrid cols={2} spacing={6}>
            {paymentTiles.map((tile) => {
              const Icon = tile.icon;
              const isSelected = paymentMethod === tile.id;

              const tileNode = (
                <UnstyledButton
                  key={tile.id}
                  disabled={tile.disabled}
                  onClick={() => !tile.disabled && changePaymentMethod(tile.id as PaymentMethod)}
                  style={{
                    height: 48,
                    borderRadius: '8px',
                    border: isSelected
                      ? '2px solid var(--mantine-color-blue-6)'
                      : '1px solid var(--border)',
                    backgroundColor: isSelected
                      ? 'var(--mantine-color-blue-light)'
                      : 'var(--bg-card)',
                    opacity: tile.disabled ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: tile.disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Group gap={6} align="center">
                    <Icon
                      size={18}
                      color={isSelected ? 'var(--mantine-color-blue-6)' : 'currentColor'}
                    />
                    <Text size="xs" fw={700} c={isSelected ? 'blue.7' : undefined}>
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

        {/* 6. Contextual Body */}
        <Box mt="xs">
          {paymentMethod === PAYMENT_METHODS.CASH && (
            <Stack gap="xs">
              <Group grow align="flex-end">
                <NumberInput
                  ref={cashInputRef}
                  label="Amount Tendered (Rs.)"
                  placeholder="e.g. 5000 (F2)"
                  prefix="Rs. "
                  min={0}
                  size="md"
                  value={tenderedRupees}
                  onChange={(val) => setTenderedRupees(typeof val === 'number' ? val : '')}
                  styles={{ input: { fontWeight: 700, fontSize: 16 } }}
                />
              </Group>

              {/* Quick Tender Chips */}
              <Group gap={4} wrap="wrap">
                {quickChips.map((amt) => (
                  <Button
                    key={amt}
                    size="xs"
                    variant="outline"
                    color="gray"
                    radius="var(--mantine-radius-default)"
                    onClick={() => setTenderedRupees(amt)}
                  >
                    Rs. {amt.toLocaleString()}
                  </Button>
                ))}
              </Group>

              {/* Change Due / Short By Display */}
              <Paper p="xs" withBorder radius="var(--mantine-radius-default)" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={700} c="dimmed">
                    {isCashShort ? 'SHORT BY' : 'CHANGE DUE'}
                  </Text>
                  <Text
                    size="lg"
                    fw={700}
                    c={isCashShort ? 'amber.7' : 'green.6'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {isCashShort ? formatMoney(shortByCents) : formatMoney(changeDueCents)}
                  </Text>
                </Group>
              </Paper>
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

              <Paper p="xs" withBorder radius="var(--mantine-radius-default)" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={700} c="dimmed">
                    REMAINING TO ALLOCATE
                  </Text>
                  <Text
                    size="sm"
                    fw={700}
                    c={splitRemainingCents === 0 ? 'green.6' : 'amber.7'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatMoney(splitRemainingCents)}
                  </Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Box>

        {/* 7. Document Selection Control */}
        <Box mt="xs">
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            mb={4}
            tt="uppercase"
            style={{ fontSize: 10, letterSpacing: '0.06em' }}
          >
            DOCUMENT OUTPUT
          </Text>
          <SegmentedControl
            fullWidth
            size="xs"
            value={documentSelection}
            onChange={(val) =>
              changeDocumentSelection(val as 'receipt' | 'invoice' | 'both' | 'none')
            }
            data={[
              { label: 'Receipt', value: 'receipt' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Both', value: 'both' },
              { label: 'None', value: 'none' },
            ]}
          />
          {(documentSelection === 'invoice' || documentSelection === 'both') && (
            <Text size="xs" c="dimmed" mt={4} style={{ fontSize: 10 }}>
              <IconFileText size={10} style={{ display: 'inline', marginRight: 4 }} />
              A4 Invoice will open in preview modal.
            </Text>
          )}
        </Box>
      </Stack>

      {/* 8. Credit / Unpaid Toggle & Due Date Picker */}
      <Stack gap="xs" mt="md">
        <Tooltip
          label={
            !customerId
              ? 'Credit requires attaching a customer first (F3)'
              : 'Leave invoice as unpaid credit balance'
          }
          disabled={Boolean(customerId)}
        >
          <Paper p="xs" withBorder radius="var(--mantine-radius-default)" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" align="center">
              <Text
                size="xs"
                fw={700}
                c={!customerId ? 'dimmed' : isCredit ? 'amber.7' : undefined}
              >
                Leave as unpaid (Credit)
              </Text>
              <Switch
                checked={isCredit}
                disabled={!customerId}
                onChange={(e) => changeIsCredit(e.currentTarget.checked)}
                color="amber"
                size="sm"
              />
            </Group>
          </Paper>
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

        {/* 9. Complete Payment Button (64px) with Echoed Amount */}
        <Box>
          <Button
            fullWidth
            size="lg"
            color={isCredit ? 'amber' : 'blue'}
            disabled={isButtonDisabled}
            loading={isProcessing}
            onClick={onCompleteCheckout}
            style={{
              height: 56,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: '8px',
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
