import { t } from '@/shared/i18n/t';
import { createElement, useMemo, useState } from 'react';
import {
  Popover,
  TextInput,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  Text,
  Stack,
  Center,
  Loader,
  UnstyledButton,
  ThemeIcon,
} from '@mantine/core';
import { IconSearch, IconChevronDown } from '@tabler/icons-react';
import {
  useAllTablerIcons,
  useTablerIcons,
  resolveTablerIcon,
  TablerIconComponent,
} from '@/shared/lib/tablerIcons';

export interface TablerIconPickerProps {
  /** Stored icon name — PascalCase, no "Icon" prefix (e.g. "DeviceMobile"). */
  value: string | null;
  onChange: (name: string) => void;
  /** Shown while the icon library is loading or for an unrecognized `value`. */
  fallbackIcon: TablerIconComponent;
  label?: string;
  error?: string;
  /** Whether to show the icon name text next to the icon. Defaults to false. */
  showName?: boolean;
  /** Optional theme color to style the preview icon background and color. */
  color?: string | null;
}

const MAX_RESULTS = 180;

export const TablerIconPicker = ({
  value,
  onChange,
  fallbackIcon,
  label = 'Icon',
  error,
  showName = false,
  color,
}: TablerIconPickerProps) => {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');

  // Browsing needs the whole library. It starts loading with this component rather than with the
  // dropdown, so the grid is ready by the time it opens; the trigger falls back to `value`'s own
  // shard while that is in flight.
  const iconMap = useAllTablerIcons();
  const selectedIconMap = useTablerIcons([value]);

  const allNames = useMemo(() => {
    if (!iconMap) return [];
    return Object.keys(iconMap)
      .filter((key) => key.startsWith('Icon'))
      .map((key) => key.slice(4))
      .sort();
  }, [iconMap]);

  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allNames;
    return allNames.filter((name) => name.toLowerCase().includes(q));
  }, [allNames, search]);

  const visibleNames = filteredNames.slice(0, MAX_RESULTS);

  const selectedIconEl = createElement(
    resolveTablerIcon(iconMap ?? selectedIconMap, value ?? undefined, fallbackIcon),
    {
      size: 18,
    }
  );

  const iconContent = (
    <ThemeIcon color={color || 'blue'} variant="light" size={28}>
      {selectedIconEl}
    </ThemeIcon>
  );

  const pickerButton = (
    <UnstyledButton
      onClick={() => setOpened((o) => !o)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: showName ? 8 : 4,
        padding: showName ? '6px 10px' : '4px 6px 4px 4px',
        border: `1px solid ${error ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-default-border)'}`,
        borderRadius: 'var(--mantine-radius-default)',
        width: 'fit-content',
        minWidth: showName ? 160 : undefined,
        boxSizing: 'border-box',
      }}
    >
      {iconContent}
      {showName && (
        <Text size="sm" c={value ? undefined : 'dimmed'}>
          {value || 'Choose an icon'}
        </Text>
      )}
      <IconChevronDown
        size={14}
        style={{ opacity: 0.6, marginInlineStart: showName ? 'auto' : undefined }}
      />
    </UnstyledButton>
  );

  return (
    <Stack gap={4}>
      {label && (
        <Text size="xs" fw={500} c="dimmed">
          {label}
        </Text>
      )}
      <Popover
        opened={opened}
        onChange={setOpened}
        position="bottom-start"
        width="min(280px, calc(100vw - 32px))"
        shadow="md"
        withinPortal
      >
        <Popover.Target>
          {!showName ? (
            <Tooltip label={value || 'Choose an icon'} withArrow disabled={opened}>
              {pickerButton}
            </Tooltip>
          ) : (
            pickerButton
          )}
        </Popover.Target>
        <Popover.Dropdown p="sm">
          <Stack gap="xs">
            <TextInput
              placeholder={t('Search icons...')}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="xs"
              autoFocus
            />
            {!iconMap ? (
              <Center py="lg">
                <Loader size="sm" />
              </Center>
            ) : (
              <>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  <SimpleGrid cols={6} spacing={4}>
                    {visibleNames.map((name) => {
                      const Icon = iconMap[`Icon${name}`];
                      const isSelected = value === name;
                      return (
                        <Tooltip key={name} label={name} withArrow openDelay={300}>
                          <ActionIcon
                            variant={isSelected ? 'filled' : 'subtle'}
                            color={isSelected ? color || 'blue' : 'gray'}
                            size="lg"
                            aria-label={name}
                            onClick={() => {
                              onChange(name);
                              setOpened(false);
                            }}
                          >
                            <Icon size={18} />
                          </ActionIcon>
                        </Tooltip>
                      );
                    })}
                  </SimpleGrid>
                </div>
                {visibleNames.length === 0 ? (
                  <Text size="xs" c="dimmed" ta="center" py="sm">
                    {t('No icons match "')}
                    {search}".
                  </Text>
                ) : (
                  <Text size="xs" c="dimmed" ta="center">
                    {filteredNames.length > MAX_RESULTS
                      ? `Showing ${MAX_RESULTS} of ${filteredNames.length} — refine your search to see more`
                      : `${filteredNames.length} icons`}
                  </Text>
                )}
              </>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
};
