import { NumberInput, NumberInputProps } from '@mantine/core';
import { CURRENCY } from '@/constants';
import { fromCents, toCents } from '@/shared/lib/money';

export interface MoneyInputProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  valueCents: number;
  onChangeCents: (cents: number) => void;
}

export const MoneyInput = ({
  valueCents,
  onChangeCents,
  prefix = `${CURRENCY.symbol} `,
  ...props
}: MoneyInputProps) => {
  const displayValue = fromCents(valueCents);

  const handleChange = (val: number | string) => {
    if (typeof val === 'number') {
      onChangeCents(toCents(val));
    } else if (val === '' || isNaN(Number(val))) {
      onChangeCents(0);
    } else {
      onChangeCents(toCents(parseFloat(val)));
    }
  };

  return (
    <NumberInput
      {...props}
      value={displayValue}
      onChange={handleChange}
      prefix={prefix}
      decimalScale={CURRENCY.decimals}
      fixedDecimalScale
      min={0}
      step={1}
    />
  );
};
