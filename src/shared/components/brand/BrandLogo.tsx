import { Box, Text } from '@mantine/core';
import { BRAND_NAME } from '@/config/branding';
import { t } from '@/shared/i18n/t';
import { BRAND_GRADIENT } from './gradient';

export interface BrandLogoProps {
  /** `on-brand`: amber mark and white text, for the gradient panels. */
  tone?: 'on-brand' | 'default';
  /** Class on the brand name, so a screen can hide it when space runs out. */
  nameClassName?: string;
}

/** The "S" mark plus the brand name. */
export const BrandLogo = ({ tone = 'default', nameClassName }: BrandLogoProps) => {
  const onBrand = tone === 'on-brand';
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Box
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: onBrand ? 'var(--brand-accent)' : BRAND_GRADIENT,
          boxShadow: onBrand ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(4, 120, 87, 0.3)',
          display: 'grid',
          placeItems: 'center',
          color: onBrand ? 'var(--brand-accent-on)' : 'var(--brand-on)',
          fontWeight: 900,
          fontSize: 16,
        }}
      >
        S
      </Box>
      <Text
        className={nameClassName}
        fw={800}
        fz="lg"
        style={{
          color: onBrand ? 'var(--brand-on)' : 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {t(BRAND_NAME)}
      </Text>
    </Box>
  );
};
