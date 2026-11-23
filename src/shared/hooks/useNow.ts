import { useEffect, useState } from 'react';

/** The current time, refreshed once a second, but only while `active` (a countdown or fading chip is on screen). */
export const useNow = (active: boolean): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
};
