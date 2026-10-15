import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Paper, Tabs } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';

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
      minWidth: 22,
      height: 22,
      padding: '0 6px',
      borderRadius: 11,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      background: active
        ? 'color-mix(in srgb, var(--mantine-color-white) 24%, transparent)'
        : count > 0
          ? 'var(--mantine-color-blue-light)'
          : 'var(--bg-active)',
      color: active
        ? 'var(--mantine-color-white)'
        : count > 0
          ? 'var(--mantine-color-blue-light-color)'
          : 'var(--text-secondary)',
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
}: AnimatedTabsProps<V>) => {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const index = tabs.findIndex((tab) => tab.value === value);

  // Slide the panel the way the tab bar moved; adjusted while rendering so it is right on the first frame.
  const [previousIndex, setPreviousIndex] = useState(index);
  const [direction, setDirection] = useState<1 | -1>(1);
  if (index !== previousIndex) {
    setDirection(index > previousIndex ? 1 : -1);
    setPreviousIndex(index);
  }
  const slide = reduceMotion ? 0 : 16;

  return (
    <Paper p={0} bg="var(--bg-card)" shadow="xs" style={{ overflow: 'hidden' }}>
      <Tabs
        id={baseId}
        value={value}
        onChange={(next) => onChange((next ?? value) as V)}
        variant="pills"
        color="blue"
        classNames={{ root: 'rich-tabs' }}
      >
        <Tabs.List
          grow
          style={{
            flexWrap: 'nowrap',
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
                value={tab.value}
                px={isMobile ? 6 : undefined}
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

      <Box p="md" style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            role="tabpanel"
            id={`${baseId}-panel-${value}`}
            aria-labelledby={`${baseId}-tab-${value}`}
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
