import { Box, Group, Text } from '@mantine/core';
import { claimStatusLook } from '../lib/claimView';
import { stateLook, type StateLook } from '../lib/warrantyView';
import type { ClaimStatus, WarrantyState } from '../types';

/** A status as a coloured dot and a word, never colour alone. */
const LookDot = ({ look, size }: { look: StateLook; size: 'xs' | 'sm' }) => (
  <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
    <Box
      w={8}
      h={8}
      style={{ borderRadius: '50%', background: `var(--mantine-color-${look.color}-filled)` }}
    />
    <Text size={size} fw={700} c={look.color} style={{ whiteSpace: 'nowrap' }}>
      {look.label}
    </Text>
  </Group>
);

/** A warranty's state as a coloured dot and a word. */
export const WarrantyStateDot = ({ state, size }: { state: WarrantyState; size: 'xs' | 'sm' }) => (
  <LookDot look={stateLook(state)} size={size} />
);

/** Where a claim is, as a coloured dot and a word. */
export const ClaimStatusDot = ({ status, size }: { status: ClaimStatus; size: 'xs' | 'sm' }) => (
  <LookDot look={claimStatusLook(status)} size={size} />
);
