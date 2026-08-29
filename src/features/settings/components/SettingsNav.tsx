import { t } from '@/shared/i18n/t';
import { Box, Paper, Stack, Tabs, Text, ThemeIcon } from '@mantine/core';
import { SETTINGS_SECTIONS, type SettingsSectionId } from '../settingsSections';

interface SettingsNavProps {
  active: SettingsSectionId;
  onChange: (section: SettingsSectionId) => void;
}

/** Desktop: a persistent vertical list of sections, boxed like the content cards. */
export const SettingsNavList = ({ active, onChange }: SettingsNavProps) => {
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
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = active === section.id;
          return (
            <Box
              key={section.id}
              onClick={() => onChange(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 40,
                padding: '6px 10px',
                borderRadius: 'var(--mantine-radius-default)',
                backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {isActive ? (
                <ThemeIcon
                  color="blue"
                  variant="light"
                  size="sm"
                  radius="var(--mantine-radius-default)"
                >
                  <section.icon size={14} />
                </ThemeIcon>
              ) : (
                <Box
                  style={{
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <section.icon size={16} />
                </Box>
              )}
              <Text size="sm" fw={isActive ? 600 : 500} c={isActive ? undefined : 'dimmed'}>
                {section.label}
              </Text>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

/** Tablet: a top tab strip standing in for the sidebar. */
export const SettingsNavTabs = ({ active, onChange }: SettingsNavProps) => {
  return (
    <Tabs
      value={active}
      onChange={(value) => value && onChange(value as SettingsSectionId)}
      variant="outline"
    >
      <Tabs.List style={{ flexWrap: 'wrap' }}>
        {SETTINGS_SECTIONS.map((section) => (
          <Tabs.Tab
            key={section.id}
            value={section.id}
            leftSection={<section.icon size={16} />}
            style={{ minHeight: 44 }}
          >
            {section.shortLabel}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};

/** Mobile: a full-screen drill-down list — the section list itself, one row per section. */
export const SettingsNavDrillDownList = ({ active, onChange }: SettingsNavProps) => {
  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('Menu')}
      </Text>
      {SETTINGS_SECTIONS.map((section) => (
        <Box
          key={section.id}
          onClick={() => onChange(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 56,
            padding: '10px 14px',
            borderRadius: 'var(--mantine-radius-default)',
            border: '1px solid var(--border)',
            backgroundColor: active === section.id ? 'var(--bg-active)' : 'var(--bg-card)',
            cursor: 'pointer',
          }}
        >
          <ThemeIcon color="blue" variant="light" size="lg" radius="var(--mantine-radius-default)">
            <section.icon size={20} />
          </ThemeIcon>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} size="sm">
              {section.label}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {section.description}
            </Text>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};
