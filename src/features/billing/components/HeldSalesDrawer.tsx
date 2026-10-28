import { t } from '@/shared/i18n/t';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Button, Center, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconCoin,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconClock,
} from '@tabler/icons-react';
import { Figure, IconAction, KpiStrip, KpiTile, RichDrawer } from '@/shared/components/drawer';
import { useHeldCarts } from '../hooks/useCart';
import { useHeldCartTotals } from '../hooks/useCheckout';
import { formatMoney } from '@/shared/lib/money';
import { sumParkedCartsTotal } from '@/shared/calculations';

export interface HeldSalesDrawerProps {
  opened: boolean;
  onClose: () => void;
}

/** A sale held for over this many hours is flagged as stale. */
const STALE_AFTER_HOURS = 2;

export const HeldSalesDrawer = ({ opened, onClose }: HeldSalesDrawerProps) => {
  const { heldCarts, loadHeldCart, removeHeldCart } = useHeldCarts();
  const reduceMotion = useReducedMotion();
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    if (opened) {
      const timer = setTimeout(() => {
        setNowMs(Date.now());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [opened]);

  const getAgeHours = (heldAt: string, currentNow: number) => {
    if (!currentNow) return 0;
    const elapsedMs = currentNow - new Date(heldAt).getTime();
    return elapsedMs / (1000 * 60 * 60);
  };

  const getAgeLabel = (heldAt: string, currentNow: number) => {
    if (!currentNow) return 'Just now';
    const elapsedMins = Math.floor((currentNow - new Date(heldAt).getTime()) / (1000 * 60));
    if (elapsedMins < 1) return 'Just now';
    if (elapsedMins < 60) return `${elapsedMins}m ago`;
    const hours = Math.floor(elapsedMins / 60);
    return `${hours}h ${elapsedMins % 60}m ago`;
  };

  // What each parked cart comes to is the server's answer; a cart still waiting shows no figure.
  const totals = useHeldCartTotals(heldCarts);
  const answered = heldCarts.every((h) => totals.has(h.id));
  const parkedValueCents = sumParkedCartsTotal(heldCarts, totals);

  return (
    <RichDrawer
      data={heldCarts}
      opened={opened}
      onClose={onClose}
      width="narrow"
      title={{
        icon: <IconPlayerPause size={20} />,
        text: t('Parked / held sales'),
        subtitle: `${heldCarts.length} ${t('parked · Ctrl+H to park the active cart')}`,
      }}
    >
      {() => (
        <Stack gap="md">
          <KpiStrip>
            <KpiTile icon={<IconPlayerPause size={16} />} color="orange" label={t('Parked')}>
              <Figure value={String(heldCarts.length)} hint={t('sales waiting')} color="orange" />
            </KpiTile>
            <KpiTile icon={<IconCoin size={16} />} color="blue" label={t('Total')}>
              <Figure
                value={answered ? formatMoney(parkedValueCents) : ''}
                hint={t('parked value')}
                color="blue"
              />
            </KpiTile>
          </KpiStrip>

          {heldCarts.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed" size="sm" ta="center">
                {t('No sales currently parked. Press')} <b>{t('Ctrl+H')}</b>{' '}
                {t('to park the active cart.')}
              </Text>
            </Center>
          ) : (
            <AnimatePresence initial={false}>
              {heldCarts.map((h) => {
                const ageHours = getAgeHours(h.heldAt, nowMs);
                const isStale = ageHours >= STALE_AFTER_HOURS;

                return (
                  <motion.div
                    key={h.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                    style={{ marginBottom: 'var(--mantine-spacing-md)' }}
                  >
                    <Paper
                      p={0}
                      bg="var(--bg-card)"
                      shadow="xs"
                      style={{
                        borderLeft: isStale ? '4px solid var(--mantine-color-yellow-6)' : undefined,
                        overflow: 'hidden',
                      }}
                    >
                      <Stack gap="xs" p="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                            <ThemeIcon
                              size={40}
                              color={isStale ? 'yellow' : 'blue'}
                              variant="light"
                              style={{ flexShrink: 0 }}
                            >
                              <IconPlayerPause size={20} />
                            </ThemeIcon>
                            <Box style={{ minWidth: 0 }}>
                              <Text size="sm" fw={700} lineClamp={1}>
                                {h.label || h.customerName || 'Unlabeled Sale'}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {h.items.length} {t('item(s) · Total:')}{' '}
                                <Text span fw={700} c="var(--text-primary)" inherit>
                                  {totals.has(h.id)
                                    ? formatMoney(totals.get(h.id)!.totalCents)
                                    : ''}
                                </Text>
                              </Text>
                            </Box>
                          </Group>
                          <Box style={{ flexShrink: 0, textAlign: 'right' }}>
                            <Group gap={2} wrap="nowrap" justify="flex-end" c="dimmed">
                              <IconClock size={12} />
                              <Text size="xs" c="dimmed">
                                {getAgeLabel(h.heldAt, nowMs)}
                              </Text>
                            </Group>
                            {isStale && (
                              <Text size="xs" fw={700} c="yellow">
                                {t('Stale (>2h)')}
                              </Text>
                            )}
                          </Box>
                        </Group>
                      </Stack>

                      <Divider />

                      <Group gap="xs" wrap="nowrap" p="sm">
                        <Button
                          variant="light"
                          color="blue"
                          leftSection={<IconPlayerPlay size={14} />}
                          style={{ flex: 1 }}
                          onClick={() => {
                            loadHeldCart(h.id);
                            onClose();
                          }}
                        >
                          {t('Restore to cart')}
                        </Button>
                        <IconAction
                          kind="danger"
                          label={t('Discard held sale')}
                          icon={<IconTrash size={16} />}
                          onClick={() => removeHeldCart(h.id)}
                        />
                      </Group>
                    </Paper>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </Stack>
      )}
    </RichDrawer>
  );
};
