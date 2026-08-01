import { useState, useRef } from 'react';
import {
  Paper,
  Group,
  Text,
  Button,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  ScrollArea,
  Popover,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconPlayerPause,
  IconTrash,
  IconDotsVertical,
  IconUser,
  IconPlus,
  IconUserCheck,
  IconTag,
  IconNotes,
  IconUserPlus,
  IconChevronUp,
  IconChevronDown,
} from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { CartLineItem } from './CartLineItem';
import { formatMoney } from '@/shared/lib/money';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DiscountPopover } from './DiscountPopover';

export interface CartPanelProps {
  onOpenCustomerPicker: () => void;
}

export function CartPanel({ onOpenCustomerPicker }: CartPanelProps) {
  const {
    items,
    itemCount,
    totalUnitCount,
    sourceBreakdown,
    lastRemovedItem,
    customerName,
    customerPhone,
    customerBalanceCents,
    subtotalCents,
    discountCents,
    notes,
    updateQty,
    updateLineDisc,
    setDiscount,
    remove,
    undoRemove,
    clearUndo,
    holdCurrentCart,
    clear,
    attachCustomer,
  } = useCart();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [orderDiscountOpen, setOrderDiscountOpen] = useState(false);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (amount: number) => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ top: amount, behavior: 'smooth' });
    }
  };

  const hasMixedSources =
    [
      sourceBreakdown.retailCents > 0,
      sourceBreakdown.repairsCents > 0,
      sourceBreakdown.printCents > 0,
    ].filter(Boolean).length > 1;

  return (
    <Paper
      p="xs"
      withBorder
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      {/* 1. Cart Header Bar */}
      <Group
        justify="space-between"
        align="center"
        pb="xs"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <Group gap="xs" align="center">
            <Text fw={700} size="sm">
              Current Sale
            </Text>
            <Badge size="xs" color="blue" variant="light">
              {itemCount} item{itemCount !== 1 ? 's' : ''} · {totalUnitCount} unit
              {totalUnitCount !== 1 ? 's' : ''}
            </Badge>
          </Group>
        </div>

        <Group gap={4}>
          <Button
            size="xs"
            variant="light"
            color="orange"
            leftSection={<IconPlayerPause size={14} />}
            disabled={items.length === 0}
            onClick={() => holdCurrentCart()}
          >
            Hold (Ctrl+H)
          </Button>

          <Button
            size="xs"
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={14} />}
            disabled={items.length === 0}
            onClick={() => setClearDialogOpen(true)}
          >
            Clear
          </Button>

          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTag size={14} />}
                onClick={() => setOrderDiscountOpen(true)}
              >
                Order Discount (Ctrl+D)
              </Menu.Item>
              <Menu.Item
                leftSection={<IconNotes size={14} />}
                onClick={() => {
                  const input = prompt('Add order notes:', notes);
                  if (input !== null) {
                    // Notes handled if needed
                  }
                }}
              >
                Add Note
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* 2. Customer Strip (Always present directly below header) */}
      <Box py="xs">
        {customerName ? (
          <Popover
            opened={customerPopoverOpen}
            onChange={setCustomerPopoverOpen}
            position="bottom-start"
            withArrow
          >
            <Popover.Target>
              <Paper
                p="xs"
                withBorder
                style={{
                  backgroundColor: 'var(--mantine-color-blue-light)',
                  borderColor: 'var(--mantine-color-blue-4)',
                  cursor: 'pointer',
                }}
                onClick={() => setCustomerPopoverOpen((o) => !o)}
              >
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <IconUserCheck size={18} color="var(--mantine-color-blue-6)" />
                    <div>
                      <Group gap="xs">
                        <Text size="sm" fw={700}>
                          {customerName}
                        </Text>
                        {customerBalanceCents > 0 && (
                          <Badge size="xs" color="red" variant="filled">
                            Bal: {formatMoney(customerBalanceCents)}
                          </Badge>
                        )}
                      </Group>
                      {customerPhone && (
                        <Text size="xs" c="dimmed">
                          {customerPhone}
                        </Text>
                      )}
                    </div>
                  </Group>
                  <Text size="xs" c="blue" fw={600}>
                    Manage &gt;
                  </Text>
                </Group>
              </Paper>
            </Popover.Target>

            <Popover.Dropdown p="xs">
              <Stack gap={4}>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconUserPlus size={14} />}
                  onClick={() => {
                    setCustomerPopoverOpen(false);
                    onOpenCustomerPicker();
                  }}
                >
                  Change Customer
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    attachCustomer(null, null);
                    setCustomerPopoverOpen(false);
                  }}
                >
                  Detach Customer
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        ) : (
          <Paper
            p="xs"
            withBorder
            style={{
              backgroundColor: 'var(--bg-hover)',
              cursor: 'pointer',
            }}
            onClick={onOpenCustomerPicker}
          >
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconUser size={18} color="var(--text-muted)" />
                <Text size="sm" c="dimmed">
                  Walk-in customer
                </Text>
              </Group>
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<IconPlus size={12} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomerPicker();
                }}
              >
                + Attach (F3)
              </Button>
            </Group>
          </Paper>
        )}
      </Box>

      {/* 3. 4-Second Line Removal Undo Banner */}
      {lastRemovedItem && (
        <Alert
          color="blue"
          p="xs"
          mb="xs"
          withCloseButton
          onClose={clearUndo}
          style={{ fontSize: 12 }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs">Removed "{lastRemovedItem.item.name}"</Text>
            <Button size="xs" variant="white" color="blue" onClick={undoRemove}>
              Undo (4s)
            </Button>
          </Group>
        </Alert>
      )}

      {/* 4. Line Items Scrollable Region */}
      <ScrollArea
        viewportRef={viewportRef}
        style={{ flex: 1 }}
        type="never"
        styles={{
          viewport: { overflowX: 'hidden' },
        }}
      >
        {items.length === 0 ? (
          <Stack align="center" justify="center" h={260} gap="xs">
            <IconShoppingCart size={44} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center" fw={600}>
              Scan an item or press F4 to bill a repair
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Items added will appear instantly at the top.
            </Text>
          </Stack>
        ) : (
          <Stack gap={6}>
            {items.map((item, index) => (
              <CartLineItem
                key={item.id}
                item={item}
                isNewest={index === 0}
                onUpdateQty={updateQty}
                onUpdateLineDiscount={updateLineDisc}
                onRemove={remove}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>

      {/* Scroll Controls */}
      {items.length > 0 && (
        <Group justify="center" gap="xs" mt="xs">
          <ActionIcon 
            variant="light" 
            color="gray" 
            size="md" 
            onClick={() => scrollByAmount(-200)}
          >
            <IconChevronUp size={18} />
          </ActionIcon>
          <ActionIcon 
            variant="light" 
            color="gray" 
            size="md" 
            onClick={() => scrollByAmount(200)}
          >
            <IconChevronDown size={18} />
          </ActionIcon>
        </Group>
      )}

      {/* 5. Mixed Cart Breakdown Footer (rendered when >1 source type present) */}
      {hasMixedSources && (
        <Box pt="xs" mt="xs" style={{ borderTop: '1px dashed var(--border-strong)' }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={2} style={{ fontSize: 10 }}>
            Mixed Cart Source Breakdown
          </Text>
          <Group gap="md">
            {sourceBreakdown.retailCents > 0 && (
              <Text size="xs" c="blue.7" fw={600}>
                Retail: <b>{formatMoney(sourceBreakdown.retailCents)}</b>
              </Text>
            )}
            {sourceBreakdown.repairsCents > 0 && (
              <Text size="xs" c="orange.7" fw={600}>
                Repairs: <b>{formatMoney(sourceBreakdown.repairsCents)}</b>
              </Text>
            )}
            {sourceBreakdown.printCents > 0 && (
              <Text size="xs" c="teal.7" fw={600}>
                Print: <b>{formatMoney(sourceBreakdown.printCents)}</b>
              </Text>
            )}
          </Group>
        </Box>
      )}

      {/* Order Level Discount Popover Anchor */}
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

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        opened={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={() => {
          clear();
          setClearDialogOpen(false);
        }}
        title="Clear Billing Cart?"
        confirmLabel="Clear Cart"
        confirmColor="red"
      >
        Are you sure you want to clear {itemCount} items from the current billing cart?
      </ConfirmDialog>
    </Paper>
  );
}
