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

/** Soft tint of an item's colour: the active pill behind the row. */
const tint = (color: string) =>
  `color-mix(in srgb, var(--mantine-color-${color}-filled) 14%, transparent)`;

// White ink fails contrast on these light swatches, so their solid tile takes dark ink.
const DARK_INK = new Set(['lime', 'yellow', 'amber']);

/** The item's icon on a small tile in its own colour; solid while the item is open. */
export const IconTile = ({
  Icon,
  color,
  isActive = false,
}: {
  Icon: NavIcon;
  color: string;
  isActive?: boolean;
}) => (
  <span
    className="sidebar-icon-tile"
    data-active={isActive}
    data-ink={DARK_INK.has(color) ? 'dark' : 'light'}
    style={{ '--tile': `var(--mantine-color-${color}-filled)` } as CSSProperties}
  >
    <Icon size={18} stroke={1.75} />
  </span>
);

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
          {isActive && <SidebarPill layoutId="sidebar-pill-rail" background={tint(color)} />}
          <ActionIcon
            component={RouterNavLink}
            to={to}
            size="lg"
            className="sidebar-link"
            variant={isActive ? 'transparent' : 'subtle'}
            color="gray"
            aria-label={label}
            onClick={onClick}
          >
            <IconTile Icon={Icon} color={color} isActive={isActive} />
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
      {isActive && <SidebarPill layoutId="sidebar-pill-full" background={tint(color)} />}
      <NavLink
        component={RouterNavLink}
        to={to}
        label={label}
        leftSection={<IconTile Icon={Icon} color={color} isActive={isActive} />}
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
