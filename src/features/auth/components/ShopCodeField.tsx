import { Anchor, Stack, Text, TextInput } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { isShopCodeRequired } from '../lib/shopCode';

interface ShopCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  className?: string;
  size?: 'sm' | 'md';
  /** The code came from a `?shop=` link: show it as text instead of an input. */
  locked?: boolean;
  /** Called when the person taps "Change" on the locked view. */
  onChangeShop?: () => void;
  /** Focus the input on mount (used right after "Change"). */
  autoFocus?: boolean;
}

/** The multi-tenant login's shop code input. Renders nothing when a shop code is not needed. */
export const ShopCodeField = ({
  value,
  onChange,
  error,
  className,
  size,
  locked,
  onChangeShop,
  autoFocus,
}: ShopCodeFieldProps) => {
  if (!isShopCodeRequired()) return null;

  if (locked && value) {
    return (
      <Stack align="center" gap={2} className={className} data-log-id="login-shop-code-locked">
        <Text size="sm" c="dimmed">
          {t('Signing in to')}{' '}
          <Text span fw={700} c="var(--text-primary)">
            {value}
          </Text>
        </Text>
        <Anchor
          component="button"
          type="button"
          size="sm"
          onClick={onChangeShop}
          data-log-id="login-shop-code-change"
        >
          {t('Not your shop? Change')}
        </Anchor>
      </Stack>
    );
  }

  return (
    <TextInput
      label={t('Shop code')}
      description={t('The short code for your business, e.g. test-shop')}
      placeholder="your-shop"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      error={error ? t(error) : undefined}
      className={className}
      size={size}
      required
      autoFocus={autoFocus}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoComplete="organization"
      data-log-id="login-shop-code"
    />
  );
};
