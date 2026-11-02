import { type ReactNode } from 'react';
import { Box, Stack, Text, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandBackdrop, BrandLogo, GlassPill } from '@/shared/components/brand';
import { CounterScene } from './CounterScene';

export interface BrandPanelProps {
  /** Small pill above the headline. */
  badge?: string;
  headline: string;
  subline?: string;
  /** Step cards or anything else pinned to the bottom of the panel. */
  footer?: ReactNode;
  /** Phones: a short band with just the mark and headline. */
  compact?: boolean;
}

export const BrandPanel = ({
  badge,
  headline,
  subline,
  footer,
  compact = false,
}: BrandPanelProps) => {
  return (
    <Box
      style={{
        position: 'relative',
        height: '100%',
        borderRadius: compact ? 20 : 32,
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      <BrandBackdrop />
      {!compact && <CounterScene />}
      <Stack
        justify="space-between"
        h="100%"
        p={compact ? 'md' : 40}
        gap={compact ? 'sm' : 'xl'}
        style={{ position: 'relative' }}
      >
        <BrandLogo tone="on-brand" />
        <Stack gap="md">
          {badge && !compact && <GlassPill>{badge}</GlassPill>}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={headline}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Title
                order={2}
                fw={700}
                fz={compact ? 24 : { base: 32, lg: 44 }}
                lh={1.15}
                style={{ color: 'var(--brand-on)', letterSpacing: '-0.02em', textWrap: 'balance' }}
              >
                {headline}
              </Title>
              {subline && !compact && (
                <Text mt="sm" fz="md" style={{ color: 'var(--brand-on-muted)', maxWidth: 440 }}>
                  {subline}
                </Text>
              )}
            </motion.div>
          </AnimatePresence>
          {footer && !compact && (
            <Box mt="lg" visibleFrom="lg">
              {footer}
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
