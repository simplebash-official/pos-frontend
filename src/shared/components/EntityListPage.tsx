import React from 'react';
import { Stack, Group, TextInput, SegmentedControl, Chip, Box, Center, Text } from '@mantine/core';
import { IconSearch, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { PageHeader } from './PageHeader';

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
}

export function EntityListPage({
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
}: EntityListPageProps) {
  return (
    <Stack gap="lg">
      <PageHeader title={title} description={description} action={action} />

      {kpiCards && <Box>{kpiCards}</Box>}

      {/* Control Bar: Search & View Toggle */}
      <Group justify="space-between" align="center" wrap="wrap">
        <TextInput
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          style={{ minWidth: 280, flex: 1 }}
        />

        <SegmentedControl
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
        <Group gap="xs">
          <Text size="xs" fw={700} c="dimmed">
            Filter by:
          </Text>
          <Chip
            size="xs"
            checked={selectedTag === null}
            onChange={() => onSelectTag(null)}
            variant="light"
          >
            All Tags
          </Chip>
          {filterTags.map((tag) => (
            <Chip
              key={tag}
              size="xs"
              checked={selectedTag === tag}
              onChange={() => onSelectTag(selectedTag === tag ? null : tag)}
              variant="light"
            >
              {tag}
            </Chip>
          ))}
        </Group>
      )}

      {/* Main Content (Table or Grid) */}
      <Box>{children}</Box>
    </Stack>
  );
}
