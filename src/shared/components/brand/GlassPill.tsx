import { type ReactNode } from 'react';
import { Box } from '@mantine/core';

/** Price-tag label for short text sitting on the brand gradient. */
export const GlassPill = ({ children }: { children: ReactNode }) => (
  <div>
    <Box
      py={6}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 12,
        paddingRight: 16,
        borderRadius: '6px 999px 999px 6px',
        background: 'var(--brand-accent)',
        color: 'var(--brand-accent-on)',
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
      }}
    >
      {/* The tag's string hole. */}
      <Box
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--brand-grad-from)',
        }}
      />
      {children}
    </Box>
  </div>
);
