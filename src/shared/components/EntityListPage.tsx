import React from 'react';
import { Stack, Group, Box, Center } from '@mantine/core';
import { IconSearch, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { PageHeader } from './PageHeader';
import { SegmentedToggle } from './SegmentedToggle';
import { FilterTagChips } from './FilterTagChips';
import { SearchHistoryInput } from './SearchHistoryInput';

interface EntityListPageProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  kpiCards?: React.ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterTags?: string[];
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  children: React.ReactNode;
  namespace?: string;
}

export const EntityListPage = ({
  title,
  description,
  action,
  kpiCards,
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterTags,
  selectedTag,
  onSelectTag,
  viewMode,
  onViewModeChange,
  children,
  namespace,
}: EntityListPageProps) => {
  const resolvedNamespace = namespace || title.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  return (
    <Stack gap="lg">
      <PageHeader title={title} description={description} action={action} />

      {kpiCards && <Box>{kpiCards}</Box>}

      {/* Control Bar: Search & View Toggle */}
      <Group justify="space-between" align="center" wrap="wrap">
        <SearchHistoryInput
          namespace={resolvedNamespace}
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={search}
          onValueChange={onSearchChange}
          wrapperStyle={{ minWidth: 280, flex: 1 }}
        />

        <SegmentedToggle
          value={viewMode}
          onChange={(val) => onViewModeChange(val as 'table' | 'grid')}
          data={[
            {
              label: (
                <Center style={{ gap: 6 }}>
                  <IconList size={16} />
                  <span>Table</span>
                </Center>
              ),
              value: 'table',
            },
            {
              label: (
                <Center style={{ gap: 6 }}>
                  <IconLayoutGrid size={16} />
                  <span>Grid</span>
                </Center>
              ),
              value: 'grid',
            },
          ]}
        />
      </Group>

      {/* Filter Tag Chips Bar */}
      {filterTags && filterTags.length > 0 && onSelectTag && (
        <FilterTagChips
          tags={filterTags}
          selectedTag={selectedTag ?? null}
          onSelectTag={onSelectTag}
        />
      )}

      {/* Main Content (Table or Grid) */}
      <Box>{children}</Box>
    </Stack>
  );
};
