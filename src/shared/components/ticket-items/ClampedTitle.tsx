import { useLayoutEffect, useRef, useState } from 'react';
import { Text, Tooltip } from '@mantine/core';

/** An item's title, cut after two lines; hovering a cut title shows the whole name. */
export const ClampedTitle = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const measure = () => setCut(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);
  return (
    <Tooltip label={text} disabled={!cut} multiline maw={320} position="top-start" zIndex={401}>
      <Text ref={ref} size="sm" fw={600} lineClamp={2}>
        {text}
      </Text>
    </Tooltip>
  );
};
