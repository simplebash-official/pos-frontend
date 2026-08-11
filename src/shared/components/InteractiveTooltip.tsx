import { ReactNode, CSSProperties, isValidElement } from 'react';
import {
  HoverCard,
  Box,
  Stack,
  Group,
  Text,
  ThemeIcon,
  Badge,
  Kbd,
  MantineRadius,
  MantineColor,
  FloatingPosition,
} from '@mantine/core';

export interface InteractiveTooltipProps {
  /** The trigger element that receives hover / focus */
  children: ReactNode;

  /** Main content text or React node */
  content?: ReactNode;

  /** Alias for content / label */
  label?: ReactNode;

  /** Optional header title */
  title?: ReactNode;

  /** Optional secondary description text */
  description?: ReactNode;

  /** Optional leading icon in tooltip header */
  icon?: ReactNode;

  /** Optional keyboard shortcut or tag chip (e.g. 'Click', 'Enter', ['Cmd', 'K']) */
  shortcut?: string | string[];

  /** Optional badge text or badge node */
  badge?: ReactNode;

  /** Optional footer note, hint, or action link */
  footer?: ReactNode;

  /** Position of the tooltip relative to target. Default: 'top' */
  position?: FloatingPosition;

  /** Space between target and tooltip in px. Default: 8 */
  offset?: number;

  /** Whether to display the arrow. Default: true */
  withArrow?: boolean;

  /** Arrow size in px. Default: 7 */
  arrowSize?: number;

  /** Arrow offset in px. Default: 10 */
  arrowOffset?: number;

  /** Delay in ms before opening. Default: 180 */
  openDelay?: number;

  /** Delay in ms before closing on mouse leave. Default: 140 */
  closeDelay?: number;

  /** Border radius (defaults to theme.defaultRadius / var(--mantine-radius-default)) */
  radius?: MantineRadius;

  /** Max width in px or css string. Default: 280 */
  maxWidth?: number | string;

  /** Min width in px or css string */
  minWidth?: number | string;

  /** Custom width in px or css string */
  width?: number | string;

  /** Custom color accent for icons, badges, or stripes */
  color?: MantineColor | string;

  /** Whether tooltip is disabled. Default: false */
  disabled?: boolean;

  /** Whether to render inside Mantine Portal. Default: true */
  withinPortal?: boolean;

  /** Z-index for the floating dropdown. Default: 1100 */
  zIndex?: number | string;

  /** Custom style for the dropdown container */
  dropdownStyle?: CSSProperties;

  /** Custom style for the target wrapper if needed */
  targetStyle?: CSSProperties;

  /** Custom class name for dropdown */
  className?: string;

  /** Whether to keep dropdown mounted in DOM when closed. Default: false */
  keepMounted?: boolean;
}

export const InteractiveTooltip = ({
  children,
  content,
  label,
  title,
  description,
  icon,
  shortcut,
  badge,
  footer,
  position = 'top',
  offset = 8,
  withArrow = true,
  arrowSize = 7,
  arrowOffset = 10,
  openDelay = 180,
  closeDelay = 140,
  radius,
  maxWidth = 280,
  minWidth,
  width,
  color = 'blue',
  disabled = false,
  withinPortal = true,
  zIndex = 1100,
  dropdownStyle,
  targetStyle,
  className,
  keepMounted = false,
}: InteractiveTooltipProps) => {
  const bodyText = description || content || label;
  const hasContent = Boolean(title || bodyText || icon || shortcut || badge || footer);

  if (disabled || !hasContent) {
    return <>{children}</>;
  }

  const targetNode = isValidElement(children) ? (
    children
  ) : (
    <Box component="span" style={{ display: 'inline-flex', maxWidth: '100%', ...targetStyle }}>
      {children}
    </Box>
  );

  return (
    <HoverCard
      position={position}
      offset={offset}
      withArrow={withArrow}
      arrowSize={arrowSize}
      arrowOffset={arrowOffset}
      arrowRadius={2}
      openDelay={openDelay}
      closeDelay={closeDelay}
      shadow="md"
      withinPortal={withinPortal}
      zIndex={zIndex}
      keepMounted={keepMounted}
    >
      <HoverCard.Target>{targetNode}</HoverCard.Target>
      <HoverCard.Dropdown
        className={className}
        style={{
          padding: '8px 12px',
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          borderRadius: radius ?? 'var(--mantine-radius-default)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
          maxWidth: maxWidth,
          minWidth: minWidth,
          width: width,
          pointerEvents: 'auto',
          userSelect: 'none',
          backdropFilter: 'blur(8px)',
          ...dropdownStyle,
        }}
      >
        <Stack gap={6}>
          {(title || icon || shortcut || badge) && (
            <Group gap="xs" justify="space-between" wrap="nowrap" align="center">
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                {icon && (
                  <ThemeIcon
                    size={20}
                    radius="var(--mantine-radius-default)"
                    variant="light"
                    color={color}
                    style={{ flexShrink: 0 }}
                  >
                    {icon}
                  </ThemeIcon>
                )}
                {title && (
                  <Text size="xs" fw={600} c="var(--text-primary)" truncate>
                    {title}
                  </Text>
                )}
              </Group>

              {shortcut && (
                <Group gap={3} wrap="nowrap" style={{ flexShrink: 0 }}>
                  {Array.isArray(shortcut) ? (
                    shortcut.map((key, i) => (
                      <Kbd key={i} size="xs" style={{ fontSize: 10, padding: '1px 4px' }}>
                        {key}
                      </Kbd>
                    ))
                  ) : (
                    <Kbd size="xs" style={{ fontSize: 10, padding: '1px 4px' }}>
                      {shortcut}
                    </Kbd>
                  )}
                </Group>
              )}

              {badge &&
                (typeof badge === 'string' ? (
                  <Badge size="xs" variant="light" color={color} style={{ flexShrink: 0 }}>
                    {badge}
                  </Badge>
                ) : (
                  badge
                ))}
            </Group>
          )}

          {bodyText &&
            (typeof bodyText === 'string' ? (
              <Text
                size="xs"
                c="var(--text-secondary)"
                style={{ lineHeight: 1.45, wordBreak: 'break-word' }}
              >
                {bodyText}
              </Text>
            ) : (
              bodyText
            ))}

          {footer && (
            <Box pt={4} style={{ borderTop: '1px solid var(--border)' }}>
              {footer}
            </Box>
          )}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
