import { useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { IconDiscount2 } from '@tabler/icons-react';
import { DiscountPopover } from '@/shared/components/DiscountPopover';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { ItemDiscount } from '@/wasm';
import { fromPopoverDiscount, toPopoverDiscount } from './itemDiscount';
import { ItemActionButton } from './ItemActionButton';

export interface ItemDiscountButtonProps {
  /** What the row's work is called, shown at the top of the discount window. */
  targetName: string;
  /** The discount typed on this row; `null` for none. */
  discount: ItemDiscount | null;
  /** What the discount comes to, as the server worked it out; `null` while it has not answered. */
  amountCents: number | null;
  /** The row's price the discount comes off. */
  originalCents: number;
  /** What is wrong with the discount, in plain words; `null` when nothing. */
  problem: string | null;
  onChange: (discount: ItemDiscount | null) => void;
  /** A finished job shows the discount only. */
  readOnly: boolean;
}

/**
 * The discount button on one line of a job ("Add discount", "-12.5% · -Rs. 1,500").
 * Tapping it opens the same small window the billing counter uses. The amount is the server's,
 * never worked out here.
 */
export const ItemDiscountButton = ({
  targetName,
  discount,
  amountCents,
  originalCents,
  problem,
  onChange,
  readOnly,
}: ItemDiscountButtonProps) => {
  const [opened, setOpened] = useState(false);

  const percent =
    discount !== null && discount.type === 'percentage' ? discount.basisPoints / 100 : null;
  const amount = amountCents === null ? '' : `-${formatMoney(amountCents)}`;
  const value =
    discount === null
      ? t('Add discount')
      : percent === null
        ? amount
        : amount === ''
          ? `-${percent}%`
          : `-${percent}% · ${amount}`;
  const tone = problem !== null ? 'red' : discount === null ? 'none' : 'orange';

  const face = (onClick?: () => void) => (
    <ItemActionButton
      label={t('Discount')}
      value={value}
      icon={<IconDiscount2 size={14} />}
      tone={tone}
      readOnly={readOnly}
      onClick={onClick}
      aria-label={`${t('Discount for')} ${targetName}`}
    />
  );

  return (
    <Stack gap={4}>
      {readOnly ? (
        face()
      ) : (
        <DiscountPopover
          opened={opened}
          onClose={() => setOpened(false)}
          targetName={targetName}
          originalCents={originalCents}
          currentDiscount={toPopoverDiscount(discount)}
          onApplyDiscount={(next) => onChange(fromPopoverDiscount(next))}
        >
          <div>{face(() => setOpened((open) => !open))}</div>
        </DiscountPopover>
      )}
      {problem !== null && (
        <Text size="xs" c="red">
          {problem}
        </Text>
      )}
    </Stack>
  );
};
