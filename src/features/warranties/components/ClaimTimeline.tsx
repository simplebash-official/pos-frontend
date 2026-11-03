import { Box, Group, Stack, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { claimStages, type ClaimStage } from '../lib/claimView';
import type { WarrantyClaim } from '../types';

const DOT = 22;

const StageDot = ({ stage }: { stage: ClaimStage }) => {
  const reduced = useReducedMotion();
  const done = stage.state === 'done';
  const current = stage.state === 'current';
  return (
    <Box
      style={{
        position: 'relative',
        width: DOT,
        height: DOT,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: done ? 'var(--mantine-color-blue-filled)' : 'var(--bg-card)',
        border: `2px solid ${
          done || current ? 'var(--mantine-color-blue-filled)' : 'var(--border-strong)'
        }`,
        color: 'var(--mantine-color-white)',
      }}
    >
      {done && <IconCheck size={13} stroke={3} />}
      {current && (
        <motion.span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--mantine-color-blue-filled)',
          }}
          animate={reduced ? undefined : { scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </Box>
  );
};

const stageText = (stage: ClaimStage) => (
  <>
    <Text
      size="xs"
      fw={stage.state === 'todo' ? 500 : 700}
      c={stage.state === 'todo' ? 'dimmed' : undefined}
    >
      {stage.label}
    </Text>
    {stage.on !== undefined && (
      <Text size="xs" c="dimmed">
        {formatDate(stage.on, 'DD MMM')}
      </Text>
    )}
  </>
);

/**
 * Where a claim is in its life: a row of steps on a wide screen, a column on a phone. Done steps
 * carry a tick, the step it waits on now pulses (still for reduced motion).
 */
export const ClaimTimeline = ({ claim }: { claim: WarrantyClaim }) => {
  const isMobile = useIsMobile();
  const stages = claimStages(claim);
  const line = (filled: boolean) =>
    filled ? 'var(--mantine-color-blue-filled)' : 'var(--border-strong)';

  if (isMobile) {
    return (
      <Stack gap={0} role="list" aria-label={t('Claim steps')}>
        {stages.map((stage, index) => (
          <Group key={stage.key} gap="sm" align="stretch" wrap="nowrap" role="listitem">
            <Stack gap={0} align="center">
              <StageDot stage={stage} />
              {index < stages.length - 1 && (
                <Box
                  w={2}
                  style={{ flex: 1, minHeight: 14, background: line(stage.state === 'done') }}
                />
              )}
            </Stack>
            <Box pb="sm">{stageText(stage)}</Box>
          </Group>
        ))}
      </Stack>
    );
  }

  return (
    <Group gap={0} wrap="nowrap" align="flex-start" role="list" aria-label={t('Claim steps')}>
      {stages.map((stage, index) => (
        <Stack
          key={stage.key}
          gap={6}
          align="center"
          style={{ flex: 1, minWidth: 0 }}
          role="listitem"
        >
          <Group gap={0} wrap="nowrap" w="100%" align="center">
            <Box
              style={{
                flex: 1,
                height: 2,
                background: index === 0 ? 'transparent' : line(stage.state === 'done'),
              }}
            />
            <StageDot stage={stage} />
            <Box
              style={{
                flex: 1,
                height: 2,
                background:
                  index === stages.length - 1
                    ? 'transparent'
                    : line(stages[index + 1].state === 'done'),
              }}
            />
          </Group>
          <Box ta="center" px={4}>
            {stageText(stage)}
          </Box>
        </Stack>
      ))}
    </Group>
  );
};
