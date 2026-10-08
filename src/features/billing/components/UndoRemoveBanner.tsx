import { t } from '@/shared/i18n/t';
import { useState, useEffect, useRef, memo } from 'react';
import { Paper, Group, Box, Text, Button, ActionIcon, ThemeIcon } from '@mantine/core';
import { IconArrowBackUp, IconX } from '@tabler/icons-react';

export interface UndoRemoveBannerProps {
  itemName: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** Timeout in milliseconds before auto-dismissing. Defaults to 4000ms. */
  durationMs?: number;
}

export const UndoRemoveBanner = memo(function UndoRemoveBanner({
  itemName,
  onUndo,
  onDismiss,
  durationMs = 4000,
}: UndoRemoveBannerProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isPaused, setIsPaused] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Reset timer if item or duration changes
  useEffect(() => {
    setRemainingMs(durationMs);
  }, [itemName, durationMs]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - 100;
        if (next <= 0) {
          clearInterval(interval);
          onDismissRef.current();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, durationMs, itemName]);

  const secondsLeft = Math.max(1, Math.ceil(remainingMs / 1000));
  const progressPercent = Math.max(0, Math.min(100, (remainingMs / durationMs) * 100));

  return (
    <Paper
      p="xs"
      radius="md"
      withBorder
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-hover)',
        borderLeft: '4px solid var(--mantine-color-blue-6)',
        transition: 'border-color 0.15s ease',
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <ThemeIcon
            size={28}
            radius="xl"
            variant="light"
            color="blue"
            style={{ flexShrink: 0 }}
          >
            <IconArrowBackUp size={16} />
          </ThemeIcon>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text size="xs" lineClamp={1}>
              <Text span c="dimmed" mr={4}>
                {t('Removed')}
              </Text>
              <Text span fw={600} c="var(--text-primary)">
                "{itemName}"
              </Text>
            </Text>
          </Box>
        </Group>

        <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={onUndo}
            style={{
              height: 28,
              fontSize: 12,
              fontWeight: 600,
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            {t('Undo')} ({secondsLeft}s)
          </Button>
          <ActionIcon
            size={28}
            variant="subtle"
            color="gray"
            onClick={onDismiss}
            aria-label={t('Dismiss')}
          >
            <IconX size={15} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Visual countdown progress line */}
      <Box
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          width: `${progressPercent}%`,
          backgroundColor: 'var(--mantine-color-blue-6)',
          opacity: isPaused ? 0.9 : 0.6,
          transition: isPaused ? 'none' : 'width 100ms linear',
        }}
      />
    </Paper>
  );
});
