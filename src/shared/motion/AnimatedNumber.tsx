import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export interface AnimatedNumberProps {
  value: number;
  /** Turns the in-between value into text, e.g. `formatMoney`. */
  format: (value: number) => string;
  /** Seconds; kept short so a total never lags behind the till. */
  duration?: number;
}

/** A figure that counts to its new value. Tabular digits keep the width steady; reduced motion snaps. */
export const AnimatedNumber = ({ value, format, duration = 0.35 }: AnimatedNumberProps) => {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduceMotion || from.current === value) {
      from.current = value;
      setShown(value);
      return undefined;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
      onComplete: () => {
        from.current = value;
        setShown(value);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduceMotion]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{format(shown)}</span>;
};
