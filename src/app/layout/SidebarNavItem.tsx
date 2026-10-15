import { memo, type ComponentType, type CSSProperties } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { ActionIcon, Badge, Indicator, NavLink, Tooltip, type NavLinkProps } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';

type NavIcon = ComponentType<{ size?: number | string; stroke?: number | string }>;

const PILL_SPRING = { type: 'spring', stiffness: 500, damping: 38 } as const;

/** The highlight that glides to whichever item is active; one per layout, so the id is shared. */
const SidebarPill = ({ layoutId, background }: { layoutId: string; background: string }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      layoutId={layoutId}
      className="sidebar-pill"
      style={{ background }}
      transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
    />
  );
};

/** A count that pops in (and nudges when the number changes). Transform only. */
const PopCount = ({ count }: { count: number }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      key={count}
      initial={reduceMotion ? false : { scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={PILL_SPRING}
      style={{ display: 'inline-block' }}
    >
      {count}
    </motion.span>
  );
};

const INDICATOR_STYLES = {
  indicator: {
    fontSize: 9,
    fontWeight: 700,
    padding: '0 3px',
    minWidth: 14,
    height: 14,
    lineHeight: '12px',
    borderColor: 'var(--mantine-color-body)',
  },
};

interface ItemProps {
  to: string;
  label: string;
  Icon: NavIcon;
  color: string;
  isActive: boolean;
  /** 0 hides the count. */
  badgeCount: number;
  onClick?: () => void;
}

export const RailNavItem = memo(function RailNavItem({
  to,
  label,
  Icon,
  color,
  isActive,
  badgeCount,
  onClick,
}: ItemProps) {
  return (
    <Tooltip label={label} position="right" withArrow>
      <Indicator
        inline
        label={badgeCount > 0 ? <PopCount count={badgeCount} /> : undefined}
        maxValue={99}
        size={16}
        color="red"
        disabled={badgeCount <= 0}
        withBorder
        offset={2}
        styles={INDICATOR_STYLES}
      >
        <div className="sidebar-item">
          {isActive && (
            <SidebarPill
              layoutId="sidebar-pill-rail"
              background={`var(--mantine-color-${color}-filled)`}
            />
          )}
          <ActionIcon
            component={RouterNavLink}
            to={to}
            size="lg"
            className="sidebar-link"
            variant={isActive ? 'transparent' : 'subtle'}
            color="gray"
            style={isActive ? { color: 'var(--mantine-color-white)' } : undefined}
            aria-label={label}
            onClick={onClick}
          >
            <Icon size={20} stroke={1.5} />
          </ActionIcon>
        </div>
      </Indicator>
    </Tooltip>
  );
});

interface FullItemProps extends Omit<ItemProps, 'Icon'> {
  Icon: NavIcon;
  linkStyles: NavLinkProps['styles'];
  minHeight: number | undefined;
  /** Position in the open mobile drawer: items slide in one after another. Leave out for none. */
  enterIndex: number | undefined;
}

export const FullNavItem = memo(function FullNavItem({
  to,
  label,
  Icon,
  color,
  isActive,
  badgeCount,
  onClick,
  linkStyles,
  minHeight,
  enterIndex,
}: FullItemProps) {
  const reduceMotion = useReducedMotion();
  const slideIn = enterIndex !== undefined && !reduceMotion;
  const style: CSSProperties = { borderRadius: 'var(--mantine-radius-default)', minHeight };
  return (
    <motion.div
      className="sidebar-item"
      initial={slideIn ? { opacity: 0, x: -8 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: slideIn ? Math.min(enterIndex, 10) * 0.02 : 0 }}
    >
      {isActive && (
        <SidebarPill
          layoutId="sidebar-pill-full"
          background={`var(--mantine-color-${color}-light)`}
        />
      )}
      <NavLink
        component={RouterNavLink}
        to={to}
        label={label}
        leftSection={<Icon size={20} stroke={1.5} />}
        rightSection={
          badgeCount > 0 ? (
            <Badge size="xs" color="red" variant="filled">
              <PopCount count={badgeCount} />
            </Badge>
          ) : undefined
        }
        active={isActive}
        color={color}
        variant="light"
        className="sidebar-link"
        onClick={onClick}
        styles={linkStyles}
        style={style}
      />
    </motion.div>
  );
});
