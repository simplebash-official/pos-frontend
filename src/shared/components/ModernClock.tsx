import { useState, useEffect } from 'react';
import { Paper, Group, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { formatClockTime, formatClockDate, parseClockTimeParts } from '@/shared/lib/date';

export interface ModernClockProps {
  variant?: 'card' | 'header' | 'compact';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  withBorder?: boolean;
}

/**
 * Live 12-hour clock: large digit-style time (muted colons, the seconds segment picked out in the
 * theme's blue accent), an AM/PM pill and the uppercase day/date below it. Supports 'card' (default)
 * for page headers and 'header'/'compact' for the sticky top navigation bar.
 */
export const ModernClock = ({
  variant = 'card',
  id,
  className,
  style,
  withBorder = true,
}: ModernClockProps) => {
  const [time, setTime] = useState<string>(() => formatClockTime());
  const [date, setDate] = useState<string>(() => formatClockDate());

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(formatClockTime(now));
      setDate(formatClockDate(now));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds, period } = parseClockTimeParts(time);

  if (variant === 'header' || variant === 'compact') {
    return (
      <Paper
        id={id}
        py={3}
        px="xs"
        withBorder={withBorder}
        radius="var(--mantine-radius-default)"
        className={className}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          userSelect: 'none',
          ...style,
        }}
      >
        <Group gap="xs" wrap="nowrap" align="center">
          <ThemeIcon color="blue" variant="light" size={28} radius="sm">
            <IconClock size={15} stroke={1.75} />
          </ThemeIcon>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Group gap={4} align="baseline" wrap="nowrap">
              <Text
                fw={800}
                style={{
                  fontSize: '0.925rem',
                  lineHeight: 1.15,
                  color: 'var(--text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.01em',
                }}
              >
                {hours}
                <span style={{ color: 'var(--text-muted)' }}>:</span>
                {minutes}
                <span style={{ color: 'var(--text-muted)' }}>:</span>
                <span style={{ color: 'var(--mantine-color-blue-6)' }}>{seconds}</span>
              </Text>
              <Badge variant="light" color="blue" size="xs" px={4} style={{ height: 16, fontSize: 9 }}>
                {period}
              </Badge>
            </Group>

            <Group gap={4} align="center" wrap="nowrap">
              <Badge
                size="xs"
                variant="light"
                color="blue"
                style={{ height: 13, fontSize: 8, padding: '0 3px' }}
              >
                Live
              </Badge>
              <Text
                fw={700}
                tt="uppercase"
                c="dimmed"
                style={{
                  fontSize: '9.5px',
                  lineHeight: 1,
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                {date}
              </Text>
            </Group>
          </div>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      id={id}
      p="xs"
      px="md"
      withBorder={withBorder}
      radius="var(--mantine-radius-default)"
      className={className}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        ...style,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="center">
        <ThemeIcon color="blue" variant="light" size={42} radius="md">
          <IconClock size={22} stroke={1.5} />
        </ThemeIcon>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Group gap={6} align="baseline" wrap="nowrap">
            <Text
              fw={800}
              style={{
                fontSize: '1.375rem',
                lineHeight: 1,
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}
            >
              {hours}
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              {minutes}
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ color: 'var(--mantine-color-blue-6)' }}>{seconds}</span>
            </Text>
            <Badge variant="light" color="blue" size="sm">
              {period}
            </Badge>
          </Group>

          <Group gap={6} align="center" wrap="nowrap">
            <Badge size="xs" variant="light" color="blue">
              Live
            </Badge>
            <Text
              fw={700}
              tt="uppercase"
              c="dimmed"
              style={{
                fontSize: '11px',
                lineHeight: 1.15,
                letterSpacing: '0.04em',
              }}
            >
              {date}
            </Text>
          </Group>
        </div>
      </Group>
    </Paper>
  );
};
