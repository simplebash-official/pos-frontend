import { ReactNode, MouseEvent, isValidElement } from 'react';
import {
  Accordion,
  AccordionProps,
  AccordionItemProps,
  ActionIcon,
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  MantineColor,
} from '@mantine/core';
import { InteractiveTooltip, InteractiveTooltipProps } from './InteractiveTooltip';

export interface ExpandableCardActionProps {
  icon: ReactNode;
  tooltip?: string;
  color?: MantineColor | string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  width?: number | string;
}

export function ExpandableCardAction({
  icon,
  tooltip,
  color = 'blue',
  onClick,
  width = 44,
}: ExpandableCardActionProps) {
  const button = (
    <ActionIcon
      variant="light"
      color={color}
      radius={0}
      style={{
        width,
        height: '100%',
        borderLeft: '1px solid var(--mantine-color-default-border)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {icon}
    </ActionIcon>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip} withArrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}

export interface ExpandableCardProps extends Omit<AccordionItemProps, 'children' | 'title'> {
  value: string;
  /** Primary title text or node shown in the card header. */
  title: ReactNode;
  /** Optional secondary subtitle text or node (e.g., subcategory count, description, status). */
  subtitle?: ReactNode;
  /** Optional icon element rendered inside a ThemeIcon container. */
  icon?: ReactNode;
  /** Theme color used for the left accent stripe (3px) and ThemeIcon background. Defaults to 'blue'. */
  color?: MantineColor | string;
  /** Optional flush action buttons rendered on the right side of the header. */
  actions?: ReactNode;
  /** Content rendered inside the expandable panel. */
  children?: ReactNode;
  /** Optional min-height for the header row. Defaults to 48px. */
  minHeaderHeight?: number | string;
  /** Optional interactive tooltip shown when hovering over the card header */
  tooltip?: ReactNode | Omit<InteractiveTooltipProps, 'children'>;
}

export function ExpandableCard({
  value,
  title,
  subtitle,
  icon,
  color = 'blue',
  actions,
  children,
  minHeaderHeight = 48,
  tooltip,
  style,
  ...itemProps
}: ExpandableCardProps) {
  const stripeColor =
    typeof color === 'string' && (color.startsWith('#') || color.startsWith('rgb'))
      ? color
      : `var(--mantine-color-${color}-6)`;

  const headerContent = (
    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0, padding: '8px 12px' }}>
      {icon && (
        <ThemeIcon
          color={color}
          variant="light"
          size={36}
          radius="var(--mantine-radius-default)"
          style={{ flexShrink: 0 }}
        >
          {icon}
        </ThemeIcon>
      )}
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        {typeof title === 'string' ? (
          <Text fw={600} size="sm" truncate style={{ textAlign: 'left' }}>
            {title}
          </Text>
        ) : (
          title
        )}
        {subtitle &&
          (typeof subtitle === 'string' ? (
            <Text size="xs" c="dimmed" style={{ textAlign: 'left' }}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          ))}
      </Stack>
    </Group>
  );

  const renderHeader = () => {
    if (!tooltip) return headerContent;

    if (
      typeof tooltip === 'object' &&
      tooltip !== null &&
      !isValidElement(tooltip) &&
      ('content' in tooltip || 'title' in tooltip || 'label' in tooltip || 'description' in tooltip)
    ) {
      return (
        <InteractiveTooltip {...(tooltip as Omit<InteractiveTooltipProps, 'children'>)}>
          {headerContent}
        </InteractiveTooltip>
      );
    }

    return (
      <InteractiveTooltip
        content={tooltip as ReactNode}
        title={typeof title === 'string' ? title : undefined}
        color={typeof color === 'string' ? color : 'blue'}
      >
        {headerContent}
      </InteractiveTooltip>
    );
  };

  return (
    <Accordion.Item
      value={value}
      style={{
        borderLeft: `3px solid ${stripeColor}`,
        overflow: 'hidden',
        ...style,
      }}
      {...itemProps}
    >
      <Accordion.Control style={{ padding: 0 }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'stretch',
            minHeight: minHeaderHeight,
            width: '100%',
          }}
        >
          {renderHeader()}

          {actions && (
            <Group
              gap={0}
              align="stretch"
              style={{ flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </Group>
          )}
        </Box>
      </Accordion.Control>
      {children && <Accordion.Panel>{children}</Accordion.Panel>}
    </Accordion.Item>
  );
}

export type ExpandableCardGroupProps<Multiple extends boolean = false> = Omit<
  AccordionProps<Multiple>,
  'variant' | 'chevron'
> & {
  children: ReactNode;
};

export function ExpandableCardGroup<Multiple extends boolean = false>({
  children,
  styles,
  ...accordionProps
}: ExpandableCardGroupProps<Multiple>) {
  return (
    <Accordion<Multiple>
      variant="separated"
      chevron={null}
      styles={{
        control: { padding: 0 },
        label: { padding: 0 },
        ...(typeof styles === 'object' ? styles : {}),
      }}
      {...accordionProps}
    >
      {children}
    </Accordion>
  );
}
