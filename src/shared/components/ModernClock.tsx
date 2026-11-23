import { t } from '@/shared/i18n/t';
import { useState, useEffect } from 'react';
import { formatClockTime, formatClockDate, parseClockTimeParts } from '@/shared/lib/date';

export interface ModernClockProps {
  variant: 'hero' | 'header' | 'compact';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Split-pill live clock:
 * - Left segment: live indicator dot + abbreviated date (e.g. 'Tue, Nov 10')
 * - Center: 1px vertical divider
 * - Right segment: tabular-num bold 12h time (e.g. '2:46:54') + blue period (e.g. 'AM')
 *
 * Supports 'hero' for the dashboard cockpit (64px pill), 'header' for the standard top
 * navigation bar (46px pill) and 'compact' for the slim billing header (28px pill).
 */
const SIZES = {
  hero: {
    h: 64,
    dot: 10,
    gap: 11,
    padL: '0 22px',
    date: '1.05rem',
    gapR: 9,
    padR: '0 26px',
    time: '2rem',
    period: '0.95rem',
  },
  header: {
    h: 46,
    dot: 8,
    gap: 9,
    padL: '0 16px',
    date: '0.95rem',
    gapR: 7,
    padR: '0 20px',
    time: '1.35rem',
    period: '0.8rem',
  },
  compact: {
    h: 28,
    dot: 5.5,
    gap: 6,
    padL: '0 10px',
    date: '0.72rem',
    gapR: 5,
    padR: '0 12px',
    time: '0.9rem',
    period: '0.585rem',
  },
} as const;

export const ModernClock = ({ variant, id, className, style }: ModernClockProps) => {
  const [time, setTime] = useState<string>(() => formatClockTime(new Date()));
  const [date, setDate] = useState<string>(() => formatClockDate(new Date()));

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
  const z = SIZES[variant];
  const timeString = `${hours}:${minutes}:${seconds}`;

  return (
    <div
      id={id}
      className={className}
      role="timer"
      aria-label={`${t('Live')} - ${date}, ${time}`}
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        height: z.h,
        borderRadius: 'var(--mantine-radius-default)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        overflow: 'hidden',
        userSelect: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Left Segment: Live Dot & Date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: z.gap,
          padding: z.padL,
          backgroundColor: 'var(--bg-card)',
          height: '100%',
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden="true"
          className="pos-clock-live-dot"
          style={{
            width: z.dot,
            height: z.dot,
            borderRadius: '50%',
            backgroundColor: 'var(--status-ok)',
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontSize: z.date,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {date}
        </span>
      </div>

      {/* Right Segment: Time & Period (with left divider) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: z.gapR,
          padding: z.padR,
          backgroundColor: 'var(--bg-active)',
          borderLeft: '1px solid var(--border)',
          height: '100%',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: z.time,
            lineHeight: 1,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {timeString}
        </span>
        <span
          style={{
            fontWeight: 800,
            fontSize: z.period,
            lineHeight: 1,
            color: 'var(--mantine-color-blue-5)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {period}
        </span>
      </div>
    </div>
  );
};
