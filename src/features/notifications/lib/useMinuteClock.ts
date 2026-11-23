import { useEffect, useState } from 'react';

/** The current time, refreshed every 30 s while `active`, so "5 min ago" keeps counting. */
export const useMinuteClock = (active: boolean): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
};
