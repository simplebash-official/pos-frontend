import type { ReactNode } from 'react';
import { Button, Group, Stack, Tooltip } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';

/** A small footer action: a word, its icon and what it does. */
export interface FooterAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export interface FooterMainProps {
  label: string;
  icon: ReactNode;
  /** A Mantine colour; the next status' colour for a ticket. */
  color: string;
  onClick: () => void;
  loading?: boolean;
  /** When set the button is disabled and this says why, in a tooltip. */
  blockedMessage?: string;
  /** The `data-log-id` the click log uses. */
  logId?: string;
}

/** The one filled action of a footer. Full width and 44px on a phone. */
export const FooterMain = ({
  label,
  icon,
  color,
  onClick,
  loading,
  blockedMessage,
  logId,
}: FooterMainProps) => {
  const isMobile = useIsMobile();
  const blocked = blockedMessage !== undefined;
  return (
    <Tooltip label={blockedMessage ?? ''} disabled={!blocked} withArrow>
      {/* The span lets the tooltip show on a disabled button. */}
      <span style={isMobile ? { display: 'block' } : undefined}>
        <Button
          variant="filled"
          color={color}
          autoContrast
          size="sm"
          h={isMobile ? 44 : undefined}
          fullWidth={isMobile}
          disabled={blocked}
          loading={loading}
          leftSection={icon}
          onClick={onClick}
          data-log-id={logId}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
};

/** A quiet footer button. On a phone it is a cell with the icon above its label. */
const FooterTool = ({ label, icon, onClick }: Omit<FooterAction, 'id'>) => {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return (
      <Button variant="subtle" color="gray" size="sm" leftSection={icon} onClick={onClick}>
        {label}
      </Button>
    );
  }
  return (
    <Button
      variant="light"
      color="gray"
      fullWidth
      leftSection={icon}
      onClick={onClick}
      styles={{
        root: { height: 'auto', minHeight: 52, padding: '8px 4px' },
        inner: { flexDirection: 'column', gap: 4 },
        section: { margin: 0 },
        label: {
          height: 'auto',
          overflow: 'visible',
          whiteSpace: 'normal',
          textAlign: 'center',
          lineHeight: 1.2,
          fontSize: 12,
        },
      }}
    >
      {label}
    </Button>
  );
};

export interface JobFooterProps {
  /** Quiet actions, for example Print receipt and Edit. */
  tools: FooterAction[];
  /** Bill: outlined next to the main action on a desktop. */
  bill: FooterAction | null;
  /** The filled next step, a `FooterMain`, or `null` when there is none. */
  main: ReactNode;
  onClose: () => void;
}

/**
 * The pinned bar of a ticket panel. Desktop: quiet tools at the left, then Close,
 * Bill and the filled main action at the right. Phone: the main action across the
 * top, the tools and Bill in equal cells below (the header X closes the panel).
 */
export const JobFooter = ({ tools, bill, main, onClose }: JobFooterProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    const cells = bill === null ? tools : [...tools, bill];
    return (
      <Stack gap="xs" className="rich-drawer-footer job-footer-phone">
        {main}
        {cells.length > 0 && (
          <div
            className="job-footer-grid"
            style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
          >
            {cells.map((cell) => (
              <FooterTool
                key={cell.id}
                label={cell.label}
                icon={cell.icon}
                onClick={cell.onClick}
              />
            ))}
          </div>
        )}
      </Stack>
    );
  }

  return (
    <Group justify="space-between" gap="sm" wrap="wrap" className="rich-drawer-footer">
      <Group gap="xs" wrap="wrap">
        {tools.map((tool) => (
          <FooterTool key={tool.id} label={tool.label} icon={tool.icon} onClick={tool.onClick} />
        ))}
      </Group>
      <Group gap="sm" wrap="wrap" justify="flex-end" ml="auto">
        <Button variant="subtle" color="gray" size="sm" onClick={onClose}>
          {t('Close')}
        </Button>
        {bill !== null && (
          <Button variant="default" size="sm" leftSection={bill.icon} onClick={bill.onClick}>
            {bill.label}
          </Button>
        )}
        {main}
      </Group>
    </Group>
  );
};
