import { t } from '@/shared/i18n/t';
import { useState, useEffect } from 'react';
import { formatClockTime, formatClockDate, parseClockTimeParts } from '@/shared/lib/date';

export interface ModernClockProps {
  variant: 'header' | 'compact';
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
 * Supports 'header' for the standard top navigation bar (42px pill) and 'compact'
 * for the slim billing header (28px pill).
 */
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
  const isCompact = variant === 'compact';
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
        height: isCompact ? 28 : 42,
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
          gap: isCompact ? 6 : 9,
          padding: isCompact ? '0 10px' : '0 16px',
          backgroundColor: 'var(--bg-card)',
          height: '100%',
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden="true"
          className="pos-clock-live-dot"
          style={{
            width: isCompact ? 5.5 : 8,
            height: isCompact ? 5.5 : 8,
            borderRadius: '50%',
            backgroundColor: 'var(--status-ok)',
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontSize: isCompact ? '0.72rem' : '0.9rem',
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
          gap: isCompact ? 5 : 7,
          padding: isCompact ? '0 12px' : '0 20px',
          backgroundColor: 'var(--bg-active)',
          borderLeft: '1px solid var(--border)',
          height: '100%',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: isCompact ? '0.825rem' : '1.2rem',
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
            fontSize: isCompact ? '0.585rem' : '0.75rem',
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
