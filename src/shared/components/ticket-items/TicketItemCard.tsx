import type { ReactNode } from 'react';
import { Box, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { IconAction } from '@/shared/components/drawer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { ClampedTitle } from './ClampedTitle';

export interface TicketItemCardProps {
  icon: ReactNode;
  title: string;
  /** The line under the title: where the part comes from, or what kind of line it is. */
  subline: ReactNode;
  /** The quantity box; `null` for a line that is always one. */
  quantity: ((size: 'xs' | 'sm') => ReactNode) | null;
  /** What the customer pays, typed or read-only. */
  price: ReactNode;
  /** A small line under the price ("Rs. 500.00 each"); `null` for none. */
  priceCaption: string | null;
  /**
   * For a line whose price is typed: the price box sits in a row of labelled boxes, after the cost
   * box (`false` on a locked line with no cost recorded). `null` when the price is only read.
   */
  typedBoxes: { cost: ReactNode } | null;
  /** `null` when the job's lines can no longer be changed. */
  onRemove: (() => void) | null;
  /** What stops the line being saved; `null` when nothing. */
  problem: string | null;
  /** The warranty and discount buttons, or why there are none. */
  children: ReactNode;
}

/**
 * One line of a job as a card: what and how much on top, then the two buttons. A line with a
 * quantity or typed boxes puts them on a second row, so the title keeps the card's width in a
 * narrow panel. On a phone everything moves under the title and gets a full-width row.
 */
export const TicketItemCard = ({
  icon,
  title,
  subline,
  quantity,
  price,
  priceCaption,
  typedBoxes,
  onRemove,
  problem,
  children,
}: TicketItemCardProps) => {
  const isMobile = useIsMobile();
  const priceColumn = (
    <>
      {price}
      {priceCaption !== null && (
        <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
          {priceCaption}
        </Text>
      )}
    </>
  );

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      bg="var(--bg-card)"
      style={{ borderColor: 'var(--border)' }}
    >
      <Stack gap="sm">
        <Group align="flex-start" wrap="nowrap" gap="sm">
          {icon}
          <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
            <ClampedTitle text={title} />
            {subline}
          </Stack>
          {!isMobile && quantity === null && typedBoxes === null && (
            <Stack gap={2} align="flex-end" style={{ flexShrink: 0, minWidth: 100 }}>
              {priceColumn}
            </Stack>
          )}
          {onRemove !== null && (
            <IconAction
              kind="danger"
              label={`${t('Remove')} ${title}`}
              icon={<IconTrash size={16} />}
              onClick={onRemove}
            />
          )}
        </Group>

        {!isMobile && typedBoxes !== null && (
          <Group align="flex-start" wrap="nowrap" gap="sm">
            {quantity !== null && (
              <Box style={{ flexShrink: 0 }}>
                <Text size="xs" fw={500} c="dimmed" mb={4}>
                  {t('Quantity')}
                </Text>
                {quantity('sm')}
              </Box>
            )}
            <SimpleGrid cols={2} spacing="sm" style={{ flex: 1, minWidth: 0 }}>
              <Box>{typedBoxes.cost}</Box>
              <Stack gap={4}>{priceColumn}</Stack>
            </SimpleGrid>
          </Group>
        )}

        {!isMobile && quantity !== null && typedBoxes === null && (
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
            {quantity('xs')}
            <Stack gap={2} align="flex-end" style={{ minWidth: 100 }}>
              {priceColumn}
            </Stack>
          </Group>
        )}

        {isMobile && (
          <Stack gap="xs">
            {quantity !== null && (
              <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {t('Quantity')}
                </Text>
                {quantity('sm')}
              </Group>
            )}
            {typedBoxes === null ? (
              <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {t('Customer pays')}
                </Text>
                <Stack gap={2} align="flex-end" style={{ flex: 1, maxWidth: 200 }}>
                  {priceColumn}
                </Stack>
              </Group>
            ) : (
              // One under the other: a long label in another language never pushes a box down.
              <>
                {typedBoxes.cost}
                <Stack gap={4}>{priceColumn}</Stack>
              </>
            )}
          </Stack>
        )}

        {problem !== null && (
          <Text size="xs" c="red" fw={500} role="alert">
            {problem}
          </Text>
        )}

        {children}
      </Stack>
    </Paper>
  );
};
