import { t } from '@/shared/i18n/t';
import { useState, type ReactNode } from 'react';
import { ActionIcon, Box, Group, Stack, Text } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageHeader } from '@/shared/components/PageHeader';
import { useLayoutTier } from '@/shared/hooks/useResponsive';
import { SettingsNavDrillDownList, SettingsNavList, SettingsNavTabs } from './SettingsNav';
import { SETTINGS_SECTIONS, type SettingsSectionId } from '../settingsSections';
import { ShopProfileSection } from './sections/ShopProfileSection';
import { BrandingSection } from './sections/BrandingSection';
import { BankDetailsSection } from './sections/BankDetailsSection';
import { PrintingSection } from './sections/PrintingSection';
import { DocumentTemplatesSection } from './sections/DocumentTemplatesSection';
import { UpdatesSection } from './sections/UpdatesSection';
import { BackupSection } from './sections/BackupSection';

const renderSection = (id: SettingsSectionId, onDirtyChange: (dirty: boolean) => void) => {
  switch (id) {
    case 'shop-profile':
      return <ShopProfileSection onDirtyChange={onDirtyChange} />;
    case 'branding':
      return <BrandingSection onDirtyChange={onDirtyChange} />;
    case 'bank-details':
      return <BankDetailsSection onDirtyChange={onDirtyChange} />;
    case 'printing':
      return <PrintingSection onDirtyChange={onDirtyChange} />;
    case 'templates':
      return <DocumentTemplatesSection onDirtyChange={onDirtyChange} />;
    case 'updates':
      return <UpdatesSection onDirtyChange={onDirtyChange} />;
    case 'backup':
      return <BackupSection onDirtyChange={onDirtyChange} />;
  }
};

export const SettingsPage = () => {
  const tier = useLayoutTier();

  const [activeSection, setActiveSection] = useState<SettingsSectionId>('shop-profile');
  // Mobile only: whether the user has drilled into a section, or is still looking at the list.
  const [mobileSectionOpen, setMobileSectionOpen] = useState(false);
  const [isSectionDirty, setIsSectionDirty] = useState(false);
  // undefined = no pending navigation attempt; otherwise the target the user tried to switch to.
  const [pendingTarget, setPendingTarget] = useState<SettingsSectionId | 'back' | undefined>(
    undefined
  );

  const commitNavigate = (target: SettingsSectionId | 'back') => {
    if (target === 'back') {
      setMobileSectionOpen(false);
    } else {
      setActiveSection(target);
      setMobileSectionOpen(true);
    }
    setIsSectionDirty(false);
  };

  const requestNavigate = (target: SettingsSectionId | 'back') => {
    if (isSectionDirty) {
      setPendingTarget(target);
    } else {
      commitNavigate(target);
    }
  };

  const activeSectionMeta = SETTINGS_SECTIONS.find((s) => s.id === activeSection);

  const header = (
    <PageHeader
      title={t('POS & Document Settings')}
      description={t('Configure shop profile, bank details, and printing behavior.')}
    />
  );

  let body: ReactNode;

  if (tier === 'desktop') {
    body = (
      <Group align="stretch" gap="xl" wrap="nowrap" style={{ flex: 1 }}>
        <Box style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <SettingsNavList active={activeSection} onChange={requestNavigate} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {renderSection(activeSection, setIsSectionDirty)}
        </Box>
      </Group>
    );
  } else if (tier === 'tablet') {
    body = (
      <Stack gap="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SettingsNavTabs active={activeSection} onChange={requestNavigate} />
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderSection(activeSection, setIsSectionDirty)}
        </Box>
      </Stack>
    );
  } else if (mobileSectionOpen) {
    body = (
      <Stack gap="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Group gap="xs">
          <ActionIcon
            variant="default"
            size={44}
            onClick={() => requestNavigate('back')}
            aria-label={t('Back to settings list')}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>
          <Text fw={700} size="md">
            {activeSectionMeta?.label}
          </Text>
        </Group>
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderSection(activeSection, setIsSectionDirty)}
        </Box>
      </Stack>
    );
  } else {
    body = <SettingsNavDrillDownList active={activeSection} onChange={requestNavigate} />;
  }

  return (
    <>
      <Stack gap="lg" style={{ minHeight: '100%' }}>
        {header}
        {body}
      </Stack>

      <ConfirmDialog
        opened={pendingTarget !== undefined}
        onClose={() => setPendingTarget(undefined)}
        onConfirm={() => {
          if (pendingTarget !== undefined) {
            commitNavigate(pendingTarget);
          }
          setPendingTarget(undefined);
        }}
        title={t('Discard unsaved changes?')}
        confirmLabel={t('Discard Changes')}
        cancelLabel={t('Keep Editing')}
      >
        {t('You have unsaved changes in this section. Leaving now will discard them.')}
      </ConfirmDialog>
    </>
  );
};
