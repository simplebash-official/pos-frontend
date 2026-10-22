import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Paper, Tabs } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';

/** A flex column that takes the room left by its parent and may shrink below its content. */
const FILL = { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } as const;

export interface AnimatedTab<V extends string> {
  value: V;
  label: string;
  icon: ReactNode;
  /** A count shown beside the name; leave out for none. */
  count?: number;
}

export interface AnimatedTabsProps<V extends string> {
  tabs: AnimatedTab<V>[];
  value: V;
  onChange: (value: V) => void;
  /** The panel for the tab that is active. */
  children: (value: V) => ReactNode;
  /** Take all the height the parent has, so a panel can scroll a long list inside itself. */
  fill?: boolean;
  /** Stretch tabs to fill the entire bar width (default false to keep natural widths). */
  grow?: boolean;
}

/**
 * The number beside a tab name: on the active (blue) tab a white-tinted chip,
 * otherwise blue when there is something to see and grey when empty.
 */
export const CountChip = ({ count, active }: { count: number; active: boolean }) => (
  <Box
    component="span"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 20,
      height: 20,
      padding: '0 5px',
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      flexShrink: 0,
      background: active
        ? 'color-mix(in srgb, var(--mantine-color-white) 24%, transparent)'
        : count > 0
          ? 'var(--mantine-color-blue-light)'
          : 'var(--bg-card)',
      color: active
        ? 'var(--mantine-color-white)'
        : count > 0
          ? 'var(--mantine-color-blue-light-color)'
          : 'var(--text-secondary)',
      border: !active ? '1px solid var(--border)' : '1px solid transparent',
    }}
  >
    {count}
  </Box>
);

/** A tab's label, with the blue highlight that glides to whichever tab is active. */
const TabLabel = ({ active, children }: { active: boolean; children: ReactNode }) => (
  <>
    {active && (
      <motion.span
        layoutId="rich-tab-pill"
        className="rich-tab-pill"
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      />
    )}
    <span className="rich-tab-label">{children}</span>
  </>
);

/**
 * Pill tabs in a tinted strip over one card. The blue highlight glides between tabs
 * and the panel fades and slides the way the bar moved. Movement is dropped for
 * anyone who asks the system for reduced motion.
 */
export const AnimatedTabs = <V extends string>({
  tabs,
  value,
  onChange,
  children,
  fill = false,
  grow = false,
}: AnimatedTabsProps<V>) => {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const index = tabs.findIndex((tab) => tab.value === value);

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const scrollToTab = useCallback(
    (tabEl: HTMLElement | null, behavior: ScrollBehavior = 'smooth') => {
      if (!tabEl || !listRef.current) return;
      const list = listRef.current;
      const listRect = list.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();

      // Guard for JSDOM or zero-layout test environments
      if (listRect.width === 0 || tabRect.width === 0) return;

      const padding = 10; // matches Tabs.List horizontal padding (var(--mantine-spacing-xs))

      if (tabRect.left < listRect.left + padding) {
        // Cut off on the left: scroll container left to reveal full tab
        const delta = tabRect.left - (listRect.left + padding);
        const targetLeft = Math.max(0, list.scrollLeft + delta);
        if (typeof list.scrollTo === 'function') {
          list.scrollTo({ left: targetLeft, behavior });
        } else {
          list.scrollLeft = targetLeft;
        }
      } else if (tabRect.right > listRect.right - padding) {
        // Cut off on the right: scroll container right to reveal full tab
        const delta = tabRect.right - (listRect.right - padding);
        const targetLeft = list.scrollLeft + delta;
        if (typeof list.scrollTo === 'function') {
          list.scrollTo({ left: targetLeft, behavior });
        } else {
          list.scrollLeft = targetLeft;
        }
      }
    },
    []
  );

  useEffect(() => {
    const activeEl = tabRefs.current.get(value);
    if (activeEl) {
      scrollToTab(activeEl, reduceMotion ? 'auto' : 'smooth');
    }
  }, [value, reduceMotion, scrollToTab]);

  // Slide the panel the way the tab bar moved; adjusted while rendering so it is right on the first frame.
  const [previousIndex, setPreviousIndex] = useState(index);
  const [direction, setDirection] = useState<1 | -1>(1);
  if (index !== previousIndex) {
    setDirection(index > previousIndex ? 1 : -1);
    setPreviousIndex(index);
  }
  const slide = reduceMotion ? 0 : 16;

  return (
    <Paper
      p={0}
      bg="var(--bg-card)"
      shadow="xs"
      style={{ overflow: 'hidden', ...(fill ? FILL : undefined) }}
    >
      <Tabs
        id={baseId}
        value={value}
        onChange={(next) => onChange((next ?? value) as V)}
        variant="pills"
        color="blue"
        classNames={{ root: 'rich-tabs' }}
      >
        <Tabs.List
          ref={listRef}
          grow={grow}
          style={{
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: reduceMotion ? 'auto' : 'smooth',
            gap: isMobile ? 4 : 6,
            padding: 'var(--mantine-spacing-xs)',
            background: 'var(--bg-app)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {tabs.map((tab) => {
            const active = tab.value === value;
            return (
              <Tabs.Tab
                key={tab.value}
                ref={(node) => {
                  if (node) {
                    tabRefs.current.set(tab.value, node);
                  } else {
                    tabRefs.current.delete(tab.value);
                  }
                }}
                onClick={(e) => {
                  scrollToTab(e.currentTarget, reduceMotion ? 'auto' : 'smooth');
                }}
                value={tab.value}
                px={isMobile ? 6 : 10}
                leftSection={isMobile ? undefined : tab.icon}
                rightSection={
                  tab.count === undefined ? undefined : (
                    <CountChip count={tab.count} active={active} />
                  )
                }
              >
                <TabLabel active={active}>{tab.label}</TabLabel>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      <Box p="md" style={{ overflow: 'hidden', ...(fill ? FILL : undefined) }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            role="tabpanel"
            id={`${baseId}-panel-${value}`}
            aria-labelledby={`${baseId}-tab-${value}`}
            style={fill ? FILL : undefined}
            initial={{ opacity: 0, x: direction * slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * slide }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {children(value)}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Paper>
  );
};
