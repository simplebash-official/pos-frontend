import { Chip, Group, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface FilterTagChipsProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  label?: string;
  allLabel?: string;
}

/**
 * Filter pill row using the theme's primary blue accent (matches buttons, header icons, etc.
 * elsewhere in the app). `variant="filled"` on Mantine's Chip renders identically to
 * `variant="light"` when unchecked (neutral gray, not tinted by `color`) — only the checked
 * state differs, so this is what makes the active chip solid blue while the rest stay neutral.
 */
export const FilterTagChips = ({
  tags,
  selectedTag,
  onSelectTag,
  label = 'Filter by:',
  allLabel = 'All Tags',
}: FilterTagChipsProps) => {
  const isMobile = useIsMobile();
  const chipSize = isMobile ? 'lg' : 'xs';
  // A touch of extra breathing room beyond Mantine's tight default chip padding; on mobile it's
  // also what clears the 44px touch-target minimum.
  const chipStyles = {
    label: { paddingBlock: isMobile ? 10 : 4, minHeight: isMobile ? 44 : undefined },
  };

  return (
    <Group gap="xs" align="center" py="3xs">
      <Text size="xs" fw={700} c="dimmed">
        {label}
      </Text>
      <Chip
        size={chipSize}
        styles={chipStyles}
        classNames={{ label: 'filter-tag-chip' }}
        checked={selectedTag === null}
        onChange={() => onSelectTag(null)}
        variant="filled"
        color="blue"
      >
        {allLabel}
      </Chip>
      {tags.map((tag) => (
        <Chip
          key={tag}
          size={chipSize}
          styles={chipStyles}
          classNames={{ label: 'filter-tag-chip' }}
          checked={selectedTag === tag}
          onChange={() => onSelectTag(selectedTag === tag ? null : tag)}
          variant="filled"
          color="blue"
        >
          {tag}
        </Chip>
      ))}
    </Group>
  );
};
