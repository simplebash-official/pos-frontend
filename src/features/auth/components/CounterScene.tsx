import { Box } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatMoney } from '@/shared/lib/money';
import { EASE } from '@/shared/motion';
import { t } from '@/shared/i18n/t';
import { ReceiptCard } from './ReceiptCard';

// Shown once the receipt has finished printing (its last row starts at 0.3 + 5 * 0.18 s).
const PAID_DELAY = 1.5;

/** An amber price tag hanging from its string, swaying a little. */
const PriceTag = ({ reduced }: { reduced: boolean }) => (
  <motion.div
    style={{ transformOrigin: 'top center', display: 'flex', flexDirection: 'column' }}
    animate={reduced ? undefined : { rotate: [-4, 4, -4] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
  >
    {/* The pin the tag hangs from, then its string. */}
    <Box
      style={{
        width: 8,
        height: 8,
        margin: '0 auto',
        borderRadius: '50%',
        background: 'var(--brand-on-muted)',
      }}
    />
    <Box style={{ width: 1, height: 48, margin: '0 auto', background: 'var(--brand-on-muted)' }} />
    <Box
      pt={18}
      pb={10}
      px={14}
      style={{
        position: 'relative',
        background: 'var(--brand-accent)',
        color: 'var(--brand-accent-on)',
        // A tag shape: the top corners are clipped into a point where the string ties on.
        clipPath: 'polygon(50% 0, 100% 16px, 100% 100%, 0 100%, 0 16px)',
        borderRadius: 4,
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 15,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: 7,
          left: '50%',
          width: 7,
          height: 7,
          marginLeft: -3.5,
          borderRadius: '50%',
          background: 'var(--brand-grad-from)',
        }}
      />
      {formatMoney(125000)}
    </Box>
  </motion.div>
);

/** The card machine's "approved" slip, popping in when the sale is done. */
const PaymentChip = ({ reduced }: { reduced: boolean }) => (
  <motion.div
    initial={reduced ? false : { opacity: 0, scale: 0.85, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={reduced ? { duration: 0 } : { delay: PAID_DELAY, duration: 0.3, ease: EASE }}
  >
    <Box
      py={10}
      px={14}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderRadius: 14,
        background: 'rgba(12, 20, 18, 0.88)',
        color: '#FFFFFF',
        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.3)',
        transform: 'rotate(2deg)',
      }}
    >
      <Box
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--brand-grad-to)',
          flexShrink: 0,
        }}
      >
        <IconCheck size={18} stroke={3} />
      </Box>
      <Box>
        <Box style={{ fontSize: 13, fontWeight: 700 }}>{t('Payment approved')}</Box>
        <Box style={{ fontSize: 12, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
          {t('Card')} · {formatMoney(245000)}
        </Box>
      </Box>
    </Box>
  </motion.div>
);

/**
 * The checkout counter on the brand panel: a receipt printing, a price tag and the
 * card machine's approval. Decorative only, so it is hidden from screen readers.
 */
export const CounterScene = () => {
  const reduced = useReducedMotion() === true;
  return (
    <Box aria-hidden data-testid="counter-scene" visibleFrom="md">
      <Box style={{ position: 'absolute', top: 130, left: '14%' }}>
        <PriceTag reduced={reduced} />
      </Box>
      <Box style={{ position: 'absolute', top: 96, right: '8%' }}>
        <ReceiptCard />
      </Box>
      <Box style={{ position: 'absolute', top: 350, right: 'calc(8% + 150px)' }}>
        <PaymentChip reduced={reduced} />
      </Box>
    </Box>
  );
};
