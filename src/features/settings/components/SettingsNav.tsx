import { t } from '@/shared/i18n/t';
import { Badge, Box, NavLink, Paper, Stack, Tabs, Text, ThemeIcon } from '@mantine/core';
import { isTauri } from '@/shared/lib/runtime';
import { useCloudState } from '@/features/account';
import { getVisibleSettingsSections, type SettingsSectionId } from '../settingsSections';

interface SettingsNavProps {
  active: SettingsSectionId;
  onChange: (section: SettingsSectionId) => void;
}

/** Desktop: a persistent vertical list of sections, styled identically to the left sidebar NavLink. */
export const SettingsNavList = ({ active, onChange }: SettingsNavProps) => {
  const { state: cloud } = useCloudState();
  const sections = getVisibleSettingsSections(isTauri(), cloud.enabled, cloud.linked);
  return (
    <Paper withBorder p="xs" style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Text
        size="xs"
        fw={700}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: '0.05em' }}
        px="xs"
        pt={4}
        pb="xs"
      >
        {t('Menu')}
      </Text>
      <Stack gap={2}>
        {sections.map((section) => {
          const isActive = active === section.id;
          const isDisabled = section.disabled || section.comingSoon;
          const Icon = section.icon;

          return (
            <NavLink
              key={section.id}
              className="settings-nav-item"
              active={isActive}
              data-disabled={isDisabled ? true : undefined}
              color="blue"
              variant="light"
              label={t(section.label)}
              leftSection={<Icon size={18} stroke={1.5} />}
              rightSection={
                section.comingSoon ? (
                  <Badge
                    size="xs"
                    variant="light"
                    color="gray"
                    tt="none"
                    style={{
                      flexShrink: 0,
                      fontSize: 10,
                      height: 18,
                      paddingLeft: 6,
                      paddingRight: 6,
                      pointerEvents: 'none',
                    }}
                  >
                    {t('Coming Soon')}
                  </Badge>
                ) : undefined
              }
              onClick={() => {
                if (!isDisabled) {
                  onChange(section.id);
                }
              }}
              styles={{
                root: {
                  height: 40,
                  minHeight: 40,
                  maxHeight: 40,
                  boxSizing: 'border-box',
                  borderRadius: 'var(--mantine-radius-default)',
                  paddingLeft: 10,
                  paddingRight: 8,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1,
                },
                body: {
                  overflow: 'hidden',
                  minWidth: 0,
                },
                label: {
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                },
              }}
            />
          );
        })}
      </Stack>
    </Paper>
  );
};

/** Tablet: a top tab strip standing in for the sidebar. */
export const SettingsNavTabs = ({ active, onChange }: SettingsNavProps) => {
  const { state: cloud } = useCloudState();
  const sections = getVisibleSettingsSections(isTauri(), cloud.enabled, cloud.linked);
  return (
    <Tabs
      value={active}
      onChange={(value) => value && onChange(value as SettingsSectionId)}
      variant="outline"
    >
      <Tabs.List style={{ flexWrap: 'wrap' }}>
        {sections.map((section) => {
          const isDisabled = section.disabled || section.comingSoon;
          return (
            <Tabs.Tab
              key={section.id}
              value={section.id}
              disabled={isDisabled}
              leftSection={<section.icon size={16} />}
              rightSection={
                section.comingSoon ? (
                  <Badge size="xs" variant="light" color="gray" tt="none" style={{ marginLeft: 4 }}>
                    {t('Coming Soon')}
                  </Badge>
                ) : undefined
              }
              style={{ minHeight: 44, opacity: isDisabled ? 0.6 : 1 }}
            >
              {t(section.shortLabel)}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Tabs>
  );
};

/** Mobile: a full-screen drill-down list — the section list itself, one row per section. */
export const SettingsNavDrillDownList = ({ active, onChange }: SettingsNavProps) => {
  const { state: cloud } = useCloudState();
  const sections = getVisibleSettingsSections(isTauri(), cloud.enabled, cloud.linked);
  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('Menu')}
      </Text>
      {sections.map((section) => {
        const isActive = active === section.id;
        const isDisabled = section.disabled || section.comingSoon;
        return (
          <Box
            key={section.id}
            onClick={() => {
              if (!isDisabled) {
                onChange(section.id);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 56,
              padding: '10px 14px',
              borderRadius: 'var(--mantine-radius-default)',
              border: `1px solid ${isActive ? 'var(--mantine-color-blue-light-hover)' : 'var(--border)'}`,
              backgroundColor: isActive ? 'var(--mantine-color-blue-light)' : 'var(--bg-card)',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
          >
            <ThemeIcon
              color={isActive ? 'blue' : isDisabled ? 'gray' : 'blue'}
              variant={isActive ? 'filled' : 'light'}
              size="lg"
              radius="var(--mantine-radius-default)"
            >
              <section.icon size={20} />
            </ThemeIcon>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <Text fw={isActive ? 700 : 600} size="sm" c={isActive ? 'blue' : undefined}>
                  {t(section.label)}
                </Text>
                {section.comingSoon && (
                  <Badge size="xs" variant="light" color="gray" tt="none" style={{ flexShrink: 0 }}>
                    {t('Coming Soon')}
                  </Badge>
                )}
              </Box>
              <Text size="xs" c="dimmed" truncate>
                {t(section.description)}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};
