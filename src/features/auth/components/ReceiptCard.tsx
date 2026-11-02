import { Box, Text } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/shared/motion';
import { t } from '@/shared/i18n/t';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const FEATURES = ['Sales', 'Expenses', 'Stock', 'Profit'];
const BARCODE_HEIGHT = 36;

// Thin and thick bars, repeated: reads as a barcode at a glance.
const BARCODE =
  'repeating-linear-gradient(90deg, var(--receipt-ink) 0 2px, transparent 2px 3px, ' +
  'var(--receipt-ink) 3px 4px, transparent 4px 6px, var(--receipt-ink) 6px 9px, transparent 9px 11px)';

// Downward triangles along the bottom: the torn edge of a till roll.
const TORN_EDGE =
  'conic-gradient(from -45deg at bottom, var(--receipt-paper) 90deg, transparent 0) 0 0 / 12px 100%';

const Dashes = () => (
  <Box my={10} style={{ borderTop: '1px dashed var(--receipt-ink)', opacity: 0.35 }} />
);

/**
 * A till receipt that prints the day's records line by line, with a scanner
 * line sweeping its barcode. Decorative: the panel's subline says the same thing.
 */
export const ReceiptCard = () => {
  const reduced = useReducedMotion() === true;
  // Every row after the header prints in turn, like a thermal printer feeding paper.
  const print = (step: number) => ({
    initial: reduced ? false : { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { delay: 0.3 + step * 0.18, duration: 0.25, ease: EASE },
  });

  return (
    <Box
      aria-hidden
      data-testid="receipt-card"
      style={{
        width: 240,
        transform: 'rotate(-3deg)',
        filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.3))',
      }}
    >
      <Box
        px={20}
        pt={18}
        pb={14}
        style={{
          background: 'var(--receipt-paper)',
          color: 'var(--receipt-ink)',
          fontFamily: MONO,
          borderRadius: '6px 6px 0 0',
        }}
      >
        <Text
          ta="center"
          fw={700}
          fz="sm"
          ff={MONO}
          tt="uppercase"
          style={{ letterSpacing: '0.2em' }}
        >
          {t('Receipt')}
        </Text>
        <Dashes />
        {FEATURES.map((feature, i) => (
          <motion.div key={feature} {...print(i)}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                lineHeight: 1.9,
              }}
            >
              <span>{t(feature)}</span>
              <span>✓</span>
            </Box>
          </motion.div>
        ))}
        <motion.div {...print(FEATURES.length)}>
          <Dashes />
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <span>{t('Total')}</span>
            <span style={{ background: 'var(--brand-accent)', padding: '0 4px' }}>
              {t('All counted')}
            </span>
          </Box>
        </motion.div>
        <motion.div {...print(FEATURES.length + 1)}>
          <Box
            mt={14}
            style={{ position: 'relative', height: BARCODE_HEIGHT, background: BARCODE }}
          >
            {!reduced && (
              <motion.div
                style={{
                  position: 'absolute',
                  left: -6,
                  right: -6,
                  top: 0,
                  height: 2,
                  background: 'var(--brand-accent)',
                  boxShadow: '0 0 8px 2px var(--brand-accent)',
                }}
                animate={{ y: [0, BARCODE_HEIGHT, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </Box>
        </motion.div>
      </Box>
      <Box style={{ height: 6, background: TORN_EDGE }} />
    </Box>
  );
};
