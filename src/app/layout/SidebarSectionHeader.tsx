import type { ComponentType } from 'react';
import { Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import { t } from '@/shared/i18n/t';

export interface SidebarSectionHeaderProps {
  title: string;
  Icon: ComponentType<{ size?: number | string; stroke?: number | string }>;
  /** Items in the section; shown as a count while it is folded. */
  count: number;
  isOpen: boolean;
  /** The open page is inside this section, so a folded section still points at it. */
  holdsActive: boolean;
  controlsId: string;
  /** Top margin that follows the sidebar density. */
  paddingTop: string | number;
  isMobile: boolean;
  onToggle: () => void;
}

export const SidebarSectionHeader = ({
  title,
  Icon,
  count,
  isOpen,
  holdsActive,
  controlsId,
  paddingTop,
  isMobile,
  onToggle,
}: SidebarSectionHeaderProps) => {
  const pointsAtPage = !isOpen && holdsActive;
  return (
    <UnstyledButton
      className="sidebar-section"
      mt={paddingTop}
      data-open={isOpen}
      data-holds-active={pointsAtPage}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={`${title}, ${count}`}
      style={{ minHeight: isMobile ? 44 : undefined }}
      onClick={onToggle}
    >
      <span
        className="sidebar-section-tile"
        {...(pointsAtPage ? { role: 'img', 'aria-label': t('Current page is in here') } : {})}
      >
        <Icon size={17} stroke={1.75} />
      </span>
      <Text component="span" className="sidebar-section-title">
        {title}
      </Text>
      {!isOpen && <span className="sidebar-section-count">{count}</span>}
      <IconChevronDown size={16} stroke={2} className="sidebar-section-chevron" />
    </UnstyledButton>
  );
};
