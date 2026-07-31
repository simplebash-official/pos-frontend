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
} from '@mantine/core';
import {
  IconCash,
  IconCreditCard,
  IconWorld,
  IconArrowsSplit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { formatMoney } from '@/shared/lib/money';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { SplitPaymentDetail } from '../types';

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
  } = useCart();

  // Tendered cash state in rupees
  const [tenderedRupees, setTenderedRupees] = useState<number | ''>('');
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Focus cash input on payment method change to Cash
  useEffect(() => {
    if (paymentMethod === PAYMENT_METHODS.CASH) {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    }
  }, [paymentMethod]);

  // Cash calculation
  const tenderedCents = typeof tenderedRupees === 'number' ? Math.round(tenderedRupees * 100) : 0;
  const changeDueCents = Math.max(0, tenderedCents - totalCents);
  const shortByCents = totalCents - tenderedCents;
  const isCashShort = paymentMethod === PAYMENT_METHODS.CASH && tenderedCents < totalCents;

  // Split payment validation
  const isSplitIncomplete =
    paymentMethod === PAYMENT_METHODS.SPLIT &&
    (splitRemainingCents !== 0 || splitPayments.length === 0);

  // Quick Tender Chips calculation (exact amount, next 500, 1000, 5000 round-ups)
  const quickChips = useMemo(() => {
    if (totalCents <= 0) return [];
    const totalRs = Math.ceil(totalCents / 100);
    const set = new Set<number>();
    set.add(totalRs); // Exact amount

    // Next 500 round-up
    const next500 = Math.ceil(totalRs / 500) * 500;
    if (next500 > totalRs) set.add(next500);

    // Next 1000 round-up
    const next1000 = Math.ceil(totalRs / 1000) * 1000;
    if (next1000 > totalRs) set.add(next1000);

    // Next 5000 round-up
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

  return (
    <Paper
      p="md"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        backgroundColor: 'var(--bg-sidebar)', // deeper cooler surface
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

        {/* 2. Discount Line (Clickable to edit) */}
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
            <Text size="sm" fw={700} c="red" style={{ fontFamily: 'monospace' }}>
              -{formatMoney(discountCents)}
            </Text>
          </Group>
        )}

        {/* 3. Firm Divider */}
        <Divider my={4} color="var(--border-strong)" />

        {/* 4. Total Hero Digit */}
        <Box py={2}>
          <Text size="xs" fw={800} c="dimmed" tt="uppercase" ta="right">
            TOTAL DUE RIGHT NOW
          </Text>
          <Group justify="flex-end" align="baseline" gap={4}>
            <Text size="md" fw={700} c="dimmed">
              Rs.
            </Text>
            <Text
              fw={900}
              c={isCredit ? 'amber.7' : 'blue.6'}
              style={{
                fontSize: 42,
                lineHeight: 1,
                fontFamily: 'monospace',
                letterSpacing: '-1px',
                transition: 'color 0.2s ease',
              }}
            >
              {Math.round(totalCents / 100).toLocaleString('en-US')}
            </Text>
          </Group>
        </Box>

        {/* 5. 4 Large Payment Method Tiles (56px) */}
        <Box mt="xs">
          <Text size="xs" fw={700} c="dimmed" mb={4} tt="uppercase" style={{ fontSize: 10 }}>
            Payment Method
          </Text>
          <SegmentedControl
            fullWidth
            size="sm"
            value={paymentMethod}
            onChange={(val) => changePaymentMethod(val as PaymentMethod)}
            data={[
              {
                value: PAYMENT_METHODS.CASH,
                label: (
                  <Group gap={4} justify="center" h={36}>
                    <IconCash size={18} />
                    <Text size="xs" fw={700}>
                      Cash
                    </Text>
                  </Group>
                ),
              },
              {
                value: PAYMENT_METHODS.CARD,
                disabled: true,
                label: (
                  <Tooltip label="Card payment coming in a future update">
                    <Group gap={4} justify="center" h={36} style={{ opacity: 0.5 }}>
                      <IconCreditCard size={18} />
                      <Text size="xs" fw={700}>
                        Card
                      </Text>
                    </Group>
                  </Tooltip>
                ),
              },
              {
                value: PAYMENT_METHODS.ONLINE,
                label: (
                  <Group gap={4} justify="center" h={36}>
                    <IconWorld size={18} />
                    <Text size="xs" fw={700}>
                      Online
                    </Text>
                  </Group>
                ),
              },
              {
                value: PAYMENT_METHODS.SPLIT,
                label: (
                  <Group gap={4} justify="center" h={36}>
                    <IconArrowsSplit size={18} />
                    <Text size="xs" fw={700}>
                      Split
                    </Text>
                  </Group>
                ),
              },
            ]}
          />
        </Box>

        {/* 6. Contextual Payment Body */}
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
                    variant="light"
                    color="blue"
                    onClick={() => setTenderedRupees(amt)}
                  >
                    Rs. {amt.toLocaleString()}
                  </Button>
                ))}
              </Group>

              {/* Change Due / Short By Display */}
              <Paper p="xs" withBorder radius="md" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={700} c="dimmed">
                    {isCashShort ? 'SHORT BY' : 'CHANGE DUE'}
                  </Text>
                  <Text
                    size="lg"
                    fw={900}
                    c={isCashShort ? 'amber.7' : 'green.6'}
                    style={{ fontFamily: 'monospace' }}
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

              <Paper p="xs" withBorder radius="md" style={{ backgroundColor: 'var(--bg-card)' }}>
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={700} c="dimmed">
                    REMAINING TO ALLOCATE
                  </Text>
                  <Text
                    size="sm"
                    fw={800}
                    c={splitRemainingCents === 0 ? 'green.6' : 'amber.7'}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {formatMoney(splitRemainingCents)}
                  </Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Box>
      </Stack>

      {/* 7. Credit / Unpaid Toggle & Complete Button */}
      <Stack gap="xs" mt="md">
        <Tooltip
          label={
            !customerId
              ? 'Credit requires attaching a customer first (F3)'
              : 'Leave invoice as unpaid credit balance'
          }
          disabled={Boolean(customerId)}
        >
          <Paper p="xs" withBorder radius="md" style={{ backgroundColor: 'var(--bg-card)' }}>
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

        {/* 8. Complete Payment Button (64px) */}
        <Box>
          <Button
            fullWidth
            size="lg"
            color={isCredit ? 'amber' : 'blue'}
            disabled={isButtonDisabled}
            loading={isProcessing}
            onClick={onCompleteCheckout}
            style={{
              height: 64,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            {isCartEmpty
              ? 'Add items to begin'
              : isCredit
                ? 'Complete as Credit (F2)'
                : 'Complete Payment (F2)'}
          </Button>
          <Text size="xs" c="dimmed" ta="center" mt={4} style={{ fontSize: 11 }}>
            Press F2 to trigger checkout
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
}
