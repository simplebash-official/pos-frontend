import { useState } from 'react';
import { NumberInput, NumberInputProps } from '@mantine/core';
import { CURRENCY } from '@/constants';
import { fromCents, toCents } from '@/shared/lib/money';

export interface MoneyInputProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  valueCents: number;
  onChangeCents: (cents: number) => void;
}

const textToCents = (text: number | string): number =>
  text === '' || isNaN(Number(text)) ? 0 : toCents(Number(text));

const centsToText = (cents: number): number | string => (cents === 0 ? '' : fromCents(cents));

/**
 * An amount field in integer cents. It is empty while the amount is 0, showing the
 * grey `Rs. 0.00` placeholder; the `Rs.` prefix only appears once something is typed.
 */
export const MoneyInput = ({
  valueCents,
  onChangeCents,
  prefix = `${CURRENCY.symbol} `,
  placeholder = `${prefix}0.00`,
  ...props
}: MoneyInputProps) => {
  // The typed text is kept so "0" or "0." can be typed on the way to "0.50"; it only
  // follows the parent when the parent sets an amount the text does not already show.
  const [text, setText] = useState<number | string>(centsToText(valueCents));
  if (textToCents(text) !== valueCents) setText(centsToText(valueCents));

  const handleChange = (val: number | string) => {
    setText(val);
    onChangeCents(textToCents(val));
  };

  return (
    <NumberInput
      {...props}
      value={text}
      placeholder={placeholder}
      onChange={handleChange}
      prefix={prefix}
      decimalScale={CURRENCY.decimals}
      fixedDecimalScale={text !== ''}
      min={0}
      step={1}
    />
  );
};
